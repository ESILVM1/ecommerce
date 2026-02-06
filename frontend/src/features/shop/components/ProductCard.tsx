import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '../types/product.types';
import { formatPrice } from '../../../lib/utils';
import Button from '../../../components/ui/Button';
import { useCartStore } from '../../cart/store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <Link to={`/shop/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.product_display_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to wishlist
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <Heart className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs text-gray-500 uppercase">{product.article_type}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.product_display_name}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="gap-1"
            >
              <ShoppingCart className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
          
          {/* Tags */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
              {product.gender}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
              {product.season}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
