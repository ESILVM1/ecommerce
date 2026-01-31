"""
Tests for payments app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from unittest.mock import patch, Mock
from .models import Payment, Refund, StripeWebhookEvent
from orders.models import Order, OrderItem
from shop.models import Product, Category
from .services import StripePaymentService

User = get_user_model()


class PaymentModelTest(TestCase):
    """Test Payment model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create category and product
        self.category = Category.objects.create(
            category_name='Test Category',
            category_display_name='Test Category'
        )
        
        self.product = Product.objects.create(
            product_display_name='Test Product',
            category=self.category,
            price=Decimal('99.99'),
            stock=10
        )
        
        # Create order
        self.order = Order.objects.create(
            user=self.user,
            order_number='ORD-001',
            total_amount=Decimal('99.99'),
            final_amount=Decimal('99.99'),
            shipping_address='123 Test St',
            shipping_city='Test City',
            shipping_postal_code='12345',
            shipping_country='Test Country'
        )
        
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price_per_unit=Decimal('99.99'),
            total_price=Decimal('99.99')
        )
    
    def test_create_payment(self):
        """Test creating a payment."""
        payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            stripe_payment_intent_id='pi_test_123',
            amount=Decimal('99.99'),
            currency='EUR',
            status='pending'
        )
        
        self.assertEqual(payment.order, self.order)
        self.assertEqual(payment.user, self.user)
        self.assertEqual(payment.amount, Decimal('99.99'))
        self.assertEqual(payment.status, 'pending')
        self.assertTrue(payment.stripe_payment_intent_id.startswith('pi_'))
    
    def test_payment_string_representation(self):
        """Test payment string representation."""
        payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            stripe_payment_intent_id='pi_test_123',
            amount=Decimal('99.99')
        )
        
        expected = f"Payment pi_test_123 - pending"
        self.assertEqual(str(payment), expected)
    
    def test_one_payment_per_order(self):
        """Test that only one payment can be created per order."""
        Payment.objects.create(
            order=self.order,
            user=self.user,
            stripe_payment_intent_id='pi_test_123',
            amount=Decimal('99.99')
        )
        
        # This should work because we're using the same order (OneToOne)
        # but will raise an error if we try to create another
        with self.assertRaises(Exception):
            Payment.objects.create(
                order=self.order,
                user=self.user,
                stripe_payment_intent_id='pi_test_456',
                amount=Decimal('99.99')
            )


