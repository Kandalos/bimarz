from django.urls import path
from .views import (
    CartDetailView, CartAddItemView, CartRemoveItemView,
    CheckoutView, PaymentSuccessView, PaymentCancelView,
    WebhookPayPalView, CheckoutSummaryView
)

urlpatterns = [
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('cart/add/', CartAddItemView.as_view(), name='cart-add'),
    path('cart/remove/<int:item_id>/', CartRemoveItemView.as_view(), name='cart-remove'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('payment/success/', PaymentSuccessView.as_view(), name='payment-success'),
    path('payment/cancel/', PaymentCancelView.as_view(), name='payment-cancel'),
    path('webhook/paypal/', WebhookPayPalView.as_view(), name='webhook-paypal'),
    path('checkout/summary/', CheckoutSummaryView.as_view(), name='checkout-summary'),
]   