/**
 * Modern Main Learn Page Hook
 * 
 * Clean, simple hook that replaces the complex Redux useMainLearnPage system.
 * Provides all necessary data and actions for the main learning interface.
 */

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useGetStudentProgressQuery,
  useGetCourseUnitsWithProgressQuery,
  useGetStudentAnalyticsQuery,
  useGetStudyStreakQuery
} from '../api';

// Types
export interface MainLearnPageData {
  userProgress: any;
  course: any;
  units: any[];
  stats: {
    hearts: number;
    points: number;
    streak: number;
    completedLessons: number;
    totalLessons: number;
    completedUnits: number;
    totalUnits: number;
    courseProgressPercentage: number;
    accuracy: number;
    weeklyGoal: number;
    weeklyProgress: number;
  };
  currentLesson: any | null;
  nextLesson: any | null;
}

export interface MainLearnPageActions {
  refreshData: () => void;
  navigateToLesson: (lessonId: string) => void;
  navigateToCourseSelection: () => void;
  navigateToShop: () => void;
  navigateToAchievements: () => void;
  navigateToLeaderboard: () => void;
  navigateToDashboard: () => void;
}

/**
 * Main hook for the learning page that provides all necessary data and actions
 */
export const useMainLearnPage = () => {
  const router = useRouter();
  
  // API queries
  const { 
    data: userProgress, 
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress
  } = useGetStudentProgressQuery();

  const activeCourseId = userProgress?.active_course?.id;
  
  const { 
    data: unitsData, 
    isLoading: unitsLoading,
    error: unitsError,
    refetch: refetchUnits
  } = useGetCourseUnitsWithProgressQuery(activeCourseId || '', {
    skip: !activeCourseId
  });

  const { 
    data: analytics,
    refetch: refetchAnalytics
  } = useGetStudentAnalyticsQuery(undefined, {
    skip: !activeCourseId
  });

  const { 
    data: streakData,
    refetch: refetchStreak
  } = useGetStudyStreakQuery();

  // Combined loading and error states
  const isLoading = progressLoading || unitsLoading;
  const error = progressError || unitsError;

  // Process and structure the data
  const data: MainLearnPageData | null = useMemo(() => {
    if (!userProgress || !unitsData) {
      return null;
    }

    const units = unitsData.units || [];
    const course = unitsData.course || userProgress.active_course;

    // Calculate comprehensive stats
    const completedLessons = units.reduce((total: number, unit: any) => {
      return total + (unit.lessons || []).filter((lesson: any) => lesson.completed).length;
    }, 0);

    const totalLessons = units.reduce((total: number, unit: any) => {
      return total + (unit.lessons || []).length;
    }, 0);

    const completedUnits = units.filter((unit: any) => {
      const unitLessons = unit.lessons || [];
      return unitLessons.length > 0 && unitLessons.every((lesson: any) => lesson.completed);
    }).length;

    const totalUnits = units.length;
    
    const courseProgressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    // Find current and next lesson
    let currentLesson = null;
    let nextLesson = null;

    for (const unit of units) {
      const lessons = unit.lessons || [];
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        if (!lesson.completed && !lesson.locked) {
          if (!currentLesson) {
            currentLesson = { ...lesson, unitId: unit.id, unitTitle: unit.title };
          }
          if (currentLesson && lesson.id !== currentLesson.id && !nextLesson) {
            nextLesson = { ...lesson, unitId: unit.id, unitTitle: unit.title };
            break;
          }
        }
      }
      if (nextLesson) break;
    }

    const stats = {
      hearts: userProgress.hearts || 5,
      points: userProgress.points || 0,
      streak: streakData?.current_streak || userProgress.streak || 0,
      completedLessons,
      totalLessons,
      completedUnits,
      totalUnits,
      courseProgressPercentage,
      accuracy: analytics?.accuracy || 85, // Default to reasonable value
      weeklyGoal: analytics?.weekly_goal || 7,
      weeklyProgress: analytics?.weekly_progress || 0,
    };

    return {
      userProgress,
      course,
      units,
      stats,
      currentLesson,
      nextLesson,
    };
  }, [userProgress, unitsData, analytics, streakData]);

  // Navigation and action handlers
  const actions: MainLearnPageActions = useMemo(() => ({
    refreshData: () => {
      refetchProgress();
      refetchUnits();
      refetchAnalytics();
      refetchStreak();
    },
    
    navigateToLesson: (lessonId: string) => {
      router.push(`/user/laboratory/lesson/${lessonId}`);
    },
    
    navigateToCourseSelection: () => {
      router.push('/user/laboratory/learn/courses');
    },
    
    navigateToShop: () => {
      router.push('/user/laboratory/learn/shop');
    },
    
    navigateToAchievements: () => {
      router.push('/user/laboratory/achievements');
    },
    
    navigateToLeaderboard: () => {
      router.push('/user/laboratory/leaderboard');
    },
    
    navigateToDashboard: () => {
      router.push('/user/dashboard');
    },
  }), [router, refetchProgress, refetchUnits, refetchAnalytics, refetchStreak]);

  // Check if user needs to be redirected to course selection
  const shouldRedirectToSelection = useCallback(() => {
    return !isLoading && userProgress && !userProgress.active_course;
  }, [isLoading, userProgress]);

  return {
    data,
    isLoading,
    error,
    actions,
    shouldRedirectToSelection,
    
    // Individual pieces of data for convenience
    userProgress,
    course: data?.course,
    units: data?.units || [],
    stats: data?.stats,
    currentLesson: data?.currentLesson,
    nextLesson: data?.nextLesson,
  };
};

