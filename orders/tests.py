from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from decimal import Decimal

from users.models import CustomUser
from shop.models import Product
from orders.models import Order, OrderItem


class OrderModelTestCase(TestCase):
    """Tests for Order model"""
    
    def setUp(self):
        """Set up test user and products"""
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.product = Product.objects.create(
            id=100,
            product_display_name="Test Product",
            gender="Men",
            master_category="Apparel",
            sub_category="Topwear",
            article_type="Shirts",
            base_colour="Blue",
            season="Summer",
            year=2024,
            usage="Casual",
            price=50.00
        )
        
        self.order = Order.objects.create(
            user=self.user,
            order_number="ORD-TEST001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country",
            total_amount=Decimal('100.00'),
            discount_amount=Decimal('10.00'),
            tax_amount=Decimal('15.00')
        )
        self.order.calculate_final_amount()
        self.order.save()
    
    def test_order_creation(self):
        """Test that order is created correctly"""
        self.assertEqual(self.order.order_number, "ORD-TEST001")
        self.assertEqual(self.order.user, self.user)
        self.assertEqual(self.order.status, "pending")
        self.assertEqual(self.order.payment_status, "pending")
    
    def test_order_string_representation(self):
        """Test order __str__ method"""
        expected = f"Order #ORD-TEST001 - testuser"
        self.assertEqual(str(self.order), expected)
    
    def test_calculate_final_amount(self):
        """Test final amount calculation: total - discount + tax"""
        self.order.calculate_final_amount()
        # 100 - 10 + 15 = 105
        self.assertEqual(self.order.final_amount, Decimal('105.00'))
    
    def test_order_status_choices(self):
        """Test that order status can be set to valid choices"""
        for status_choice in ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']:
            self.order.status = status_choice
            self.order.save()
            self.order.refresh_from_db()
            self.assertEqual(self.order.status, status_choice)


class OrderItemModelTestCase(TestCase):
    """Tests for OrderItem model"""
    
    def setUp(self):
        """Set up test order and product"""
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.product = Product.objects.create(
            id=101,
            product_display_name="Test Product",
            gender="Men",
            master_category="Apparel",
            sub_category="Topwear",
            article_type="Shirts",
            base_colour="Blue",
            season="Summer",
            year=2024,
            usage="Casual",
            price=50.00
        )
        
        self.order = Order.objects.create(
            user=self.user,
            order_number="ORD-ITEM001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country"
        )
    
    def test_order_item_creation(self):
        """Test that order item is created correctly"""
        item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            price_per_unit=Decimal('50.00')
        )
        self.assertEqual(item.product, self.product)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.total_price, Decimal('100.00'))
    
    def test_order_item_total_price_calculation(self):
        """Test that total price is calculated on save"""
        item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=3,
            price_per_unit=Decimal('25.00')
        )
        item.refresh_from_db()
        self.assertEqual(item.total_price, Decimal('75.00'))
    
    def test_order_item_creation(self):
        """Test that order item is created correctly"""
        item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price_per_unit=Decimal('50.00')
        )
        expected = f"Test Product (Order #ORD-ITEM001)"
        self.assertEqual(str(item), expected)


