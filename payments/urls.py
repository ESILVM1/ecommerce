from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'refunds', views.RefundViewSet, basename='refund')

urlpatterns = [
    # ViewSet routes
    path('', include(router.urls)),
    
    # Stripe webhook endpoint
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
]