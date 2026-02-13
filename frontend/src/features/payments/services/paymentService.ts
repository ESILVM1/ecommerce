import api from '../../../lib/api';
import type { 
  CreatePaymentIntentRequest, 
  CreatePaymentIntentResponse,
  DemoPaymentRequest,
  DemoPaymentResponse 
} from '../types/payment.types';

export const paymentService = {
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
    const response = await api.post<CreatePaymentIntentResponse>(
      '/api/payments/payments/create_payment_intent/',
      data
    );
    return response.data;
  },

  demoPayment: async (data: DemoPaymentRequest): Promise<DemoPaymentResponse> => {
    const response = await api.post<DemoPaymentResponse>(
      '/api/payments/payments/demo_payment/',
      data
    );
    return response.data;
  },
};
