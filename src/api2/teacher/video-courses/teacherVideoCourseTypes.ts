import { BaseCourse } from '../../shared/sharedTypes';

// Teacher Video Course specific types
export interface TeacherVideoCourse extends BaseCourse {
  courseId: string; // Legacy field compatibility
  teacher: string; // Teacher ID
  teacherName: string;
  teacherId?: string; // For backward compatibility
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Draft' | 'Published';
  template: 'general' | 'business' | 'technology' | 'medical' | 'legal';
  total_sections?: number;
  total_chapters?: number;
  total_enrollments?: number;
  sections?: CourseSection[];
  enrollments?: { userId: string }[];
}

export interface CourseSection {
  id: string;
  sectionId: string;
  course: string;
  sectionTitle: string;
  sectionDescription?: string;
  order: number;
  chapters?: CourseChapter[];
}

export interface CourseChapter {
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
}

// Course creation/update data for video courses
export interface CreateVideoCourseData {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  template: 'general' | 'business' | 'technology' | 'medical' | 'legal';
  price: number;
  teacher?: string;
  teacherName?: string;
  teacherId?: string;
}

export interface UpdateVideoCourseData extends Partial<CreateVideoCourseData> {
  courseId: string;
}

// Section management
export interface CreateSectionData {
  course: string;
  sectionTitle: string;
  sectionDescription?: string;
  order: number;
}

export interface UpdateSectionData extends Partial<CreateSectionData> {
  sectionId: string;
}

// Chapter management
export interface CreateChapterData {
  section: string;
  chapterTitle: string;
  content?: string;
  type: 'video' | 'text' | 'quiz' | 'exercise';
  order: number;
  freePreview?: boolean;
}

export interface UpdateChapterData extends Partial<CreateChapterData> {
  chapterId: string;
}

// Video upload types
export interface VideoUploadRequest {
  courseId: string;
  chapterId: string;
  sectionId: string;
  fileName: string;
  fileType: string;
}

export interface VideoUploadResponse {
  uploadUrl: string;
  videoUrl: string;
}

// Course analytics for video courses
export interface VideoCourseAnalytics {
  courseId: string;
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  watchTime: {
    totalMinutes: number;
    averagePerStudent: number;
  };
  sectionStats: Array<{
    sectionId: string;
    sectionTitle: string;
    completionRate: number;
    averageWatchTime: number;
  }>;
  chapterStats: Array<{
    chapterId: string;
    chapterTitle: string;
    viewCount: number;
    completionRate: number;
    averageWatchTime: number;
  }>;
}

// Student enrollment and progress
export interface CourseEnrollment {
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  lastAccessedAt: string;
  completedChapters: string[];
  currentChapter?: string;
}

export interface StudentVideoProgress {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  lastAccessedAt: string;
  completedSections: number;
  totalSections: number;
  completedChapters: number;
  totalChapters: number;
  totalWatchTime: number;
  averageScore?: number;
}