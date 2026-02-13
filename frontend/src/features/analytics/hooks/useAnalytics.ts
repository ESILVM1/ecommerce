import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const useSalesStats = () => {
  return useQuery({
    queryKey: ['analytics', 'sales'],
    queryFn: () => analyticsService.getSalesStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductPerformance = () => {
  return useQuery({
    queryKey: ['analytics', 'products'],
    queryFn: () => analyticsService.getProductPerformance(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserActivity = () => {
  return useQuery({
    queryKey: ['analytics', 'users'],
    queryFn: () => analyticsService.getUserActivity(),
    staleTime: 5 * 60 * 1000,
  });
};
