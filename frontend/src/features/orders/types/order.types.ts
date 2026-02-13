export interface OrderItem {
  id: number;
  product: number;
  product_name?: string;
  product_image?: string;
  quantity: number;
  price_per_unit: string;
  total_price: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: string;
  discount_amount: string;
  tax_amount: string;
  final_amount: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface CreateOrderRequest {
  items: {
    product_id: number;
    quantity: number;
  }[];
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
}
