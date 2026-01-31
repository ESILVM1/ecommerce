from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """Inline admin for OrderItems within Order admin"""
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price', 'created_at']
    fields = ['product', 'quantity', 'price_per_unit', 'total_price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin interface for Order management"""
    list_display = ['order_number', 'user', 'status', 'payment_status', 'final_amount', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'user__username', 'user__email']
    readonly_fields = ['order_number', 'total_amount', 'final_amount', 'created_at', 'updated_at', 'shipped_at', 'delivered_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'payment_status')
        }),
        ('Amounts', {
            'fields': ('total_amount', 'discount_amount', 'tax_amount', 'final_amount')
        }),
        ('Shipping Address', {
            'fields': ('shipping_address', 'shipping_city', 'shipping_postal_code', 'shipping_country')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'shipped_at', 'delivered_at')
        }),
    )
    
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin interface for OrderItem management"""
    list_display = ['order', 'product', 'quantity', 'price_per_unit', 'total_price']
    list_filter = ['order__status', 'created_at']
    search_fields = ['order__order_number', 'product__product_display_name']
    readonly_fields = ['total_price', 'created_at', 'updated_at']
    ordering = ['-created_at']
