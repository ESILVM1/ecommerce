import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';
import type { Product } from '../../shop/types/product.types';

describe('cartStore', () => {
  const mockProduct1: Product = {
    id: 1,
    product_display_name: 'Test Product 1',
    article_type: 'Shirt',
    base_colour: 'Blue',
    price: 29.99,
    gender: 'Men',
    master_category: 'Apparel',
    sub_category: 'Topwear',
    image: '/images/product1.jpg',
    season: 'Summer',
    year: 2024,
    usage: 'Casual',
  };

  const mockProduct2: Product = {
    id: 2,
    product_display_name: 'Test Product 2',
    article_type: 'Pants',
    base_colour: 'Black',
    price: 49.99,
    gender: 'Men',
    master_category: 'Apparel',
    sub_category: 'Bottomwear',
    image: '/images/product2.jpg',
    season: 'Winter',
    year: 2024,
    usage: 'Casual',
  };

  beforeEach(() => {
    // Reset cart state before each test
    useCartStore.setState({ items: [] });
  });

  it('initializes with empty cart', () => {
    const state = useCartStore.getState();
    
    expect(state.items).toEqual([]);
    expect(state.getItemCount()).toBe(0);
    expect(state.getTotal()).toBe(0);
  });

  it('adds item to cart', () => {
    useCartStore.getState().addItem(mockProduct1);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].product).toEqual(mockProduct1);
    expect(state.items[0].quantity).toBe(1);
  });

  it('adds multiple quantities of item', () => {
    useCartStore.getState().addItem(mockProduct1, 3);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(3);
  });

  it('increases quantity when adding existing item', () => {
    useCartStore.getState().addItem(mockProduct1, 2);
    useCartStore.getState().addItem(mockProduct1, 3);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(5);
  });

  it('adds multiple different products', () => {
    useCartStore.getState().addItem(mockProduct1);
    useCartStore.getState().addItem(mockProduct2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
  });

  it('removes item from cart', () => {
    useCartStore.getState().addItem(mockProduct1);
    useCartStore.getState().addItem(mockProduct2);
    
    useCartStore.getState().removeItem(mockProduct1.id);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].product.id).toBe(mockProduct2.id);
  });

  it('updates item quantity', () => {
    useCartStore.getState().addItem(mockProduct1, 2);
    useCartStore.getState().updateQuantity(mockProduct1.id, 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
  });

  it('removes item when updating quantity to 0', () => {
    useCartStore.getState().addItem(mockProduct1);
    useCartStore.getState().updateQuantity(mockProduct1.id, 0);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('removes item when updating quantity to negative', () => {
    useCartStore.getState().addItem(mockProduct1);
    useCartStore.getState().updateQuantity(mockProduct1.id, -1);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    useCartStore.getState().addItem(mockProduct1, 2); // 29.99 * 2 = 59.98
    useCartStore.getState().addItem(mockProduct2, 1); // 49.99 * 1 = 49.99

    const total = useCartStore.getState().getTotal();
    expect(total).toBeCloseTo(109.97, 2);
  });

  it('calculates total with string prices', () => {
    const productWithStringPrice = {
      ...mockProduct1,
      price: '29.99' as any,
    };
    
    useCartStore.getState().addItem(productWithStringPrice, 2);

    const total = useCartStore.getState().getTotal();
    expect(total).toBeCloseTo(59.98, 2);
  });

  it('calculates item count correctly', () => {
    useCartStore.getState().addItem(mockProduct1, 3);
    useCartStore.getState().addItem(mockProduct2, 2);

    const count = useCartStore.getState().getItemCount();
    expect(count).toBe(5);
  });

  it('clears cart', () => {
    useCartStore.getState().addItem(mockProduct1);
    useCartStore.getState().addItem(mockProduct2);
    
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.getTotal()).toBe(0);
    expect(state.getItemCount()).toBe(0);
  });

  it('maintains cart state after multiple operations', () => {
    // Add items
    useCartStore.getState().addItem(mockProduct1, 2);
    useCartStore.getState().addItem(mockProduct2, 3);
    
    // Update quantity
    useCartStore.getState().updateQuantity(mockProduct1.id, 4);
    
    // Remove an item
    useCartStore.getState().removeItem(mockProduct2.id);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(4);
    expect(state.getTotal()).toBeCloseTo(119.96, 2); // 29.99 * 4
  });
});
