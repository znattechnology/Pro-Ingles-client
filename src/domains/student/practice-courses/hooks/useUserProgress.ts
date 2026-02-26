/**
 * Modern User Progress Hook
 * 
 * Clean, focused hook for user progress data that replaces the complex Redux system.
 * Provides comprehensive user progress information including points, hearts, level, and course data.
 */

import { useMemo } from 'react';
import { 
  useGetStudentProgressQuery,
  useGetStudentAnalyticsQuery,
  useGetStudyStreakQuery
} from '../api';

// Types
export interface UserLevel {
  level: string;
  levelNumber: number;
  color: string;
  icon: string;
  progress: number;
  nextLevelPoints: number;
  pointsInCurrentLevel: number;
}

export interface UserProgressData {
  userProgress: any | null;
  activeCourse: any | null;
  hearts: number;
  maxHearts: number;
  points: number;
  streak: number;
  level: UserLevel;
  accuracy: number;
  weeklyGoal: number;
  weeklyProgress: number;
  hasActiveSubscription: boolean;
  isLowOnHearts: boolean;
}

/**
 * Hook for comprehensive user progress data
 */
export const useUserProgress = (): UserProgressData & { isLoading: boolean; error: any } => {
  const { 
    data: userProgress, 
    isLoading: progressLoading,
    error: progressError
  } = useGetStudentProgressQuery();

  const { 
    data: analytics,
    isLoading: analyticsLoading
  } = useGetStudentAnalyticsQuery(undefined, {
    skip: !userProgress
  });

  const { 
    data: streakData,
    isLoading: streakLoading
  } = useGetStudyStreakQuery();

  const isLoading = progressLoading || analyticsLoading || streakLoading;
  const error = progressError;

  // Calculate user level based on points
  const level: UserLevel = useMemo(() => {
    const points = userProgress?.points || 0;
    
    // Level thresholds
    const levels = [
      { min: 0, max: 1999, name: "Beginner", color: "from-gray-500 to-gray-600", icon: "Sparkles" },
      { min: 2000, max: 4999, name: "Advanced", color: "from-green-500 to-green-600", icon: "TrendingUp" },
      { min: 5000, max: 9999, name: "Expert", color: "from-blue-500 to-blue-600", icon: "Star" },
      { min: 10000, max: Infinity, name: "Master", color: "from-purple-500 to-purple-600", icon: "Crown" },
    ];
    
    const currentLevel = levels.find(l => points >= l.min && points <= l.max) || levels[0];
    const levelIndex = levels.indexOf(currentLevel);
    const levelNumber = levelIndex + 1;
    
    // Calculate progress within current level
    const pointsInCurrentLevel = points - currentLevel.min;
    const pointsNeededForLevel = currentLevel.max === Infinity 
      ? 5000 // For master level, use arbitrary large number
      : currentLevel.max - currentLevel.min + 1;
    
    const progress = Math.min(
      Math.round((pointsInCurrentLevel / pointsNeededForLevel) * 100),
      100
    );
    
    const nextLevelPoints = currentLevel.max === Infinity 
      ? 0 
      : currentLevel.max + 1 - points;

    return {
      level: currentLevel.name,
      levelNumber,
      color: currentLevel.color,
      icon: currentLevel.icon,
      progress,
      nextLevelPoints,
      pointsInCurrentLevel,
    };
  }, [userProgress?.points]);

  // Extract data with fallbacks
  const hearts = userProgress?.hearts || 5;
  const maxHearts = 5;
  const points = userProgress?.points || 0;
  const streak = streakData?.current_streak || userProgress?.streak || 0;
  const accuracy = analytics?.accuracy || 85;
  const weeklyGoal = analytics?.weekly_goal || 7;
  const weeklyProgress = analytics?.weekly_progress || 0;
  const hasActiveSubscription = userProgress?.has_active_subscription || false;
  const isLowOnHearts = hearts <= 2;

  return {
    userProgress,
    activeCourse: userProgress?.active_course || null,
    hearts,
    maxHearts,
    points,
    streak,
    level,
    accuracy,
    weeklyGoal,
    weeklyProgress,
    hasActiveSubscription,
    isLowOnHearts,
    isLoading,
    error,
  };
};

/**
 * Hook specifically for points and level system
 */
export const usePointsSystem = () => {
  const { points, level, isLoading } = useUserProgress();
  
  return {
    currentPoints: points,
    levelInfo: level,
    isLoading,
  };
};

/**
 * Hook specifically for hearts system
 */
export const useHeartsSystem = () => {
  const { hearts, maxHearts, isLowOnHearts, hasActiveSubscription, isLoading } = useUserProgress();
  
  const heartsPercentage = Math.round((hearts / maxHearts) * 100);
  
  return {
    heartsCount: hearts,
    maxHearts,
    heartsPercentage,
    isLowOnHearts,
    hasUnlimitedHearts: hasActiveSubscription,
    isLoading,
  };
};

/**
 * Hook specifically for active course information
 */
export const useActiveCourse = () => {
  const { activeCourse, isLoading, error } = useUserProgress();
  
  return {
    activeCourse,
    hasActiveCourse: !!activeCourse,
    isLoading,
    error,
  };
};

/**
 * Hook for user statistics and achievements
 */
export const useUserStats = () => {
  const { accuracy, streak, weeklyGoal, weeklyProgress, level, isLoading } = useUserProgress();
  
  return {
    accuracy,
    streak,
    weeklyGoal,
    weeklyProgress,
    level,
    isLoading,
  };
};