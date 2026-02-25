/**
 * HTTP Interceptor for Django JWT Authentication
 * Automatically handles token refresh and request retries
 *
 * Security: Uses HttpOnly cookies for authentication
 * - Backend middleware reads access_token from cookie
 * - No localStorage token access needed
 */

import { tokenRefreshCoordinator } from './token-refresh-coordinator';

export interface RequestConfig {
  url: string;
  options?: RequestInit;
  skipAuth?: boolean;
}

class HttpInterceptor {
  async request({ url, options = {}, skipAuth = false }: RequestConfig): Promise<Response> {
    // Add default headers
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // No Authorization header needed - backend middleware reads from HttpOnly cookie

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Sends HttpOnly cookies automatically
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle token expiration (401 Unauthorized)
      if (response.status === 401 && !skipAuth) {
        return this.handleTokenExpiration(url, requestOptions);
      }

      return response;
    } catch (error) {
      console.error('[HttpInterceptor] HTTP request failed:', error);
      throw error;
    }
  }

  private async handleTokenExpiration(url: string, options: RequestInit): Promise<Response> {
    try {
      console.log('[HttpInterceptor] Token expired, attempting coordinated refresh...');

      // Coordinator handles queuing and prevents race conditions
      await tokenRefreshCoordinator.refreshToken();

      console.log('[HttpInterceptor] Token refreshed successfully, retrying request...');

      // Retry the original request - new cookies are automatically included
      return fetch(url, options);
    } catch (refreshError) {
      console.error('[HttpInterceptor] Token refresh failed:', refreshError);

      // Refresh failed, clear tokens and redirect
      tokenRefreshCoordinator.clearTokens();

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/signin?reason=session_expired';
      }

      throw refreshError;
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