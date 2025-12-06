from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        extra_fields.setdefault("username", None)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("username", "admin")  # Admin needs a username for the admin UI

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    # Custom fields
    customer_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    is_verified_buyer = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(_('email address'), unique=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    # Replace username system
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # No username required

    objects = CustomUserManager()

    username = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Legacy field (unused). Optional for admin panel compatibility."
    )

    def __str__(self):
        return self.email
