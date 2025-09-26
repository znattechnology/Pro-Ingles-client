/**
 * Teacher Course Management Hooks
 * 
 * Hooks para gerenciar cursos do professor, incluindo criação,
 * edição, publicação e analytics.
 */

import { useCallback } from 'react';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useGetTeacherCoursesQuery,
  useCreateCourseTeacherMutation,
  useUpdateCourseTeacherMutation,
  useDeleteCourseTeacherMutation,
  usePublishCourseTeacherMutation,
  useGetCourseAnalyticsQuery,
} from '../laboratoryApiSlice';

// Import Redux hooks from teacher module
import { 
  useGetPracticeCoursesQuery, 
  useCreatePracticeCourseMutation, 
  useUpdatePracticeCourseMutation 
} from '@modules/teacher';

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
  const useRedux = useFeatureFlag('REDUX_TEACHER_MANAGEMENT');
  
  if (useRedux) {
    const { 
      data, 
      isLoading, 
      error, 
      refetch 
    } = useGetTeacherCoursesQuery({ includeDrafts: true });
    
    // Debug log para confirmar uso do Redux
    if (process.env.NODE_ENV === 'development' && data) {
      console.log('🚀 REDUX CONFIRMED - useTeacherCourses returning data from Redux:', {
        source: 'Redux RTK Query',
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
      description: course.description,
      category: course.category,
      level: course.level as 'Beginner' | 'Intermediate' | 'Advanced',
      status: course.status as 'Draft' | 'Published' | 'Archived',
      units: course.totalUnits || 0,
      lessons: course.total_lessons || 0,
      challenges: course.total_challenges || 0,
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
  } else {
    console.log('⚠️ LEGACY MODE - useTeacherCourses using legacy implementation');
    // Legacy implementation seria implementada aqui
    // com useState e useEffect para consistência
    return {
      courses: [],
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
};

/**
 * Hook para ações de gerenciamento de cursos
 */
export const useTeacherCourseActions = (): TeacherCourseActions => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_MANAGEMENT');
  
  // Redux mutations
  const [createCourseRedux] = useCreateCourseTeacherMutation();
  const [updateCourseRedux] = useUpdateCourseTeacherMutation();
  const [deleteCourseRedux] = useDeleteCourseTeacherMutation();
  const [publishCourseRedux] = usePublishCourseTeacherMutation();
  
  // Practice API mutations for legacy fallback
  const [createPractice] = useCreatePracticeCourseMutation();
  const [updatePractice] = useUpdatePracticeCourseMutation();
  
  const createCourse = useCallback(async (data: CourseCreationData) => {
    if (useRedux) {
      const result = await createCourseRedux(data).unwrap();
      return result;
    } else {
      // Legacy implementation using practice API
      const result = await createPractice(data).unwrap();
      return result;
    }
  }, [useRedux, createCourseRedux, createPractice]);
  
  const updateCourse = useCallback(async (id: string, data: CourseUpdateData) => {
    if (useRedux) {
      const result = await updateCourseRedux({ id, data }).unwrap();
      return result;
    } else {
      // Legacy implementation using practice API
      const result = await updatePractice({ courseId: id, data }).unwrap();
      return result;
    }
  }, [useRedux, updateCourseRedux, updatePractice]);
  
  const deleteCourse = useCallback(async (id: string) => {
    if (useRedux) {
      await deleteCourseRedux(id).unwrap();
    } else {
      // Legacy implementation
      throw new Error('Legacy delete not implemented');
    }
  }, [useRedux, deleteCourseRedux]);
  
  const publishCourse = useCallback(async (id: string, publish: boolean) => {
    if (useRedux) {
      const result = await publishCourseRedux({ courseId: id, publish }).unwrap();
      return result;
    } else {
      // Legacy implementation using practice API
      const result = await updatePractice({ 
        courseId: id, 
        data: { status: publish ? 'Published' : 'Draft' } 
      }).unwrap();
      return result;
    }
  }, [useRedux, publishCourseRedux, updatePractice]);
  
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
  const useRedux = useFeatureFlag('REDUX_TEACHER_MANAGEMENT');
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetCourseAnalyticsQuery(courseId!, {
    skip: !courseId || !useRedux
  });
  
  if (!useRedux) {
    return {
      analytics: null,
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
  
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