/**
 * Core Types - Shared type definitions across modules
 * 
 * This module contains common types used across the application
 * to ensure type safety and consistency.
 */

// Common API response types
export interface ApiResponse<T = any> {
  message: string;
  data: T;
  success?: boolean;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Common entity types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  is_active: boolean;
  is_verified: boolean;
}

// Module health status
export interface ModuleHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  services: ServiceHealth[];
  lastCheck: string;
}

export interface ServiceHealth {
  name: string;
  status: 'available' | 'unavailable';
  endpoint?: string;
  responseTime?: number;
}

// Feature flag types
export interface FeatureFlags {
  useModularServices: boolean;
  useReduxMigration: boolean;
  useNewAuth: boolean;
  useAdvancedLearning: boolean;
  useGamificationV2: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError extends AppError {
  field: string;
  value: any;
}

// Progress tracking
export interface Progress {
  completed: boolean;
  percentage: number;
  current_step: number;
  total_steps: number;
  completed_at?: string;
}

// Common filter and search types
export interface FilterParams {
  search?: string;
  category?: string;
  level?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface SearchResult<T = any> {
  items: T[];
  total_count: number;
  search_term: string;
  filters_applied: FilterParams;
  execution_time: number;
}