import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCartStore } from '../../cart/store/cartStore';
import { formatPrice } from '../../../lib/utils';
import Button from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { useState } from 'react';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(Number(id));
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-lg"></div>
          <div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Produit non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.product_display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <span className="text-sm text-gray-500 uppercase">{product.article_type}</span>
            <h1 className="text-3xl font-bold mt-2 mb-4">{product.product_display_name}</h1>
            <p className="text-3xl font-bold text-primary-600">{formatPrice(product.price)}</p>
          </div>

          {/* Product Details */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Détails du produit</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Genre:</span>
                  <span className="ml-2 font-medium">{product.gender}</span>
                </div>
                <div>
                  <span className="text-gray-600">Saison:</span>
                  <span className="ml-2 font-medium">{product.season}</span>
                </div>
                <div>
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="ml-2 font-medium">{product.master_category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Usage:</span>
                  <span className="ml-2 font-medium">{product.usage}</span>
                </div>
                <div>
                  <span className="text-gray-600">Couleur:</span>
                  <span className="ml-2 font-medium">{product.base_colour}</span>
                </div>
                <div>
                  <span className="text-gray-600">Année:</span>
                  <span className="ml-2 font-medium">{product.year}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantité</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded-md hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-16 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border rounded-md hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ajouter au panier
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
