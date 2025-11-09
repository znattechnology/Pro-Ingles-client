/**
 * Modern Unit Management Hooks
 * 
 * Clean hooks for managing course units, lessons progression, and learning paths.
 * Replaces complex Redux unit management with simple, focused hooks.
 */

import { useCallback, useMemo } from 'react';
import { 
  useGetStudentProgressQuery,
  useGetCourseUnitsWithProgressQuery,
  useGetLessonDetailQuery,
  useSelectActiveCourseMutation
} from '../api';

// Types
export interface LessonProgress {
  id: string;
  title: string;
  completed: boolean;
  locked: boolean;
  progress: number;
  order: number;
  estimated_time: number;
  difficulty_level: string;
}

export interface UnitProgress {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonProgress[];
  completedLessons: number;
  totalLessons: number;
  progress: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface LearningPath {
  currentUnit: UnitProgress | null;
  currentLesson: LessonProgress | null;
  nextLesson: LessonProgress | null;
  unitsProgress: UnitProgress[];
  overallProgress: {
    completedUnits: number;
    totalUnits: number;
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  };
}

/**
 * Hook for managing course units and learning progression
 */
export const useUnitManagement = (courseId: string | null) => {
  const { 
    data: unitsData, 
    isLoading: unitsLoading,
    error: unitsError,
    refetch: refetchUnits
  } = useGetCourseUnitsWithProgressQuery(courseId || '', {
    skip: !courseId
  });

  const { data: userProgress } = useGetStudentProgressQuery();

  // Transform raw units data into structured learning path
  const learningPath: LearningPath = useMemo(() => {
    if (!unitsData?.units) {
      return {
        currentUnit: null,
        currentLesson: null,
        nextLesson: null,
        unitsProgress: [],
        overallProgress: {
          completedUnits: 0,
          totalUnits: 0,
          completedLessons: 0,
          totalLessons: 0,
          percentage: 0,
        },
      };
    }

    // Process units with progress calculation
    const unitsProgress: UnitProgress[] = unitsData.units.map((unit: any) => {
      const lessons: LessonProgress[] = (unit.lessons || []).map((lesson: any, index: number) => ({
        id: lesson.id,
        title: lesson.title,
        completed: lesson.completed || false,
        locked: lesson.locked || false,
        progress: lesson.progress || 0,
        order: lesson.order || index + 1,
        estimated_time: lesson.estimated_time || 10,
        difficulty_level: lesson.difficulty_level || 'medium',
      }));

      const completedLessons = lessons.filter(l => l.completed).length;
      const totalLessons = lessons.length;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        id: unit.id,
        title: unit.title,
        description: unit.description,
        order: unit.order || 0,
        lessons: lessons.sort((a, b) => a.order - b.order),
        completedLessons,
        totalLessons,
        progress,
        isUnlocked: unit.unlocked !== false, // Default to unlocked unless explicitly locked
        isCompleted: completedLessons === totalLessons && totalLessons > 0,
      };
    });

    // Sort units by order
    unitsProgress.sort((a, b) => a.order - b.order);

    // Calculate overall progress
    const totalUnits = unitsProgress.length;
    const completedUnits = unitsProgress.filter(u => u.isCompleted).length;
    const totalLessons = unitsProgress.reduce((sum, unit) => sum + unit.totalLessons, 0);
    const completedLessons = unitsProgress.reduce((sum, unit) => sum + unit.completedLessons, 0);
    const overallPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Find current unit and lesson
    let currentUnit: UnitProgress | null = null;
    let currentLesson: LessonProgress | null = null;
    let nextLesson: LessonProgress | null = null;

    // Find first incomplete unit
    for (const unit of unitsProgress) {
      if (!unit.isCompleted && unit.isUnlocked) {
        currentUnit = unit;
        
        // Find first incomplete lesson in this unit
        const incompleteLesson = unit.lessons.find(lesson => !lesson.completed && !lesson.locked);
        if (incompleteLesson) {
          currentLesson = incompleteLesson;
          
          // Find next lesson after current
          const currentIndex = unit.lessons.findIndex(l => l.id === incompleteLesson.id);
          if (currentIndex < unit.lessons.length - 1) {
            nextLesson = unit.lessons[currentIndex + 1];
          } else {
            // Look in next unit
            const nextUnitIndex = unitsProgress.findIndex(u => u.id === unit.id) + 1;
            if (nextUnitIndex < unitsProgress.length) {
              const nextUnit = unitsProgress[nextUnitIndex];
              if (nextUnit.lessons.length > 0) {
                nextLesson = nextUnit.lessons[0];
              }
            }
          }
        }
        break;
      }
    }

    return {
      currentUnit,
      currentLesson,
      nextLesson,
      unitsProgress,
      overallProgress: {
        completedUnits,
        totalUnits,
        completedLessons,
        totalLessons,
        percentage: overallPercentage,
      },
    };
  }, [unitsData]);

