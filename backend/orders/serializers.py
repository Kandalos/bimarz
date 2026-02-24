from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, ShippingZone, PromoCode, Payment


class CartItemSerializer(serializers.ModelSerializer):
    # Expose book details from the related book
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    title = serializers.CharField(source='book.title', read_only=True)
    author = serializers.CharField(source='book.author', read_only=True)
    translator = serializers.CharField(source='book.translator', read_only=True, default=None)
    price = serializers.DecimalField(source='book.price', max_digits=10, decimal_places=0, read_only=True)
    cover_image = serializers.ImageField(source='book.cover_image', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            'id', 'book', 'book_id', 'title', 'author', 'translator', 'price',
            'cover_image', 'quantity', 'total_price'
        )
        extra_kwargs = {'book': {'write_only': True}}  # book ID for writes

    def get_total_price(self, obj):
        return obj.quantity * obj.book.price


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    shipping_fee = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = (
            'id', 'user', 'items', 'subtotal', 'total_items',
            'shipping_fee', 'total', 'updated_at'
        )
        read_only_fields = ('user',)

    def get_subtotal(self, obj):
        return sum(item.quantity * item.book.price for item in obj.items.all())

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_shipping_fee(self, obj):
        """Calculate shipping based on user's location."""
        try:
            from orders.services import calculate_shipping
            return calculate_shipping(obj.user)
        except Exception:
            return None

    def get_total(self, obj):
        subtotal = self.get_subtotal(obj)
        shipping = self.get_shipping_fee(obj)
        if shipping is None:
            return None
        return subtotal + shipping


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'book_id', 'title_snapshot', 'price_snapshot', 'quantity')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'user', 'user_email', 'status', 'currency',
            'subtotal', 'shipping_fee', 'discount_amount', 'total_amount',
            'email_snapshot', 'phone_snapshot', 'address_snapshot',
            'postal_code_snapshot', 'location_snapshot',
            'created_at', 'paid_at', 'items'
        )
        read_only_fields = ('id', 'order_number', 'created_at')


class ShippingZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingZone
        fields = ('id', 'name', 'locations', 'price_eur', 'active')


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = (
            'id', 'code', 'discount_type', 'value', 'active',
            'expires_at', 'usage_limit', 'used_count'
        )
        read_only_fields = ('used_count',)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id', 'order', 'provider', 'paypal_order_id', 'paypal_capture_id',
            'status', 'raw_webhook', 'created_at'
        )
        read_only_fields = ('created_at',)