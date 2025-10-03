// Shared types between teacher and student APIs
export interface BaseCourse {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
  status?: string;
  course_type?: string;
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
  type: 'SELECT' | 'ASSIST' | 'TRANSLATE';
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

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
  success?: boolean;
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
  level?: string;
  status?: string;
}

// Cache tags that can be shared
export const SHARED_CACHE_TAGS = {
  Course: 'Course',
  Unit: 'Unit', 
  Lesson: 'Lesson',
  Challenge: 'Challenge',
  UserProgress: 'UserProgress',
} as const;

export type SharedCacheTag = typeof SHARED_CACHE_TAGS[keyof typeof SHARED_CACHE_TAGS];