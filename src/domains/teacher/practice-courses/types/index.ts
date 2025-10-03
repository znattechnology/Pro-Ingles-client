/**
 * Teacher Practice Courses Types
 * 
 * Interface definitions for teacher practice course management including
 * courses, units, lessons, challenges, and analytics.
 */

// Base course interface from the working API2
export interface PracticeCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  course_type: string;
  units_count?: number;
  lessons_count?: number;
  challenges_count?: number;
  total_progress?: number;
  created_at: string;
  updated_at: string;
  teacher?: string;
  teacher_id?: string;
  teacher_email?: string;
  teacher_name?: string;
  // Additional properties for UI compatibility
  units?: number;
  lessons?: number;
  challenges?: number;
  students?: number;
  completionRate?: number;
}

export interface PracticeUnit {
  id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  lessons?: PracticeLesson[];
}

export interface CourseUnitsResponse {
  course: PracticeCourse;
  units: PracticeUnit[];
}

export interface PracticeLesson {
  id: string;
  unit: string;
  title: string;
  order: number;
  challenges?: PracticeChallenge[];
}

export interface PracticeChallenge {
  id: string;
  lesson: string;
  type: string;
  question: string;
  order: number;
  options?: CourseOption[];
}

export interface CourseOption {
  id?: string;
  text: string;
  is_correct: boolean;
  image_url?: string;
  audio_url?: string;
  order: number;
}

export interface CreatePracticeCourseData {
  title: string;
  description: string;
  category: string;
  level: string;
  template?: string;
  teacher_id?: string;
  teacher_email?: string;
  teacher_name?: string;
  course_type?: string;
  status?: string;
  created_by?: string;
  language?: string;
  difficulty_level?: string;
  learningObjectives?: string[];
  targetAudience?: string;
  hearts?: number;
  pointsPerCourse?: number;
  passingScore?: number;
}

export interface CreatePracticeUnitData {
  course: string;
  title: string;
  description: string;
  order: number;
}

export interface CreatePracticeLessonData {
  unit: string;
  title: string;
  order: number;
}

export interface CreatePracticeChallengeData {
  lesson: string;
  type: string;
  question: string;
  order: number;
  options: Array<{
    text: string;
    is_correct: boolean;
    image_url?: string;
    audio_url?: string;
    order: number;
  }>;
}

export interface Analytics {
  total_students: number;
  total_courses: number;
  total_challenges: number;
  avg_completion_rate: number;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  student_name: string;
  name: string;
  email: string;
  course_id: string;
  course_name: string;
  active_course: string;
  progress_percentage: number;
  last_activity: string;
  total_points: number;
  hearts: number;
  completed_lessons: number;
  total_lessons: number;
  average_accuracy: number;
}

export interface PracticeAnalytics {
  total_students: number;
  total_courses: number;
  total_challenges: number;
  avg_completion_rate: number;
}