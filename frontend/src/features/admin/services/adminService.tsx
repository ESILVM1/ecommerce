import api from '../../../lib/api';

export const adminService = {
  // Produits
  getProduct: (id: number) => api.get(`/products/${id}/`),
  createProduct: (data: FormData) => api.post('/products/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateProduct: (id: number, data: FormData) => api.patch(`/products/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteProduct: (id: number) => api.delete(`/products/${id}/`),
  bulkDeleteProducts: async (ids: number[]) => {
    return Promise.all(ids.map(id => api.delete(`/products/${id}/`)));
  },
  bulkUpdateProducts: async (ids: number[], updates: Record<string, any>) => {
    return Promise.all(ids.map(id => api.patch(`/products/${id}/`, updates)));
  },
  
  // Commandes
  getOrders: () => api.get('/orders/admin/'),
  updateOrderStatus: (id: number, status: string) => api.patch(`/orders/${id}/`, { status }),
};