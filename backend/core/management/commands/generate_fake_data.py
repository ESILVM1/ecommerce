"""
Django management command to generate fake data for analytics dashboard.
Usage: python manage.py generate_fake_data
"""
import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import models

from shop.models import Product
from orders.models import Order, OrderItem
from payments.models import Payment

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate fake data for analytics dashboard testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=50,
            help='Number of fake users to create'
        )
        parser.add_argument(
            '--orders',
            type=int,
            default=100,
            help='Number of fake orders to create'
        )

    def handle(self, *args, **options):
        num_users = options['users']
        num_orders = options['orders']
        
        self.stdout.write(self.style.SUCCESS('Starting fake data generation...'))
        
        # Create fake users
        self.stdout.write('Creating fake users...')
        fake_users = []
        for i in range(num_users):
            username = f'user{i+1}'
            email = f'user{i+1}@test.com'
            
            # Skip if user already exists
            if User.objects.filter(username=username).exists():
                continue
                
            user = User.objects.create_user(
                username=username,
                email=email,
                password='test123456',
                first_name=random.choice(['Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Emma']),
                last_name=random.choice(['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit'])
            )
            fake_users.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(fake_users)} users'))
        
        # Get all users (including existing ones)
        all_users = list(User.objects.filter(username__startswith='user'))
        
        if not all_users:
            self.stdout.write(self.style.ERROR('No users available to create orders'))
            return
        
        # Get random products
        products = list(Product.objects.all().order_by('?')[:100])
        
        if not products:
            self.stdout.write(self.style.ERROR('No products available. Please import products first.'))
            return
        
        # Create fake orders over the past 12 months
        self.stdout.write('Creating fake orders...')
        orders_created = 0
        
        for i in range(num_orders):
            # Random date within last 12 months
            days_ago = random.randint(0, 365)
            order_date = timezone.now() - timedelta(days=days_ago)
            
            # Random user
            user = random.choice(all_users)
            
            # Random status and payment status
            status_choices = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
            payment_status_choices = ['pending', 'paid', 'failed', 'refunded']
            
            status = random.choice(status_choices)
            if status == 'delivered':
                payment_status = 'paid'
            elif status == 'cancelled':
                payment_status = random.choice(['pending', 'failed'])
            else:
                payment_status = random.choice(payment_status_choices)
            
            # Create order
            order = Order.objects.create(
                user=user,
                order_number=f'ORD-{timezone.now().timestamp():.0f}-{i}',
                status=status,
                payment_status=payment_status,
                shipping_address=f'{random.randint(1, 999)} Rue Example',
                shipping_city=random.choice(['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes']),
                shipping_postal_code=f'{random.randint(10000, 99999)}',
                shipping_country='France',
                created_at=order_date,
                updated_at=order_date
            )
            
            # Add random items to order
            num_items = random.randint(1, 5)
            total_amount = Decimal('0.00')
            
            for _ in range(num_items):
                product = random.choice(products)
                quantity = random.randint(1, 3)
                price = Decimal(str(product.price))
                
                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price_per_unit=price,
                    total_price=price * quantity
                )
                
                total_amount += order_item.total_price
            
            # Calculate final amounts
            order.total_amount = total_amount
            discount = Decimal(str(random.uniform(0, 0.1))) * total_amount  # 0-10% discount
            order.discount_amount = discount
            tax = (total_amount - discount) * Decimal('0.20')  # 20% VAT
            order.tax_amount = tax
            order.final_amount = total_amount - discount + tax
            order.save()
            
            # Create payment for paid orders
            if payment_status == 'paid':
                Payment.objects.create(
                    order=order,
                    user=user,
                    stripe_payment_intent_id=f'pi_fake_{i}_{random.randint(1000, 9999)}',
                    stripe_customer_id=f'cus_fake_{user.id}',
                    stripe_charge_id=f'ch_fake_{i}',
                    amount=order.final_amount,
                    currency='EUR',
                    status='succeeded',
                    payment_method='card',
                    paid_at=order_date + timedelta(minutes=random.randint(1, 30))
                )
            
            orders_created += 1
            
            if orders_created % 20 == 0:
                self.stdout.write(f'  ... {orders_created} orders created')
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {orders_created} orders with items'))
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('Fake data generation completed!'))
        self.stdout.write('='*50)
        self.stdout.write(f'Total users: {User.objects.count()}')
        self.stdout.write(f'Total orders: {Order.objects.count()}')
        self.stdout.write(f'Total revenue: {Order.objects.filter(payment_status="paid").aggregate(total=models.Sum("final_amount"))["total"] or 0} EUR')
        self.stdout.write('\n✓ You can now access the analytics dashboard with meaningful data!')
