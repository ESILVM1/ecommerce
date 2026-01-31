import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useMyOrders } from '../hooks/useOrders';
import { Card, CardContent } from '../../../components/ui/Card';
import { formatPrice, formatDate } from '../../../lib/utils';

const statusIcons = {
  pending: <Clock className="h-5 w-5 text-yellow-600" />,
  confirmed: <CheckCircle className="h-5 w-5 text-blue-600" />,
  shipped: <Truck className="h-5 w-5 text-purple-600" />,
  delivered: <CheckCircle className="h-5 w-5 text-green-600" />,
  cancelled: <XCircle className="h-5 w-5 text-red-600" />,
};

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useMyOrders();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Erreur lors du chargement des commandes
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Aucune commande</h2>
          <p className="text-gray-600 mb-8">
            Vous n'avez pas encore passé de commande
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Découvrir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mes Commandes</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Commande #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Passée le {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusIcons[order.status]}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Total: </span>
                        <span className="font-bold text-lg">
                          {formatPrice(order.final_amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Paiement: </span>
                        <span className={`font-medium ${
                          order.payment_status === 'paid' 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`}>
                          {order.payment_status === 'paid' ? 'Payé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                    <span className="text-primary-600 font-medium">
                      Voir détails →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
