from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from orders.models import Order, OrderItem
from shop.models import Product
from users.models import CustomUser
from .serializers import (
    SalesStatsSerializer,
    ProductPerformanceSerializer,
    UserActivitySerializer
)


class SalesStatsView(APIView):
    """
    API endpoint for sales statistics.
    Requires admin authentication.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Get comprehensive sales statistics."""
        # Total orders and revenue
        orders = Order.objects.all()
        total_orders = orders.count()
        total_revenue = orders.filter(
            payment_status='paid'
        ).aggregate(
            total=Sum('final_amount')
        )['total'] or Decimal('0.00')
        
        average_order_value = orders.filter(
            payment_status='paid'
        ).aggregate(
            avg=Avg('final_amount')
        )['avg'] or Decimal('0.00')

        # Orders by status
        orders_by_status = dict(
            orders.values('status').annotate(
                count=Count('id')
            ).values_list('status', 'count')
        )

        # Revenue by month (last 12 months)
        twelve_months_ago = timezone.now() - timedelta(days=365)
        revenue_by_month = list(
            orders.filter(
                created_at__gte=twelve_months_ago,
                payment_status='paid'
            ).annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                revenue=Sum('final_amount'),
                orders=Count('id')
            ).order_by('month').values('month', 'revenue', 'orders')
        )

        # Recent orders
        recent_orders = list(
            orders.select_related('user').order_by('-created_at')[:10].values(
                'id',
                'order_number',
                'status',
                'payment_status',
                'final_amount',
                'created_at',
                'user__email'
            )
        )

        data = {
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'average_order_value': float(average_order_value),
            'orders_by_status': orders_by_status,
            'revenue_by_month': revenue_by_month,
            'recent_orders': recent_orders,
        }

        serializer = SalesStatsSerializer(data)
        return Response(serializer.data)


class ProductPerformanceView(APIView):
    """
    API endpoint for product performance statistics.
    Requires admin authentication.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Get product performance statistics."""
        # Top selling products
        top_selling = list(
            OrderItem.objects.values(
                'product__id',
                'product__product_display_name',
                'product__image'
            ).annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum('total_price'),
                order_count=Count('order', distinct=True)
            ).order_by('-total_quantity')[:10]
        )

        # Revenue by product
        revenue_by_product = list(
            OrderItem.objects.values(
                'product__id',
                'product__product_display_name'
            ).annotate(
                revenue=Sum('total_price')
            ).order_by('-revenue')[:20]
        )

        # Products by category
        products_by_category = dict(
            Product.objects.values('master_category').annotate(
                count=Count('id')
            ).values_list('master_category', 'count')
        )

        # Low stock products (this is a placeholder - adjust based on your inventory logic)
        low_stock_products = []

        # Total products
        total_products = Product.objects.count()

        data = {
            'top_selling_products': top_selling,
            'revenue_by_product': revenue_by_product,
            'products_by_category': products_by_category,
            'low_stock_products': low_stock_products,
            'total_products': total_products,
        }

        serializer = ProductPerformanceSerializer(data)
        return Response(serializer.data)


class UserActivityView(APIView):
    """
    API endpoint for user activity statistics.
    Requires admin authentication.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Get user activity statistics."""
        # Total users
        total_users = CustomUser.objects.count()

        # New users this month
        current_month_start = timezone.now().replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        new_users_this_month = CustomUser.objects.filter(
            date_joined__gte=current_month_start
        ).count()

        # Active users (users who placed at least one order)
        users_with_orders = CustomUser.objects.filter(
            orders__isnull=False
        ).distinct().count()

        # Users who made orders in last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_users = CustomUser.objects.filter(
            orders__created_at__gte=thirty_days_ago
        ).distinct().count()

        # Average orders per user
        total_orders = Order.objects.count()
        average_orders_per_user = (
            Decimal(total_orders) / Decimal(total_users)
            if total_users > 0 else Decimal('0.00')
        )

        # Conversion rate (users with orders / total users)
        conversion_rate = (
            (Decimal(users_with_orders) / Decimal(total_users)) * 100
            if total_users > 0 else Decimal('0.00')
        )

        # Registrations by month (last 12 months)
        twelve_months_ago = timezone.now() - timedelta(days=365)
        registrations_by_month = list(
            CustomUser.objects.filter(
                date_joined__gte=twelve_months_ago
            ).annotate(
                month=TruncMonth('date_joined')
            ).values('month').annotate(
                count=Count('id')
            ).order_by('month').values('month', 'count')
        )

        data = {
            'total_users': total_users,
            'new_users_this_month': new_users_this_month,
            'active_users': active_users,
            'users_with_orders': users_with_orders,
            'average_orders_per_user': float(average_orders_per_user),
            'conversion_rate': float(conversion_rate),
            'registrations_by_month': registrations_by_month,
        }

        serializer = UserActivitySerializer(data)
        return Response(serializer.data)
