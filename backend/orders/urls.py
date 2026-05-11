from django.urls import path
from .views import (
    CartDetailView, CartAddItemView, CartRemoveItemView,
    CheckoutView, PaymentSuccessView, PaymentCancelView,
    WebhookPayPalView, CheckoutSummaryView,
    AdminOrderListView, AdminOrderDetailView, AdminOrderStatusUpdateView,
)

urlpatterns = [
    # ── Cart ──────────────────────────────────────────────
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('cart/add/', CartAddItemView.as_view(), name='cart-add'),
    path('cart/remove/<int:item_id>/', CartRemoveItemView.as_view(), name='cart-remove'),

    # ── Checkout & Payment ────────────────────────────────
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('checkout/summary/', CheckoutSummaryView.as_view(), name='checkout-summary'),
    path('payment/success/', PaymentSuccessView.as_view(), name='payment-success'),
    path('payment/cancel/', PaymentCancelView.as_view(), name='payment-cancel'),
    path('webhook/paypal/', WebhookPayPalView.as_view(), name='webhook-paypal'),

    # ── Admin: Order Management ───────────────────────────
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<str:order_id>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/orders/<str:order_id>/status/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status'),
]