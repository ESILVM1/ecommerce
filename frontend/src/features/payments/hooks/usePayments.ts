import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import type { CreatePaymentIntentRequest } from '../types/payment.types';

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentRequest) => 
      paymentService.createPaymentIntent(data),
  });
};

export const usePaymentStatus = (paymentId: number) => {
  return useQuery({
    queryKey: ['payment', paymentId, 'status'],
    queryFn: () => paymentService.getPaymentStatus(paymentId),
    enabled: !!paymentId,
    refetchInterval: 3000, // Poll every 3 seconds
  });
};

export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: (paymentId: number) => paymentService.confirmPayment(paymentId),
  });
};
