from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import uuid

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderUpdateSerializer,
    OrderItemSerializer
)
from shop.models import Product


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for order management.
    Provides CRUD operations for orders with custom actions.
    Only authenticated users can access their own orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only orders belonging to the current user"""
        return Order.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use appropriate serializer based on action"""
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['partial_update', 'update']:
            return OrderUpdateSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new order from cart items"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Create order
            order = Order.objects.create(
                user=request.user,
                order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
                shipping_address=serializer.validated_data['shipping_address'],
                shipping_city=serializer.validated_data['shipping_city'],
                shipping_postal_code=serializer.validated_data['shipping_postal_code'],
                shipping_country=serializer.validated_data['shipping_country'],
            )
            
            total_amount = 0
            
            # Create order items
            for item_data in serializer.validated_data['items']:
                product = Product.objects.get(id=item_data['product_id'])
                quantity = item_data['quantity']
                
                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price_per_unit=product.price,
                )
                total_amount += order_item.total_price
            
            # Update order amounts
            order.total_amount = total_amount
            order.calculate_final_amount()
            order.save()
            
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        
        except Product.DoesNotExist:
            return Response(
                {'error': 'One or more products not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get all orders for the current user"""
        orders = self.get_queryset().order_by('-created_at')
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """Cancel an order if it's still pending"""
        order = self.get_object()
        
        if order.status != 'pending':
            return Response(
                {'error': 'Only pending orders can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        return Response(
            {'message': 'Order cancelled successfully', 'order': OrderSerializer(order).data},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def mark_as_shipped(self, request, pk=None):
        """Mark order as shipped (admin only)"""
        order = self.get_object()
        
        if order.status not in ['confirmed', 'pending']:
            return Response(
                {'error': 'Only confirmed orders can be shipped'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'shipped'
        order.shipped_at = timezone.now()
        order.save()
        
        return Response(
            {'message': 'Order marked as shipped', 'order': OrderSerializer(order).data},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def confirm_delivery(self, request, pk=None):
        """Confirm order delivery"""
        order = self.get_object()
        
        if order.status != 'shipped':
            return Response(
                {'error': 'Only shipped orders can be delivered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()
        
        return Response(
            {'message': 'Order marked as delivered', 'order': OrderSerializer(order).data},
            status=status.HTTP_200_OK
        )


class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing order items.
    Read-only access to order items.
    """
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return order items only from user's orders"""
        return OrderItem.objects.filter(order__user=self.request.user)
