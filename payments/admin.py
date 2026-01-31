from django.contrib import admin
from .models import Payment, StripeWebhookEvent, Refund


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin interface for Payment model."""
    
    list_display = [
        'id',
        'order',
        'user',
        'amount',
        'currency',
        'status',
        'payment_method',
        'created_at',
        'paid_at',
    ]
    
    list_filter = [
        'status',
        'payment_method',
        'currency',
        'created_at',
        'paid_at',
    ]
    
    search_fields = [
        'stripe_payment_intent_id',
        'stripe_customer_id',
        'stripe_charge_id',
        'order__order_number',
        'user__email',
        'user__username',
    ]
    
    readonly_fields = [
        'stripe_payment_intent_id',
        'stripe_customer_id',
        'stripe_charge_id',
        'created_at',
        'updated_at',
        'paid_at',
    ]
    
    fieldsets = (
        ('Relations', {
            'fields': ('order', 'user')
        }),
        ('Stripe Information', {
            'fields': (
                'stripe_payment_intent_id',
                'stripe_customer_id',
                'stripe_charge_id',
            )
        }),
        ('Payment Details', {
            'fields': (
                'amount',
                'currency',
                'status',
                'payment_method',
                'description',
                'error_message',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        """Disable manual creation of payments via admin."""
        return False


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    """Admin interface for Refund model."""
    
    list_display = [
        'id',
        'payment',
        'amount',
        'currency',
        'status',
        'reason',
        'created_at',
        'refunded_at',
    ]
    
    list_filter = [
        'status',
        'reason',
        'created_at',
        'refunded_at',
    ]
    
    search_fields = [
        'stripe_refund_id',
        'payment__stripe_payment_intent_id',
        'payment__order__order_number',
        'description',
    ]
    
    readonly_fields = [
        'stripe_refund_id',
        'created_at',
        'updated_at',
        'refunded_at',
    ]
    
    fieldsets = (
        ('Relations', {
            'fields': ('payment',)
        }),
        ('Stripe Information', {
            'fields': ('stripe_refund_id',)
        }),
        ('Refund Details', {
            'fields': (
                'amount',
                'currency',
                'status',
                'reason',
                'description',
                'error_message',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'refunded_at'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        """Disable manual creation of refunds via admin."""
        return False


@admin.register(StripeWebhookEvent)
class StripeWebhookEventAdmin(admin.ModelAdmin):
    """Admin interface for StripeWebhookEvent model."""
    
    list_display = [
        'id',
        'stripe_event_id',
        'event_type',
        'processed',
        'created_at',
        'processed_at',
    ]
    
    list_filter = [
        'event_type',
        'processed',
        'created_at',
    ]
    
    search_fields = [
        'stripe_event_id',
        'event_type',
        'processing_error',
    ]
    
    readonly_fields = [
        'stripe_event_id',
        'event_type',
        'data',
        'processed',
        'processing_error',
        'created_at',
        'processed_at',
    ]
    
    fieldsets = (
        ('Event Information', {
            'fields': (
                'stripe_event_id',
                'event_type',
                'processed',
            )
        }),
        ('Event Data', {
            'fields': ('data',),
            'classes': ('collapse',)
        }),
        ('Processing', {
            'fields': ('processing_error', 'processed_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        """Disable manual creation of webhook events via admin."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Make webhook events read-only."""
        return False
