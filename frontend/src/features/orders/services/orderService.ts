import api from '../../../lib/api';
import type { Order, CreateOrderRequest } from '../types/order.types';

export const orderService = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/api/orders/orders/', data);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/api/orders/orders/my_orders/');
    return response.data;
  },
};
