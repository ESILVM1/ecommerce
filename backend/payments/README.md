# Payments App - Stripe Integration

This Django app handles payment processing using Stripe for the ecommerce platform.

## Features

- **Payment Intent Creation**: Create Stripe Payment Intents for orders
- **Payment Confirmation**: Verify and confirm payments
- **Refund Management**: Process full or partial refunds
- **Webhook Handling**: Receive and process Stripe webhook events
- **Customer Management**: Automatic Stripe customer creation and management
- **Secure Payment Processing**: PCI-compliant payment handling via Stripe

## Models

### Payment
Stores payment transaction details:
- `order`: One-to-one relationship with Order
- `user`: Foreign key to CustomUser
- `stripe_payment_intent_id`: Unique Stripe Payment Intent ID
- `stripe_customer_id`: Stripe Customer ID
- `stripe_charge_id`: Stripe Charge ID
- `amount`: Payment amount
- `currency`: Payment currency (default: EUR)
- `status`: Payment status (pending, processing, succeeded, failed, cancelled, refunded)
- `payment_method`: Payment method type (card, bank_transfer, wallet)

### Refund
Tracks refund transactions:
- `payment`: Foreign key to Payment
- `stripe_refund_id`: Unique Stripe Refund ID
- `amount`: Refund amount
- `status`: Refund status
- `reason`: Refund reason

### StripeWebhookEvent
Logs Stripe webhook events for debugging and audit:
- `stripe_event_id`: Unique Stripe Event ID
- `event_type`: Type of webhook event
- `data`: Event data (JSON)
- `processed`: Whether the event has been processed

## Setup

### 1. Install Dependencies

```bash
pip install stripe==11.3.0
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Stripe API Keys
STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

To get your Stripe keys:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** > **API keys**
3. Copy your **Publishable key** (starts with `pk_`) and **Secret key** (starts with `sk_`)

### 3. Run Migrations

```bash
python manage.py makemigrations payments
python manage.py migrate payments
```

### 4. Configure Webhooks

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook/stripe/`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the **Signing secret** (starts with `whsec_`) to your `.env` file

## API Endpoints

### Payments

#### List Payments
```http
GET /api/payments/payments/
```
Returns all payments for the authenticated user.

#### Get Payment Details
```http
GET /api/payments/payments/{id}/
```
Get details of a specific payment.

#### Create Payment Intent
```http
POST /api/payments/payments/create_payment_intent/
Content-Type: application/json

{
  "order_id": 1,
  "payment_method": "card"
}
```

**Response:**
```json
{
  "payment_id": 1,
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx",
  "amount": "99.99",
  "currency": "EUR",
  "status": "pending"
}
```

#### Confirm Payment
```http
GET /api/payments/payments/{id}/confirm/
```
Confirms and retrieves the current status of a payment.

#### Get Payment Status
```http
GET /api/payments/payments/{id}/status/
```
Retrieves the current status from Stripe.

### Refunds

#### List Refunds
```http
GET /api/payments/refunds/
```
Returns all refunds for the authenticated user's payments.

#### Create Refund
```http
POST /api/payments/refunds/create_refund/
Content-Type: application/json

{
  "payment_id": 1,
  "amount": 50.00,  // Optional, defaults to full refund
  "reason": "requested_by_customer",  // Optional
  "description": "Customer requested refund"  // Optional
}
```

**Refund Reasons:**
- `requested_by_customer`
- `duplicate`
- `fraudulent`
- `other`

### Webhooks

#### Stripe Webhook Endpoint
```http
POST /api/payments/webhook/stripe/
```
This endpoint receives webhook events from Stripe. It's automatically called by Stripe when payment events occur.

**Supported Events:**
- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed
- `payment_intent.canceled`: Payment was canceled
- `charge.refunded`: Charge was refunded

## Frontend Integration Example

### 1. Create Payment Intent

```javascript
// Create payment intent for an order
const response = await fetch('/api/payments/payments/create_payment_intent/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${userToken}`
  },
  body: JSON.stringify({
    order_id: 1,
    payment_method: 'card'
  })
});

const { client_secret, payment_id } = await response.json();
```

### 2. Confirm Payment with Stripe.js

```javascript
// Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_your_public_key_here');

// Confirm the payment
const { error, paymentIntent } = await stripe.confirmCardPayment(
  client_secret,
  {
    payment_method: {
      card: cardElement,  // Stripe Card Element
      billing_details: {
        name: 'Customer Name',
        email: 'customer@example.com'
      }
    }
  }
);

if (error) {
  console.error('Payment failed:', error.message);
} else if (paymentIntent.status === 'succeeded') {
  console.log('Payment successful!');
  // Redirect to success page or update order status
}
```

### 3. Check Payment Status

```javascript
// After payment, verify the status
const statusResponse = await fetch(`/api/payments/payments/${payment_id}/confirm/`, {
  headers: {
    'Authorization': `Token ${userToken}`
  }
});

const paymentStatus = await statusResponse.json();
console.log('Payment status:', paymentStatus.status);
```

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC
- Use any ZIP code

### Testing Webhooks Locally

Use Stripe CLI to forward webhook events to your local development server:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/payments/webhook/stripe/

# Trigger test events
stripe trigger payment_intent.succeeded
```

## Security Considerations

1. **Never expose your Secret Key**: Keep `STRIPE_SECRET_KEY` in environment variables only
2. **Verify Webhook Signatures**: The webhook handler automatically verifies Stripe signatures
3. **Use HTTPS in Production**: Stripe requires HTTPS for production webhooks
4. **Validate Payment Amounts**: Always verify payment amounts match order totals
5. **Log Events**: Webhook events are logged in `StripeWebhookEvent` for audit trails

## Troubleshooting

### Payment Intent Creation Fails
- Verify Stripe API keys are correct
- Check that the order exists and belongs to the user
- Ensure the order doesn't already have a payment

### Webhook Events Not Received
- Verify webhook URL is accessible from the internet (use ngrok for local testing)
- Check `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint in Stripe Dashboard
- Review webhook event logs in Stripe Dashboard

### Payment Status Not Updating
- Check Django logs for errors in webhook processing
- Verify `StripeWebhookEvent` records in admin panel
- Ensure payment_intent_id matches between Payment model and Stripe

## Admin Interface

Access the admin panel at `/admin/` to view:
- All payments with filtering by status, date, etc.
- Refund records
- Webhook event logs

All payment and refund creation is disabled in admin to ensure integrity - they must be created via API.

## Further Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
