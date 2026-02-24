from django.contrib import admin
from .models import (
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
    ShippingZone,
    PromoCode,
)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "updated_at")
    inlines = [CartItemInline]


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


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "provider", "status", "created_at")
    search_fields = ("paypal_order_id",)


admin.site.register(ShippingZone)
admin.site.register(PromoCode)