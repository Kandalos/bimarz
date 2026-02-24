from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin # Renamed to avoid confusion
from .models import CustomUser, Location

# Customize the fields shown in the Django Admin for your CustomUser
class CustomUserAdmin(BaseUserAdmin):
    # These fields are included in AbstractUser, so we list them for visibility
    list_display = (
        'username', 'email', 'first_name', 'last_name', 
        'is_staff', 'is_active', 'phone_number','location' # Added phone_number for easy viewing
    )
    
    # Add your custom fields to the fieldsets for viewing/editing a user
    fieldsets = BaseUserAdmin.fieldsets + (
        ('اطلاعات بیشتر', {'fields': ('phone_number', 'address', 'postal_code','location' ,'customer_id', 'is_verified_buyer')}),
    )

    # Add custom fields to the add_fieldsets for creating a user in the admin
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {'fields': ('email', 'first_name', 'last_name', 'phone_number', 'address', 'postal_code','location')}),
    )

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

admin.site.register(CustomUser, CustomUserAdmin)