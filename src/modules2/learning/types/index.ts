/**
 * Learning Types
 * 
 * All learning-related TypeScript types and interfaces
 */

// Re-export existing types from practice API
export type { Course, Unit, Lesson, Challenge, UserProgress } from '../services/practice-courses'

// Course types
export interface CourseWithStats extends Course {
  units_count: number;
  lessons_count: number;
  challenges_count: number;
  total_progress: number;
  completion_percentage: number;
}

// Progress types  
export interface LearningProgress {
  course_id: string;
  completed_lessons: string[];
  completed_challenges: string[];
  current_unit: string | null;
  current_lesson: string | null;
  hearts: number;
  points: number;
  streak: number;
  last_activity: string;
}

// Lesson types
export interface LessonDetail {
  id: string;
  title: string;
  description?: string;
  unit_id: string;
  order: number;
  challenges: Challenge[];
  is_completed: boolean;
  completion_percentage: number;
}

// Challenge types
export interface ChallengeResult {
  challenge_id: string;
  is_correct: boolean;
  selected_option?: string;
  points_earned: number;
  hearts_lost: number;
  completion_time: number;
}

// Unit types
export interface UnitWithProgress extends Unit {
  lessons: LessonDetail[];
  completion_percentage: number;
  is_unlocked: boolean;
  completed_lessons_count: number;
  total_lessons_count: number;
}

// Practice session types
export interface PracticeSession {
  id: string;
  course_id: string;
  lesson_id: string;
  started_at: string;
  completed_at?: string;
  challenges_completed: number;
  correct_answers: number;
  points_earned: number;
  hearts_used: number;
}