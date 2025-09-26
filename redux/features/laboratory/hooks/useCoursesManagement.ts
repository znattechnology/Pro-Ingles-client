/**
 * Custom Hooks - Course Management
 * 
 * Hooks que facilitam a migração gradual e oferecem interface
 * unificada entre implementação legacy e Redux.
 */

import { useCallback } from 'react';
import { 
  useGetLaboratoryCoursesQuery,
  useGetPracticeCoursesQuery,
  useUpdateUserProgressMutation,
  useCreatePracticeCourseMutation,
  useUpdatePracticeCourseMutation,
  useDeletePracticeCourseMutation,
  useToggleCoursePublicationMutation,
} from '../laboratoryApiSlice';

// Import practice management hooks
import {
  useCreatePracticeCourseMutation as useCreatePracticeCoursePracticeModule,
  useUpdatePracticeCourseMutation as useUpdatePracticeCoursePracticeModule,
  useDeletePracticeCourseMutation as useDeletePracticeCoursePracticeModule,
  usePublishPracticeCourseMutation
} from '@modules/teacher';

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
 * Usa Redux para gerenciamento de estado
 */
export const useLaboratoryCourses = (): CourseManagementResult => {
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
  
  // Practice module hooks for legacy fallback
  const [createPractice] = useCreatePracticeCoursePracticeModule();
  const [updatePractice] = useUpdatePracticeCoursePracticeModule();
  const [deletePractice] = useDeletePracticeCoursePracticeModule();
  const [publishPractice] = usePublishPracticeCourseMutation();
  
  const createCourse = useCallback(async (data: any) => {
    if (useRedux) {
      const result = await createCourseRedux(data).unwrap();
      return result;
    } else {
      const result = await createPractice(data).unwrap();
      return result;
    }
  }, [useRedux, createCourseRedux, createPractice]);
  
  const updateCourse = useCallback(async (id: string, data: any) => {
    if (useRedux) {
      const result = await updateCourseRedux({ id, data }).unwrap();
      return result;
    } else {
      const result = await updatePractice({ courseId: id, data }).unwrap();
      return result;
    }
  }, [useRedux, updateCourseRedux, updatePractice]);
  
  const deleteCourse = useCallback(async (id: string) => {
    if (useRedux) {
      await deleteCourseRedux(id).unwrap();
    } else {
      await deletePractice(id).unwrap();
    }
  }, [useRedux, deleteCourseRedux, deletePractice]);
  
  const publishCourse = useCallback(async (id: string, publish: boolean) => {
    if (useRedux) {
      const result = await publishCourseRedux({ courseId: id, publish }).unwrap();
      return result;
    } else {
      const result = await publishPractice({ courseId: id, publish }).unwrap();
      return result;
    }
  }, [useRedux, publishCourseRedux, publishPractice]);
  
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
  const [updateProgress] = useUpdateUserProgressMutation();
  
  const selectCourse = useCallback(async (courseId: string) => {
    await updateProgress({ courseId }).unwrap();
  }, [updateProgress]);
  
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
 * Hook para debugging e monitoramento
 */
export const useCourseMigrationDebug = () => {
  const flags = {
    courseSelection: true,
    teacherManagement: true,
    userProgress: true,
  };
  
  const status = {
    totalFlags: Object.keys(flags).length,
    activeFlags: Object.values(flags).filter(Boolean).length,
    migrationProgress: 100,
  };
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Course Debug:', { flags, status });
  }
  
  return { flags, status };
};