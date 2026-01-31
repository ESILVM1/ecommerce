import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../cart/store/cartStore';
import { useCreateOrder } from '../hooks/useOrders';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { formatPrice } from '../../../lib/utils';
import { ArrowRight, CreditCard, Package } from 'lucide-react';

const checkoutSchema = z.object({
  shipping_address: z.string().min(5, 'Adresse requise'),
  shipping_city: z.string().min(2, 'Ville requise'),
  shipping_postal_code: z.string().min(4, 'Code postal requis'),
  shipping_country: z.string().min(2, 'Pays requis'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const createOrderMutation = useCreateOrder();
  const total = getTotal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_country: 'France',
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        ...data,
      };

      const order = await createOrderMutation.mutateAsync(orderData);
      
      // Redirect to payment with order info
      navigate(`/payment?order_id=${order.id}&order_number=${order.order_number}`);
      
      // Clear cart after successful order
      clearCart();
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Adresse complète"
                    {...register('shipping_address')}
                    error={errors.shipping_address?.message}
                    placeholder="123 Rue Example"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Code postal"
                      {...register('shipping_postal_code')}
                      error={errors.shipping_postal_code?.message}
                      placeholder="75001"
                    />
                    <Input
                      label="Ville"
                      {...register('shipping_city')}
                      error={errors.shipping_city?.message}
                      placeholder="Paris"
                    />
                  </div>

                  <Input
                    label="Pays"
                    {...register('shipping_country')}
                    error={errors.shipping_country?.message}
                  />

                  {createOrderMutation.isError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                      Erreur lors de la création de la commande
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" isLoading={createOrderMutation.isPending}>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Continuer vers le paiement
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Cart Items Preview */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <CardTitle>Articles ({items.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => {
                  const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
                  return (
                    <div key={item.product.id} className="flex gap-3 py-2 border-b last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {item.product.image && (
                          <img src={item.product.image} alt={item.product.product_display_name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.product_display_name}</p>
                        <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(price * item.quantity)}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Récapitulatif</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Sous-total</span><span>{formatPrice(total)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Livraison</span><span className="text-green-600">Gratuite</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">TVA (20%)</span><span>{formatPrice(total * 0.2)}</span></div>
                  <div className="border-t pt-2"><div className="flex justify-between text-base"><span className="font-bold">Total</span><span className="font-bold text-lg">{formatPrice(total * 1.2)}</span></div></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
