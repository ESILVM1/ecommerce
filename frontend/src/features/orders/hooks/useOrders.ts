import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { CreateOrderRequest } from '../types/order.types';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useMyOrders = () => {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => orderService.getMyOrders(),
  });
};

export const useOrder = (orderId: number) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: number) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useConfirmDelivery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: number) => orderService.confirmDelivery(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
