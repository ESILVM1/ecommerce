import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCreatePaymentIntent, useConfirmPayment } from '../hooks/usePayments';
import { useOrder } from '../../orders/hooks/useOrders';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { formatPrice } from '../../../lib/utils';
import { CreditCard, Lock } from 'lucide-react';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_your_publishable_key_here');

function PaymentForm({ orderId, clientSecret }: { orderId: number; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const confirmPayment = useConfirmPayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?order_id=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Une erreur est survenue');
        setIsProcessing(false);
      } else {
        navigate(`/payment/success?order_id=${orderId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
        isLoading={isProcessing}
      >
        <Lock className="mr-2 h-5 w-5" />
        Payer {formatPrice(0)} {/* Will be filled by Stripe */}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Paiement sécurisé par Stripe. Vos informations sont protégées.
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const orderId = Number(searchParams.get('order_id'));
  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const createPaymentIntent = useCreatePaymentIntent();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && !clientSecret) {
      createPaymentIntent.mutate(
        { order_id: orderId },
        {
          onSuccess: (data) => {
            setClientSecret(data.client_secret);
          },
        }
      );
    }
  }, [orderId]);

  if (orderLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-2xl mx-auto">
          <div className="h-8 bg-gray-200 rounded mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (createPaymentIntent.isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Erreur de paiement
            </h2>
            <p className="text-red-600">
              Impossible de créer le paiement. Veuillez réessayer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Paiement</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Commande #{order.order_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant total</span>
                  <span className="font-bold text-lg">
                    {formatPrice(order.final_amount)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_postal_code} {order.shipping_city}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Informations de paiement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm orderId={orderId} clientSecret={clientSecret} />
                </Elements>
              ) : (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
