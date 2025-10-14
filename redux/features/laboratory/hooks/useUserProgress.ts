/**
 * Custom Hooks - User Progress Management
 * 
 * Hooks para gerenciar progresso do usuário, incluindo hearts,
 * points, active course, e achievement tracking.
 */

import { useCallback } from 'react';
import { 
  useGetStudentProgressQuery,
  useSelectActiveCourseMutation,
  useUseHeartMutation,
  useRefillHeartsMutation,
} from '@/src/domains/student/practice-courses/api/studentPracticeApiSlice';

// Types
export interface UserProgressState {
  hearts: number;
  points: number;
  user_image_src: string;
  active_course: any | null;
  streak?: number;
}

export interface UserProgressResult {
  userProgress: UserProgressState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UserProgressActions {
  updateActiveCourse: (courseId: string) => Promise<void>;
  reduceHearts: () => Promise<any>;
  refillHearts: () => Promise<any>;
  addPoints: (points: number) => void;
}

/**
 * Hook principal para gerenciar progresso do usuário
 */
export const useUserProgress = (): UserProgressResult => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetStudentProgressQuery();
  
  return {
    userProgress: data || null,
    isLoading,
    error: error ? 'Failed to load user progress' : null,
    refetch,
  };
};

/**
 * Hook para ações de progresso do usuário
 */
export const useUserProgressActions = (): UserProgressActions => {
  // Redux mutations using new domain APIs
  const [updateProgress] = useSelectActiveCourseMutation();
  const [reduceHeartsRedux] = useUseHeartMutation();
  const [refillHeartsRedux] = useRefillHeartsMutation();
  
  const updateActiveCourse = useCallback(async (courseId: string) => {
    await updateProgress({ courseId }).unwrap();
  }, [updateProgress]);
  
  const reduceHearts = useCallback(async () => {
    const result = await reduceHeartsRedux({ amount: 1 }).unwrap();
    return result;
  }, [reduceHeartsRedux]);
  
  const refillHearts = useCallback(async () => {
    const result = await refillHeartsRedux().unwrap();
    return result;
  }, [refillHeartsRedux]);
  
  const addPoints = useCallback((points: number) => {
    // This would trigger an optimistic update in the real implementation
    console.log('Adding points:', points);
  }, []);
  
  return {
    updateActiveCourse,
    reduceHearts,
    refillHearts,
    addPoints,
  };
};

/**
 * Hook para gerenciar hearts especificamente
 */
export const useHeartsSystem = () => {
  const { userProgress } = useUserProgress();
  const { reduceHearts, refillHearts } = useUserProgressActions();
  
  const canContinue = userProgress ? userProgress.hearts > 0 : true;
  const heartsCount = userProgress?.hearts || 5;
  const isLowOnHearts = heartsCount <= 1;
  
  const useHeart = useCallback(async () => {
    if (canContinue) {
      await reduceHearts();
    } else {
      throw new Error('No hearts remaining');
    }
  }, [canContinue, reduceHearts]);
  
  const buyHearts = useCallback(async () => {
    await refillHearts();
  }, [refillHearts]);
  
  return {
    heartsCount,
    canContinue,
    isLowOnHearts,
    useHeart,
    buyHearts,
  };
};

/**
 * Hook para gerenciar points e rewards
 */
export const usePointsSystem = () => {
  const { userProgress } = useUserProgress();
  const { addPoints } = useUserProgressActions();
  
  const currentPoints = userProgress?.points || 0;
  
  const awardPoints = useCallback((amount: number, reason?: string) => {
    addPoints(amount);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🏆 Awarded ${amount} points${reason ? ` for ${reason}` : ''}`);
    }
  }, [addPoints]);
  
  // Calculate user level based on points
  const calculateLevel = useCallback((points: number): { level: number; progress: number; nextLevelPoints: number } => {
    const pointsPerLevel = 1000;
    const level = Math.floor(points / pointsPerLevel) + 1;
    const currentLevelPoints = points % pointsPerLevel;
    const progress = (currentLevelPoints / pointsPerLevel) * 100;
    const nextLevelPoints = pointsPerLevel - currentLevelPoints;
    
    return { level, progress, nextLevelPoints };
  }, []);
  
  const levelInfo = calculateLevel(currentPoints);
  
  return {
    currentPoints,
    levelInfo,
    awardPoints,
  };
};

/**
 * Hook para streak tracking
 */
export const useStreakSystem = () => {
  const { userProgress } = useUserProgress();
  
  const currentStreak = userProgress?.streak || 0;
  
  const getStreakBonus = useCallback((streak: number): number => {
    if (streak >= 30) return 50; // 1 month
    if (streak >= 14) return 25; // 2 weeks
    if (streak >= 7) return 15;  // 1 week
    if (streak >= 3) return 10;  // 3 days
    return 0;
  }, []);
  
  const streakBonus = getStreakBonus(currentStreak);
  const nextStreakMilestone = currentStreak < 3 ? 3 : currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : 30;
  
  return {
    currentStreak,
    streakBonus,
    nextStreakMilestone,
    daysUntilNextMilestone: nextStreakMilestone - currentStreak,
  };
};

/**
 * Hook para gerenciar active course
 */
export const useActiveCourse = () => {
  const { userProgress } = useUserProgress();
  const { updateActiveCourse } = useUserProgressActions();
  
  const activeCourse = userProgress?.active_course;
  const hasActiveCourse = !!activeCourse;
  
  const setActiveCourse = useCallback(async (courseId: string) => {
    await updateActiveCourse(courseId);
  }, [updateActiveCourse]);
  
  const clearActiveCourse = useCallback(async () => {
    // This would be implemented as setting active course to null
    console.log('Clear active course functionality would be implemented here');
  }, []);
  
  return {
    activeCourse,
    hasActiveCourse,
    setActiveCourse,
    clearActiveCourse,
  };
};

/**
 * Hook combinado para funcionalidade completa de progresso
 */
export const useFullUserProgressManagement = () => {
  const progressResult = useUserProgress();
  const actionsResult = useUserProgressActions();
  const heartsResult = useHeartsSystem();
  const pointsResult = usePointsSystem();
  const streakResult = useStreakSystem();
  const courseResult = useActiveCourse();
  
  return {
    // Basic progress
    ...progressResult,
    
    // Actions
    ...actionsResult,
    
    // Hearts system
    hearts: heartsResult,
    
    // Points system
    points: pointsResult,
    
    // Streak system
    streak: streakResult,
    
    // Active course
    course: courseResult,
  };
};

/**
 * Hook para debugging do user progress
 */
export const useProgressMigrationDebug = () => {
  const { userProgress } = useUserProgress();
  
  const debugInfo = {
    usingRedux: true,
    hasProgress: !!userProgress,
    hearts: userProgress?.hearts,
    points: userProgress?.points,
    activeCourse: userProgress?.active_course?.id,
  };
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 User Progress Debug:', debugInfo);
  }
  
  return debugInfo;
};