/**
 * Hook specifically for navigation logic on the main learn page
 */
export const useLearnPageNavigation = () => {
  const router = useRouter();

  const navigateToActiveCourse = useCallback((userProgress: any) => {
    if (!userProgress) {
      return false; // Should wait for loading
    }

    if (!userProgress.active_course) {
      // No active course, redirect to course selection
      router.push('/user/laboratory/learn/courses');
      return false; // Don't continue rendering
    }

    // Has active course, can continue
    return true;
  }, [router]);

  const navigateToLesson = useCallback((lessonId: string, unitId?: string) => {
    router.push(`/user/laboratory/lesson/${lessonId}`);
  }, [router]);

  const navigateBasedOnProgress = useCallback((learningPath: any) => {
    if (learningPath.currentLesson) {
      // Has a current lesson, navigate to it
      navigateToLesson(learningPath.currentLesson.id, learningPath.currentLesson.unitId);
    } else if (learningPath.unitsProgress.length === 0) {
      // No units available, course might be empty
      console.warn('Course has no units available');
    } else {
      // All lessons completed, stay on main page to show progress
      console.log('All lessons completed, showing course completion');
    }
  }, [navigateToLesson]);

  return {
    navigateToActiveCourse,
    navigateToLesson,
    navigateBasedOnProgress,
  };
};

/**
 * Hook for quick actions available on the main learn page
 */
export const useMainLearnPageQuickActions = () => {
  const router = useRouter();

  const quickActions = useMemo(() => ({
    practiceWeakSkills: () => {
      router.push('/user/laboratory/practice/weak-skills');
    },
    
    reviewMistakes: () => {
      router.push('/user/laboratory/practice/review');
    },
    
    takeAssessment: () => {
      router.push('/user/laboratory/assessment');
    },
    
    viewProgress: () => {
      router.push('/user/laboratory/progress');
    },
    
    changeCourse: () => {
      router.push('/user/laboratory/learn/courses');
    },
    
    getHelp: () => {
      router.push('/user/support');
    },
  }), [router]);

  return quickActions;
};

/**
 * Combined hook that provides all main learn page functionality
 */
export const useFullMainLearnPage = () => {
  const mainLearnPage = useMainLearnPage();
  const navigation = useLearnPageNavigation();
  const quickActions = useMainLearnPageQuickActions();

  return {
    ...mainLearnPage,
    navigation,
    quickActions,
  };
};