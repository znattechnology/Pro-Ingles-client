/**
 * Student Video Courses Types
 * TypeScript interfaces for student video course domain
 */

import { 
  BaseCourse, 
  User,
  PaginationParams,
  FilterParams 
} from '../../../shared/types';

// Student-specific video course interface
export interface StudentVideoCourse extends BaseCourse {
  type: 'video';
  price: number;
  currency?: string;
  instructor: User;
  instructor_name?: string; // For backward compatibility
  duration?: number; // total course duration in minutes
  total_sections?: number;
  total_chapters?: number;
  language?: string;
  captions_available?: string[]; // Array of language codes
  tags?: string[];
  
  // Ratings and reviews
  rating?: number;
  review_count?: number;
  reviews?: CourseReview[];
  
  // Enrollment and progress
  is_enrolled?: boolean;
  enrollment?: CourseEnrollment;
  progress?: StudentCourseProgress;
  
  // Course content preview
  sections?: StudentVideoSection[];
  what_you_will_learn?: string[];
  requirements?: string[];
  target_audience?: string[];
  
  // Social proof
  student_count?: number;
  completion_rate?: number;
  
  // Wishlist status
  in_wishlist?: boolean;
}

export interface StudentVideoSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration?: number; // in minutes
  chapters: StudentVideoChapter[];
  is_locked?: boolean;
  completion_percentage?: number;
}

export interface StudentVideoChapter {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'exercise' | 'resource';
  videoUrl?: string;
  duration?: number; // in seconds
  order: number;
  is_free_preview?: boolean;
  is_locked?: boolean;
  completed?: boolean;
  progress?: {
    watched_duration: number;
    completion_percentage: number;
    last_watched_at?: string;
  };
  resources?: ChapterResource[];
  quiz?: ChapterQuiz;
  notes_count?: number;
  bookmarks_count?: number;
}

export interface ChapterResource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'document' | 'image' | 'code';
  url: string;
  description?: string;
  downloadable: boolean;
  size?: number; // in bytes
}

export interface ChapterQuiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit?: number; // in minutes
  attempts_allowed: number;
  user_attempts?: QuizAttempt[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'matching';
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  attempt_number: number;
  score: number;
  total_points: number;
  passed: boolean;
  started_at: string;
  completed_at?: string;
  answers: Array<{
    question_id: string;
    user_answer: string | string[];
    is_correct: boolean;
    points_earned: number;
  }>;
}

// Course enrollment
export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  last_accessed_at?: string;
  completion_percentage: number;
  completed_at?: string;
  certificate_issued?: boolean;
  payment_status: 'pending' | 'completed' | 'free' | 'scholarship';
  access_expires_at?: string;
}

export interface CourseEnrollmentRequest {
  courseId: string;
  payment_method?: 'credit_card' | 'paypal' | 'bank_transfer' | 'free' | 'coupon';
  coupon_code?: string;
}

// Course progress tracking
export interface StudentCourseProgress {
  course_id: string;
  completion_percentage: number;
  total_watch_time: number; // in minutes
  completed_sections: number;
  total_sections: number;
  completed_chapters: number;
  total_chapters: number;
  current_chapter?: string;
  last_accessed_at: string;
  streak_days: number;
  certificates_earned: string[];
  
  // Detailed progress by section
  section_progress: Array<{
    section_id: string;
    completion_percentage: number;
    time_spent: number;
    completed_chapters: number;
    total_chapters: number;
  }>;
  
  // Learning goals
  daily_goal?: {
    target_minutes: number;
    completed_minutes: number;
    achieved: boolean;
  };
  
  weekly_goal?: {
    target_minutes: number;
    completed_minutes: number;
    achieved: boolean;
  };
}

// Video progress update
export interface VideoProgressUpdate {
  chapterId: string;
  watched_duration: number;
  total_duration: number;
  completed?: boolean;
  quality?: string;
  playback_speed?: number;
}

export interface ChapterCompletion {
  chapterId: string;
  sectionId: string;
  courseId: string;
  completion_time?: number;
  quiz_score?: number;
  notes_taken?: number;
}

// Course search and filtering
export interface CourseSearchParams extends PaginationParams, FilterParams {
  price_min?: number;
  price_max?: number;
  duration_min?: number;
  duration_max?: number;
  rating_min?: number;
  language?: string;
  instructor?: string;
  sort_by?: 'relevance' | 'rating' | 'price' | 'newest' | 'popularity';
  include_free?: boolean;
  tags?: string[];
}

// Reviews and ratings
export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number; // 1-5 stars
  title?: string;
  comment: string;
  created_at: string;
  updated_at?: string;
  helpful_count: number;
  user_found_helpful?: boolean;
  
  // User info
  user: {
    name: string;
    avatar?: string;
    is_verified?: boolean;
    courses_completed?: number;
  };
  
  // Review metadata
  purchase_verified: boolean;
  course_completed: boolean;
}

export interface CreateReviewData {
  courseId: string;
  rating: number;
  title?: string;
  comment: string;
}

// Student notes and bookmarks
export interface StudentNote {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  content: string;
  timestamp?: number; // video timestamp if applicable
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  is_private: boolean;
}

export interface StudentBookmark {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  timestamp?: number; // video timestamp if applicable
  title?: string;
  note?: string;
  createdAt: string;
}

// Certificates
export interface CourseCertificate {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  instructor_name: string;
  issued_at: string;
  certificate_url: string;
  verification_code: string;
  completion_percentage: number;
  final_score?: number;
  is_verified: boolean;
}

// Analytics for students
export interface StudentVideoAnalytics {
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_watch_time: number; // in minutes
  average_completion_rate: number;
  certificates_earned: number;
  
  learning_streak: {
    current: number;
    longest: number;
    last_activity: string;
  };
  
  monthly_progress: Array<{
    month: string;
    courses_completed: number;
    watch_time: number;
    certificates: number;
  }>;
  
  subject_breakdown: Array<{
    category: string;
    courses_completed: number;
    watch_time: number;
    average_rating_given: number;
  }>;
  
  learning_goals: {
    daily_target: number;
    weekly_target: number;
    monthly_target: number;
    current_streak: number;
    goals_achieved_this_month: number;
  };
}

// Course recommendations
export interface CourseRecommendation {
  course: StudentVideoCourse;
  reason: 'similar_content' | 'same_instructor' | 'trending' | 'wishlist' | 'completion_bonus';
  score: number; // recommendation confidence 0-1
  explanation: string;
}

// Wishlist
export interface WishlistItem {
  id: string;
  user_id: string;
  course_id: string;
  added_at: string;
  priority?: number;
  course: StudentVideoCourse;
}