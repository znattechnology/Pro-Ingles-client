/**
 * Django Authentication Service
 * Handles all authentication-related API calls to Django backend
 */

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
  private getHeaders(includeAuth: boolean = false) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
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
    });

    const result = await this.handleResponse(response);
    
    // Store tokens in localStorage
    if (result.access) {
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('refresh_token', result.refresh);
    }

    return result;
  }

  async verifyEmail(data: EmailVerificationData): Promise<AuthResponse> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/verify-email/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse(response);
    
    // Store tokens after email verification
    if (result.access) {
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('refresh_token', result.refresh);
    }

    return result;
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/resend-verification/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    return this.handleResponse(response);
  }

  async requestPasswordReset(data: PasswordResetData): Promise<{ message: string }> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/password-reset/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<{ message: string }> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/password-reset-confirm/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${DJANGO_BASE_URL}/users/refresh-token/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const result = await this.handleResponse(response);
    
    // Store new access token
    if (result.access) {
      localStorage.setItem('access_token', result.access);
    }

    return result;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      if (refreshToken) {
        await fetch(`${DJANGO_BASE_URL}/users/logout/`, {
          method: 'POST',
          headers: this.getHeaders(true),
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/profile/`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return this.handleResponse(response);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${DJANGO_BASE_URL}/users/profile/`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
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
        return '/user/learn';
    }
  }
}

export const djangoAuth = new DjangoAuthService();
export default djangoAuth;