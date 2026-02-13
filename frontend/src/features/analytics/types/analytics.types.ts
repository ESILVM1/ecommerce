export interface SalesStats {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  recent_orders: Array<{
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    final_amount: string;
    created_at: string;
    user__email: string;
  }>;
}

export interface ProductPerformance {
  top_selling_products: Array<{
    product__id: number;
    product__product_display_name: string;
    product__image?: string;
    total_quantity: number;
    total_revenue: number;
    order_count: number;
  }>;
  revenue_by_product: Array<{
    product__id: number;
    product__product_display_name: string;
    revenue: number;
  }>;
  products_by_category: Record<string, number>;
  low_stock_products: any[];
  total_products: number;
}

export interface UserActivity {
  total_users: number;
  new_users_this_month: number;
  active_users: number;
  users_with_orders: number;
  average_orders_per_user: number;
  conversion_rate: number;
  registrations_by_month: Array<{
    month: string;
    count: number;
  }>;
}
