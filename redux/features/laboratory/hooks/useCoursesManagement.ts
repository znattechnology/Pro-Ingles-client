/**
 * Custom Hooks - Course Management
 * 
 * Hooks que facilitam a migração gradual e oferecem interface
 * unificada entre implementação legacy e Redux.
 */

import { useCallback } from 'react';
// Import from new separated APIs
import { 
  useGetAvailableCoursesQuery as useGetLaboratoryCoursesQuery, // Student laboratory courses
  useUpdateProgressMutation as useUpdateUserProgressMutation,
} from '@/src/domains/student/practice-courses/api/studentPracticeApiSlice';
// TODO: Teacher imports temporariamente comentados - focando na parte do estudante
// import {
//   useGetTeacherPracticeCoursesQuery as useGetPracticeCoursesQuery,
// } from '@/src/domains/teacher/practice-courses/api';
// import {
//   useCreateTeacherCourseMutation as useCreatePracticeCourseMutation,
//   useUpdatePracticeCourseMutation,
//   useDeleteTeacherCourseMutation as useDeletePracticeCourseMutation,
//   usePublishTeacherCourseMutation as useToggleCoursePublicationMutation,
// } from '@/src/domains/teacher/practice-courses/api';


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
  } = useGetLaboratoryCoursesQuery({ includeDrafts: true });
  
  return {
    courses: data,
    isLoading,
    error: error ? 'Failed to load courses' : null,
    refetch,
  };
};

/**
 * Hook para gerenciar cursos do laboratório (Teacher)
 * TODO: Temporariamente desabilitado - teacher hooks serão importados separadamente
 */
export const usePracticeCourses = (): CourseManagementResult => {
  // const { 
  //   data = [], 
  //   isLoading, 
  //   error, 
  //   refetch 
  // } = useGetPracticeCoursesQuery({ includeDrafts: true });
  
  return {
    courses: [],
    isLoading: false,
    error: null,
    refetch: () => {},
  };
};

/**
 * Hook para ações de curso (Teacher)
 * TODO: Temporariamente desabilitado - teacher hooks serão importados separadamente
 */
export const useCourseActions = (): CourseActionsResult => {
  // const [createCourse] = useCreatePracticeCourseMutation();
  // const [updateCourse] = useUpdatePracticeCourseMutation();
  // const [deleteCourse] = useDeletePracticeCourseMutation();
  // const [publishCourse] = useToggleCoursePublicationMutation();
  
  const createCourseAction = useCallback(async (data: any) => {
    // const result = await createCourse(data).unwrap();
    // return result;
    throw new Error('Teacher functionality temporarily disabled');
  }, []);
  
  const updateCourseAction = useCallback(async (id: string, data: any) => {
    // const result = await updateCourse({ id, data }).unwrap();
    // return result;
    throw new Error('Teacher functionality temporarily disabled');
  }, []);
  
  const deleteCourseAction = useCallback(async (id: string) => {
    // await deleteCourse(id).unwrap();
    throw new Error('Teacher functionality temporarily disabled');
  }, []);
  
  const publishCourseAction = useCallback(async (id: string, publish: boolean) => {
    // const result = await publishCourse({ courseId: id, publish }).unwrap();
    // return result;
    throw new Error('Teacher functionality temporarily disabled');
  }, []);
  
  return {
    createCourse: createCourseAction,
    updateCourse: updateCourseAction,
    deleteCourse: deleteCourseAction,
    publishCourse: publishCourseAction,
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