"""
Payment views for handling Stripe payment operations.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from .models import Payment, Refund, StripeWebhookEvent
from .serializers import (
    PaymentSerializer,
    CreatePaymentIntentSerializer,
    RefundSerializer,
    CreateRefundSerializer,
    StripeWebhookEventSerializer
)
from .services import StripePaymentService, StripeWebhookService


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing payment records.
    Only the payment owner can view their payments.
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return payments for the current user only."""
        return Payment.objects.filter(user=self.request.user).select_related(
            'order', 'user'
        )
    
    @action(detail=False, methods=['post'])
    def create_payment_intent(self, request):
        """
        Create a new Stripe Payment Intent for an order.
        
        Request body:
        {
            "order_id": 1,
            "payment_method": "card"  // optional, default: "card"
        }
        """
        serializer = CreatePaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = StripePaymentService.create_payment_intent(
                order_id=serializer.validated_data['order_id'],
                user=request.user,
                payment_method=serializer.validated_data.get('payment_method', 'card')
            )
            
            return Response(result, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def confirm(self, request, pk=None):
        """
        Confirm a payment and retrieve its current status.
        """
        payment = self.get_object()
        
        try:
            updated_payment = StripePaymentService.confirm_payment(
                payment.stripe_payment_intent_id
            )
            serializer = self.get_serializer(updated_payment)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Get the current status of a payment from Stripe.
        """
        payment = self.get_object()
        
        try:
            payment_intent = StripePaymentService.retrieve_payment_intent(
                payment.stripe_payment_intent_id
            )
            return Response(payment_intent)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RefundViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing refund records.
    Only the refund owner (via payment) can view their refunds.
    """
    serializer_class = RefundSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return refunds for the current user's payments only."""
        return Refund.objects.filter(
            payment__user=self.request.user
        ).select_related('payment', 'payment__order')
    
    @action(detail=False, methods=['post'])
    def create_refund(self, request):
        """
        Create a refund for a payment.
        
        Request body:
        {
            "payment_id": 1,
            "amount": 50.00,  // optional, defaults to full refund
            "reason": "requested_by_customer",  // optional
            "description": "Customer requested refund"  // optional
        }
        """
        serializer = CreateRefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Verify the payment belongs to the user
            payment = Payment.objects.get(
                id=serializer.validated_data['payment_id'],
                user=request.user
            )
            
            refund = StripePaymentService.create_refund(
                payment_id=payment.id,
                amount=serializer.validated_data.get('amount'),
                reason=serializer.validated_data.get('reason', 'requested_by_customer'),
                description=serializer.validated_data.get('description', '')
            )
            
            response_serializer = RefundSerializer(refund)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found or does not belong to you'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    View for handling Stripe webhook events.
    This endpoint receives events from Stripe about payment status changes.
    """
    permission_classes = []  # No authentication required for webhooks
    
    def post(self, request):
        """
        Handle incoming Stripe webhook events.
        """
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        if not sig_header:
            return HttpResponse('Missing signature', status=400)
        
        try:
            # Construct and verify the event
            event = StripeWebhookService.construct_event(payload, sig_header)
            
            # Handle the event
            webhook_event = StripeWebhookService.handle_event(event)
            
            return HttpResponse(
                f'Webhook received: {event.type}',
                status=200
            )
            
        except ValueError as e:
            return HttpResponse(str(e), status=400)
        except Exception as e:
            return HttpResponse(
                f'Webhook processing failed: {str(e)}',
                status=500
            )
