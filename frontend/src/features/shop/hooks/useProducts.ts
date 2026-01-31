import { useQuery } from '@tanstack/react-query';
import { shopService } from '../services/shopService';
import type { ProductFilters } from '../types/product.types';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => shopService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => shopService.getProduct(id),
    enabled: !!id,
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => shopService.searchProducts(query),
    enabled: query.length > 2,
  });
};
