from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import uuid


# =========================
# SHIPPING CONFIG (Singleton)
# =========================

class ShippingConfig(models.Model):
    """
    Singleton model for global shipping configuration.
    Controls the paper weight (grams per page) used to estimate book weight.
    """
    paper_weight_grams = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        default=0.08,
        help_text="Weight of a single page in grams (e.g. 0.08 g/page for standard 80gsm paper)."
    )

    class Meta:
        verbose_name = "Shipping Configuration"
        verbose_name_plural = "Shipping Configuration"

    def __str__(self):
        return f"Shipping Config (paper weight: {self.paper_weight_grams} g/page)"

    def save(self, *args, **kwargs):
        # Enforce singleton: only one instance allowed
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


# =========================
# SHIPPING ZONE
# =========================

class ShippingZone(models.Model):
    """
    Represents a shipping destination zone with weight-based pricing rules.
    """
    name = models.CharField(max_length=100)
    locations = models.ManyToManyField("core.Location")
    active = models.BooleanField(default=True)

    # --- Pricing ---
    default_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Fixed shipping price applied when shipment weight is within the threshold (in EUR)."
    )
    price_per_weight_unit = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=0,
        help_text="Price charged per gram of total shipment weight when weight exceeds threshold (in EUR)."
    )
    weight_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text=(
            "Maximum shipment weight in grams that qualifies for the fixed default price. "
            "If total weight exceeds this, per-weight pricing applies."
        )
    )

    def __str__(self):
        return (
            f"{self.name} — fixed: €{self.default_price} "
            f"(up to {self.weight_threshold}g), "
            f"per-gram: €{self.price_per_weight_unit}"
        )

    def calculate_shipping_cost(self, total_weight_grams):
        """
        Determine shipping cost based on shipment weight.

        Args:
            total_weight_grams (Decimal): total weight of all books in the order.

        Returns:
            Decimal: shipping cost in EUR.
        """
        from decimal import Decimal
        total_weight_grams = Decimal(str(total_weight_grams))

        if total_weight_grams <= self.weight_threshold:
            return self.default_price
        else:
            return total_weight_grams * self.price_per_weight_unit


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