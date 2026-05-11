import logging
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem, Order, OrderStatus, PromoCode
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, PromoCodeSerializer
from .services import (
    convert_cart_to_order, create_paypal_order, handle_paypal_webhook,
    validate_shipping_profile, calculate_shipping
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
#  CHECKOUT SUMMARY
# ─────────────────────────────────────────────

class CheckoutSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "سبد خرید خالی است"}, status=status.HTTP_400_BAD_REQUEST)

        missing = validate_shipping_profile(user, return_missing=True)
        if missing:
            return Response({
                "user_profile_complete": False,
                "missing_fields": missing,
                "error": "پروفایل شما ناقص است"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            shipping_fee = calculate_shipping(user)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        items = cart.items.select_related('book').all()
        subtotal = sum(item.book.price * item.quantity for item in items)

        item_serializer = CartItemSerializer(items, many=True)
        return Response({
            "items": item_serializer.data,
            "subtotal": subtotal,
            "shipping_fee": shipping_fee,
            "total": subtotal + shipping_fee,
            "user_profile_complete": True,
        })


# ─────────────────────────────────────────────
#  CART
# ─────────────────────────────────────────────

class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart


class CartAddItemView(APIView):
    """Add or update a book in cart with stock validation."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from shop.models import Book
        cart, _ = Cart.objects.get_or_create(user=request.user)
        book_id = request.data.get('book_id')
        quantity = request.data.get('quantity', 1)

        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response(
                    {"error": "تعداد باید حداقل ۱ باشد"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response({"error": "تعداد نامعتبر است"}, status=status.HTTP_400_BAD_REQUEST)

        book = get_object_or_404(Book, id=book_id, is_active=True)

        # ── Stock validation ──────────────────────────────────────────
        if book.stock <= 0:
            return Response(
                {"error": f"کتاب «{book.title}» موجود نیست."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if quantity > book.stock:
            return Response(
                {
                    "error": f"موجودی کافی نیست. فقط {book.stock} جلد از «{book.title}» در انبار موجود است.",
                    "available_stock": book.stock,
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        # ─────────────────────────────────────────────────────────────

        cart_item, created = CartItem.objects.get_or_create(cart=cart, book=book)
        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartRemoveItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
#  CHECKOUT / PAYMENT
# ─────────────────────────────────────────────

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        promo_code_str = request.data.get('promo_code')

        promo_code = None
        if promo_code_str:
            try:
                promo_code = PromoCode.objects.get(code=promo_code_str)
                if not promo_code.is_valid:
                    return Response({"error": "کد تخفیف معتبر نیست"}, status=status.HTTP_400_BAD_REQUEST)
            except PromoCode.DoesNotExist:
                return Response({"error": "کد تخفیف یافت نشد"}, status=status.HTTP_404_NOT_FOUND)

        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "سبد خرید خالی است"}, status=status.HTTP_400_BAD_REQUEST)

        if not cart.items.exists():
            return Response({"error": "سبد خرید خالی است"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                order = convert_cart_to_order(cart, promo_code)
                return_url = request.build_absolute_uri('/api/orders/payment/success/')
                cancel_url = request.build_absolute_uri('/api/orders/payment/cancel/')
                approval_url, payment = create_paypal_order(order, return_url, cancel_url)
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Checkout failed")
            return Response({"error": "خطا در پردازش سفارش"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "order_id": str(order.id),
            "approval_url": approval_url,
        }, status=status.HTTP_200_OK)


class PaymentSuccessView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"message": "پرداخت تأیید شد. تأیییدیه به زودی ارسال خواهد شد."})


class PaymentCancelView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"message": "پرداخت لغو شد."}, status=status.HTTP_200_OK)


class WebhookPayPalView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.data
        headers = request.headers
        try:
            handle_paypal_webhook(payload, headers)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            logger.exception("Webhook processing error")
            return Response({"error": "Internal error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"status": "received"}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
#  ADMIN: ORDER MANAGEMENT
# ─────────────────────────────────────────────

# Status transitions allowed by admins
ALLOWED_ADMIN_TRANSITIONS = {
    OrderStatus.PENDING_PAYMENT: [OrderStatus.CANCELLED],
    OrderStatus.PAID: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    OrderStatus.PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
    OrderStatus.DELIVERED: [],
    OrderStatus.CANCELLED: [],
}


class AdminOrderListView(APIView):
    """
    GET  /api/orders/admin/orders/
    List all orders with optional filtering by status and search by order_number / email.
    Only accessible by staff/admin users.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        qs = Order.objects.select_related('user').prefetch_related('items').order_by('-created_at')

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        # Search by order number or customer email
        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                models_Q(order_number__icontains=search) |
                models_Q(email_snapshot__icontains=search) |
                models_Q(user__email__icontains=search)
            )

        serializer = OrderSerializer(qs, many=True)
        return Response(serializer.data)


class AdminOrderDetailView(APIView):
    """
    GET   /api/orders/admin/orders/<order_id>/
    Full detail for a single order.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, order_id):
        order = get_object_or_404(
            Order.objects.select_related('user').prefetch_related('items'),
            id=order_id
        )
        serializer = OrderSerializer(order)
        return Response(serializer.data)


class AdminOrderStatusUpdateView(APIView):
    """
    PATCH /api/orders/admin/orders/<order_id>/status/
    Update order status. Enforces allowed transition rules.
    Body: { "status": "<new_status>" }
    """
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        new_status = request.data.get('status')

        if not new_status:
            return Response({"error": "فیلد status الزامی است"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate it's a known status value
        valid_values = [s.value for s in OrderStatus]
        if new_status not in valid_values:
            return Response(
                {"error": f"وضعیت نامعتبر. مقادیر مجاز: {valid_values}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        current = order.status
        allowed = ALLOWED_ADMIN_TRANSITIONS.get(current, [])
        if new_status not in allowed:
            return Response(
                {
                    "error": f"تبدیل وضعیت از «{current}» به «{new_status}» مجاز نیست.",
                    "allowed_transitions": list(allowed),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        if new_status == OrderStatus.PAID:
            from django.utils import timezone
            order.paid_at = timezone.now()
        order.save(update_fields=['status', 'paid_at'] if new_status == OrderStatus.PAID else ['status'])

        serializer = OrderSerializer(order)
        return Response(serializer.data)


# Django Q import alias to avoid shadowing 'status' variable
from django.db.models import Q as models_Q