class OrderAPITestCase(TestCase):
    """Tests for Order API endpoints"""
    
    def setUp(self):
        """Set up test client, user, and products"""
        self.client = APIClient()
        
        # Create user and authenticate
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # Create products
        self.product1 = Product.objects.create(
            id=200,
            product_display_name="Product 1",
            gender="Men",
            master_category="Apparel",
            sub_category="Topwear",
            article_type="Shirts",
            base_colour="Blue",
            season="Summer",
            year=2024,
            usage="Casual",
            price=30.00
        )
        
        self.product2 = Product.objects.create(
            id=201,
            product_display_name="Product 2",
            gender="Women",
            master_category="Apparel",
            sub_category="Dress",
            article_type="Dresses",
            base_colour="Red",
            season="Spring",
            year=2024,
            usage="Party",
            price=60.00
        )
        
        self.list_url = reverse('order-list')
    
    def test_create_order(self):
        """Test creating an order with multiple items"""
        data = {
            'items': [
                {'product_id': 200, 'quantity': 2},
                {'product_id': 201, 'quantity': 1}
            ],
            'shipping_address': '123 Test St',
            'shipping_city': 'Test City',
            'shipping_postal_code': '12345',
            'shipping_country': 'Test Country'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_number', response.data)
        self.assertEqual(len(response.data['items']), 2)
        
        # Verify order was created
        self.assertTrue(Order.objects.filter(order_number=response.data['order_number']).exists())
    
    def test_list_orders(self):
        """Test listing user's orders"""
        # Create an order
        order = Order.objects.create(
            user=self.user,
            order_number="ORD-LIST001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country"
        )
        
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_retrieve_order(self):
        """Test retrieving a single order"""
        order = Order.objects.create(
            user=self.user,
            order_number="ORD-RETRIEVE001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country",
            total_amount=Decimal('100.00')
        )
        
        url = reverse('order-detail', kwargs={'pk': order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['order_number'], "ORD-RETRIEVE001")
    
    def test_cancel_order(self):
        """Test cancelling a pending order"""
        order = Order.objects.create(
            user=self.user,
            order_number="ORD-CANCEL001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country",
            status="pending"
        )
        
        url = reverse('order-cancel-order', kwargs={'pk': order.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.status, "cancelled")
    
    def test_cannot_cancel_shipped_order(self):
        """Test that shipped orders cannot be cancelled"""
        order = Order.objects.create(
            user=self.user,
            order_number="ORD-SHIPPED001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country",
            status="shipped"
        )
        
        url = reverse('order-cancel-order', kwargs={'pk': order.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_mark_order_as_shipped(self):
        """Test marking order as shipped"""
        order = Order.objects.create(
            user=self.user,
            order_number="ORD-MARK001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country",
            status="pending"
        )
        
        url = reverse('order-mark-as-shipped', kwargs={'pk': order.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.status, "shipped")
        self.assertIsNotNone(order.shipped_at)
    
    def test_confirm_delivery(self):
        """Test confirming order delivery"""
        order = Order.objects.create(
            user=self.user,
            order_number="ORD-DELIVERY001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country",
            status="shipped"
        )
        
        url = reverse('order-confirm-delivery', kwargs={'pk': order.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.status, "delivered")
        self.assertIsNotNone(order.delivered_at)
    
    def test_my_orders_action(self):
        """Test my_orders custom action"""
        # Create orders
        Order.objects.create(
            user=self.user,
            order_number="ORD-MY001",
            shipping_address="123 Test St",
            shipping_city="Test City",
            shipping_postal_code="12345",
            shipping_country="Test Country"
        )
        
        Order.objects.create(
            user=self.user,
            order_number="ORD-MY002",
            shipping_address="456 Test Ave",
            shipping_city="Another City",
            shipping_postal_code="54321",
            shipping_country="Test Country"
        )
        
        url = reverse('order-my-orders')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
    
    def test_create_order_unauthorized(self):
        """Test that unauthenticated user cannot create order"""
        self.client.credentials()  # Remove authentication
        
        data = {
            'items': [{'product_id': 200, 'quantity': 1}],
            'shipping_address': '123 Test St',
            'shipping_city': 'Test City',
            'shipping_postal_code': '12345',
            'shipping_country': 'Test Country'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_order_with_invalid_product(self):
        """Test creating order with non-existent product"""
        data = {
            'items': [{'product_id': 99999, 'quantity': 1}],
            'shipping_address': '123 Test St',
            'shipping_city': 'Test City',
            'shipping_postal_code': '12345',
            'shipping_country': 'Test Country'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_order_with_empty_items(self):
        """Test creating order with empty items list"""
        data = {
            'items': [],
            'shipping_address': '123 Test St',
            'shipping_city': 'Test City',
            'shipping_postal_code': '12345',
            'shipping_country': 'Test Country'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

