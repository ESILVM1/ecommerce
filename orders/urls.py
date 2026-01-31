from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderItemViewSet

# URL routing configuration for orders app
# DefaultRouter automatically generates CRUD endpoints for registered ViewSets
# Plus custom actions defined in ViewSets (my_orders, cancel_order, mark_as_shipped, confirm_delivery)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-items', OrderItemViewSet, basename='order-item')

urlpatterns = [
    path('', include(router.urls)),
]