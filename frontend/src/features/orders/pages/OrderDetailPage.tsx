import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { useOrder, useCancelOrder, useConfirmDelivery } from '../hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatPrice, formatDate } from '../../../lib/utils';

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(Number(id));
  const cancelMutation = useCancelOrder();
  const confirmDeliveryMutation = useConfirmDelivery();

  const handleCancel = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      await cancelMutation.mutateAsync(Number(id));
    }
  };

  const handleConfirmDelivery = async () => {
    await confirmDeliveryMutation.mutateAsync(Number(id));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Commande non trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour aux commandes
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Commande #{order.order_number}
              </h1>
              <p className="text-gray-600">
                Passée le {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Statut</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium
                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'}`}>
                {statusLabels[order.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <CardTitle>Adresse de livraison</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.shipping_address}</p>
                <p className="text-gray-600">
                  {order.shipping_postal_code} {order.shipping_city}
                </p>
                <p className="text-gray-600">{order.shipping_country}</p>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  <CardTitle>Articles commandés</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{item.product_name || `Produit #${item.product}`}</p>
                          <p className="text-sm text-gray-600">
                            Quantité: {item.quantity} × {formatPrice(item.price_per_unit)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Détails des articles non disponibles
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary & Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <CardTitle>Récapitulatif</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                  {parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Réduction</span>
                      <span className="text-green-600">
                        -{formatPrice(order.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA</span>
                    <span>{formatPrice(order.tax_amount)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">
                        {formatPrice(order.final_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Statut paiement</p>
                  <p className={`font-medium ${
                    order.payment_status === 'paid' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {order.payment_status === 'paid' ? 'Payé' : 'En attente'}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                  {order.status === 'pending' && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleCancel}
                      isLoading={cancelMutation.isPending}
                    >
                      Annuler la commande
                    </Button>
                  )}

                  {order.status === 'shipped' && (
                    <Button
                      className="w-full"
                      onClick={handleConfirmDelivery}
                      isLoading={confirmDeliveryMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmer la réception
                    </Button>
                  )}

                  {order.payment_status === 'pending' && (
                    <Link to={`/payment?order_id=${order.id}`}>
                      <Button variant="outline" className="w-full">
                        Payer la commande
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
