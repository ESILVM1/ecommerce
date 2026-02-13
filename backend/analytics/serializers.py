from rest_framework import serializers


class SalesStatsSerializer(serializers.Serializer):
    """Serializer for sales statistics."""
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    orders_by_status = serializers.DictField()
    revenue_by_month = serializers.ListField()
    recent_orders = serializers.ListField()


class ProductPerformanceSerializer(serializers.Serializer):
    """Serializer for product performance statistics."""
    top_selling_products = serializers.ListField()
    revenue_by_product = serializers.ListField()
    products_by_category = serializers.DictField()
    low_stock_products = serializers.ListField()
    total_products = serializers.IntegerField()


class UserActivitySerializer(serializers.Serializer):
    """Serializer for user activity statistics."""
    total_users = serializers.IntegerField()
    new_users_this_month = serializers.IntegerField()
    active_users = serializers.IntegerField()
    users_with_orders = serializers.IntegerField()
    average_orders_per_user = serializers.DecimalField(max_digits=10, decimal_places=2)
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    registrations_by_month = serializers.ListField()
