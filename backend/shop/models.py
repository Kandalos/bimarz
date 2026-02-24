# shop/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum
from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver

User = get_user_model()
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name = _("Genre")
        verbose_name_plural = _("Genres")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BookSize(models.TextChoices):
    JIBI_SHOMIZ = "JIBI_SHOMIZ", "جیبی (شومیز)"
    JIBI_GHALINGOR = "JIBI_GHALINGOR", "جیبی (گالینگور)"

    PALTUI_SHOMIZ = "PALTUI_SHOMIZ", "پالتویی (شومیز)"
    PALTUI_GHALINGOR = "PALTUI_GHALINGOR", "پالتویی (گالینگور)"

    RAGHEI_SHOMIZ = "RAGHEI_SHOMIZ", "رقعی (شومیز)"
    RAGHEI_GHALINGOR = "RAGHEI_GHALINGOR", "رقعی (گالینگور)"

    VAZIRI_SHOMIZ = "VAZIRI_SHOMIZ", "وزیری (شومیز)"
    VAZIRI_GHALINGOR = "VAZIRI_GHALINGOR", "وزیری (گالینگور)"

    RAHLI_SHOMIZ = "RAHLI_SHOMIZ", "رحلی (شومیز)"
    RAHLI_GHALINGOR = "RAHLI_GHALINGOR", "رحلی (گالینگور)"

    KHESHTI_SHOMIZ = "KHESHTI_SHOMIZ", "خشتی (شومیز)"
    KHESHTI_GHALINGOR = "KHESHTI_GHALINGOR", "خشتی (گالینگور)"

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    translator = models.CharField(max_length=255, null=True, blank=True)
    isbn = models.CharField(max_length=13, unique=True, help_text=_("13-digit ISBN."),null=True,blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=9, decimal_places=0)
    stock = models.IntegerField(default=0, help_text=_("Current number of units in stock."))
    genres = models.ManyToManyField(Genre, related_name='books', blank=True)
    year = models.CharField(null=True , blank =True)
    pages=models.CharField(max_length=4, blank =True, null=True)
    publisher=models.CharField(max_length=255, null=True,blank=True)
    cover_image = models.ImageField(
        upload_to='book_covers/',
        blank=True,
        null=True,
        help_text=_("Book cover image.")
    )
    book_size = models.CharField(
    max_length=20,
    choices=BookSize.choices,
    default=BookSize.JIBI_SHOMIZ
    )
    is_active = models.BooleanField(default=True, help_text=_("Designates if the book is available for purchase."))

    # NEW: cached sold count (keeps queries cheap)
    sold_count = models.IntegerField(default=0, help_text=_("Cached total units sold for this book."))

    class Meta:
        verbose_name = _("Book")
        verbose_name_plural = _("Books")

    def __str__(self):
        return self.title

class RecommendedGroup(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    books = models.ManyToManyField(Book, related_name="recommended_groups", blank=True)

    class Meta:
        verbose_name = "Recommended Book Group"
        verbose_name_plural = "Recommended Book Groups"

    def __str__(self):
        return self.name
