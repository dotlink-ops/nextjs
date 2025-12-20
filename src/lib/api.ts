/**
 * Secure fetch wrapper for API calls
 * Auto-handles 401 errors and provides structured error logging
 */

import { logger } from './logger';

interface FetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

interface ApiError {
  message: string;
  status: number;
  statusText: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Secure fetch wrapper with automatic error handling
   * 
   * @param url - API endpoint (relative or absolute)
   * @param options - Fetch options with optional skipAuthRedirect
   * @returns Promise with JSON response or throws ApiError
   */
  async fetch<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuthRedirect = false, ...fetchOptions } = options;
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    try {
      logger.debug('API Request', { url: fullUrl, method: options.method || 'GET' });

      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        logger.warn('Unauthorized request detected', { url: fullUrl });
        
        if (!skipAuthRedirect && typeof window !== 'undefined') {
          // Redirect to login page
          logger.info('Redirecting to login due to 401');
          window.location.href = '/login';
        }

        throw {
          message: 'Unauthorized',
          status: 401,
          statusText: response.statusText,
        } as ApiError;
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        const apiError: ApiError = {
          message: errorData.error || `Request failed with status ${response.status}`,
          status: response.status,
          statusText: response.statusText,
          details: errorData.details || errorData,
        };

        logger.error('API Error', {
          url: fullUrl,
          status: response.status,
          error: apiError.message,
        });

        throw apiError;
      }

      // Success response
      const data = await response.json();
      logger.debug('API Response', { url: fullUrl, status: response.status });
      
      return data as T;

    } catch (error: any) {
      // If it's already an ApiError, rethrow it
      if (error.status) {
        throw error;
      }

      // Network error or other fetch failure
      logger.error('Network or fetch error', {
        url: fullUrl,
        error: error.message,
      });

      throw {
        message: error.message || 'Network error',
        status: 0,
        statusText: 'Network Error',
        details: error,
      } as ApiError;
    }
  }

  /**
   * Convenience method for GET requests
   */
  async get<T = any>(url: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Convenience method for POST requests
   */
  async post<T = any>(url: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Convenience method for PUT requests
   */
  async put<T = any>(url: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T = any>(url: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Convenience method for PATCH requests
   */
  async patch<T = any>(url: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export type for use in components
export type { ApiError, FetchOptions };
