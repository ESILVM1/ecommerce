import api from '../../../lib/api';
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from '../types/payment.types';

export const paymentService = {
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
    const response = await api.post<CreatePaymentIntentResponse>(
      '/api/payments/payments/create_payment_intent/',
      data
    );
    return response.data;
  },
};
