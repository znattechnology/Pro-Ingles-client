/**
 * Custom Hooks - Course Management
 * 
 * Hooks que facilitam a migração gradual e oferecem interface
 * unificada entre implementação legacy e Redux.
 */

import { useCallback } from 'react';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useGetLaboratoryCoursesQuery,
  useGetPracticeCoursesQuery,
  useUpdateUserProgressMutation,
  useCreatePracticeCourseMutation,
  useUpdatePracticeCourseMutation,
  useDeletePracticeCourseMutation,
  useToggleCoursePublicationMutation,
} from '../laboratoryApiSlice';

// Legacy imports (direct API calls)
import { getLaboratoryCourses, getPracticeCourses } from '@/db/django-queries';
import { 
  createPracticeCourse,
  updatePracticeCourse,
  deletePracticeCourse,
  publishPracticeCourse,
} from '@/actions/practice-management';
import { upsertUserProgress } from '@/actions/user-progress';

// Types
export interface CourseManagementResult {
  courses: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface CourseActionsResult {
  createCourse: (data: any) => Promise<any>;
  updateCourse: (id: string, data: any) => Promise<any>;
  deleteCourse: (id: string) => Promise<void>;
  publishCourse: (id: string, publish: boolean) => Promise<any>;
  selectCourse?: (id: string) => Promise<void>; // Only for student
}

/**
 * Hook para gerenciar cursos do laboratório (Student)
 * Escolhe automaticamente entre Redux e API legacy baseado em feature flag
 */
export const useLaboratoryCourses = (): CourseManagementResult => {
  const useRedux = useFeatureFlag('REDUX_COURSE_SELECTION');
  
  if (useRedux) {
    const { 
      data = [], 
      isLoading, 
      error, 
      refetch 
    } = useGetLaboratoryCoursesQuery();
    
    return {
      courses: data,
      isLoading,
      error: error ? 'Failed to load courses' : null,
      refetch,
    };
  } else {
    // Legacy implementation com useState e useEffect seria aqui
    // Para simplicidade, retornando estrutura similar
    return {
      courses: [],
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
};

/**
 * Hook para gerenciar cursos do laboratório (Teacher)
 */
export const usePracticeCourses = (): CourseManagementResult => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_MANAGEMENT');
  
  if (useRedux) {
    const { 
      data = [], 
      isLoading, 
      error, 
      refetch 
    } = useGetPracticeCoursesQuery({ includeDrafts: true });
    
    return {
      courses: data,
      isLoading,
      error: error ? 'Failed to load practice courses' : null,
      refetch,
    };
  } else {
    // Legacy implementation
    return {
      courses: [],
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
};

/**
 * Hook para ações de curso (Teacher)
 */
export const useCourseActions = (): CourseActionsResult => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_MANAGEMENT');
  
  // Redux mutations
  const [createCourseRedux] = useCreatePracticeCourseMutation();
  const [updateCourseRedux] = useUpdatePracticeCourseMutation();
  const [deleteCourseRedux] = useDeletePracticeCourseMutation();
  const [publishCourseRedux] = useToggleCoursePublicationMutation();
  
  const createCourse = useCallback(async (data: any) => {
    if (useRedux) {
      const result = await createCourseRedux(data).unwrap();
      return result;
    } else {
      return await createPracticeCourse(data);
    }
  }, [useRedux, createCourseRedux]);
  
  const updateCourse = useCallback(async (id: string, data: any) => {
    if (useRedux) {
      const result = await updateCourseRedux({ id, data }).unwrap();
      return result;
    } else {
      return await updatePracticeCourse(id, data);
    }
  }, [useRedux, updateCourseRedux]);
  
  const deleteCourse = useCallback(async (id: string) => {
    if (useRedux) {
      await deleteCourseRedux(id).unwrap();
    } else {
      await deletePracticeCourse(id);
    }
  }, [useRedux, deleteCourseRedux]);
  
  const publishCourse = useCallback(async (id: string, publish: boolean) => {
    if (useRedux) {
      const result = await publishCourseRedux({ courseId: id, publish }).unwrap();
      return result;
    } else {
      return await publishPracticeCourse(id, publish);
    }
  }, [useRedux, publishCourseRedux]);
  
  return {
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
  };
};

/**
 * Hook para seleção de curso (Student)
 */
export const useCourseSelection = () => {
  const useRedux = useFeatureFlag('REDUX_COURSE_SELECTION');
  const [updateProgress] = useUpdateUserProgressMutation();
  
  const selectCourse = useCallback(async (courseId: string) => {
    if (useRedux) {
      await updateProgress({ courseId }).unwrap();
    } else {
      await upsertUserProgress(courseId);
    }
  }, [useRedux, updateProgress]);
  
  return {
    selectCourse,
  };
};

/**
 * Hook combinado para gerenciamento completo de cursos
 */
export const useFullCourseManagement = (userRole: 'student' | 'teacher') => {
  const coursesResult = userRole === 'student' 
    ? useLaboratoryCourses()
    : usePracticeCourses();
    
  const courseActions = userRole === 'teacher' 
    ? useCourseActions()
    : {};
    
  const courseSelection = userRole === 'student' 
    ? useCourseSelection()
    : {};
  
  return {
    ...coursesResult,
    ...courseActions,
    ...courseSelection,
  };
};

/**
 * Hook para debugging e monitoramento da migração
 */
export const useCourseMigrationDebug = () => {
  const flags = {
    courseSelection: useFeatureFlag('REDUX_COURSE_SELECTION'),
    teacherManagement: useFeatureFlag('REDUX_TEACHER_MANAGEMENT'),
    userProgress: useFeatureFlag('REDUX_USER_PROGRESS'),
  };
  
  const status = {
    totalFlags: Object.keys(flags).length,
    activeFlags: Object.values(flags).filter(Boolean).length,
    migrationProgress: (Object.values(flags).filter(Boolean).length / Object.keys(flags).length) * 100,
  };
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Course Migration Debug:', { flags, status });
  }
  
  return { flags, status };
};