import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDemoPayment } from '../hooks/usePayments';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { CreditCard, Lock } from 'lucide-react';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const orderNumber = searchParams.get('order_number') || 'N/A';
  const navigate = useNavigate();
  const demoPayment = useDemoPayment();

  const [formData, setFormData] = useState({
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_holder: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'card_number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'card_expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'card_cvv') {
      formattedValue = value.replace(/[^0-9]/gi, '').substring(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.card_holder.trim()) {
      newErrors.card_holder = 'Le nom du titulaire est requis';
    }

    const cardNumber = formData.card_number.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.card_number = 'Numéro de carte invalide';
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.card_expiry)) {
      newErrors.card_expiry = 'Format invalide (MM/YY)';
    }

    if (!formData.card_cvv || formData.card_cvv.length < 3) {
      newErrors.card_cvv = 'CVV invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !orderId) return;

    try {
      await demoPayment.mutateAsync({
        order_id: Number(orderId),
        card_number: formData.card_number,
        card_expiry: formData.card_expiry,
        card_cvv: formData.card_cvv,
        card_holder: formData.card_holder,
      });

      navigate(`/payment/success?order=${orderNumber}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors du paiement';
      setErrors({ general: errorMessage });
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="card_holder" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du titulaire
                </label>
                <Input
                  id="card_holder"
                  name="card_holder"
                  type="text"
                  value={formData.card_holder}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  error={errors.card_holder}
                />
              </div>

              <div>
                <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de carte
                </label>
                <Input
                  id="card_number"
                  name="card_number"
                  type="text"
                  value={formData.card_number}
                  onChange={handleInputChange}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  error={errors.card_number}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="card_expiry" className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration
                  </label>
                  <Input
                    id="card_expiry"
                    name="card_expiry"
                    type="text"
                    value={formData.card_expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    error={errors.card_expiry}
                  />
                </div>

                <div>
                  <label htmlFor="card_cvv" className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <Input
                    id="card_cvv"
                    name="card_cvv"
                    type="text"
                    value={formData.card_cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    error={errors.card_cvv}
                  />
                </div>
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                  {errors.general}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                isLoading={demoPayment.isPending}
              >
                <Lock className="mr-2 h-5 w-5" />
                Payer maintenant
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Paiement sécurisé - Mode Démo
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">💳 Mode Démo</p>
          <p>Utilisez n'importe quel numéro de carte valide pour tester le paiement. Aucun paiement réel ne sera effectué.</p>
        </div>
      </div>
    </div>
  );
}
