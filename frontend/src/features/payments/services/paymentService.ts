import api from '../../../lib/api';
import type { Payment, CreatePaymentIntentRequest, CreatePaymentIntentResponse } from '../types/payment.types';

export const paymentService = {
  // Create payment intent
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
    const response = await api.post<CreatePaymentIntentResponse>(
      '/api/payments/payments/create_payment_intent/',
      data
    );
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId: number): Promise<Payment> => {
    const response = await api.get<Payment>(`/api/payments/payments/${paymentId}/status/`);
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (paymentId: number): Promise<Payment> => {
    const response = await api.get<Payment>(`/api/payments/payments/${paymentId}/confirm/`);
    return response.data;
  },
};
