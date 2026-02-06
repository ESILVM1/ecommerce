import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCreatePaymentIntent } from '../hooks/usePayments';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { CreditCard, Lock } from 'lucide-react';

// Get Stripe key from environment or use test key
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51QjrQsEYuSMpqGYtd9m7IVqLX0GKt3BQPj9VFOjCj5v6sWaIjkEwQphPCeNe3n4KrB6tPhGgLPKgN7u6TQlgwqr200gMwpwBmH';
const stripePromise = loadStripe(STRIPE_KEY);

function PaymentForm({ clientSecret, orderNumber }: { clientSecret: string; orderNumber: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?order=${orderNumber}`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Erreur de paiement');
      } else {
        navigate(`/payment/success?order=${orderNumber}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>
      )}
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full" size="lg" isLoading={isProcessing}>
        <Lock className="mr-2 h-5 w-5" />
        Payer maintenant
      </Button>
      <p className="text-xs text-gray-500 text-center">Paiement sécurisé par Stripe</p>
    </form>
  );
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const orderNumber = searchParams.get('order_number') || 'N/A';
  const createPaymentIntent = useCreatePaymentIntent();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && !clientSecret) {
      createPaymentIntent.mutate(
        { order_id: Number(orderId) },
        {
          onSuccess: (data) => setClientSecret(data.client_secret),
          onError: (error) => console.error('Payment intent error:', error),
        }
      );
    }
  }, [orderId, clientSecret]);

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Commande introuvable</h2>
        <p className="text-gray-600">Aucune commande à payer</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Paiement Sécurisé</h1>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Informations de paiement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm clientSecret={clientSecret} orderNumber={orderNumber} />
              </Elements>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">💳 Mode Test Stripe</p>
          <p>Utilisez: 4242 4242 4242 4242 | Exp: 12/34 | CVC: 123</p>
        </div>
      </div>
    </div>
  );
}
