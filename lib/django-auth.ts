/**
 * Django Authentication Service
 * Handles all authentication-related API calls to Django backend
 *
 * Security: Uses HttpOnly cookies for token storage (set by backend).
 * All requests use credentials: 'include' to send/receive cookies automatically.
 */

import { tokenRefreshCoordinator } from './token-refresh-coordinator';

const DJANGO_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  email_verified: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  password_confirm?: string;
  role?: 'student' | 'teacher';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface EmailVerificationData {
  email: string;
  code: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  email: string;
  code: string;
  newPassword: string;
}

class DjangoAuthService {
  /**
   * Mark user as authenticated (non-sensitive flag cookie)
   * The actual tokens are stored in HttpOnly cookies by the backend
   */
  private markAuthenticated(user: User) {
    if (typeof window === 'undefined') return;

    // Store user info for UI purposes (non-sensitive)
    // Actual authentication is handled by HttpOnly cookies
    localStorage.setItem('user_info', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    }));

    // Set a flag cookie for quick auth state check (not a security token)
    document.cookie = 'auth_state=authenticated; path=/; max-age=604800; SameSite=Lax';
  }

  /**
   * Clear authentication state
   */
  private clearAuthState() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('user_info');
    // Clear legacy tokens if they exist
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Clear auth state cookie
    document.cookie = 'auth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  private getHeaders() {
    // No need to manually add Authorization header anymore
    // HttpOnly cookies are sent automatically with credentials: 'include'
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Network error occurred');
    }
    return response.json();
  }

  async register(data: RegisterData): Promise<{ message: string; email: string; requires_verification: boolean }> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/register/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include', // Receives HttpOnly cookies from backend
    });

    const result = await this.handleResponse(response);

    // Mark user as authenticated (tokens are in HttpOnly cookies from backend)
    if (result.user) {
      this.markAuthenticated(result.user);
    }

    return result;
  }

  async verifyEmail(data: EmailVerificationData): Promise<AuthResponse> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/verify-email/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include', // Receives HttpOnly cookies from backend
    });

    const result = await this.handleResponse(response);

    // Mark user as authenticated (tokens are in HttpOnly cookies from backend)
    if (result.user) {
      this.markAuthenticated(result.user);
    }

    return result;
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/resend-verification/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
      credentials: 'include', // ✅ FASE 2: Permite envio/recebimento de cookies HttpOnly
    });

    return this.handleResponse(response);
  }

  async requestPasswordReset(data: PasswordResetData): Promise<{ message: string }> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/password-reset/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include', // ✅ FASE 2: Permite envio/recebimento de cookies HttpOnly
    });

    return this.handleResponse(response);
  }

  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<{ message: string }> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/password-reset-confirm/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include', // ✅ FASE 2: Permite envio/recebimento de cookies HttpOnly
    });

    return this.handleResponse(response);
  }

  /**
   * Refresh token - backend reads refresh token from HttpOnly cookie
   * New tokens are returned in HttpOnly cookies automatically
   */
  async refreshToken(): Promise<{ access: string; refresh?: string }> {
    // No need to send refresh token in body - backend reads from HttpOnly cookie
    const response = await fetch(`${DJANGO_BASE_URL}/users/refresh-token/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}), // Backend reads from cookie
      credentials: 'include', // Sends HttpOnly cookies, receives new ones
    });

    return this.handleResponse(response);
  }

  async logout(): Promise<void> {
    try {
      // Backend reads refresh token from HttpOnly cookie and blacklists it
      // Backend also clears the HttpOnly cookies
      await fetch(`${DJANGO_BASE_URL}/users/logout/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({}),
        credentials: 'include', // Sends HttpOnly cookies for backend to clear
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear local auth state
      this.clearAuthState();
      tokenRefreshCoordinator.clearTokens();
    }
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/profile/`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include', // HttpOnly cookies sent automatically
    });

    return this.handleResponse(response);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/profile/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include', // HttpOnly cookies sent automatically
    });

    return this.handleResponse(response);
  }

  /**
   * Check if user appears to be authenticated (quick UI check)
   * Note: This checks local state, not actual token validity.
   * Use getProfile() for authoritative auth check.
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for auth state cookie (set on login)
    const hasAuthState = document.cookie.includes('auth_state=authenticated');
    const hasUserInfo = !!localStorage.getItem('user_info');

    return hasAuthState || hasUserInfo;
  }

  /**
   * Get cached user info (for UI purposes)
   * Note: This is not a security check - tokens are in HttpOnly cookies
   */
  getCachedUserInfo(): User | null {
    if (typeof window === 'undefined') return null;

    try {
      const userInfo = localStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  }

  /**
   * @deprecated Tokens are now stored in HttpOnly cookies
   */
  getAccessToken(): string | null {
    console.warn('[DEPRECATED] getAccessToken() - Tokens are now in HttpOnly cookies and cannot be accessed via JavaScript');
    return null;
  }

  /**
   * @deprecated Tokens are now stored in HttpOnly cookies
   */
  getRefreshToken(): string | null {
    console.warn('[DEPRECATED] getRefreshToken() - Tokens are now in HttpOnly cookies and cannot be accessed via JavaScript');
    return null;
  }

  // Helper method to get user role redirect URL
  getUserRedirectUrl(user: User, isCheckoutPage: boolean = false, courseId?: string): string {
    if (isCheckoutPage && courseId) {
      return `/checkout?step=2&id=${courseId}`;
    }

    switch (user.role) {
      case 'teacher':
        return '/teacher/courses';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/user/courses/explore';
    }
  }
}

export const djangoAuth = new DjangoAuthService();
export default djangoAuth;