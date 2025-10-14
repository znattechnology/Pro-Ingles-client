/**
 * Custom Hooks - Main Learn Page Management
 * 
 * Hooks específicos para gerenciar a página principal de aprendizagem,
 * incluindo units, lesson progress, e dashboard stats.
 */

import { useCallback, useMemo, useEffect } from 'react';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useGetCourseUnitsWithProgressQuery,
  useGetStudentProgressQuery as useGetUserProgressQuery,
  studentPracticeApiSlice,
} from '@/src/domains/student/practice-courses/api/studentPracticeApiSlice';

// Debug: Verificar se a API está sendo importada corretamente
console.log('🔍 API Debug - studentPracticeApiSlice reducerPath:', studentPracticeApiSlice.reducerPath);
// import { useUserProgress } from './useUserProgress'; // Temporarily disabled to debug

// Legacy imports
import { getUnits, getCourseProgress, getLessonPercentage } from '@/db/django-queries';

// Types
export interface LearnPageData {
  userProgress: any | null;
  units: any[];
  courseProgress: any | null;
  lessonPercentage: number;
  activeCourse: any | null;
}

export interface LearnPageResult {
  data: LearnPageData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface LearnPageStats {
  hearts: number;
  points: number;
  streak: number;
  completedLessons: number;
  totalLessons: number;
  courseProgressPercentage: number;
}

/**
 * Hook principal para gerenciar dados da Main Learn Page
 */
export const useMainLearnPage = (): LearnPageResult => {
  const useRedux = useFeatureFlag('REDUX_MAIN_LEARN_PAGE');
  
  // Get user progress (sempre Redux se habilitado)
  const { 
    data: userProgress, 
    isLoading: userProgressLoading, 
    error: userProgressError, 
    refetch: refetchUserProgress 
  } = useGetUserProgressQuery();
  
  // Get course units if we have an active course
  const activeCourseId = userProgress?.active_course?.id;
  
  const { 
    data: unitsData, 
    isLoading: unitsLoading, 
    error: unitsError, 
    refetch: refetchUnits 
  } = useGetCourseUnitsWithProgressQuery(activeCourseId, {
    skip: !useRedux || !activeCourseId,
  });
  
  if (useRedux) {
    const isLoading = userProgressLoading || unitsLoading;
    const error = userProgressError || (unitsError ? 'Failed to load course units' : null);
    
    // Process units data
    const units = unitsData?.units || [];
    const course = unitsData?.course || userProgress?.active_course;
    
    const data: LearnPageData = {
      userProgress,
      units,
      courseProgress: null, // This would be calculated from units
      lessonPercentage: 0, // This would be calculated from lesson progress
      activeCourse: course,
    };
    
    return {
      data: isLoading ? null : data,
      isLoading,
      error,
      refetch: () => {
        refetchUserProgress();
        if (activeCourseId) {
          refetchUnits();
        }
      },
    };
  } else {
    // Legacy implementation fallback
    return {
      data: null,
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
};

/**
 * Hook para calcular estatísticas da página de aprendizagem
 */
export const useLearnPageStats = (data: LearnPageData | null): LearnPageStats => {
  const useRedux = useFeatureFlag('REDUX_MAIN_LEARN_PAGE');
  
  if (!data || !useRedux) {
    return {
      hearts: 5,
      points: 0,
      streak: 0,
      completedLessons: 0,
      totalLessons: 0,
      courseProgressPercentage: 0,
    };
  }
  
  const { userProgress, units } = data;
  
  // Safe calculation of lesson statistics
  const safeUnits = Array.isArray(units) ? units : [];
  
  const completedLessons = safeUnits.reduce((acc: number, unit: any) => {
    if (!unit?.lessons || !Array.isArray(unit.lessons)) return acc;
    return acc + unit.lessons.filter((lesson: any) => lesson?.completed === true).length;
  }, 0);
  
  const totalLessons = safeUnits.reduce((acc: number, unit: any) => {
    if (!unit?.lessons || !Array.isArray(unit.lessons)) return acc;
    return acc + unit.lessons.length;
  }, 0);
  
  const courseProgressPercentage = totalLessons > 0 ? 
    Math.round((completedLessons / totalLessons) * 100) : 0;
  
  return {
    hearts: userProgress?.hearts || 5,
    points: userProgress?.points || 0,
    streak: userProgress?.streak || 0,
    completedLessons,
    totalLessons,
    courseProgressPercentage,
  };
};

/**
 * Hook para gerenciar navegação da Main Learn Page
 */
export const useLearnPageNavigation = () => {
  const useRedux = useFeatureFlag('REDUX_MAIN_LEARN_PAGE');
  
  const navigateToActiveCourse = useCallback((router: any, userProgress: any) => {
    if (!userProgress) {
      console.warn('No user progress data, redirecting to courses');
      router.push("/user/laboratory/learn/courses");
      return false;
    }

    if (!userProgress.active_course) {
      console.warn('No active course, redirecting to courses');
      router.push("/user/laboratory/learn/courses");
      return false;
    }
    
    return true;
  }, []);
  
  const navigateToLesson = useCallback((router: any, lessonId: string) => {
    router.push(`/user/laboratory/learn/lesson/${lessonId}`);
  }, []);
  
  const navigateToShop = useCallback((router: any) => {
    router.push('/user/laboratory/learn/shop');
  }, []);
  
  const navigateToAchievements = useCallback((router: any) => {
    router.push('/user/laboratory/achievements');
  }, []);
  
  const navigateToLeaderboard = useCallback((router: any) => {
    router.push('/user/laboratory/leaderboard');
  }, []);
  
  return {
    navigateToActiveCourse,
    navigateToLesson,
    navigateToShop,
    navigateToAchievements,
    navigateToLeaderboard,
  };
};

/**
 * Hook para gerenciar ações rápidas da Main Learn Page
 */
export const useLearnPageActions = () => {
  const useRedux = useFeatureFlag('REDUX_MAIN_LEARN_PAGE');
  
  const buyHearts = useCallback(async () => {
    if (useRedux) {
      // This would integrate with the hearts refill mutation
      console.log('🛒 Redux: Buying hearts...');
      // Implementation would go here
    } else {
      console.log('🛒 Legacy: Buying hearts...');
    }
  }, [useRedux]);
  
  const viewAchievements = useCallback(() => {
    if (useRedux) {
      console.log('🏆 Redux: Viewing achievements...');
    } else {
      console.log('🏆 Legacy: Viewing achievements...');
    }
  }, [useRedux]);
  
  const viewLeaderboard = useCallback(() => {
    if (useRedux) {
      console.log('📊 Redux: Viewing leaderboard...');
    } else {
      console.log('📊 Legacy: Viewing leaderboard...');
    }
  }, [useRedux]);
  
  return {
    buyHearts,
    viewAchievements,
    viewLeaderboard,
  };
};

/**
 * Hook para debugging da migração da Main Learn Page
 */
export const useMainLearnPageMigrationDebug = () => {
  const useRedux = useFeatureFlag('REDUX_MAIN_LEARN_PAGE');
  const { data, isLoading, error } = useMainLearnPage();
  const stats = useLearnPageStats(data);
  
  const debugInfo = useMemo(() => ({
    usingRedux: useRedux,
    hasData: !!data,
    isLoading,
    error,
    activeCourse: data?.activeCourse?.title,
    unitsCount: data?.units?.length || 0,
    statsCalculated: {
      hearts: stats.hearts,
      points: stats.points,
      completedLessons: stats.completedLessons,
      totalLessons: stats.totalLessons,
      progressPercentage: stats.courseProgressPercentage,
    },
  }), [useRedux, data, isLoading, error, stats]);
  
  // Only log in development, with throttling
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timeoutId = setTimeout(() => {
        console.log('🏠 Main Learn Page Migration Debug:', debugInfo);
      }, 1000); // Throttle logs to once per second
      
      return () => clearTimeout(timeoutId);
    }
  }, [debugInfo.hasData, debugInfo.isLoading, debugInfo.error]); // Only log when important states change
  
  return debugInfo;
};

/**
 * Hook combinado para funcionalidade completa da Main Learn Page
 */
export const useFullMainLearnPage = () => {
  const pageResult = useMainLearnPage();
  const stats = useLearnPageStats(pageResult.data);
  const navigation = useLearnPageNavigation();
  const actions = useLearnPageActions();
  
  // Debug information
  useMainLearnPageMigrationDebug();
  
  return {
    // Main page data
    ...pageResult,
    
    // Calculated stats
    stats,
    
    // Navigation helpers
    navigation,
    
    // Quick actions
    actions,
  };
};