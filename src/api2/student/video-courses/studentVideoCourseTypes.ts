import { BaseCourse } from '../../shared/sharedTypes';

// Student Video Course specific types
export interface StudentVideoCourse extends BaseCourse {
  courseId: string; // Legacy field compatibility
  teacher: string; // Teacher ID
  teacherName: string;
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Draft' | 'Published';
  template: 'general' | 'business' | 'technology' | 'medical' | 'legal';
  total_sections?: number;
  total_chapters?: number;
  enrolled?: boolean;
  enrollment?: CourseEnrollment;
  progress?: StudentCourseProgress;
  sections?: StudentCourseSection[];
}

export interface StudentCourseSection {
  id: string;
  sectionId: string;
  course: string;
  sectionTitle: string;
  sectionDescription?: string;
  order: number;
  chapters?: StudentCourseChapter[];
  completed?: boolean;
  progress?: number;
}

export interface StudentCourseChapter {
  id: string;
  chapterId: string;
  section: string;
  chapterTitle: string;
  content?: string;
  type: 'video' | 'text' | 'quiz' | 'exercise';
  order: number;
  video?: string;
  videoUrl?: string;
  freePreview?: boolean;
  completed?: boolean;
  progress?: number;
  watchTime?: number;
  lastWatchPosition?: number;
}

// Course enrollment and progress
export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  lastAccessedAt: string;
  completedChapters: string[];
  currentChapter?: string;
  certificateEarned?: boolean;
  certificateUrl?: string;
}

export interface StudentCourseProgress {
  userId: string;
  courseId: string;
  overallProgress: number;
  completedSections: number;
  totalSections: number;
  completedChapters: number;
  totalChapters: number;
  totalWatchTime: number; // in minutes
  lastAccessedAt: string;
  currentSection?: string;
  currentChapter?: string;
  notes?: StudentNote[];
  bookmarks?: StudentBookmark[];
}

export interface StudentNote {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  timestamp: number; // video timestamp
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentBookmark {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  timestamp: number; // video timestamp
  title: string;
  description?: string;
  createdAt: string;
}

// Course interaction types
export interface VideoProgressUpdate {
  chapterId: string;
  currentTime: number;
  duration: number;
  completed?: boolean;
  watchTime?: number; // session watch time
}

export interface ChapterCompletion {
  chapterId: string;
  sectionId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
  score?: number; // for quiz chapters
  timeSpent?: number;
}

export interface CourseEnrollmentRequest {
  courseId: string;
  paymentMethod?: string;
  promoCode?: string;
}

// Course discovery and filtering
export interface CourseFilter {
  category?: string;
  level?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: string; // 'short' | 'medium' | 'long'
  rating?: number;
  language?: string;
  featured?: boolean;
}

export interface CourseSearchParams extends CourseFilter {
  search?: string;
  sortBy?: 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

// Course reviews and ratings
export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  courseId: string;
  rating: number; // 1-5
  title: string;
  content: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  courseId: string;
  rating: number;
  title: string;
  content: string;
}

// Learning analytics for students
export interface StudentVideoAnalytics {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalWatchTime: number; // in minutes
  averageProgress: number;
  certificatesEarned: number;
  currentStreak: number;
  longestStreak: number;
  learningGoals: {
    daily: {
      target: number; // minutes
      current: number;
      achieved: boolean;
    };
    weekly: {
      target: number; // minutes
      current: number;
      achieved: boolean;
    };
  };
  recentActivity: Array<{
    type: 'enrolled' | 'completed_chapter' | 'completed_course';
    courseId: string;
    courseTitle: string;
    chapterId?: string;
    chapterTitle?: string;
    timestamp: string;
  }>;
}

// Certificates
export interface CourseCertificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  teacherName: string;
  completedAt: string;
  certificateUrl: string;
  validationCode: string;
  skills: string[];
}

// Course recommendations
export interface CourseRecommendation {
  course: StudentVideoCourse;
  reason: 'similar_content' | 'same_teacher' | 'popular' | 'next_level';
  confidence: number; // 0-1
  description: string;
}