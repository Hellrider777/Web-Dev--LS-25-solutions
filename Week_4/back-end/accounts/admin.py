from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import EmailVerificationToken


class EmailVerificationTokenInline(admin.StackedInline):
    """Inline admin for email verification tokens"""
    model = EmailVerificationToken
    extra = 0
    readonly_fields = ('token', 'created_at', 'is_verified')


class CustomUserAdmin(BaseUserAdmin):
    """Custom User admin with verification token inline"""
    inlines = (EmailVerificationTokenInline,)
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_active', 'is_verified', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    def is_verified(self, obj):
        """Check if user has verified email"""
        try:
            return obj.emailverificationtoken.is_verified
        except EmailVerificationToken.DoesNotExist:
            return False
    
    is_verified.boolean = True
    is_verified.short_description = 'Email Verified'


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Admin for email verification tokens"""
    list_display = ('user', 'token', 'created_at', 'is_verified', 'is_expired_status')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('user__username', 'user__email', 'token')
    readonly_fields = ('token', 'created_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Verification Details', {
            'fields': ('token', 'created_at', 'is_verified')
        }),
    )
    
    def is_expired_status(self, obj):
        """Show if token is expired"""
        return obj.is_expired()
    
    is_expired_status.boolean = True
    is_expired_status.short_description = 'Is Expired'


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Customize admin site headers
admin.site.site_header = "YouTube Clone Admin"
admin.site.site_title = "YouTube Clone Admin Portal"
admin.site.index_title = "Welcome to YouTube Clone Administration"
