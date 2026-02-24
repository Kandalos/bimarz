import os
import requests
from decimal import Decimal
from django.conf import settings
from orders.models import Payment

PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"  # change to production when ready
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID')
PAYPAL_CLIENT_SECRET = os.environ.get('PAYPAL_CLIENT_SECRET')


def get_access_token():
    """Obtain OAuth2 token from PayPal."""
    url = f"{PAYPAL_API_BASE}/v1/oauth2/token"
    data = {'grant_type': 'client_credentials'}
    auth = (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    response = requests.post(url, data=data, auth=auth)
    response.raise_for_status()
    return response.json()['access_token']


def create_paypal_order(order, return_url, cancel_url):
    """
    Create a PayPal order and return the approval URL.
    Also stores the PayPal order ID in a Payment record.
    """
    access_token = get_access_token()
    url = f"{PAYPAL_API_BASE}/v2/checkout/orders"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}',
    }
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": str(order.id),
                "amount": {
                    "currency_code": "EUR",
                    "value": str(order.total.quantize(Decimal('0.01'))),
                }
            }
        ],
        "application_context": {
            "return_url": return_url,
            "cancel_url": cancel_url,
            "brand_name": "Your Store",
            "landing_page": "BILLING",
            "user_action": "PAY_NOW",
        }
    }
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    data = response.json()

    # Store payment record
    payment = Payment.objects.create(
        order=order,
        paypal_order_id=data['id'],
        amount=order.total,
        currency='EUR',
        status='created',
    )

    # Find approval link
    approval_url = next(link['href'] for link in data['links'] if link['rel'] == 'approve')
    return approval_url, payment


def capture_paypal_order(paypal_order_id):
    """Capture an approved PayPal order."""
    access_token = get_access_token()
    url = f"{PAYPAL_API_BASE}/v2/checkout/orders/{paypal_order_id}/capture"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}',
    }
    response = requests.post(url, headers=headers)
    response.raise_for_status()
    return response.json()