/**
 * Student Practice Courses Types
 * TypeScript interfaces for student practice/laboratory course domain
 */

import { 
  BaseCourse, 
  BaseUnit, 
  BaseLesson, 
  BaseChallenge, 
  BaseChallengeOption,
  BaseUserProgress,
  User 
} from '../../../shared/types';

// Student-specific practice course interface
export interface StudentPracticeCourse extends BaseCourse {
  type: 'practice';
  units_count?: number;
  lessons_count?: number;
  challenges_count?: number;
  total_progress?: number;
  difficulty_rating?: number;
  estimated_duration?: number; // in hours
  
  // UI-friendly naming for compatibility
  totalUnits?: number;
  total_lessons?: number;
  total_challenges?: number;
  
  // Progress tracking
  user_progress?: {
    completed_units?: number;
    completed_lessons?: number;
    completed_challenges?: number;
    percentage?: number;
    last_accessed?: string;
  };
  
  // Enrollment status
  is_enrolled?: boolean;
  enrolled_at?: string;
}

export interface StudentPracticeUnit extends BaseUnit {
  lessons: StudentPracticeLesson[];
  completed?: boolean;
  progress_percentage?: number;
  total_lessons?: number;
  completed_lessons?: number;
  is_locked?: boolean;
  unlock_criteria?: string;
}

export interface StudentPracticeLesson extends BaseLesson {
  challenges: StudentPracticeChallenge[];
  completed?: boolean;
  progress_percentage?: number;
  total_challenges?: number;
  completed_challenges?: number;
  estimated_time?: number;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  is_locked?: boolean;
  unlock_criteria?: string;
  user_score?: number;
  max_score?: number;
}

export interface StudentPracticeChallenge extends BaseChallenge {
  options: StudentChallengeOption[];
  completed?: boolean;
  user_answer?: string;
  is_correct?: boolean;
  attempts?: number;
  max_attempts?: number;
  points_value?: number;
  time_limit?: number;
  explanation?: string;
  hint?: string;
}

export interface StudentChallengeOption extends BaseChallengeOption {
  selected?: boolean;
  feedback?: string;
}

// User progress interface for students
export interface StudentUserProgress extends BaseUserProgress {
  user_image_src?: string;
  streak?: number;
  level?: number;
  total_xp?: number;
  current_course_progress?: number;
  achievements?: StudentAchievement[];
  daily_goal?: {
    target: number;
    current: number;
    completed: boolean;
  };
  weekly_goal?: {
    target: number;
    current: number;
    completed: boolean;
  };
  // Subscription status
  hasActiveSubscription?: boolean;
  hasUnlimitedHearts?: boolean;
}

// Achievement types
export interface StudentAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge_color: string;
  earned_at?: string;
  progress?: {
    current: number;
    target: number;
  };
  category: 'learning' | 'streak' | 'completion' | 'accuracy' | 'speed';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Challenge interaction types
export interface ChallengeSubmission {
  challenge: string;
  selected_option?: string;
  user_answer?: string;
  time_spent?: number;
  attempt_number?: number;
  confidence_level?: number; // 1-5 scale
}

export interface ChallengeResult {
  success: boolean;
  correct: boolean;
  pointsEarned: number;
  heartsUsed: number;
  explanation?: string;
  correctAnswer?: string;
  nextChallenge?: StudentPracticeChallenge;
  levelUp?: boolean;
  achievementUnlocked?: StudentAchievement;
  streak_bonus?: number;
  performance_feedback?: {
    speed: 'fast' | 'normal' | 'slow';
    accuracy: 'high' | 'medium' | 'low';
    improvement_suggestion?: string;
  };
}

// Course selection and progress
export interface CourseSelectionData {
  courseId: string;
}

export interface ProgressUpdateData {
  courseId?: string;
  lessonId?: string;
  challengeId?: string;
  completed?: boolean;
  score?: number;
  timeSpent?: number;
  difficulty_rating?: number;
}

// Learning session types
export interface LearningSession {
  id: string;
  course_id: string;
  lesson_id?: string;
  started_at: string;
  ended_at?: string;
  challenges_attempted: number;
  challenges_completed: number;
  points_earned: number;
  hearts_used: number;
  accuracy_rate: number;
  session_type: 'lesson' | 'practice' | 'review';
}

export interface SessionSummary {
  session: LearningSession;
  achievements: StudentAchievement[];
  performance_stats: {
    total_time: number;
    average_response_time: number;
    accuracy: number;
    improvement: number;
  };
  nextRecommendation?: {
    type: 'lesson' | 'review' | 'practice';
    content_id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

// Course units with progress
export interface CourseUnitsWithProgress {
  course: StudentPracticeCourse | null;
  units: StudentPracticeUnit[];
  overall_progress: {
    completed_units: number;
    total_units: number;
    completed_lessons: number;
    total_lessons: number;
    completed_challenges: number;
    total_challenges: number;
    percentage: number;
  };
}

// Hearts system
export interface HeartsSystem {
  current: number;
  maximum: number;
  refill_time?: string;
  can_refill: boolean;
  refill_cost?: number;
  refill_methods: Array<{
    type: 'time' | 'gems' | 'ad' | 'subscription';
    cost?: number;
    available: boolean;
  }>;
}

export interface HeartAction {
  action: 'use' | 'refill' | 'restore';
  amount?: number;
  method?: 'time' | 'gems' | 'ad' | 'subscription';
}

// Leaderboard and social features
export interface StudentLeaderboard {
  user_position: number;
  user_points: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  top_students: Array<{
    rank: number;
    user_id: string;
    username: string;
    points: number;
    avatar?: string;
    streak: number;
    level?: number;
  }>;
  friends?: Array<{
    user_id: string;
    username: string;
    points: number;
    avatar?: string;
    is_following: boolean;
    mutual_follow: boolean;
  }>;
}

// Study streak
export interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
  streak_freeze_count: number;
  next_milestone: {
    days: number;
    reward: string;
  };
  streak_protection: {
    available: boolean;
    cost?: number;
  };
}

// Practice recommendations
export interface PracticeRecommendation {
  type: 'weak_skill' | 'review' | 'new_content' | 'daily_goal';
  title: string;
  description: string;
  target_id: string;
  target_type: 'lesson' | 'challenge' | 'skill' | 'unit';
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: number;
  reason: string;
  priority: number; // 1-5 scale
  category: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing';
}

// Analytics for students (their own progress)
export interface StudentAnalytics {
  learning_time: {
    today: number;
    this_week: number;
    this_month: number;
    average_daily: number;
    total_all_time: number;
  };
  accuracy: {
    overall: number;
    trend: 'improving' | 'declining' | 'stable';
    by_skill: Array<{
      skill: string;
      accuracy: number;
      improvement: number;
      recommendation?: string;
    }>;
  };
  progress: {
    courses_completed: number;
    lessons_completed: number;
    challenges_completed: number;
    points_earned: number;
    current_level: number;
    xp_to_next_level: number;
  };
  goals: {
    daily_target: number;
    weekly_target: number;
    completion_rate: number;
    streak_goal: number;
  };
  performance_trends: {
    response_time: Array<{ date: string; average_time: number }>;
    accuracy: Array<{ date: string; accuracy: number }>;
    learning_time: Array<{ date: string; time: number }>;
  };
}