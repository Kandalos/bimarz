# shop/views.py
from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, permission_classes

from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Book, Genre, Order, OrderItem, RecommendedGroup
from .serializers import BookSerializer, GenreSerializer, OrderSerializer, RecommendedGroupSerializer


# -----------------------
# Catalogue Views
# -----------------------
class BookViewSet(viewsets.ModelViewSet):
    """
    Public: list & retrieve books.
    Admin-only: create/update/partial_update/destroy.
    Accepts multipart/form-data so admins can upload cover images.
    """
    queryset = Book.objects.filter(is_active=True).order_by("title")
    serializer_class = BookSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        # Allow anyone to list/retrieve
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            # Only admins can create/update/destroy
            permission_classes = [IsAdminUser]
        return [p() for p in permission_classes]

    def perform_destroy(self, instance):
        # Soft-delete so we keep historical data (optional)
        instance.is_active = False
        instance.save()


    def perform_create(self, serializer):
        serializer.save(is_active=True)


class GenreViewSet(viewsets.ModelViewSet):
    """
    Simple CRUD for genres.
    Public gets list/retrieve.
    Admin-only can create/update/delete.
    """
    queryset = Genre.objects.all().order_by("name")
    serializer_class = GenreSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [p() for p in permission_classes]


# -----------------------
# Orders / E-commerce Views
# -----------------------
class OrderCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    Endpoint to create orders.
    Requires authentication.
    Example payload:
    {
      "items": [
        {"book": <book_id>, "quantity": 2}
      ]
    }
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        order = serializer.save()

        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)


# -----------------------
# Most Bought Books Endpoint
# -----------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def most_bought_books(request):
    # get top 5 by sold_count
    books = Book.objects.filter(is_active=True).order_by("-sold_count")[:5]

    # if none have sold_count > 0, return 5 random books instead
    if not books or all((b.sold_count or 0) == 0 for b in books):
        books = Book.objects.filter(is_active=True).order_by("?")[:5]

    data = BookSerializer(books, many=True, context={'request': request}).data
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def recommended_books(request):
    # Get the first active recommended group
    group = RecommendedGroup.objects.filter(is_active=True).first()

    if not group:
        return Response({"books": []})

    data = RecommendedGroupSerializer(group, context={'request': request}).data
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def recommended_group_by_slug(request, slug):
    group = RecommendedGroup.objects.filter(slug=slug, is_active=True).first()

    if not group:
        return Response({"books": []})

    data = RecommendedGroupSerializer(group, context={'request': request}).data
    return Response(data)

class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows genres to be viewed.
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticated] 