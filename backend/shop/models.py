# shop/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum
from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver

User = get_user_model()
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name = _("Genre")
        verbose_name_plural = _("Genres")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class BookSize(models.TextChoices):
    A5 = "A5", "A5 (148 × 210 mm)"
    B5 = "B5", "B5 (176 × 250 mm)"
    A4 = "A4", "A4 (210 × 297 mm)"
    POCKET = "POCKET", "Pocket"
    CUSTOM = "CUSTOM", "Custom"

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    translator = models.CharField(max_length=255, null=True, blank=True)
    isbn = models.CharField(max_length=13, unique=True, help_text=_("13-digit ISBN."))
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=9, decimal_places=0)
    stock = models.IntegerField(default=0, help_text=_("Current number of units in stock."))
    genres = models.ManyToManyField(Genre, related_name='books', blank=True)
    year = models.CharField(null=True , blank =True)
    pages=models.CharField(max_length=4)
    
    cover_image = models.ImageField(
        upload_to='book_covers/',
        blank=True,
        null=True,
        help_text=_("Book cover image.")
    )
    book_size = models.CharField(
    max_length=20,
    choices=BookSize.choices,
    default=BookSize.B5 
    )
    is_active = models.BooleanField(default=True, help_text=_("Designates if the book is available for purchase."))

    # NEW: cached sold count (keeps queries cheap)
    sold_count = models.IntegerField(default=0, help_text=_("Cached total units sold for this book."))

    class Meta:
        verbose_name = _("Book")
        verbose_name_plural = _("Books")
        ordering = ['title']

    def __str__(self):
        return self.title

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Payment'),
        ('PAID', 'Paid'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELED', 'Canceled'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders',
        help_text=_("The user who placed the order (null if guest or user deleted).")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("The final total price of the order.")
    )

    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} | Status: {self.get_status_display()}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    book = models.ForeignKey(
        Book,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items',
        help_text=_("The book purchased. Set to null if the book is deleted.")
    )
    book_title_snapshot = models.CharField(max_length=255, editable=False) # Snapshot for historical data
    quantity = models.IntegerField(default=1)
    price_at_purchase = models.DecimalField(
        max_digits=9,
        decimal_places=0,
        help_text=_("The price of the book at the exact time of purchase.")
    )

    class Meta:
        verbose_name = _("Order Item")
        verbose_name_plural = _("Order Items")
        unique_together = ('order', 'book')

    def save(self, *args, **kwargs):
        # Set snapshot and default price if necessary
        if self.book and not self.book_title_snapshot:
            self.book_title_snapshot = self.book.title
        if self.book and (not self.price_at_purchase or self.price_at_purchase == 0):
            # store current book price as fallback (if frontend or serializer didn't set it)
            self.price_at_purchase = self.book.price
        super().save(*args, **kwargs)

    def get_cost(self):
        return self.price_at_purchase * self.quantity

    def __str__(self):
        title = self.book_title_snapshot or (self.book.title if self.book else "Unknown")
        return f"{self.quantity} x {title}"


# ------------------------------
# Signals to maintain stock & sold_count
# ------------------------------
@receiver(pre_save, sender=OrderItem)
def orderitem_pre_save(sender, instance: OrderItem, **kwargs):
    """
    Save old quantity (if updating) to compute delta later in post_save.
    """
    if instance.pk:
        try:
            old = OrderItem.objects.get(pk=instance.pk)
            instance._old_quantity = old.quantity
        except OrderItem.DoesNotExist:
            instance._old_quantity = 0
    else:
        instance._old_quantity = 0

@receiver(post_save, sender=OrderItem)
def orderitem_post_save(sender, instance: OrderItem, created, **kwargs):
    """
    On create: decrease Book.stock by quantity and increase sold_count by quantity.
    On update: apply delta = new - old.
    """
    if not instance.book:
        return

    old_q = getattr(instance, "_old_quantity", 0)
    new_q = instance.quantity
    delta = new_q - (old_q or 0)

    # Decrease stock by delta (could be negative if quantity reduced -> stock increases)
    if delta != 0:
        book = instance.book
        book.stock = book.stock - delta
        # Update sold_count accordingly
        book.sold_count = (book.sold_count or 0) + delta
        # Avoid negative sold_count
        if book.sold_count < 0:
            book.sold_count = 0
        # Optionally clamp stock to non-negative (depends on your desired behavior)
        # if book.stock < 0:
        #     book.stock = 0
        book.save(update_fields=['stock', 'sold_count'])

@receiver(pre_delete, sender=OrderItem)
def orderitem_pre_delete(sender, instance: OrderItem, **kwargs):
    """
    When an order item is deleted (e.g. order cancelled), restore stock and decrement sold_count.
    """
    if not instance.book:
        return
    book = instance.book
    # restore stock
    book.stock = (book.stock or 0) + (instance.quantity or 0)
    # decrement sold_count
    book.sold_count = max(0, (book.sold_count or 0) - (instance.quantity or 0))
    book.save(update_fields=['stock', 'sold_count'])

class RecommendedGroup(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    books = models.ManyToManyField(Book, related_name="recommended_groups", blank=True)

    class Meta:
        verbose_name = "Recommended Book Group"
        verbose_name_plural = "Recommended Book Groups"

    def __str__(self):
        return self.name
