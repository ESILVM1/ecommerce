import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Shield, Truck } from 'lucide-react';
import Button from '../components/ui/Button';
import { useProducts } from '../features/shop/hooks/useProducts';
import ProductCard from '../features/shop/components/ProductCard';

export default function HomePage() {
  const { data } = useProducts();
  const featuredProducts = data?.results?.slice(0, 6) || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Bienvenue sur Fashion Shop</h1>
          <p className="text-xl mb-8 text-primary-100">
            Découvrez notre collection de plus de 44 000 produits fashion
          </p>
          <Link to="/shop">
            <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-gray-100">
              Explorer la boutique
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>



      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Large choix</h3>
              <p className="text-gray-600">Plus de 44 000 produits fashion</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Truck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Livraison rapide</h3>
              <p className="text-gray-600">Livraison en 48h partout en France</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Paiement sécurisé</h3>
              <p className="text-gray-600">Paiements sécurisés via Stripe</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Produits en vedette</h2>
              <Link to="/shop">
                <Button variant="ghost">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
