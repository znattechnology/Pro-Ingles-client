/**
 * Token Refresh Coordinator - Centralized token refresh logic
 *
 * ✅ FIX P2: Prevents race conditions by coordinating all refresh attempts
 *
 * Features:
 * - Single refresh promise shared across all callers
 * - Automatic retry with exponential backoff
 * - Request queuing during refresh
 * - Synchronized localStorage + cookies
 * - Detailed logging for debugging
 */

import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  user_id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  exp: number;
  iat: number;
}

interface RefreshResponse {
  access: string;
  refresh?: string; // Some backends return new refresh token
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

export class TokenRefreshCoordinator {
  private static instance: TokenRefreshCoordinator;

  // Refresh state
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private requestQueue: QueuedRequest[] = [];

  // Retry configuration
  private maxRetries = 3;
  private retryCount = 0;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  // Logging flag (set to false in production)
  private enableLogging = process.env.NODE_ENV === 'development';

  private constructor() {
    this.log('🔧 TokenRefreshCoordinator initialized');
  }

  static getInstance(): TokenRefreshCoordinator {
    if (!TokenRefreshCoordinator.instance) {
      TokenRefreshCoordinator.instance = new TokenRefreshCoordinator();
    }
    return TokenRefreshCoordinator.instance;
  }

  /**
   * Main refresh method - coordinates all refresh attempts
   */
  async refreshToken(): Promise<string> {
    // If already refreshing, return existing promise
    if (this.isRefreshing && this.refreshPromise) {
      this.log('⏳ Refresh already in progress, returning existing promise');
      return this.refreshPromise;
    }

    // Start new refresh
    this.isRefreshing = true;
    this.log('🔄 Starting new token refresh');

    this.refreshPromise = this.performRefresh()
      .then(newAccessToken => {
        this.log('✅ Token refresh successful');
        this.retryCount = 0; // Reset retry counter on success
        this.processQueue(null, newAccessToken);
        this.resetRefreshState();
        return newAccessToken;
      })
      .catch(error => {
        this.log('❌ Token refresh failed:', error.message);
        this.processQueue(error, null);
        this.resetRefreshState();
        throw error;
      });

    return this.refreshPromise;
  }

  /**
   * Queue a request to wait for token refresh
   */
  async waitForRefresh(): Promise<string> {
    if (!this.isRefreshing) {
      return this.refreshToken();
    }

    this.log('📋 Queuing request to wait for refresh');

    return new Promise<string>((resolve, reject) => {
      this.requestQueue.push({ resolve, reject });
    });
  }

  /**
   * Check if token needs refresh (5 minutes before expiry)
   */
  shouldRefreshToken(): boolean {
    const token = this.getStoredAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const now = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - now;

      // Refresh if less than 5 minutes remaining
      const shouldRefresh = timeUntilExpiry <= 300; // 5 minutes

      if (shouldRefresh) {
        this.log(`⚠️ Token expires in ${Math.round(timeUntilExpiry)} seconds, refresh needed`);
      }

      return shouldRefresh;
    } catch (error) {
      this.log('❌ Error checking token expiry:', error);
      return false;
    }
  }

  /**
   * Check if token is valid (not expired)
   */
  isTokenValid(): boolean {
    const token = this.getStoredAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(): number | null {
    const token = this.getStoredAccessToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const now = Date.now() / 1000;
      return Math.max(0, decoded.exp - now);
    } catch {
      return null;
    }
  }

  /**
   * Perform actual token refresh with retry logic
   */
  private async performRefresh(): Promise<string> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

      this.log(`🌐 Calling refresh endpoint: ${apiUrl}/users/refresh-token/`);

      const response = await fetch(`${apiUrl}/users/refresh-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      const data: RefreshResponse = await response.json();

      if (!data.access) {
        throw new Error('No access token in refresh response');
      }

      // ✅ FIX P3: Unified storage - sync both localStorage and cookies
      this.storeTokens(data.access, data.refresh || refreshToken);

      return data.access;
    } catch (error: any) {
      // Retry logic with exponential backoff
      if (this.retryCount < this.maxRetries) {
        const delay = this.retryDelays[this.retryCount];
        this.retryCount++;

        this.log(`🔁 Retry ${this.retryCount}/${this.maxRetries} after ${delay}ms`);

        await this.sleep(delay);
        return this.performRefresh();
      }

      // Max retries exceeded
      this.log('❌ Max retries exceeded');
      throw error;
    }
  }

  /**
   * Store tokens in both localStorage and cookies (unified storage)
   */
  private storeTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;

    this.log('💾 Storing tokens in localStorage and cookies');

    // Primary: localStorage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    // Secondary: Cookies (for SSR middleware access)
    const accessMaxAge = 3600; // 1 hour
    const refreshMaxAge = 604800; // 7 days

    document.cookie = `access_token=${accessToken}; path=/; max-age=${accessMaxAge}; SameSite=strict; Secure`;
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${refreshMaxAge}; SameSite=strict; Secure`;

    this.log('✅ Tokens stored successfully');
  }

  /**
   * Get access token from storage (prioritize localStorage)
   */
  private getStoredAccessToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Try localStorage first
    const token = localStorage.getItem('access_token');
    if (token) return token;

    // Fallback to cookies
    return this.getCookie('access_token');
  }

  /**
   * Get refresh token from storage (prioritize localStorage)
   */
  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Try localStorage first
    const token = localStorage.getItem('refresh_token');
    if (token) return token;

    // Fallback to cookies
    return this.getCookie('refresh_token');
  }

  /**
   * Get cookie value by name
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }

    return null;
  }

  /**
   * Process queued requests after refresh completes
   */
  private processQueue(error: any, token: string | null) {
    this.log(`📤 Processing ${this.requestQueue.length} queued requests`);

    this.requestQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      }
    });

    this.requestQueue = [];
  }

  /**
   * Reset refresh state
   */
  private resetRefreshState() {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging utility (only in development)
   */
  private log(...args: any[]) {
    if (this.enableLogging) {
      console.log('[TokenRefreshCoordinator]', ...args);
    }
  }

  /**
   * Clear all tokens and reset state
   */
  clearTokens() {
    this.log('🧹 Clearing all tokens');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    this.resetRefreshState();
    this.requestQueue = [];
    this.retryCount = 0;
  }
}

// Export singleton instance
export const tokenRefreshCoordinator = TokenRefreshCoordinator.getInstance();
export default tokenRefreshCoordinator;
