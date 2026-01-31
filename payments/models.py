from django.db import models
from orders.models import Order
from users.models import CustomUser


class Payment(models.Model):
    """
    Payment model to track Stripe payment transactions.
    Stores payment intent details and status.
    """
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('wallet', 'Wallet'),
    ]
    
    # Relations
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='payments')
    
    # Stripe details
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Payment information
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='card')
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        indexes = [
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} - {self.status}"


class StripeWebhookEvent(models.Model):
    """
    Model to store and track Stripe webhook events.
    Helps with debugging and preventing duplicate processing.
    """
    EVENT_TYPE_CHOICES = [
        ('payment_intent.succeeded', 'Payment Intent Succeeded'),
        ('payment_intent.payment_failed', 'Payment Intent Failed'),
        ('payment_intent.canceled', 'Payment Intent Canceled'),
        ('charge.succeeded', 'Charge Succeeded'),
        ('charge.failed', 'Charge Failed'),
        ('charge.refunded', 'Charge Refunded'),
        ('customer.created', 'Customer Created'),
        ('customer.updated', 'Customer Updated'),
    ]
    
    # Stripe event details
    stripe_event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=100)
    
    # Event data
    data = models.JSONField()
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Stripe Webhook Event'
        verbose_name_plural = 'Stripe Webhook Events'
        indexes = [
            models.Index(fields=['stripe_event_id']),
            models.Index(fields=['event_type']),
            models.Index(fields=['processed']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.stripe_event_id}"


class Refund(models.Model):
    """
    Model to track refund transactions.
    """
    REFUND_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    REFUND_REASON_CHOICES = [
        ('requested_by_customer', 'Requested by Customer'),
        ('duplicate', 'Duplicate'),
        ('fraudulent', 'Fraudulent'),
        ('other', 'Other'),
    ]
    
    # Relations
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    
    # Stripe details
    stripe_refund_id = models.CharField(max_length=255, unique=True)
    
    # Refund information
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    status = models.CharField(max_length=20, choices=REFUND_STATUS_CHOICES, default='pending')
    reason = models.CharField(max_length=50, choices=REFUND_REASON_CHOICES, blank=True, null=True)
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Refund'
        verbose_name_plural = 'Refunds'
        indexes = [
            models.Index(fields=['stripe_refund_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Refund {self.stripe_refund_id} - {self.amount} {self.currency}"
