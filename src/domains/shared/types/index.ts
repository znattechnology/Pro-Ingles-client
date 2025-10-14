/**
 * Shared Types
 * Common types and interfaces used across all domains
 */

// Base entity interfaces
export interface BaseCourse {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  status?: 'Draft' | 'Published' | 'Archived';
  course_type?: 'practice' | 'video';
  created_at?: string;
  updated_at?: string;
}

export interface BaseUnit {
  id: string;
  course: string;
  title: string;
  description?: string;
  order: number;
}

export interface BaseLesson {
  id: string;
  unit: string;
  title: string;
  order: number;
}

export interface BaseChallenge {
  id: string;
  lesson: string;
  type: 'SELECT' | 'ASSIST' | 'TRANSLATE' | 'SPEAKING' | 'LISTENING';
  question: string;
  order: number;
}

export interface BaseChallengeOption {
  id: string;
  text: string;
  is_correct: boolean;
  image_url?: string;
  audio_url?: string;
  order: number;
}

export interface BaseUserProgress {
  id: string;
  user_id: string;
  hearts: number;
  points: number;
  active_course?: BaseCourse | null;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role: 'teacher' | 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

// Common query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterParams {
  search?: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  status?: 'Draft' | 'Published' | 'Archived';
}

export interface SortParams {
  sort_by?: string;
  order?: 'asc' | 'desc';
}

// Cache tags that can be shared
export const SHARED_CACHE_TAGS = {
  Course: 'Course',
  Unit: 'Unit', 
  Lesson: 'Lesson',
  Challenge: 'Challenge',
  UserProgress: 'UserProgress',
  User: 'User',
} as const;

export type SharedCacheTag = typeof SHARED_CACHE_TAGS[keyof typeof SHARED_CACHE_TAGS];

// Common form field types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'number' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Component props interfaces
export interface ComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// File upload types
export interface FileUpload {
  file: File;
  progress?: number;
  url?: string;
  error?: string;
}

export interface UploadResponse {
  uploadUrl: string;
  fileUrl: string;
  fileName: string;
}

// Analytics common types
export interface AnalyticsTimeframe {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}