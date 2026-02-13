import api from '../../../lib/api';
import type { SalesStats, ProductPerformance, UserActivity } from '../types/analytics.types';

export const analyticsService = {
  getSalesStats: async (): Promise<SalesStats> => {
    const response = await api.get<SalesStats>('/api/analytics/sales-stats/');
    return response.data;
  },

  getProductPerformance: async (): Promise<ProductPerformance> => {
    const response = await api.get<ProductPerformance>('/api/analytics/product-performance/');
    return response.data;
  },

  getUserActivity: async (): Promise<UserActivity> => {
    const response = await api.get<UserActivity>('/api/analytics/user-activity/');
    return response.data;
  },
};
