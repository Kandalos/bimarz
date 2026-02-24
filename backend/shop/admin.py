# shop/admin.py
from django.contrib import admin
from .models import Genre, Book, RecommendedGroup

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("id", "name")

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "price", "stock", "is_active")
    list_filter = ("is_active", "genres")
    search_fields = ("title", "author", "isbn")
    filter_horizontal = ("genres",)

@admin.register(RecommendedGroup)
class RecommendedGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("books",)
