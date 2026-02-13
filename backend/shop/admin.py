from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Sum, Avg
from .models import Product


class PriceRangeFilter(admin.SimpleListFilter):
    """Custom filter for price ranges."""
    title = 'price range'
    parameter_name = 'price_range'

    def lookups(self, request, model_admin):
        return [
            ('0-50', '0€ - 50€'),
            ('50-100', '50€ - 100€'),
            ('100-200', '100€ - 200€'),
            ('200+', '200€+'),
        ]

    def queryset(self, request, queryset):
        if self.value() == '0-50':
            return queryset.filter(price__gte=0, price__lt=50)
        elif self.value() == '50-100':
            return queryset.filter(price__gte=50, price__lt=100)
        elif self.value() == '100-200':
            return queryset.filter(price__gte=100, price__lt=200)
        elif self.value() == '200+':
            return queryset.filter(price__gte=200)
        return queryset


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'image_thumbnail', 
        'product_display_name', 
        'price_display', 
        'gender', 
        'master_category',
        'season',
        'usage',
        'created_at'
    )
    
    list_display_links = ('id', 'product_display_name')
    
    search_fields = (
        'product_display_name', 
        'article_type', 
        'base_colour',
        'master_category',
        'sub_category'
    )
    
    list_filter = (
        'gender', 
        'master_category',
        'sub_category',
        'season',
        'usage',
        PriceRangeFilter,
        'created_at',
    )
    
    list_per_page = 50
    
    date_hierarchy = 'created_at'
    
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Product Information', {
            'fields': ('product_display_name', 'description', 'image')
        }),
        ('Categorization', {
            'fields': ('gender', 'master_category', 'sub_category', 'article_type', 'base_colour')
        }),
        ('Attributes', {
            'fields': ('season', 'year', 'usage')
        }),
        ('Pricing', {
            'fields': ('price',)
        }),
    )
    
    actions = ['apply_discount_10', 'apply_discount_20', 'mark_as_out_of_stock']
    
    def image_thumbnail(self, obj):
        """Display product image as thumbnail."""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.image
            )
        return '-'
    image_thumbnail.short_description = 'Image'
    
    def price_display(self, obj):
        """Display price with currency symbol."""
        return format_html('<strong>{}€</strong>', obj.price)
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'price'
    
    @admin.action(description='Apply 10% discount')
    def apply_discount_10(self, request, queryset):
        """Apply a 10% discount to selected products."""
        count = 0
        for product in queryset:
            product.price = float(product.price) * 0.9
            product.save()
            count += 1
        self.message_user(request, f'10% discount applied to {count} products.')
    
    @admin.action(description='Apply 20% discount')
    def apply_discount_20(self, request, queryset):
        """Apply a 20% discount to selected products."""
        count = 0
        for product in queryset:
            product.price = float(product.price) * 0.8
            product.save()
            count += 1
        self.message_user(request, f'20% discount applied to {count} products.')
    
    @admin.action(description='Mark as out of stock (set price to 0)')
    def mark_as_out_of_stock(self, request, queryset):
        """Mark selected products as out of stock by setting price to 0."""
        updated = queryset.update(price=0)
        self.message_user(request, f'{updated} products marked as out of stock.')
    
    def changelist_view(self, request, extra_context=None):
        """Add statistics to the changelist view."""
        extra_context = extra_context or {}
        
        # Calculate statistics
        stats = Product.objects.aggregate(
            total_products=Count('id'),
            avg_price=Avg('price'),
            total_value=Sum('price'),
        )
        
        # Products by category
        by_category = dict(
            Product.objects.values('master_category')
            .annotate(count=Count('id'))
            .values_list('master_category', 'count')
        )
        
        extra_context['stats'] = stats
        extra_context['by_category'] = by_category
        
        return super().changelist_view(request, extra_context=extra_context)