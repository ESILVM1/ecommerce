import api from '../../../lib/api';
import type { Order, OrdersResponse, CreateOrderRequest } from '../types/order.types';

export const orderService = {
  // Get all user orders
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/api/orders/orders/my_orders/');
    return response.data;
  },

  // Get single order
  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/api/orders/orders/${id}/`);
    return response.data;
  },

  // Create order
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/api/orders/orders/', data);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: number): Promise<Order> => {
    const response = await api.post<Order>(`/api/orders/orders/${id}/cancel_order/`);
    return response.data;
  },

  // Confirm delivery
  confirmDelivery: async (id: number): Promise<Order> => {
    const response = await api.post<Order>(`/api/orders/orders/${id}/confirm_delivery/`);
    return response.data;
  },
};
