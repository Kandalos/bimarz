# core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    re_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'password', 're_password',
            'first_name', 'last_name', 'phone_number', 'address', 'postal_code',
        )

    def validate(self, data):
        # Check password match
        if data["password"] != data["re_password"]:
            raise serializers.ValidationError({"re_password": "Passwords don't match."})

        # Validate password strength
        try:
            validate_password(data["password"])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        return data

    def create(self, validated_data):
        validated_data.pop("re_password")
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
            "address",
            "postal_code",
            "avatar",
            "customer_id",
            "is_verified_buyer",
            "is_superuser",
            "is_staff",
        ]
        read_only_fields = ["id", "customer_id", "is_verified_buyer"]
