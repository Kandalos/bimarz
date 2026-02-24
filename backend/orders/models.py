from django.db import models
from django.conf import settings
import uuid


# =========================
# SHIPPING
# =========================

class ShippingZone(models.Model):
    name = models.CharField(max_length=100)
    locations = models.ManyToManyField("core.Location")
    price_eur = models.DecimalField(max_digits=8, decimal_places=2)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - €{self.price_eur}"


# =========================
# CART
# =========================

class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart ({self.user})"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        related_name="items",
        on_delete=models.CASCADE
    )
    book = models.ForeignKey(
        "shop.Book",
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "book")

    def __str__(self):
        return f"{self.book} x {self.quantity}"


# =========================
# ORDER STATUS
# =========================

class OrderStatus(models.TextChoices):
    CART = "cart", "Cart"
    PENDING_PAYMENT = "pending_payment", "Pending Payment"
    PAID = "paid", "Paid"
    PROCESSING = "processing", "Processing"
    SHIPPED = "shipped", "Shipped"
    DELIVERED = "delivered", "Delivered"
    CANCELLED = "cancelled", "Cancelled"


# =========================
# ORDER
# =========================

class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders"
    )

    order_number = models.CharField(max_length=20, unique=True, db_index=True)

    status = models.CharField(
        max_length=30,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING_PAYMENT,
        db_index=True
    )

    currency = models.CharField(max_length=3, default="EUR")

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # SNAPSHOT SHIPPING DATA
    email_snapshot = models.EmailField()
    phone_snapshot = models.CharField(max_length=20)
    address_snapshot = models.TextField()
    postal_code_snapshot = models.CharField(max_length=20)
    location_snapshot = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name="items",
        on_delete=models.CASCADE
    )

    book_id = models.IntegerField()
    title_snapshot = models.CharField(max_length=255)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.title_snapshot} x {self.quantity}"


# =========================
# PROMO CODES
# =========================

class PromoCode(models.Model):
    PERCENT = "percent"
    FIXED = "fixed"

    DISCOUNT_TYPES = [
        (PERCENT, "Percent"),
        (FIXED, "Fixed"),
    ]

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES)
    value = models.DecimalField(max_digits=8, decimal_places=2)

    active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.code


# =========================
# PAYMENT
# =========================

class Payment(models.Model):

    PAYPAL = "paypal"

    provider = models.CharField(max_length=20, default=PAYPAL)

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment"
    )

    paypal_order_id = models.CharField(max_length=255, db_index=True)
    paypal_capture_id = models.CharField(max_length=255, null=True, blank=True)

    status = models.CharField(max_length=50)

    raw_webhook = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.order.order_number}"