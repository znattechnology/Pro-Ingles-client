/**
 * Custom Hooks - Teacher Laboratory Dashboard
 * 
 * Hooks específicos para gerenciar o dashboard principal do professor,
 * incluindo estatísticas, navegação e ações rápidas.
 */

import { useCallback } from 'react';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useGetTeacherCoursesQuery,
  useGetPracticeAnalyticsQuery,
} from '../laboratoryApiSlice';
import { useTeacherDashboardStats } from './useTeacherCourses';

// Types
export interface TeacherDashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalChallenges: number;
  completionRate: number;
}

export interface TeacherDashboardData {
  stats: TeacherDashboardStats;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

export interface TeacherDashboardResult {
  data: TeacherDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface TeacherDashboardActions {
  navigateToCreateCourse: () => void;
  navigateToManageCourses: () => void;
  navigateToAnalytics: () => void;
  navigateToLessonConstructor: () => void;
  navigateToChallengeConstructor: () => void;
  navigateToCoursePractices: () => void;
  navigateToAchievements: () => void;
  navigateToLeaderboard: () => void;
  refreshDashboard: () => void;
}

/**
 * Hook principal para gerenciar dados do Teacher Dashboard
 */
export const useTeacherDashboard = (): TeacherDashboardResult => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_DASHBOARD');
  
  // Get teacher courses for stats calculation
  const { 
    data: coursesData, 
    isLoading: coursesLoading, 
    error: coursesError, 
    refetch: refetchCourses 
  } = useGetTeacherCoursesQuery({ includeDrafts: true }, {
    skip: !useRedux,
  });
  
  // Get dashboard stats (from existing hook)
  const { stats } = useTeacherDashboardStats();
  
  if (useRedux) {
    const isLoading = coursesLoading;
    const error = coursesError ? 'Failed to load dashboard data' : null;
    
    // Calculate enhanced stats from courses data
    const enhancedStats: TeacherDashboardStats = {
      totalCourses: coursesData?.length || stats.totalCourses,
      totalStudents: stats.totalStudents,
      totalChallenges: stats.totalChallenges,
      completionRate: stats.averageCompletionRate,
    };
    
    const data: TeacherDashboardData = {
      stats: enhancedStats,
      isLoading,
      error,
      lastUpdated: new Date().toISOString(),
    };
    
    return {
      data: isLoading ? null : data,
      isLoading,
      error,
      refetch: refetchCourses,
    };
  } else {
    // Legacy implementation with mock data
    const mockStats: TeacherDashboardStats = {
      totalCourses: 2,
      totalStudents: 77,
      totalChallenges: 270,
      completionRate: 73,
    };
    
    const data: TeacherDashboardData = {
      stats: mockStats,
      isLoading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    };
    
    return {
      data,
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
};

/**
 * Hook para ações de navegação do Teacher Dashboard
 */
export const useTeacherDashboardNavigation = (): TeacherDashboardActions => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_DASHBOARD');
  
  const navigateToCreateCourse = useCallback(() => {
    if (useRedux) {
      console.log('🚀 Redux: Navigating to create course...');
    } else {
      console.log('🚀 Legacy: Navigating to create course...');
    }
  }, [useRedux]);
  
  const navigateToManageCourses = useCallback(() => {
    if (useRedux) {
      console.log('📚 Redux: Navigating to manage courses...');
    } else {
      console.log('📚 Legacy: Navigating to manage courses...');
    }
  }, [useRedux]);
  
  const navigateToAnalytics = useCallback(() => {
    if (useRedux) {
      console.log('📊 Redux: Navigating to analytics...');
    } else {
      console.log('📊 Legacy: Navigating to analytics...');
    }
  }, [useRedux]);
  
  const navigateToLessonConstructor = useCallback(() => {
    if (useRedux) {
      console.log('📝 Redux: Navigating to lesson constructor...');
    } else {
      console.log('📝 Legacy: Navigating to lesson constructor...');
    }
  }, [useRedux]);
  
  const navigateToChallengeConstructor = useCallback(() => {
    if (useRedux) {
      console.log('🎯 Redux: Navigating to challenge constructor...');
    } else {
      console.log('🎯 Legacy: Navigating to challenge constructor...');
    }
  }, [useRedux]);
  
  const navigateToCoursePractices = useCallback(() => {
    if (useRedux) {
      console.log('🎙️ Redux: Navigating to course practices...');
    } else {
      console.log('🎙️ Legacy: Navigating to course practices...');
    }
  }, [useRedux]);
  
  const navigateToAchievements = useCallback(() => {
    if (useRedux) {
      console.log('🏆 Redux: Navigating to achievements...');
    } else {
      console.log('🏆 Legacy: Navigating to achievements...');
    }
  }, [useRedux]);
  
  const navigateToLeaderboard = useCallback(() => {
    if (useRedux) {
      console.log('📈 Redux: Navigating to leaderboard...');
    } else {
      console.log('📈 Legacy: Navigating to leaderboard...');
    }
  }, [useRedux]);
  
  const refreshDashboard = useCallback(() => {
    if (useRedux) {
      console.log('🔄 Redux: Refreshing dashboard data...');
    } else {
      console.log('🔄 Legacy: Refreshing dashboard data...');
    }
  }, [useRedux]);
  
  return {
    navigateToCreateCourse,
    navigateToManageCourses,
    navigateToAnalytics,
    navigateToLessonConstructor,
    navigateToChallengeConstructor,
    navigateToCoursePractices,
    navigateToAchievements,
    navigateToLeaderboard,
    refreshDashboard,
  };
};

/**
 * Hook para monitorar performance do dashboard
 */
export const useTeacherDashboardPerformance = () => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_DASHBOARD');
  const usePerformanceMonitoring = useFeatureFlag('PERFORMANCE_MONITORING');
  
