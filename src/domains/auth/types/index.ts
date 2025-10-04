/**
 * Auth Types
 * 
 * All authentication-related TypeScript types and interfaces
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login/Register types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
}

// Auth response types
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// Additional types will be added as needed
export type AuthRole = 'student' | 'teacher' | 'admin';
export type AuthProvider = 'local' | 'google' | 'github';