  return {
    learningPath,
    course: unitsData?.course,
    isLoading: unitsLoading,
    error: unitsError,
    refetch: refetchUnits,
  };
};

/**
 * Hook for lesson navigation within units
 */
export const useLessonNavigation = (courseId: string | null) => {
  const { learningPath } = useUnitManagement(courseId);

  // Navigate to next lesson
  const goToNextLesson = useCallback(() => {
    if (learningPath.nextLesson) {
      return {
        lessonId: learningPath.nextLesson.id,
        unitId: learningPath.currentUnit?.id,
      };
    }
    return null;
  }, [learningPath]);

  // Check if can navigate to specific lesson
  const canNavigateToLesson = useCallback((lessonId: string) => {
    // Find the lesson across all units
    for (const unit of learningPath.unitsProgress) {
      const lesson = unit.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return !lesson.locked;
      }
    }
    return false;
  }, [learningPath]);

  // Get lesson details by ID
  const getLessonById = useCallback((lessonId: string) => {
    for (const unit of learningPath.unitsProgress) {
      const lesson = unit.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return { lesson, unit };
      }
    }
    return null;
  }, [learningPath]);

  // Get previous lesson
  const getPreviousLesson = useCallback((currentLessonId: string) => {
    for (const unit of learningPath.unitsProgress) {
      const lessonIndex = unit.lessons.findIndex(l => l.id === currentLessonId);
      if (lessonIndex > 0) {
        return {
          lesson: unit.lessons[lessonIndex - 1],
          unit,
        };
      } else if (lessonIndex === 0) {
        // Look in previous unit
        const unitIndex = learningPath.unitsProgress.findIndex(u => u.id === unit.id);
        if (unitIndex > 0) {
          const prevUnit = learningPath.unitsProgress[unitIndex - 1];
          if (prevUnit.lessons.length > 0) {
            return {
              lesson: prevUnit.lessons[prevUnit.lessons.length - 1],
              unit: prevUnit,
            };
          }
        }
      }
    }
    return null;
  }, [learningPath]);

  return {
    currentLesson: learningPath.currentLesson,
    nextLesson: learningPath.nextLesson,
    goToNextLesson,
    canNavigateToLesson,
    getLessonById,
    getPreviousLesson,
  };
};

/**
 * Hook for course selection and activation
 */
export const useCourseSelection = () => {
  const { data: userProgress, refetch } = useGetStudentProgressQuery();
  const [selectActiveCourse] = useSelectActiveCourseMutation();

  const activateCourse = useCallback(async (courseId: string) => {
    try {
      await selectActiveCourse(courseId).unwrap();
      await refetch();
      return { success: true };
    } catch (error) {
      console.error('Failed to activate course:', error);
      throw error;
    }
  }, [selectActiveCourse, refetch]);

  return {
    activeCourse: userProgress?.active_course,
    activateCourse,
    userProgress,
  };
};

/**
 * Hook for unit unlock logic and progression
 */
export const useUnitProgression = (courseId: string | null) => {
  const { learningPath } = useUnitManagement(courseId);

  // Check if unit should be unlocked based on previous unit completion
  const isUnitUnlocked = useCallback((unitId: string) => {
    const units = learningPath.unitsProgress;
    const unitIndex = units.findIndex(u => u.id === unitId);
    
    if (unitIndex === 0) {
      // First unit is always unlocked
      return true;
    }
    
    if (unitIndex > 0) {
      // Unit is unlocked if previous unit is completed
      const previousUnit = units[unitIndex - 1];
      return previousUnit.isCompleted;
    }
    
    return false;
  }, [learningPath]);

  // Get next unit to unlock
  const getNextUnitToUnlock = useCallback(() => {
    const units = learningPath.unitsProgress;
    return units.find(unit => !unit.isUnlocked && isUnitUnlocked(unit.id));
  }, [learningPath, isUnitUnlocked]);

  // Calculate learning streak (consecutive days with completed lessons)
  const getLearningStreak = useCallback(() => {
    // This would be implemented based on completion timestamps
    // For now, return a placeholder
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null,
    };
  }, []);

  return {
    isUnitUnlocked,
    getNextUnitToUnlock,
    getLearningStreak,
    overallProgress: learningPath.overallProgress,
  };
};

/**
 * Combined hook for complete unit management functionality
 */
export const useCompleteUnitManagement = (courseId: string | null) => {
  const unitManagement = useUnitManagement(courseId);
  const navigation = useLessonNavigation(courseId);
  const courseSelection = useCourseSelection();
  const progression = useUnitProgression(courseId);

  return {
    ...unitManagement,
    ...navigation,
    ...courseSelection,
    ...progression,
  };
};