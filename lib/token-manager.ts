/**
 * Token Manager - Handles session management with HttpOnly cookies
 *
 * With HttpOnly cookies, we can't:
 * - Read token expiration
 * - Schedule proactive refresh
 *
 * Instead, we:
 * - Let the backend handle token refresh via 401 responses
 * - Clear local state on logout
 * - Handle visibility changes to check session status
 */

import { tokenRefreshCoordinator } from './token-refresh-coordinator';

class TokenManager {
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize token manager
   */
  init() {
    if (typeof window === 'undefined') return;

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    console.log('[TokenManager] Initialized (HttpOnly cookie mode)');
  }

  /**
   * Cleanup token manager
   */
  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  /**
   * Handle page visibility changes
   * When user returns to the page, we don't need to do anything special
   * The next API call will validate the session via HttpOnly cookies
   */
  private handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      console.log('[TokenManager] Page visible - session will be validated on next API call');
    }
  }

  /**
   * Check if user appears to be authenticated
   * Note: This is a UI hint only - actual auth is validated by backend
   */
  isAuthenticated(): boolean {
    return tokenRefreshCoordinator.isAuthenticated();
  }

  /**
   * Clear authentication state
   */
  clearAuth() {
    tokenRefreshCoordinator.clearTokens();
  }
}

export const tokenManager = new TokenManager();
