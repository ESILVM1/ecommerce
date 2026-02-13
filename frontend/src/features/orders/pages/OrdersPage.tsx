import { Link } from 'react-router-dom';
import { useMemo } from 'react';
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

  // Sort orders: paid first, then by date (most recent first)
  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    
    return [...orders].sort((a, b) => {
      // First by payment status (paid before pending)
      if (a.payment_status === 'paid' && b.payment_status !== 'paid') return -1;
      if (a.payment_status !== 'paid' && b.payment_status === 'paid') return 1;
      
      // Then by date (most recent first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [orders]);

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
          {sortedOrders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card 
                className="hover:shadow-lg transition-shadow border-l-4" 
                style={{
                  borderLeftColor: order.payment_status === 'paid' ? '#10b981' : '#f59e0b'
                }}
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Left: Order Info */}
                    <div className="md:col-span-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Commande #{order.order_number}
                        </h3>
                        {order.payment_status === 'paid' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Payé
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {formatDate(order.created_at)}
                      </p>
                      
                      {/* Product Preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="relative">
                              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                {item.product_image ? (
                                  <img 
                                    src={item.product_image} 
                                    alt={item.product_name || 'Produit'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-full h-full p-2 text-gray-400" />
                                )}
                              </div>
                              {item.quantity > 1 && (
                                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-600 text-xs font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Middle: Status */}
                    <div className="md:col-span-3 flex items-center justify-center md:justify-start">
                      <div className="flex items-center gap-2">
                        {statusIcons[order.status]}
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right: Price & Action */}
                    <div className="md:col-span-3 flex flex-col items-end justify-center">
                      <span className="text-gray-600 text-sm mb-1">Total</span>
                      <span className="font-bold text-xl text-gray-900">
                        {formatPrice(order.final_amount)}
                      </span>
                      <span className="text-primary-600 font-medium text-sm mt-2 hover:text-primary-700">
                        Voir détails →
                      </span>
                    </div>
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
