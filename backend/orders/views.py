from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import uuid
import logging

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderUpdateSerializer,
    OrderItemSerializer
)
from shop.models import Product

logger = logging.getLogger('orders')


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for order management.
    Provides CRUD operations for orders with custom actions.
    Only authenticated users can access their own orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return only orders belonging to the current user.
        Optimized with select_related for user and prefetch_related for items.
        """
        return Order.objects.filter(
            user=self.request.user
        ).select_related(
            'user'
        ).prefetch_related(
            'items__product'
        )
    
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
        """
        Create a new order from cart items.
        Optimized to fetch all products at once to avoid N+1 queries.
        """
        logger.info(f"Order creation initiated by user {request.user.id} ({request.user.email})")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Fetch all products at once to avoid N+1 queries
            product_ids = [item['product_id'] for item in serializer.validated_data['items']]
            products = {
                p.id: p for p in Product.objects.filter(id__in=product_ids)
            }
            
            # Verify all products exist
            if len(products) != len(product_ids):
                missing_ids = set(product_ids) - set(products.keys())
                logger.warning(
                    f"Order creation failed for user {request.user.id}: "
                    f"Products not found: {missing_ids}"
                )
                return Response(
                    {'error': f'Products not found: {missing_ids}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
                shipping_address=serializer.validated_data['shipping_address'],
                shipping_city=serializer.validated_data['shipping_city'],
                shipping_postal_code=serializer.validated_data['shipping_postal_code'],
                shipping_country=serializer.validated_data['shipping_country'],
            )
            
            logger.info(f"Order {order.order_number} created with ID {order.id}")
            
            total_amount = 0
            order_items = []
            
            # Prepare order items for bulk creation
            for item_data in serializer.validated_data['items']:
                product = products[item_data['product_id']]
                quantity = item_data['quantity']
                price_per_unit = product.price
                item_total_price = quantity * price_per_unit
                
                order_item = OrderItem(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price_per_unit=price_per_unit,
                    total_price=item_total_price,  # Calculate manually
                )
                total_amount += item_total_price
                order_items.append(order_item)
            
            # Bulk create order items
            OrderItem.objects.bulk_create(order_items)
            logger.debug(f"Created {len(order_items)} items for order {order.order_number}")
            
            # Update order amounts
            order.total_amount = total_amount
            order.calculate_final_amount()
            order.save()
            
            logger.info(
                f"Order {order.order_number} completed: "
                f"Total ${order.final_amount}, {len(order_items)} items, "
                f"User: {request.user.email}"
            )
            
            # Fetch order with related data for response
            order = Order.objects.select_related('user').prefetch_related(
                'items__product'
            ).get(id=order.id)
            
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            logger.error(
                f"Order creation failed for user {request.user.id}: {str(e)}",
                exc_info=True
            )
            return Response(
                {'error': str(e)},
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
            logger.warning(
                f"Cancel order failed: Order {order.order_number} "
                f"has status {order.status}, cannot cancel"
            )
            return Response(
                {'error': 'Only pending orders can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        logger.info(
            f"Order {order.order_number} cancelled by user {request.user.email}"
        )
        
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
        """
        Return order items only from user's orders.
        Optimized with select_related for order and product.
        """
        return OrderItem.objects.filter(
            order__user=self.request.user
        ).select_related(
            'order',
            'order__user',
            'product'
        )
