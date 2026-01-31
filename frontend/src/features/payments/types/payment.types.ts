export interface Payment {
  id: number;
  order: number;
  order_number: string;
  stripe_payment_intent_id: string;
  amount: string;
  currency: string;
  status: string;
}

export interface CreatePaymentIntentRequest {
  order_id: number;
  payment_method?: 'card';
}

export interface CreatePaymentIntentResponse {
  payment_id: number;
  client_secret: string;
  payment_intent_id: string;
  amount: string;
  currency: string;
}
