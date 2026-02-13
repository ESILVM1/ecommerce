import { useMutation } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import type { CreatePaymentIntentRequest, DemoPaymentRequest } from '../types/payment.types';

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentRequest) => 
      paymentService.createPaymentIntent(data),
  });
};

export const useDemoPayment = () => {
  return useMutation({
    mutationFn: (data: DemoPaymentRequest) => 
      paymentService.demoPayment(data),
  });
};
