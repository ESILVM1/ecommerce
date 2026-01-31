from rest_framework import serializers
from .models import Order, OrderItem
from shop.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model - represents individual products in an order"""
    product_name = serializers.CharField(source='product.product_display_name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_per_unit', 'total_price', 'created_at']
        read_only_fields = ['id', 'total_price', 'created_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders - accepts items data"""
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        help_text="List of items with product_id and quantity"
    )
    
    class Meta:
        model = Order
        fields = [
            'items', 'shipping_address', 'shipping_city',
            'shipping_postal_code', 'shipping_country'
        ]
    
    def validate_items(self, items):
        """Validate that items list is not empty and contains valid products"""
        if not items:
            raise serializers.ValidationError("Order must contain at least one item")
        
        for item in items:
            if 'product_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError("Each item must have product_id and quantity")
            
            if not Product.objects.filter(id=item['product_id']).exists():
                raise serializers.ValidationError(f"Product {item['product_id']} does not exist")
            
            if item['quantity'] < 1:
                raise serializers.ValidationError("Quantity must be at least 1")
        
        return items


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model - complete order information with nested items"""
    items = OrderItemSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_username', 'status', 'payment_status',
            'total_amount', 'discount_amount', 'tax_amount', 'final_amount',
            'shipping_address', 'shipping_city', 'shipping_postal_code', 'shipping_country',
            'items', 'created_at', 'updated_at', 'shipped_at', 'delivered_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'total_amount', 'final_amount',
            'created_at', 'updated_at', 'shipped_at', 'delivered_at'
        ]


class OrderUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating order status"""
    class Meta:
        model = Order
        fields = ['status', 'payment_status']


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders - simplified view"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user_username', 'status', 'payment_status',
            'final_amount', 'item_count', 'created_at'
        ]
    
    def get_item_count(self, obj):
        """Get total number of items in order"""
        return obj.items.count()
