export interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: string;
  final_amount: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  created_at: string;
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