  const trackNavigation = useCallback((destination: string, timestamp?: number) => {
    if (useRedux && usePerformanceMonitoring) {
      console.log('📊 Dashboard Navigation Tracked:', {
        destination,
        timestamp: timestamp || Date.now(),
        usingRedux: true,
      });
    }
  }, [useRedux, usePerformanceMonitoring]);
  
  const trackFeatureUsage = useCallback((feature: string, metadata?: any) => {
    if (useRedux && usePerformanceMonitoring) {
      console.log('📊 Feature Usage Tracked:', {
        feature,
        metadata,
        timestamp: Date.now(),
        usingRedux: true,
      });
    }
  }, [useRedux, usePerformanceMonitoring]);
  
  return {
    trackNavigation,
    trackFeatureUsage,
  };
};

/**
 * Hook para debugging da migração do Teacher Dashboard
 */
export const useTeacherDashboardMigrationDebug = () => {
  const useRedux = useFeatureFlag('REDUX_TEACHER_DASHBOARD');
  const { data, isLoading, error } = useTeacherDashboard();
  
  const debugInfo = {
    usingRedux: useRedux,
    hasData: !!data,
    isLoading,
    error,
    stats: data?.stats,
    lastUpdated: data?.lastUpdated,
  };
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎓 Teacher Dashboard Migration Debug:', debugInfo);
  }
  
  return debugInfo;
};

/**
 * Hook combinado para funcionalidade completa do Teacher Dashboard
 */
export const useFullTeacherDashboard = () => {
  const dashboardResult = useTeacherDashboard();
  const navigationActions = useTeacherDashboardNavigation();
  const performance = useTeacherDashboardPerformance();
  
  // Debug information
  useTeacherDashboardMigrationDebug();
  
  return {
    // Main dashboard data
    ...dashboardResult,
    
    // Navigation actions
    actions: navigationActions,
    
    // Performance tracking
    performance,
  };
};