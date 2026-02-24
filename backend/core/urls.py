# core/urls.py

from django.urls import path, include
from .views import PublicUserViewSet, UserRegistrationView,UserMeView ,LocationListView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', PublicUserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
    path('', include('djoser.urls')),
    path('jwt/', include('djoser.urls.jwt')),
    path('register/', UserRegistrationView.as_view(), name='custom-register'),
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('locations/', LocationListView.as_view(), name='location-list'),
]
