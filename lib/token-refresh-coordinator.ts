/**
 * Token Refresh Coordinator - Centralized token refresh logic
 *
 * Security: Tokens are now stored in HttpOnly cookies by the backend.
 * This coordinator handles refresh coordination without direct token access.
 *
 * Features:
 * - Single refresh promise shared across all callers
 * - Automatic retry with exponential backoff
 * - Request queuing during refresh
 * - Works with HttpOnly cookies (no direct token access)
 */

interface QueuedRequest {
  resolve: () => void;
  reject: (error: any) => void;
}

export class TokenRefreshCoordinator {
  private static instance: TokenRefreshCoordinator;

  // Refresh state
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  private requestQueue: QueuedRequest[] = [];

  // Retry configuration
  private maxRetries = 3;
  private retryCount = 0;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  // Logging flag (set to false in production)
  private enableLogging = process.env.NODE_ENV === 'development';

  private constructor() {
    this.log('🔧 TokenRefreshCoordinator initialized (HttpOnly mode)');
  }

  static getInstance(): TokenRefreshCoordinator {
    if (!TokenRefreshCoordinator.instance) {
      TokenRefreshCoordinator.instance = new TokenRefreshCoordinator();
    }
    return TokenRefreshCoordinator.instance;
  }

  /**
   * Main refresh method - coordinates all refresh attempts
   * Returns void since we can't access the token (it's in HttpOnly cookies)
   */
  async refreshToken(): Promise<void> {
    // If already refreshing, return existing promise
    if (this.isRefreshing && this.refreshPromise) {
      this.log('⏳ Refresh already in progress, returning existing promise');
      return this.refreshPromise;
    }

    // Start new refresh
    this.isRefreshing = true;
    this.log('🔄 Starting new token refresh');

    this.refreshPromise = this.performRefresh()
      .then(() => {
        this.log('✅ Token refresh successful');
        this.retryCount = 0;
        this.processQueue(null);
        this.resetRefreshState();
      })
      .catch(error => {
        this.log('❌ Token refresh failed:', error.message);
        this.processQueue(error);
        this.resetRefreshState();
        throw error;
      });

    return this.refreshPromise;
  }

  /**
   * Queue a request to wait for token refresh
   */
  async waitForRefresh(): Promise<void> {
    if (!this.isRefreshing) {
      return this.refreshToken();
    }

    this.log('📋 Queuing request to wait for refresh');

    return new Promise<void>((resolve, reject) => {
      this.requestQueue.push({ resolve, reject });
    });
  }

  /**
   * Check if we should attempt a refresh
   * Since we can't read HttpOnly cookies, we rely on API errors to trigger refresh
   */
  shouldRefreshToken(): boolean {
    // Can't check token expiry directly with HttpOnly cookies
    // Return false - let API errors trigger refresh
    return false;
  }

  /**
   * Check if user appears to be authenticated
   * This is a quick UI check, not authoritative
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for auth state cookie (non-HttpOnly flag set on login)
    return document.cookie.includes('auth_state=authenticated');
  }

  /**
   * Perform actual token refresh with retry logic
   * Backend reads refresh token from HttpOnly cookie
   */
  private async performRefresh(): Promise<void> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

      this.log(`🌐 Calling refresh endpoint: ${apiUrl}/users/refresh-token/`);

      const response = await fetch(`${apiUrl}/users/refresh-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Backend reads from HttpOnly cookie
        credentials: 'include', // Send and receive HttpOnly cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      // Success - backend has set new HttpOnly cookies in the response
      this.log('✅ Refresh successful - new cookies set by backend');

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
   * Process queued requests after refresh completes
   */
  private processQueue(error: any) {
    this.log(`📤 Processing ${this.requestQueue.length} queued requests`);

    this.requestQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
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
   * Clear authentication state
   * Note: HttpOnly cookies are cleared by the backend on logout
   */
  clearTokens() {
    this.log('🧹 Clearing auth state');

    if (typeof window !== 'undefined') {
      // Clear legacy localStorage tokens if they exist
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');

      // Clear auth state cookie (this one is not HttpOnly)
      document.cookie = 'auth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    this.resetRefreshState();
    this.requestQueue = [];
    this.retryCount = 0;
  }
}

// Export singleton instance
export const tokenRefreshCoordinator = TokenRefreshCoordinator.getInstance();
export default tokenRefreshCoordinator;
