import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Paiement réussi !</h1>
        <p className="text-gray-600 mb-8">
          Merci pour votre commande. Vous allez recevoir un email de confirmation.
        </p>

        {orderNumber && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-gray-600 mb-2">Numéro de commande</p>
              <p className="font-bold text-xl">{orderNumber}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders">
            <Button size="lg">
              <Package className="mr-2 h-5 w-5" />
              Voir mes commandes
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" size="lg">
              Continuer mes achats
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
