import json
import hashlib
import hmac
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from orders.models import Payment, Order, Cart


def verify_paypal_webhook(request_body, headers):
    """
    Verify PayPal webhook signature.
    Implement according to PayPal's verification docs.
    This is a simplified example; use proper verification in production.
    """
    # In production, you should verify using PayPal's API or signature.
    # For now, assume valid if webhook ID matches environment variable.
    # You'll need PAYPAL_WEBHOOK_ID in env.
    expected_id = os.environ.get('PAYPAL_WEBHOOK_ID')
    actual_id = headers.get('Paypal-Transmission-Id')
    if actual_id != expected_id:
        return False
    # More checks: transmission-sig, cert url, etc.
    return True


def handle_paypal_webhook(payload, headers):
    """Process PayPal webhook event."""
    if not verify_paypal_webhook(payload, headers):
        raise PermissionError("Invalid webhook signature")

    event_type = payload.get('event_type')
    resource = payload.get('resource', {})

    if event_type == 'CHECKOUT.ORDER.APPROVED':
        # Order approved by buyer, waiting for capture
        paypal_order_id = resource.get('id')
        try:
            payment = Payment.objects.get(paypal_order_id=paypal_order_id)
            payment.status = 'approved'
            payment.webhook_payload = payload
            payment.save()
        except Payment.DoesNotExist:
            # Log or handle
            pass

    elif event_type == 'PAYMENT.CAPTURE.COMPLETED':
        # Payment captured successfully
        capture_id = resource.get('id')
        paypal_order_id = resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
        if not paypal_order_id:
            # fallback: from custom_id or invoice id
            custom_id = resource.get('custom_id')
            if custom_id:
                try:
                    order = Order.objects.get(id=custom_id)
                    paypal_order_id = order.payment.paypal_order_id
                except Order.DoesNotExist:
                    return
        try:
            payment = Payment.objects.get(paypal_order_id=paypal_order_id)
        except Payment.DoesNotExist:
            return

        payment.paypal_capture_id = capture_id
        payment.status = 'captured'
        payment.webhook_payload = payload
        payment.save()

        # Mark order as paid
        order = payment.order
        order.status = 'paid'
        order.save()

        # Clear user's cart (if exists)
        try:
            cart = Cart.objects.get(user=order.user)
            cart.items.all().delete()  # empty cart, keep cart object
        except Cart.DoesNotExist:
            pass

        # Increment promo code usage if applied
        if order.promo_code:
            order.promo_code.used_count += 1
            order.promo_code.save()

    # Handle other events as needed