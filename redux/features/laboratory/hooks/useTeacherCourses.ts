/**
 * Teacher Course Management Hooks
 * 
 * Hooks para gerenciar cursos do professor, incluindo criação,
 * edição, publicação e analytics.
 */

import { useCallback } from 'react';
import { useFeatureFlag } from '@/lib/featureFlags';

// Import from new domain APIs (removing laboratoryApiSlice dependency)
import { 
  useGetTeacherCoursesQuery,
  useCreateTeacherCourseMutation,
  useUpdatePracticeCourseMutation,
  useDeleteTeacherCourseMutation,
  usePublishTeacherCourseMutation,
  useGetCourseAnalyticsQuery,
} from '@/src/domains/teacher/practice-courses/api';

// Types
export interface TeacherCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Draft' | 'Published' | 'Archived';
  units: number;
  lessons: number;
  challenges: number;
  students: number;
  completionRate: number;
  lastUpdated: string;
  createdAt: string;
}

export interface TeacherCoursesResult {
  courses: TeacherCourse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface TeacherCourseActions {
  createCourse: (data: CourseCreationData) => Promise<TeacherCourse>;
  updateCourse: (id: string, data: CourseUpdateData) => Promise<TeacherCourse>;
  deleteCourse: (id: string) => Promise<void>;
  publishCourse: (id: string, publish: boolean) => Promise<TeacherCourse>;
}

export interface CourseCreationData {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  template: string;
}

export interface CourseUpdateData extends Partial<CourseCreationData> {
  status?: 'Draft' | 'Published' | 'Archived';
}

export interface CourseAnalyticsResult {
  analytics: {
    totalStudents: number;
    activeStudents: number;
    completionRate: number;
    averageProgress: number;
    totalSessions: number;
    averageSessionTime: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook principal para gerenciar cursos do professor
 */
export const useTeacherCourses = (): TeacherCoursesResult => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetTeacherCoursesQuery({ includeDrafts: true });
  
  // Debug log para confirmar uso do novo domínio
  if (process.env.NODE_ENV === 'development' && data) {
    console.log('🚀 NEW DOMAIN API - useTeacherCourses returning data from teacher/practice-courses:', {
      source: 'Teacher Practice Domain API',
      courseCount: data.length,
      sampleCourse: data[0] ? {
        id: data[0].id,
        title: data[0].title,
        teacher_id: (data[0] as any).teacher_id || 'N/A'
      } : null
    });
  }
  
  // Transform CourseWithUnits to TeacherCourse format
  const transformedCourses: TeacherCourse[] = (data || []).map(course => ({
    id: course.id,
    title: course.title,
    description: course.description || '',
    category: course.category || 'General',
    level: (course.level as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
    status: (course.status as 'Draft' | 'Published' | 'Archived') || 'Draft',
    units: course.units_count || 0,
    lessons: course.lessons_count || 0,
    challenges: course.challenges_count || 0,
    students: 0, // Will be populated from analytics
    completionRate: 0, // Will be populated from analytics
    lastUpdated: course.updated_at || course.created_at || new Date().toISOString(),
    createdAt: course.created_at || new Date().toISOString(),
  }));
  
  return {
    courses: transformedCourses,
    isLoading,
    error: error ? 'Failed to load teacher courses' : null,
    refetch,
  };
};

/**
 * Hook para ações de gerenciamento de cursos
 */
export const useTeacherCourseActions = (): TeacherCourseActions => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_MANAGEMENT');
  
  // All mutations now use the new domain APIs
  const [createCourseRedux] = useCreateTeacherCourseMutation();
  const [updateCourseRedux] = useUpdatePracticeCourseMutation();
  const [deleteCourseRedux] = useDeleteTeacherCourseMutation();
  const [publishCourseRedux] = usePublishTeacherCourseMutation();
  
  const createCourse = useCallback(async (data: CourseCreationData) => {
    const result = await createCourseRedux(data).unwrap();
    return result;
  }, [createCourseRedux]);
  
  const updateCourse = useCallback(async (id: string, data: CourseUpdateData) => {
    const result = await updateCourseRedux({ courseId: id, data }).unwrap();
    return result;
  }, [updateCourseRedux]);
  
  const deleteCourse = useCallback(async (id: string) => {
    await deleteCourseRedux(id).unwrap();
  }, [deleteCourseRedux]);
  
  const publishCourse = useCallback(async (id: string, publish: boolean) => {
    const result = await publishCourseRedux({ courseId: id, publish }).unwrap();
    return result;
  }, [publishCourseRedux]);
  
  return {
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
  };
};

/**
 * Hook para analytics de curso específico
 */
export const useCourseAnalytics = (courseId: string | null): CourseAnalyticsResult => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetCourseAnalyticsQuery(courseId!, {
    skip: !courseId
  });
  
  return {
    analytics: data || null,
    isLoading,
    error: error ? 'Failed to load course analytics' : null,
    refetch,
  };
};

/**
 * Hook para filtros e busca de cursos do professor
 */
export const useTeacherCourseFilters = () => {
  const filterCourses = useCallback((
    courses: TeacherCourse[], 
    searchTerm: string, 
    statusFilter: string
  ) => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = statusFilter === 'all' || course.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });
  }, []);
  
  const sortCourses = useCallback((
    courses: TeacherCourse[], 
    sortBy: 'name' | 'date' | 'status' | 'students'
  ) => {
    return [...courses].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'students':
          return b.students - a.students;
        default:
          return 0;
      }
    });
  }, []);
  
  return {
    filterCourses,
    sortCourses,
  };
};

/**
 * Hook para estatísticas resumidas do professor
 */
export const useTeacherDashboardStats = () => {
  const { courses, isLoading } = useTeacherCourses();
  
  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.status === 'Published').length,
    draftCourses: courses.filter(c => c.status === 'Draft').length,
    totalStudents: courses.reduce((sum, course) => sum + (course.students || 0), 0),
    totalChallenges: courses.reduce((sum, course) => sum + (course.challenges || 0), 0),
    averageCompletionRate: courses.length > 0 
      ? Math.round(courses.reduce((sum, course) => sum + (course.completionRate || 0), 0) / courses.length)
      : 0,
  };
  
  return {
    stats,
    isLoading,
  };
};

/**
 * Hook para debugging de migração do teacher management
 */
export const useTeacherMigrationDebug = () => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_MANAGEMENT');
  const { courses } = useTeacherCourses();
  
  const debugInfo = {
    usingRedux: useRedux,
    hasCourses: courses.length > 0,
    courseCount: courses.length,
    publishedCount: courses.filter(c => c.status === 'Published').length,
    draftCount: courses.filter(c => c.status === 'Draft').length,
  };
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎓 Teacher Management Migration Debug:', debugInfo);
  }
  
  return debugInfo;
};