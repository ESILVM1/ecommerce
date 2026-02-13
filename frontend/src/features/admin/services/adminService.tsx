import api from '../../../lib/api';

export const adminService = {
  // Produits
  updateProduct: (id: number, data: any) => api.patch(`/products/${id}/`, data),
  deleteProduct: (id: number) => api.delete(`/products/${id}/`),
  
  // Commandes
  getOrders: () => api.get('/orders/admin/'),
  updateOrderStatus: (id: number, status: string) => api.patch(`/orders/${id}/`, { status }),
};