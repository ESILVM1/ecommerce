import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { logError, logWarning } from './errorTracking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Log API requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    logError(error, {
      component: 'API Request Interceptor',
      action: 'request_failed',
    });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    // Handle different error scenarios
    if (status === 401) {
      // Unauthorized - token invalid or expired
      logWarning('User session expired', {
        component: 'API Response Interceptor',
        action: 'session_expired',
        metadata: { url },
      });
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      // Forbidden - user doesn't have permission
      logWarning('Access denied', {
        component: 'API Response Interceptor',
        action: 'access_denied',
        metadata: { url },
      });
    } else if (status === 404) {
      // Not found
      logWarning('Resource not found', {
        component: 'API Response Interceptor',
        action: 'not_found',
        metadata: { url },
      });
    } else if (status === 429) {
      // Rate limit exceeded
      logWarning('Rate limit exceeded', {
        component: 'API Response Interceptor',
        action: 'rate_limit',
        metadata: { url },
      });
    } else if (status && status >= 500) {
      // Server error
      logError(error, {
        component: 'API Response Interceptor',
        action: 'server_error',
        metadata: {
          url,
          status,
          statusText: error.response?.statusText,
        },
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      logError(error, {
        component: 'API Response Interceptor',
        action: 'timeout',
        metadata: { url },
      });
    } else if (error.message === 'Network Error') {
      // Network error
      logError(error, {
        component: 'API Response Interceptor',
        action: 'network_error',
        metadata: { url },
      });
    } else {
      // Other errors
      logError(error, {
        component: 'API Response Interceptor',
        action: 'api_error',
        metadata: {
          url,
          status,
          message: error.message,
        },
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
