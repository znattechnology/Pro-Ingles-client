import { 
  BaseCourse, 
  BaseUnit, 
  BaseLesson, 
  BaseChallenge, 
  BaseChallengeOption 
} from '../shared/sharedTypes';

// Teacher-specific course interface
export interface TeacherCourse extends BaseCourse {
  teacher_id?: string;
  teacher_email?: string;
  teacher_name?: string;
  units_count?: number;
  lessons_count?: number;
  challenges_count?: number;
  students_count?: number;
  completion_rate?: number;
  // Statistics for dashboard
  units?: number;
  lessons?: number;
  challenges?: number;
  students?: number;
  completionRate?: number;
  lastUpdated?: string;
  createdAt?: string;
}

export interface TeacherUnit extends BaseUnit {
  lessons?: TeacherLesson[];
  lessons_count?: number;
  challenges_count?: number;
}

export interface TeacherLesson extends BaseLesson {
  challenges?: TeacherChallenge[];
  challenges_count?: number;
}

export interface TeacherChallenge extends BaseChallenge {
  options: TeacherChallengeOption[];
}

export interface TeacherChallengeOption extends BaseChallengeOption {
  challenge?: string;
}

// Course creation/update data
export interface CreateCourseData {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  template?: string;
  teacher_id?: string;
  teacher_email?: string;
  teacher_name?: string;
  course_type?: string;
  status?: 'Draft' | 'Published';
  language?: string;
  learningObjectives?: string[];
  targetAudience?: string;
  hearts?: number;
  pointsPerChallenge?: number;
  passingScore?: number;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  id: string;
}

// Unit creation/update data
export interface CreateUnitData {
  course: string;
  title: string;
  description: string;
  order: number;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {
  id: string;
}

// Lesson creation/update data
export interface CreateLessonData {
  unit: string;
  title: string;
  order: number;
}

export interface UpdateLessonData extends Partial<CreateLessonData> {
  id: string;
}

// Challenge creation/update data
export interface CreateChallengeData {
  lesson: string;
  type: 'SELECT' | 'ASSIST' | 'TRANSLATE';
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

export interface UpdateChallengeData extends Partial<CreateChallengeData> {
  id: string;
}

// Analytics types
export interface CourseAnalytics {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalSessions: number;
  averageSessionTime: number;
  challengeStats: {
    totalChallenges: number;
    completedChallenges: number;
    averageAccuracy: number;
  };
  progressOverTime: Array<{
    date: string;
    enrollments: number;
    completions: number;
  }>;
}

export interface StudentProgressDetail {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  course_id: string;
  course_name: string;
  progress_percentage: number;
  last_activity: string;
  total_points: number;
  hearts: number;
  completed_lessons: number;
  total_lessons: number;
  average_accuracy: number;
  time_spent: number;
  challenge_completion: {
    correct: number;
    total: number;
  };
}

export interface TeacherDashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  totalChallenges: number;
  averageCompletionRate: number;
  recentActivity: Array<{
    type: 'enrollment' | 'completion' | 'submission';
    student: string;
    course: string;
    timestamp: string;
  }>;
}

// File upload types
export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

export interface FileUploadRequest {
  challengeId: string;
  fileName: string;
  fileType: string;
  uploadType: 'audio' | 'image';
}

// AI assistance types
export interface AITranslationValidation {
  sourceText: string;
  userTranslation: string;
  challengeId?: string;
  difficultyLevel?: string;
}

export interface AITranslationSuggestions {
  sourceText: string;
  difficultyLevel?: string;
  count?: number;
}

export interface AIValidationResponse {
  isCorrect: boolean;
  score: number;
  feedback: string;
  suggestions?: string[];
  explanation?: string;
}

export interface AISuggestionResponse {
  suggestions: Array<{
    text: string;
    difficulty: string;
    confidence: number;
  }>;
  metadata: {
    sourceLanguage: string;
    targetLanguage: string;
    generatedAt: string;
  };
}