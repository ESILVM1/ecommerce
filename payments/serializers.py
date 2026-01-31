from rest_framework import serializers
from .models import Payment, StripeWebhookEvent, Refund


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model.
    Provides read-only access to payment details.
    """
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'order_number',
            'user',
            'user_email',
            'stripe_payment_intent_id',
            'stripe_customer_id',
            'stripe_charge_id',
            'amount',
            'currency',
            'status',
            'payment_method',
            'description',
            'error_message',
            'created_at',
            'updated_at',
            'paid_at',
        ]
        read_only_fields = [
            'id',
            'stripe_payment_intent_id',
            'stripe_customer_id',
            'stripe_charge_id',
            'status',
            'created_at',
            'updated_at',
            'paid_at',
        ]


class CreatePaymentIntentSerializer(serializers.Serializer):
    """
    Serializer for creating a Stripe Payment Intent.
    """
    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(
        choices=['card', 'bank_transfer', 'wallet'],
        default='card'
    )
    
    def validate_order_id(self, value):
        """Validate that the order exists and belongs to the requesting user."""
        from orders.models import Order
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found.")
        
        # Check if payment already exists for this order
        if hasattr(order, 'payment'):
            raise serializers.ValidationError(
                "Payment already exists for this order."
            )
        
        return value


class RefundSerializer(serializers.ModelSerializer):
    """
    Serializer for Refund model.
    """
    payment_intent_id = serializers.CharField(
        source='payment.stripe_payment_intent_id',
        read_only=True
    )
    
    class Meta:
        model = Refund
        fields = [
            'id',
            'payment',
            'payment_intent_id',
            'stripe_refund_id',
            'amount',
            'currency',
            'status',
            'reason',
            'description',
            'error_message',
            'created_at',
            'updated_at',
            'refunded_at',
        ]
        read_only_fields = [
            'id',
            'stripe_refund_id',
            'status',
            'created_at',
            'updated_at',
            'refunded_at',
        ]


class CreateRefundSerializer(serializers.Serializer):
    """
    Serializer for creating a refund.
    """
    payment_id = serializers.IntegerField()
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        help_text="Amount to refund. If not provided, full amount will be refunded."
    )
    reason = serializers.ChoiceField(
        choices=['requested_by_customer', 'duplicate', 'fraudulent', 'other'],
        required=False
    )
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_payment_id(self, value):
        """Validate that the payment exists and can be refunded."""
        try:
            payment = Payment.objects.get(id=value)
        except Payment.DoesNotExist:
            raise serializers.ValidationError("Payment not found.")
        
        if payment.status != 'succeeded':
            raise serializers.ValidationError(
                "Only succeeded payments can be refunded."
            )
        
        return value


class StripeWebhookEventSerializer(serializers.ModelSerializer):
    """
    Serializer for Stripe Webhook Event model.
    """
    class Meta:
        model = StripeWebhookEvent
        fields = [
            'id',
            'stripe_event_id',
            'event_type',
            'data',
            'processed',
            'processing_error',
            'created_at',
            'processed_at',
        ]
        read_only_fields = ['id', 'created_at', 'processed_at']
