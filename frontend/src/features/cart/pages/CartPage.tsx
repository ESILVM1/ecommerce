import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../../auth/store/authStore';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { formatPrice } from '../../../lib/utils';

export default function CartPage() {
  const { items, getTotal, clearCart, removeItem, updateQuantity } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const total = getTotal();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">
            Découvrez notre collection et ajoutez des produits à votre panier !
          </p>
          <Link to="/shop">
            <Button size="lg">
              Découvrir la boutique
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mon Panier ({items.length})</h1>
          <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700">
            Vider le panier
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
              return (
                <Card key={item.product.id}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.product_display_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.product.product_display_name}</h3>
                      <p className="text-sm text-gray-500">{item.product.article_type}</p>
                      <p className="font-semibold text-primary-600 mt-2">{formatPrice(price)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <button onClick={() => removeItem(item.product.id)} className="text-red-600 text-sm">Supprimer</button>
                      <div className="flex items-center gap-2 border rounded-md">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1">-</button>
                        <span className="px-3">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-3 py-1">+</button>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(price * item.quantity)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Résumé</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Sous-total</span><span>{formatPrice(total)}</span></div>
                  <div className="flex justify-between"><span>Livraison</span><span className="text-green-600">Gratuite</span></div>
                  <div className="flex justify-between"><span>TVA (20%)</span><span>{formatPrice(total * 0.2)}</span></div>
                  <div className="border-t pt-2"><div className="flex justify-between"><span className="font-bold">Total</span><span className="font-bold text-lg">{formatPrice(total * 1.2)}</span></div></div>
                </div>
                <Button onClick={handleCheckout} className="w-full" size="lg">Passer la commande<ArrowRight className="ml-2 h-5 w-5" /></Button>
                <Link to="/shop"><Button variant="outline" className="w-full">Continuer mes achats</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
