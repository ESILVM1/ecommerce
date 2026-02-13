import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../cart/store/cartStore';
import { useCreateOrder } from '../hooks/useOrders';
import { useDemoPayment } from '../../payments/hooks/usePayments';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { formatPrice } from '../../../lib/utils';
import { ArrowRight, CreditCard, Package, Lock } from 'lucide-react';

const checkoutSchema = z.object({
  shipping_address: z.string().min(5, 'Adresse requise'),
  shipping_city: z.string().min(2, 'Ville requise'),
  shipping_postal_code: z.string().min(4, 'Code postal requis'),
  shipping_country: z.string().min(2, 'Pays requis'),
  card_holder: z.string().min(1, 'Nom du titulaire requis'),
  card_number: z.string().min(13, 'Numéro de carte invalide'),
  card_expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format invalide (MM/YY)'),
  card_cvv: z.string().min(3, 'CVV invalide'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Helper functions for card formatting
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  return parts.join(' ').substring(0, 19);
};

const formatExpiry = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

const formatCVV = (value: string) => {
  return value.replace(/[^0-9]/gi, '').substring(0, 4);
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const createOrderMutation = useCreateOrder();
  const demoPaymentMutation = useDemoPayment();
  const total = getTotal();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_country: 'France',
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setPaymentError(null);
    
    try {
      // Step 1: Create the order
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        shipping_address: data.shipping_address,
        shipping_city: data.shipping_city,
        shipping_postal_code: data.shipping_postal_code,
        shipping_country: data.shipping_country,
      };

      const order = await createOrderMutation.mutateAsync(orderData);
      
      // Step 2: Process payment immediately
      await demoPaymentMutation.mutateAsync({
        order_id: order.id,
        card_number: data.card_number.replace(/\s/g, ''),
        card_expiry: data.card_expiry,
        card_cvv: data.card_cvv,
        card_holder: data.card_holder,
      });
      
      // Step 3: Clear cart and redirect to success
      clearCart();
      navigate(`/payment/success?order=${order.order_number}`);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      setPaymentError(error.response?.data?.error || 'Erreur lors du paiement');
    }
  };

  // Redirect to cart if empty - use useEffect to avoid state update during render
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Don't render checkout form if cart is empty
  if (items.length === 0) {
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Shipping Address Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Adresse de livraison</h3>
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
                  </div>

                  {/* Payment Section */}
                  <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-primary-600" />
                      <h3 className="font-semibold text-lg">Informations de paiement</h3>
                    </div>

                    <Input
                      label="Nom du titulaire"
                      {...register('card_holder')}
                      error={errors.card_holder?.message}
                      placeholder="John Doe"
                    />

                    <Input
                      label="Numéro de carte"
                      {...register('card_number', {
                        onChange: (e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setValue('card_number', formatted);
                        }
                      })}
                      error={errors.card_number?.message}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Date d'expiration"
                        {...register('card_expiry', {
                          onChange: (e) => {
                            const formatted = formatExpiry(e.target.value);
                            setValue('card_expiry', formatted);
                          }
                        })}
                        error={errors.card_expiry?.message}
                        placeholder="MM/YY"
                        maxLength={5}
                      />

                      <Input
                        label="CVV"
                        {...register('card_cvv', {
                          onChange: (e) => {
                            const formatted = formatCVV(e.target.value);
                            setValue('card_cvv', formatted);
                          }
                        })}
                        error={errors.card_cvv?.message}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {(createOrderMutation.isError || paymentError) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                      {paymentError || 'Erreur lors du paiement'}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    isLoading={createOrderMutation.isPending || demoPaymentMutation.isPending}
                  >
                    <Lock className="mr-2 h-5 w-5" />
                    Finaliser et payer
                  </Button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                    <p className="font-medium">💳 Mode Démo - Test</p>
                    <p>Utilisez: 4242 4242 4242 4242 | Exp: 12/34 | CVV: 123</p>
                  </div>
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
