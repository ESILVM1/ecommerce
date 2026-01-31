import { useMutation } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import type { CreatePaymentIntentRequest } from '../types/payment.types';

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentRequest) => 
      paymentService.createPaymentIntent(data),
  });
};
