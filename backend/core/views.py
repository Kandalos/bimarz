# core/views.py
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework import permissions
from django.contrib.auth import get_user_model
from djoser.views import UserViewSet
from .serializers import UserRegistrationSerializer, UserSerializer
from .models import Location
from .serializers import LocationSerializer

User = get_user_model()

from djoser.views import UserViewSet
from rest_framework.permissions import AllowAny

class LocationListView(generics.ListAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

class PublicUserViewSet(UserViewSet):
    permission_classes = [AllowAny]

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserMeView(generics.RetrieveUpdateAPIView):   # <-- Update allowed here
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user