# shop/serializers.py
from rest_framework import serializers
from .models import Book, Genre, Order, OrderItem, RecommendedGroup
from django.contrib.auth import get_user_model

User = get_user_model()

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ("id", "name")


class BookSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Genre.objects.all(), source='genres'
    )

    cover_image = serializers.ImageField(required=False, allow_null=True)
    sold_count = serializers.IntegerField(read_only=True)   # <--- include here

    class Meta:
        model = Book
        fields = (
            "id",
            "title",
            "author",
            "isbn",
            "description",
            "price",
            "stock",
            "genres",
            "genre_ids",
            "cover_image",
            "is_active",
            "sold_count",
            "translator",
            "book_size",
            "year",
            "pages",
        )
        read_only_fields = ("id","sold_count")

    def create(self, validated_data):
        # genres were provided in 'genre_ids' (source='genres')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # handle cover_image updates and many-to-many through source field
        return super().update(instance, validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    book_title_snapshot = serializers.CharField(read_only=True)
    price_at_purchase = serializers.DecimalField(max_digits=9, decimal_places=0, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "order", "book", "book_title_snapshot", "quantity", "price_at_purchase")
        read_only_fields = ("id", "book_title_snapshot", "price_at_purchase")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, write_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Order
        fields = ("id", "user", "items", "total_price", "status", "created_at")
        read_only_fields = ("id", "user", "total_price", "created_at", "status")

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        user = self.context["request"].user if "request" in self.context else None

        order = Order.objects.create(user=user, status="PENDING", total_price=0)
        total_price = 0

        for item in items_data:
            book = item["book"]
            quantity = item.get("quantity", 1)

            if book.stock < quantity:
                raise serializers.ValidationError({"stock": f"Insufficient stock for {book.title}"})

            OrderItem.objects.create(
                order=order,
                book=book,
                quantity=quantity,
                price_at_purchase=book.price,
            )

            book.stock -= quantity
            book.save()
            total_price += (book.price * quantity)

        order.total_price = total_price
        order.save()
        return order

class RecommendedGroupSerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = RecommendedGroup
        fields = ("id", "name", "slug", "books")
