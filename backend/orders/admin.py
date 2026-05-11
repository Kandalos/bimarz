from django.contrib import admin
from .models import (
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
    ShippingZone,
    ShippingConfig,
    PromoCode,
)


# =========================
# SHIPPING CONFIG (Singleton)
# =========================

@admin.register(ShippingConfig)
class ShippingConfigAdmin(admin.ModelAdmin):
    """
    Singleton admin for global shipping settings.
    Only one instance is ever created (pk=1 enforced in the model).
    """
    fieldsets = (
        ("Paper Weight", {
            "fields": ("paper_weight_grams",),
            "description": (
                "Set the weight of a single page in grams. "
                "This value is used to estimate the weight of every book in an order. "
                "Example: standard 80gsm paper ≈ 0.08 g/page."
            ),
        }),
    )

    def has_add_permission(self, request):
        # Prevent creating a second instance via admin
        return not ShippingConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


# =========================
# SHIPPING ZONE
# =========================

@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "active",
        "default_price",
        "weight_threshold",
        "price_per_weight_unit",
    )
    list_filter = ("active",)
    search_fields = ("name",)
    filter_horizontal = ("locations",)
    fieldsets = (
        ("General", {
            "fields": ("name", "active", "locations"),
        }),
        ("Pricing Rules", {
            "fields": ("default_price", "weight_threshold", "price_per_weight_unit"),
            "description": (
                "If total shipment weight ≤ Weight Threshold → charge Default Price (fixed).\n"
                "If total shipment weight > Weight Threshold → charge Total Weight × Price Per Weight Unit."
            ),
        }),
    )


# =========================
# CART
# =========================

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "updated_at")
    inlines = [CartItemInline]


# =========================
# ORDER
# =========================

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "title_snapshot",
        "price_snapshot",
        "quantity",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "status",
        "total_amount",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("order_number", "user__email")
    readonly_fields = ("created_at", "paid_at")
    inlines = [OrderItemInline]


# =========================
# PAYMENT
# =========================

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "provider", "status", "created_at")
    search_fields = ("paypal_order_id",)


# =========================
# PROMO CODE
# =========================

admin.site.register(PromoCode)