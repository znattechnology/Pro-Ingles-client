/**
 * Token Manager - Handles automatic token refresh and session management
 *
 * ✅ Updated to use TokenRefreshCoordinator to prevent race conditions
 */

import { jwtDecode } from 'jwt-decode';
import { tokenRefreshCoordinator } from './token-refresh-coordinator';

interface JWTPayload {
  user_id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  exp: number;
  iat: number;
}

class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  /**
   * Initialize token manager - starts automatic refresh scheduling
   */
  init() {
    if (typeof window === 'undefined') return;

    // Check token on initialization
    this.checkTokenAndScheduleRefresh();

    // Listen for storage changes (multiple tabs)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Cleanup token manager
   */
  cleanup() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  /**
   * Check if token needs refresh and schedule the next refresh
   */
  private checkTokenAndScheduleRefresh() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.clearRefreshTimer();
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const now = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - now;

      // If token expires in less than 5 minutes, refresh immediately
      if (timeUntilExpiry <= 300) { // 5 minutes
        this.refreshTokenSafely();
      } else {
        // Schedule refresh 5 minutes before expiry
        const refreshIn = (timeUntilExpiry - 300) * 1000; // Convert to milliseconds
        this.scheduleRefresh(refreshIn);
      }
    } catch (error) {
      console.error('Error parsing token for refresh scheduling:', error);
      this.clearTokens();
    }
  }

  /**
   * Schedule token refresh
   */
  private scheduleRefresh(delay: number) {
    this.clearRefreshTimer();
    
    // Don't schedule if delay is too long (over 24 hours) or negative
    if (delay > 86400000 || delay < 0) {
      return;
    }

    console.log(`Token refresh scheduled in ${Math.round(delay / 1000 / 60)} minutes`);
    
    this.refreshTimer = setTimeout(() => {
      this.refreshTokenSafely();
    }, delay);
  }

  /**
   * Safely refresh token with error handling
   * ✅ Now uses TokenRefreshCoordinator to prevent race conditions
   */
  private async refreshTokenSafely() {
    if (this.isRefreshing) return;

    try {
      this.isRefreshing = true;
      console.log('[TokenManager] Automatically refreshing token...');

      // Use coordinator instead of direct refresh
      await tokenRefreshCoordinator.refreshToken();
      console.log('[TokenManager] Token refreshed successfully');

      // Schedule next refresh
      this.checkTokenAndScheduleRefresh();
    } catch (error) {
      console.error('[TokenManager] Automatic token refresh failed:', error);
      this.clearTokens();
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle storage changes (for multi-tab sync)
   */
  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'access_token') {
      if (event.newValue) {
        // Token was updated in another tab, reschedule refresh
        this.checkTokenAndScheduleRefresh();
      } else {
        // Token was removed in another tab, clear timer
        this.clearRefreshTimer();
      }
    }
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // Page became visible, check if token needs refresh
      this.checkTokenAndScheduleRefresh();
    }
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Clear tokens and redirect to login
   */
  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.clearRefreshTimer();
    
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/signin?reason=session_expired';
      }, 100);
    }
  }

  /**
   * Check if current token is valid
   * ✅ Now uses TokenRefreshCoordinator for consistency
   */
  isTokenValid(): boolean {
    return tokenRefreshCoordinator.isTokenValid();
  }

  /**
   * Get time until token expires (in seconds)
   * ✅ Now uses TokenRefreshCoordinator for consistency
   */
  getTimeUntilExpiry(): number | null {
    return tokenRefreshCoordinator.getTimeUntilExpiry();
  }
}

export const tokenManager = new TokenManager();