class RefundModelTest(TestCase):
    """Test Refund model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            category_name='Test Category',
            category_display_name='Test Category'
        )
        
        self.product = Product.objects.create(
            product_display_name='Test Product',
            category=self.category,
            price=Decimal('99.99'),
            stock=10
        )
        
        self.order = Order.objects.create(
            user=self.user,
            order_number='ORD-001',
            total_amount=Decimal('99.99'),
            final_amount=Decimal('99.99'),
            shipping_address='123 Test St',
            shipping_city='Test City',
            shipping_postal_code='12345',
            shipping_country='Test Country'
        )
        
        self.payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            stripe_payment_intent_id='pi_test_123',
            amount=Decimal('99.99'),
            status='succeeded'
        )
    
    def test_create_refund(self):
        """Test creating a refund."""
        refund = Refund.objects.create(
            payment=self.payment,
            stripe_refund_id='re_test_123',
            amount=Decimal('99.99'),
            currency='EUR',
            status='succeeded',
            reason='requested_by_customer'
        )
        
        self.assertEqual(refund.payment, self.payment)
        self.assertEqual(refund.amount, Decimal('99.99'))
        self.assertEqual(refund.status, 'succeeded')
        self.assertEqual(refund.reason, 'requested_by_customer')
    
    def test_refund_string_representation(self):
        """Test refund string representation."""
        refund = Refund.objects.create(
            payment=self.payment,
            stripe_refund_id='re_test_123',
            amount=Decimal('50.00'),
            currency='EUR'
        )
        
        expected = "Refund re_test_123 - 50.00 EUR"
        self.assertEqual(str(refund), expected)
    
    def test_partial_refund(self):
        """Test creating a partial refund."""
        refund = Refund.objects.create(
            payment=self.payment,
            stripe_refund_id='re_test_123',
            amount=Decimal('50.00'),  # Partial refund
            currency='EUR',
            status='succeeded'
        )
        
        self.assertLess(refund.amount, self.payment.amount)
        self.assertEqual(refund.amount, Decimal('50.00'))


class StripeWebhookEventModelTest(TestCase):
    """Test StripeWebhookEvent model."""
    
    def test_create_webhook_event(self):
        """Test creating a webhook event."""
        event = StripeWebhookEvent.objects.create(
            stripe_event_id='evt_test_123',
            event_type='payment_intent.succeeded',
            data={'test': 'data'}
        )
        
        self.assertEqual(event.stripe_event_id, 'evt_test_123')
        self.assertEqual(event.event_type, 'payment_intent.succeeded')
        self.assertFalse(event.processed)
        self.assertEqual(event.data, {'test': 'data'})
    
    def test_webhook_event_string_representation(self):
        """Test webhook event string representation."""
        event = StripeWebhookEvent.objects.create(
            stripe_event_id='evt_test_123',
            event_type='payment_intent.succeeded',
            data={}
        )
        
        expected = "payment_intent.succeeded - evt_test_123"
        self.assertEqual(str(event), expected)
    
    def test_mark_event_as_processed(self):
        """Test marking webhook event as processed."""
        event = StripeWebhookEvent.objects.create(
            stripe_event_id='evt_test_123',
            event_type='payment_intent.succeeded',
            data={}
        )
        
        self.assertFalse(event.processed)
        
        event.processed = True
        event.save()
        
        self.assertTrue(event.processed)


class StripePaymentServiceTest(TestCase):
    """Test StripePaymentService."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            category_name='Test Category',
            category_display_name='Test Category'
        )
        
        self.product = Product.objects.create(
            product_display_name='Test Product',
            category=self.category,
            price=Decimal('99.99'),
            stock=10
        )
        
        self.order = Order.objects.create(
            user=self.user,
            order_number='ORD-001',
            total_amount=Decimal('99.99'),
            final_amount=Decimal('99.99'),
            shipping_address='123 Test St',
            shipping_city='Test City',
            shipping_postal_code='12345',
            shipping_country='Test Country'
        )
    
    @patch('stripe.Customer.create')
    @patch('stripe.PaymentIntent.create')
    def test_create_payment_intent(self, mock_payment_intent, mock_customer):
        """Test creating a payment intent."""
        # Mock Stripe responses
        mock_customer.return_value = Mock(id='cus_test_123')
        mock_payment_intent.return_value = Mock(
            id='pi_test_123',
            client_secret='pi_test_123_secret_test',
            status='requires_payment_method'
        )
        
        result = StripePaymentService.create_payment_intent(
            order_id=self.order.id,
            user=self.user
        )
        
        self.assertIn('payment_id', result)
        self.assertIn('client_secret', result)
        self.assertEqual(result['payment_intent_id'], 'pi_test_123')
        self.assertEqual(result['amount'], '99.99')
        
        # Verify Payment was created in database
        payment = Payment.objects.get(id=result['payment_id'])
        self.assertEqual(payment.stripe_payment_intent_id, 'pi_test_123')
        self.assertEqual(payment.amount, Decimal('99.99'))
    
    @patch('stripe.PaymentIntent.retrieve')
    def test_confirm_payment(self, mock_retrieve):
        """Test confirming a payment."""
        # Create a payment
        payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            stripe_payment_intent_id='pi_test_123',
            amount=Decimal('99.99'),
            status='pending'
        )
        
        # Mock Stripe response
        mock_retrieve.return_value = Mock(
            id='pi_test_123',
            status='succeeded',
            latest_charge='ch_test_123'
        )
        
        updated_payment = StripePaymentService.confirm_payment('pi_test_123')
        
        self.assertEqual(updated_payment.status, 'succeeded')
        self.assertEqual(updated_payment.stripe_charge_id, 'ch_test_123')
        self.assertIsNotNone(updated_payment.paid_at)
        
        # Verify order status was updated
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, 'paid')
        self.assertEqual(self.order.status, 'confirmed')
