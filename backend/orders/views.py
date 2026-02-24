import logging
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem, Order, PromoCode
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, PromoCodeSerializer
from .services import (
    convert_cart_to_order, create_paypal_order, handle_paypal_webhook,
    validate_shipping_profile, calculate_shipping
)

logger = logging.getLogger(__name__)

class CheckoutSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # fixed: use permissions.

    def get(self, request):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "سبد خرید خالی است"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate profile completeness
        missing = validate_shipping_profile(user, return_missing=True)
        if missing:
            return Response({
                "user_profile_complete": False,
                "missing_fields": missing,
                "error": "پروفایل شما ناقص است"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate shipping
        try:
            shipping_fee = calculate_shipping(user)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate subtotal
        items = cart.items.select_related('book').all()
        subtotal = sum(item.book.price * item.quantity for item in items)

        # Build response
        item_serializer = CartItemSerializer(items, many=True)
        data = {
            "items": item_serializer.data,
            "subtotal": subtotal,
            "shipping_fee": shipping_fee,
            "total": subtotal + shipping_fee,
            "user_profile_complete": True,
        }
        return Response(data)

# ... rest of your views remain unchanged ...
class CartDetailView(generics.RetrieveAPIView):
    """Get current user's cart."""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart


class CartAddItemView(APIView):
    """Add or update a book in cart."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        book_id = request.data.get('book_id')
        quantity = request.data.get('quantity', 1)

        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)

        # Assuming shop.Book exists
        from shop.models import Book  # adjust import
        book = get_object_or_404(Book, id=book_id)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, book=book)
        if not created:
            cart_item.quantity = quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartRemoveItemView(APIView):
    """Remove an item from cart."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    """
    Step 1: Convert cart to order and get PayPal approval URL.
    Expects optional promo_code.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        promo_code_str = request.data.get('promo_code')

        # Validate promo code if provided
        promo_code = None
        if promo_code_str:
            try:
                promo_code = PromoCode.objects.get(code=promo_code_str)
                if not promo_code.is_valid:
                    return Response({"error": "Promo code is not valid"}, status=status.HTTP_400_BAD_REQUEST)
            except PromoCode.DoesNotExist:
                return Response({"error": "Promo code not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get user's cart
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Convert cart to order
                order = convert_cart_to_order(cart, promo_code)
                # Create PayPal order
                return_url = request.build_absolute_uri('/api/orders/payment/success/')  # adjust
                cancel_url = request.build_absolute_uri('/api/orders/payment/cancel/')
                approval_url, payment = create_paypal_order(order, return_url, cancel_url)
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Checkout failed")
            return Response({"error": "Checkout processing failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Return approval URL and order ID
        return Response({
            "order_id": order.id,
            "approval_url": approval_url,
        }, status=status.HTTP_200_OK)


class PaymentSuccessView(APIView):
    """
    Optional endpoint where PayPal redirects after payment approval.
    Usually you'd rely on webhook, but you can also manually capture here.
    """
    permission_classes = [permissions.AllowAny]  # but should validate token/order

    def get(self, request):
        # PayPal returns token/PayerID, you can capture here if needed.
        # For simplicity, we return a success message; actual capture via webhook.
        return Response({"message": "Payment approved. You will receive confirmation shortly."})


class PaymentCancelView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"message": "Payment cancelled."}, status=status.HTTP_200_OK)


class WebhookPayPalView(APIView):
    """Endpoint for PayPal webhook events."""
    permission_classes = [permissions.AllowAny]  # no auth, signature verified inside

    def post(self, request):
        payload = request.data
        headers = request.headers
        try:
            handle_paypal_webhook(payload, headers)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.exception("Webhook processing error")
            return Response({"error": "Internal error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": "received"}, status=status.HTTP_200_OK)