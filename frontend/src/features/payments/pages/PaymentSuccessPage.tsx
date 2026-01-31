import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { useOrder } from '../../orders/hooks/useOrders';
import Button from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { formatPrice } from '../../../lib/utils';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = Number(searchParams.get('order_id'));
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Paiement réussi !</h1>
        <p className="text-gray-600 mb-8">
          Merci pour votre commande. Vous allez recevoir un email de confirmation.
        </p>

        {/* Order Info */}
        {order && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Numéro de commande</span>
                  <span className="font-bold">{order.order_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Montant payé</span>
                  <span className="font-bold text-lg text-green-600">
                    {formatPrice(order.final_amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Statut</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {order.status === 'confirmed' ? 'Confirmée' : 'En cours'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/orders/${orderId}`}>
            <Button size="lg">
              <Package className="mr-2 h-5 w-5" />
              Voir la commande
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" size="lg">
              Continuer mes achats
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Un email de confirmation a été envoyé à votre adresse.
        </p>
      </div>
    </div>
  );
}
