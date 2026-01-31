"""
Payment services for handling Stripe integration.
"""
import stripe
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from typing import Dict, Optional
from .models import Payment, Refund, StripeWebhookEvent
from orders.models import Order

# Configure Stripe API key
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


class StripePaymentService:
    """
    Service class for handling Stripe payment operations.
    """
    
    @staticmethod
    def create_payment_intent(
        order_id: int,
        user,
        payment_method: str = 'card'
    ) -> Dict:
        """
        Create a Stripe Payment Intent for an order.
        
        Args:
            order_id: The ID of the order to create payment for
            user: The user making the payment
            payment_method: Payment method type (default: 'card')
            
        Returns:
            Dict containing payment intent details and client_secret
        """
        try:
            # Get the order
            order = Order.objects.get(id=order_id, user=user)
            
            # Check if payment already exists
            if hasattr(order, 'payment'):
                raise ValueError("Payment already exists for this order")
            
            # Convert amount to cents (Stripe requires integer cents)
            amount_in_cents = int(order.final_amount * 100)
            
            # Create or retrieve Stripe customer
            stripe_customer = StripePaymentService._get_or_create_customer(user)
            
            # Create payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency='eur',
                customer=stripe_customer.id,
                description=f"Payment for Order #{order.order_number}",
                metadata={
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'user_id': user.id,
                },
                automatic_payment_methods={
                    'enabled': True,
                }
            )
            
            # Create Payment record
            payment = Payment.objects.create(
                order=order,
                user=user,
                stripe_payment_intent_id=payment_intent.id,
                stripe_customer_id=stripe_customer.id,
                amount=order.final_amount,
                currency='EUR',
                status='pending',
                payment_method=payment_method,
                description=f"Payment for Order #{order.order_number}"
            )
            
            return {
                'payment_id': payment.id,
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id,
                'amount': str(order.final_amount),
                'currency': 'EUR',
                'status': payment.status,
            }
            
        except Order.DoesNotExist:
            raise ValueError("Order not found or does not belong to user")
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")
    
    @staticmethod
    def _get_or_create_customer(user):
        """
        Get or create a Stripe customer for the user.
        
        Args:
            user: CustomUser instance
            
        Returns:
            Stripe Customer object
        """
        # Check if user already has a Stripe customer ID
        existing_payment = Payment.objects.filter(
            user=user,
            stripe_customer_id__isnull=False
        ).first()
        
        if existing_payment and existing_payment.stripe_customer_id:
            try:
                return stripe.Customer.retrieve(existing_payment.stripe_customer_id)
            except stripe.error.StripeError:
                pass  # Create new customer if retrieval fails
        
        # Create new Stripe customer
        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}".strip() or user.username,
            metadata={
                'user_id': user.id,
                'username': user.username,
            }
        )
        
        return customer
    
    @staticmethod
    def confirm_payment(payment_intent_id: str) -> Payment:
        """
        Confirm a payment and update the payment status.
        
        Args:
            payment_intent_id: Stripe Payment Intent ID
            
        Returns:
            Updated Payment instance
        """
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            
            # Retrieve payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status == 'succeeded':
                payment.status = 'succeeded'
                payment.paid_at = timezone.now()
                payment.stripe_charge_id = payment_intent.latest_charge
                
                # Update order payment status
                payment.order.payment_status = 'paid'
                payment.order.status = 'confirmed'
                payment.order.save()
                
            elif payment_intent.status == 'processing':
                payment.status = 'processing'
            elif payment_intent.status == 'canceled':
                payment.status = 'cancelled'
            else:
                payment.status = 'failed'
                payment.error_message = payment_intent.cancellation_reason or 'Payment failed'
            
            payment.save()
            return payment
            
        except Payment.DoesNotExist:
            raise ValueError("Payment not found")
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")
    
    @staticmethod
    def create_refund(
        payment_id: int,
        amount: Optional[Decimal] = None,
        reason: str = 'requested_by_customer',
        description: str = ''
    ) -> Refund:
        """
        Create a refund for a payment.
        
        Args:
            payment_id: ID of the payment to refund
            amount: Amount to refund (if None, full refund)
            reason: Reason for refund
            description: Optional description
            
        Returns:
            Refund instance
        """
        try:
            payment = Payment.objects.get(id=payment_id)
            
            if payment.status != 'succeeded':
                raise ValueError("Can only refund succeeded payments")
            
            # Determine refund amount
            refund_amount = amount if amount else payment.amount
            refund_amount_cents = int(refund_amount * 100)
            
            # Create Stripe refund
            stripe_refund = stripe.Refund.create(
                payment_intent=payment.stripe_payment_intent_id,
                amount=refund_amount_cents,
                reason=reason if reason in ['duplicate', 'fraudulent'] else None,
                metadata={
                    'payment_id': payment.id,
                    'order_id': payment.order.id,
                }
            )
            
            # Create Refund record
            refund = Refund.objects.create(
                payment=payment,
                stripe_refund_id=stripe_refund.id,
                amount=refund_amount,
                currency=payment.currency,
                status='pending' if stripe_refund.status == 'pending' else 'succeeded',
                reason=reason,
                description=description,
                refunded_at=timezone.now() if stripe_refund.status == 'succeeded' else None
            )
            
            # Update payment status if full refund
            if refund_amount >= payment.amount:
                payment.status = 'refunded'
                payment.order.payment_status = 'refunded'
                payment.order.save()
                payment.save()
            
            return refund
            
        except Payment.DoesNotExist:
            raise ValueError("Payment not found")
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")
    
    @staticmethod
    def retrieve_payment_intent(payment_intent_id: str) -> Dict:
        """
        Retrieve payment intent details from Stripe.
        
        Args:
            payment_intent_id: Stripe Payment Intent ID
            
        Returns:
            Dict with payment intent details
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'id': payment_intent.id,
                'amount': payment_intent.amount / 100,
                'currency': payment_intent.currency.upper(),
                'status': payment_intent.status,
                'client_secret': payment_intent.client_secret,
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")


class StripeWebhookService:
    """
    Service class for handling Stripe webhook events.
    """
    
    @staticmethod
    def construct_event(payload: bytes, sig_header: str) -> stripe.Event:
        """
        Construct and verify a Stripe webhook event.
        
        Args:
            payload: Request body as bytes
            sig_header: Stripe signature header
            
        Returns:
            Verified Stripe Event
        """
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            return event
        except ValueError as e:
            raise ValueError(f"Invalid payload: {str(e)}")
        except stripe.error.SignatureVerificationError as e:
            raise ValueError(f"Invalid signature: {str(e)}")
    
    @staticmethod
    def handle_event(event: stripe.Event) -> StripeWebhookEvent:
        """
        Handle a Stripe webhook event.
        
        Args:
            event: Stripe Event object
            
        Returns:
            StripeWebhookEvent instance
        """
        # Check if event already processed
        existing_event = StripeWebhookEvent.objects.filter(
            stripe_event_id=event.id
        ).first()
        
        if existing_event:
            return existing_event
        
        # Create webhook event record
        webhook_event = StripeWebhookEvent.objects.create(
            stripe_event_id=event.id,
            event_type=event.type,
            data=event.data.to_dict()
        )
        
        try:
            # Handle different event types
            if event.type == 'payment_intent.succeeded':
                StripeWebhookService._handle_payment_succeeded(event)
            elif event.type == 'payment_intent.payment_failed':
                StripeWebhookService._handle_payment_failed(event)
            elif event.type == 'payment_intent.canceled':
                StripeWebhookService._handle_payment_canceled(event)
            elif event.type == 'charge.refunded':
                StripeWebhookService._handle_charge_refunded(event)
            
            webhook_event.processed = True
            webhook_event.processed_at = timezone.now()
            
        except Exception as e:
            webhook_event.processing_error = str(e)
        
        webhook_event.save()
        return webhook_event
    
    @staticmethod
    def _handle_payment_succeeded(event: stripe.Event):
        """Handle payment_intent.succeeded event."""
        payment_intent = event.data.object
        StripePaymentService.confirm_payment(payment_intent.id)
    
    @staticmethod
    def _handle_payment_failed(event: stripe.Event):
        """Handle payment_intent.payment_failed event."""
        payment_intent = event.data.object
        
        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent.id
            )
            payment.status = 'failed'
            payment.error_message = payment_intent.last_payment_error.get('message', 'Payment failed')
            payment.save()
            
            payment.order.payment_status = 'failed'
            payment.order.save()
        except Payment.DoesNotExist:
            pass
    
    @staticmethod
    def _handle_payment_canceled(event: stripe.Event):
        """Handle payment_intent.canceled event."""
        payment_intent = event.data.object
        
        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent.id
            )
            payment.status = 'cancelled'
            payment.save()
            
            payment.order.payment_status = 'failed'
            payment.order.status = 'cancelled'
            payment.order.save()
        except Payment.DoesNotExist:
            pass
    
    @staticmethod
    def _handle_charge_refunded(event: stripe.Event):
        """Handle charge.refunded event."""
        charge = event.data.object
        
        try:
            payment = Payment.objects.get(stripe_charge_id=charge.id)
            
            # Update refund status if exists
            for refund_data in charge.refunds.data:
                try:
                    refund = Refund.objects.get(stripe_refund_id=refund_data.id)
                    refund.status = 'succeeded'
                    refund.refunded_at = timezone.now()
                    refund.save()
                except Refund.DoesNotExist:
                    pass
                    
        except Payment.DoesNotExist:
            pass
