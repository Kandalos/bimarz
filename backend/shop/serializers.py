# shop/serializers.py
from rest_framework import serializers
from .models import Book, Genre, RecommendedGroup
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
            "publisher",
        )
        read_only_fields = ("id","sold_count")

    def create(self, validated_data):
        # genres were provided in 'genre_ids' (source='genres')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # handle cover_image updates and many-to-many through source field
        return super().update(instance, validated_data)


class RecommendedGroupSerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = RecommendedGroup
        fields = ("id", "name", "slug", "books")