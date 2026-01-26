from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from users.models import CustomUser, UserProfile


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    """Admin interface for CustomUser model management"""
    list_display = ['username', 'email', 'first_name', 'last_name', 'phone', 'is_staff']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Information', {
            'fields': ('phone', 'date_of_birth')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model management"""
    list_display = ['user', 'gender', 'city', 'country', 'is_verified', 'created_at']
    list_filter = ['gender', 'country', 'is_verified', 'created_at']
    search_fields = ['user__username', 'user__email', 'city', 'country']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('bio', 'gender', 'profile_picture')
        }),
        ('Address', {
            'fields': ('address', 'city', 'postal_code', 'country')
        }),
        ('Status', {
            'fields': ('is_verified', 'created_at', 'updated_at')
        }),
    )
