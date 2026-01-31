import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem as CartItemType } from '../store/cartStore';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../../../lib/utils';
import Button from '../../../components/ui/Button';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity } = item;

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const subtotal = price * quantity;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={`http://localhost:8000${product.image}`}
            alt={product.product_display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-1">
          {product.product_display_name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{product.article_type}</p>
        <p className="font-semibold text-primary-600">{formatPrice(price)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-3">
        <button
          onClick={() => removeItem(product.id)}
          className="text-red-600 hover:text-red-700 p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 border border-gray-300 rounded-md">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="p-2 hover:bg-gray-50"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="p-2 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Subtotal: <span className="font-semibold">{formatPrice(subtotal)}</span>
        </p>
      </div>
    </div>
  );
}
