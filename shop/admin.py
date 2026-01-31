from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'product_display_name', 'price', 'gender', 'master_category')
    search_fields = ('product_display_name',)
    list_filter = ('gender', 'master_category')