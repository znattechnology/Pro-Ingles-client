/**
 * HTTP Interceptor for Django JWT Authentication
 * Automatically handles token refresh and request retries
 */

import { djangoAuth } from './django-auth';

export interface RequestConfig {
  url: string;
  options?: RequestInit;
  skipAuth?: boolean;
}

class HttpInterceptor {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  async request({ url, options = {}, skipAuth = false }: RequestConfig): Promise<Response> {
    // Add default headers
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add authentication header if not skipped
    if (!skipAuth) {
      const token = djangoAuth.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle token expiration (401 Unauthorized)
      if (response.status === 401 && !skipAuth) {
        return this.handleTokenExpiration(url, requestOptions);
      }

      return response;
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  private async handleTokenExpiration(url: string, options: RequestInit): Promise<Response> {
    const originalRequest = { url, options };

    if (this.isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        const token = djangoAuth.getAccessToken();
        if (token && options.headers) {
          (options.headers as Headers).set('Authorization', `Bearer ${token}`);
        }
        return fetch(url, options);
      });
    }

    this.isRefreshing = true;

    try {
      // Try to refresh the token
      await djangoAuth.refreshToken();
      
      // Update the original request with new token
      const newToken = djangoAuth.getAccessToken();
      if (newToken && options.headers) {
        (options.headers as Headers).set('Authorization', `Bearer ${newToken}`);
      }

      this.processQueue(null, newToken);
      
      // Retry the original request
      return fetch(url, options);
    } catch (refreshError) {
      // Refresh failed, logout user
      this.processQueue(refreshError, null);
      await djangoAuth.logout();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Convenience methods for common HTTP verbs
  async get(url: string, options?: Omit<RequestConfig, 'url'>): Promise<Response> {
    return this.request({
      url,
      options: { method: 'GET', ...options?.options },
      skipAuth: options?.skipAuth,
    });
  }

  async post(url: string, data?: any, options?: Omit<RequestConfig, 'url'>): Promise<Response> {
    return this.request({
      url,
      options: {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options?.options,
      },
      skipAuth: options?.skipAuth,
    });
  }

  async put(url: string, data?: any, options?: Omit<RequestConfig, 'url'>): Promise<Response> {
    return this.request({
      url,
      options: {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...options?.options,
      },
      skipAuth: options?.skipAuth,
    });
  }

  async delete(url: string, options?: Omit<RequestConfig, 'url'>): Promise<Response> {
    return this.request({
      url,
      options: { method: 'DELETE', ...options?.options },
      skipAuth: options?.skipAuth,
    });
  }

  async patch(url: string, data?: any, options?: Omit<RequestConfig, 'url'>): Promise<Response> {
    return this.request({
      url,
      options: {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        ...options?.options,
      },
      skipAuth: options?.skipAuth,
    });
  }
}

export const httpInterceptor = new HttpInterceptor();
export default httpInterceptor;