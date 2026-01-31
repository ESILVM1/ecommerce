export interface Payment {
  id: number;
  order: number;
  order_number: string;
  user: number;
  user_email: string;
  stripe_payment_intent_id: string;
  stripe_customer_id?: string;
  stripe_charge_id?: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  payment_method: 'card' | 'bank_transfer' | 'wallet';
  description?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface CreatePaymentIntentRequest {
  order_id: number;
  payment_method?: 'card' | 'bank_transfer' | 'wallet';
}

export interface CreatePaymentIntentResponse {
  payment_id: number;
  client_secret: string;
  payment_intent_id: string;
  amount: string;
  currency: string;
  status: string;
}
