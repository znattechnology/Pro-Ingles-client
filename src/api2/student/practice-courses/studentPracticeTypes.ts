import { 
  BaseCourse, 
  BaseUnit, 
  BaseLesson, 
  BaseChallenge, 
  BaseChallengeOption,
  BaseUserProgress 
} from '../shared/sharedTypes';

// Student-specific course interface (for learning)
export interface StudentCourse extends BaseCourse {
  // Statistics visible to students
  units_count?: number;
  lessons_count?: number;
  challenges_count?: number;
  total_progress?: number;
  // UI-friendly naming
  totalUnits?: number;
  total_lessons?: number;
  total_challenges?: number;
  // Progress tracking
  user_progress?: {
    completed_units?: number;
    completed_lessons?: number;
    completed_challenges?: number;
    percentage?: number;
  };
}

export interface StudentUnit extends BaseUnit {
  lessons: StudentLesson[];
  completed?: boolean;
  progress_percentage?: number;
  total_lessons?: number;
  completed_lessons?: number;
}

export interface StudentLesson extends BaseLesson {
  challenges: StudentChallenge[];
  completed?: boolean;
  progress_percentage?: number;
  total_challenges?: number;
  completed_challenges?: number;
}

export interface StudentChallenge extends BaseChallenge {
  options: StudentChallengeOption[];
  completed?: boolean;
  user_answer?: string;
  is_correct?: boolean;
  attempts?: number;
  max_attempts?: number;
}

export interface StudentChallengeOption extends BaseChallengeOption {
  selected?: boolean;
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
}

// Challenge interaction types
export interface ChallengeSubmission {
  challenge: string;
  selected_option?: string;
  user_answer?: string;
  time_spent?: number;
  attempt_number?: number;
}

export interface ChallengeResult {
  success: boolean;
  correct: boolean;
  pointsEarned: number;
  heartsUsed: number;
  explanation?: string;
  correctAnswer?: string;
  nextChallenge?: StudentChallenge;
  levelUp?: boolean;
  achievementUnlocked?: StudentAchievement;
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
}

export interface SessionSummary {
  session: LearningSession;
  achievements: StudentAchievement[];
  nextRecommendation?: {
    type: 'lesson' | 'review' | 'practice';
    content_id: string;
    title: string;
    description: string;
  };
}

// Course units with progress
export interface CourseUnitsWithProgress {
  course: StudentCourse;
  units: StudentUnit[];
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

// Lesson detail with challenges
export interface LessonDetail {
  id: string;
  title: string;
  order: number;
  unit: {
    id: string;
    title: string;
    description: string;
    course: {
      id: string;
      title: string;
    };
  };
  challenges: StudentChallenge[];
  estimated_time: number;
  difficulty_level: string;
  learning_objectives: string[];
}

// Hearts system
export interface HeartsSystem {
  current: number;
  maximum: number;
  refill_time?: string;
  can_refill: boolean;
  refill_cost?: number;
}

export interface HeartAction {
  action: 'use' | 'refill' | 'restore';
  amount?: number;
}

// Leaderboard and social features
export interface StudentLeaderboard {
  user_position: number;
  user_points: number;
  top_students: Array<{
    rank: number;
    user_id: string;
    username: string;
    points: number;
    avatar?: string;
    streak: number;
  }>;
  friends?: Array<{
    user_id: string;
    username: string;
    points: number;
    avatar?: string;
    is_following: boolean;
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
}

// Practice recommendations
export interface PracticeRecommendation {
  type: 'weak_skill' | 'review' | 'new_content';
  title: string;
  description: string;
  target_id: string;
  target_type: 'lesson' | 'challenge' | 'skill';
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: number;
  reason: string;
}

// Analytics for students (their own progress)
export interface StudentAnalytics {
  learning_time: {
    today: number;
    this_week: number;
    this_month: number;
    average_daily: number;
  };
  accuracy: {
    overall: number;
    by_skill: Array<{
      skill: string;
      accuracy: number;
      improvement: number;
    }>;
  };
  progress: {
    courses_completed: number;
    lessons_completed: number;
    challenges_completed: number;
    points_earned: number;
  };
  goals: {
    daily_target: number;
    weekly_target: number;
    completion_rate: number;
  };
}