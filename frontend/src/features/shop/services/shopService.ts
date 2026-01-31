import api from '../../../lib/api';
import type { Product, ProductsResponse, ProductFilters } from '../types/product.types';

export const shopService = {
  // Get products with filters
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.master_category) params.append('master_category', filters.master_category);
    if (filters?.sub_category) params.append('sub_category', filters.sub_category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.season) params.append('season', filters.season);
    if (filters?.usage) params.append('usage', filters.usage);
    
    const response = await api.get<ProductsResponse>(`/api/shop/products/?${params.toString()}`);
    return response.data;
  },

  // Get single product
  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/api/shop/products/${id}/`);
    return response.data;
  },

  // Search products
  searchProducts: async (query: string): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(`/api/shop/products/?search=${query}`);
    return response.data;
  },
};
