# shop/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'books', views.BookViewSet)
router.register(r'genres', views.GenreViewSet)

urlpatterns = [
    # ⚠ PLACE CUSTOM ROUTES FIRST (before router)
    path("books/most-bought/", views.most_bought_books, name="most-bought-books"),
    path("books/recommended/", views.recommended_books, name="recommended-books"),
    path("books/recommended/<slug:slug>/", views.recommended_group_by_slug),

    # Order creation
    path('orders/', views.OrderCreateViewSet.as_view({'post': 'create'}), name='order-create'),

    # Router-generated URLs
    path('', include(router.urls)),
]
