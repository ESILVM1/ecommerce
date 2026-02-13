/**
 * Error tracking and logging utilities.
 * In production, this would integrate with a service like Sentry.
 */

export interface ErrorContext {
  user?: string | number;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an error with context information.
 * In development, logs to console. In production, would send to error tracking service.
 */
export const logError = (
  error: Error,
  context?: ErrorContext
): void => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (import.meta.env.DEV) {
    console.error('Error logged:', errorData);
  } else {
    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { extra: context });
    console.error(errorData);
  }
};

/**
 * Log a warning with context information.
 */
export const logWarning = (
  message: string,
  context?: ErrorContext
): void => {
  const warningData = {
    message,
    timestamp: new Date().toISOString(),
    level: 'warning',
    ...context,
  };

  if (import.meta.env.DEV) {
    console.warn('Warning logged:', warningData);
  } else {
    // In production, send to monitoring service
    console.warn(warningData);
  }
};

/**
 * Extract user-friendly error message from API error response.
 */
export const getErrorMessage = (error: any): string => {
  // Check if it's an API error response
  if (error.response?.data) {
    const data = error.response.data;
    
    // Our custom error format
    if (data.message) {
      return data.message;
    }
    
    // DRF validation errors
    if (data.detail) {
      return typeof data.detail === 'string' 
        ? data.detail 
        : 'Validation error occurred';
    }
    
    // Field-specific errors
    if (typeof data === 'object') {
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError)) {
        return firstError[0];
      }
      if (typeof firstError === 'string') {
        return firstError;
      }
    }
  }
  
  // Network errors
  if (error.message === 'Network Error') {
    return 'Unable to connect to server. Please check your internet connection.';
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Handle API errors in a consistent way.
 * Logs the error and returns a user-friendly message.
 */
export const handleAPIError = (
  error: any,
  context?: ErrorContext
): string => {
  const userMessage = getErrorMessage(error);
  
  // Log the error with context
  logError(
    error instanceof Error ? error : new Error(userMessage),
    {
      ...context,
      statusCode: error.response?.status,
      endpoint: error.config?.url,
    }
  );
  
  return userMessage;
};

/**
 * Get a user-friendly error message string.
 * This is a helper that can be used in error boundaries or catch blocks.
 */
export const getErrorFallbackMessage = (message?: string): string => {
  return message || 'Something went wrong. Please try refreshing the page.';
};
