from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Event, EventRegistration
from .serializers import EventSerializer, EventRegistrationSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_superuser


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_superuser:
            return Event.objects.all()
        return Event.objects.filter(is_public=True)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        event = self.get_object()

        if event.capacity != 0 and event.remaining_capacity <= 0:
            return Response(
                {"detail": "ظرفیت این رویداد تکمیل شده است"},
                status=status.HTTP_400_BAD_REQUEST
            )

        registration, created = EventRegistration.objects.get_or_create(
            user=request.user,
            event=event
        )

        if not created:
            return Response(
                {"detail": "شما قبلاً در این رویداد ثبت‌نام کرده‌اید"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            EventRegistrationSerializer(registration).data,
            status=status.HTTP_201_CREATED
        )
