/**
 * Custom Hooks - Unit Management
 * 
 * Hooks para gerenciar units e lessons, incluindo progress tracking,
 * lesson navigation e unlock logic.
 */

import { useCallback, useMemo } from 'react';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useGetCourseUnitsWithProgressQuery,
} from '../laboratoryApiSlice';

// Types
export interface Lesson {
  id: string;
  order: number;
  title: string;
  completed?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons?: Lesson[];
}

export interface ActiveLesson extends Lesson {
  unit: Unit;
}

export interface UnitProgress {
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface LessonProgress {
  isLocked: boolean;
  isCurrent: boolean;
  isCompleted: boolean;
  progressPercentage: number;
}

export interface UnitManagementResult {
  units: Unit[];
  activeLesson: ActiveLesson | null;
  isLoading: boolean;
  error: string | null;
  getUnitProgress: (unitId: string) => UnitProgress;
  getLessonProgress: (lessonId: string, unitId: string) => LessonProgress;
  navigateToLesson: (lessonId: string) => void;
}

/**
 * Hook para gerenciar units de um curso
 */
export const useUnitManagement = (courseId: string | null): UnitManagementResult => {
  const useRedux = useFeatureFlag('REDUX_UNIT_MANAGEMENT');
  
  const { 
    data: unitsData, 
    isLoading, 
    error, 
  } = useGetCourseUnitsWithProgressQuery(courseId, {
    skip: !useRedux || !courseId,
  });
  
  // Calculate unit progress with sequential unlock logic
  const getUnitProgress = useCallback((unitId: string): UnitProgress => {
    if (!useRedux || !unitsData?.units) {
      return {
        completedLessons: 0,
        totalLessons: 0,
        progressPercentage: 0,
        isUnlocked: true,
        isCompleted: false,
      };
    }
    
    const unit = unitsData.units.find(u => u.id === unitId);
    if (!unit || !unit.lessons) {
      return {
        completedLessons: 0,
        totalLessons: 0,
        progressPercentage: 0,
        isUnlocked: true,
        isCompleted: false,
      };
    }
    
    // Find the actual first unit (minimum order value)
    const sortedUnits = [...unitsData.units].sort((a, b) => Number(a.order) - Number(b.order));
    const firstUnit = sortedUnits[0];
    const isActualFirstUnit = firstUnit && unit.id === firstUnit.id;
    
    const numericOrder = Number(unit.order);
    
    // EXTENSIVE DEBUG LOGGING for first unit issue
    if (isActualFirstUnit) {
      console.log(`🚨 ACTUAL FIRST UNIT DEBUG - "${unit.title}":`, {
        id: unit.id,
        order: unit.order,
        orderType: typeof unit.order,
        orderAsNumber: numericOrder,
        isActualFirstUnit,
        allUnitsOrders: sortedUnits.map(u => ({ id: u.id, title: u.title, order: u.order })),
        lessonsCount: unit.lessons?.length || 0,
        lessons: unit.lessons?.map(l => ({
          id: l.id,
          title: l.title,
          completed: l.completed,
          completedType: typeof l.completed
        })) || []
      });
    }
    
    const completedLessons = unit.lessons.filter(lesson => lesson.completed === true).length;
    const totalLessons = unit.lessons.length;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const isCompleted = completedLessons === totalLessons && totalLessons > 0;
    
    // Sequential unlock logic: only unlock if previous unit is completed
    // IMPORTANT: ACTUAL FIRST UNIT (lowest order) is ALWAYS unlocked
    let isUnlocked = isActualFirstUnit;
    
    if (isActualFirstUnit) {
      console.log(`🔓 Unit "${unit.title}" (order ${unit.order}) is ACTUAL FIRST UNIT - always unlocked (numericOrder: ${numericOrder})`);
    } else {
      // Find previous unit and check if it's completed
      const previousUnit = sortedUnits.find(u => Number(u.order) === numericOrder - 1);
      
      console.log(`🔍 Checking unit "${unit.title}" (order ${unit.order}, numeric: ${numericOrder})`);
      console.log(`🔍 Previous unit:`, previousUnit ? `"${previousUnit.title}" (order ${previousUnit.order})` : 'NOT FOUND');
      
      if (previousUnit && previousUnit.lessons) {
        const prevCompletedLessons = previousUnit.lessons.filter(l => l.completed === true).length;
        const prevTotalLessons = previousUnit.lessons.length;
        const isPreviousCompleted = prevCompletedLessons === prevTotalLessons && prevTotalLessons > 0;
        isUnlocked = isPreviousCompleted;
        
        console.log(`🔍 Previous unit progress: ${prevCompletedLessons}/${prevTotalLessons} - ${isPreviousCompleted ? 'COMPLETED' : 'NOT COMPLETED'}`);
        console.log(`🔍 Current unit "${unit.title}" is ${isUnlocked ? 'UNLOCKED' : 'LOCKED'}`);
      } else {
        console.log(`🔍 Previous unit not found or has no lessons - unit "${unit.title}" remains LOCKED`);
      }
    }
    
    return {
      completedLessons,
      totalLessons,
      progressPercentage,
      isUnlocked,
      isCompleted,
    };
  }, [useRedux, unitsData]);
  
  // Calculate lesson progress
  const getLessonProgress = useCallback((lessonId: string, unitId: string): LessonProgress => {
    if (!useRedux || !unitsData?.units) {
      return {
        isLocked: false,
        isCurrent: false,
        isCompleted: false,
        progressPercentage: 0,
      };
    }
    
    const unit = unitsData.units.find(u => u.id === unitId);
    if (!unit || !unit.lessons) {
      return {
        isLocked: false,
        isCurrent: false,
        isCompleted: false,
        progressPercentage: 0,
      };
    }
    
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (!lesson) {
      return {
        isLocked: false,
        isCurrent: false,
        isCompleted: false,
        progressPercentage: 0,
      };
    }
    
    // Check if lesson is unlocked (completed or first incomplete)
    const lessonIndex = unit.lessons.findIndex(l => l.id === lessonId);
    const previousLessons = unit.lessons.slice(0, lessonIndex);
    const allPreviousCompleted = previousLessons.every(l => l.completed === true);
    const isLessonCompleted = lesson.completed === true;
    
    return {
      isLocked: !allPreviousCompleted && !isLessonCompleted,
      isCurrent: allPreviousCompleted && !isLessonCompleted,
      isCompleted: isLessonCompleted,
      progressPercentage: isLessonCompleted ? 100 : 0,
    };
  }, [useRedux, unitsData]);
  
  // Navigation handler
  const navigateToLesson = useCallback((lessonId: string) => {
    if (useRedux) {
      console.log('🔄 Redux: Navigating to lesson:', lessonId);
      // Navigation logic would be implemented here
    } else {
      console.log('🔄 Legacy: Navigating to lesson:', lessonId);
    }
  }, [useRedux]);
  
  // Find active lesson (first incomplete lesson)
  const activeLesson = useMemo((): ActiveLesson | null => {
    if (!useRedux || !unitsData?.units) {
      return null;
    }
    
    for (const unit of unitsData.units) {
      if (!unit.lessons) continue;
      
      const firstIncomplete = unit.lessons.find(lesson => !lesson.completed);
      if (firstIncomplete) {
        return {
          ...firstIncomplete,
          unit,
        };
      }
    }
    
    return null;
  }, [useRedux, unitsData]);
  
  if (useRedux) {
    return {
      units: unitsData?.units || [],
      activeLesson,
      isLoading,
      error: error ? 'Failed to load units' : null,
      getUnitProgress,
      getLessonProgress,
      navigateToLesson,
    };
  } else {
    // Legacy implementation fallback
    return {
      units: [],
      activeLesson: null,
      isLoading: false,
      error: null,
      getUnitProgress,
      getLessonProgress,
      navigateToLesson,
    };
  }
};

/**
 * Hook para debugging da migração de units
 */
export const useUnitManagementDebug = (courseId: string | null) => {
  const useRedux = useFeatureFlag('REDUX_UNIT_MANAGEMENT');
  const { units, activeLesson, isLoading, error } = useUnitManagement(courseId);
  
  const debugInfo = {
    usingRedux: useRedux,
    courseId,
    unitsCount: units.length,
    activeLesson: activeLesson?.title,
    isLoading,
    error,
  };
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📚 Unit Management Debug:', debugInfo);
  }
  
  return debugInfo;
};

/**
 * Hook para ações específicas de units
 */
export const useUnitActions = () => {
  const useRedux = useFeatureFlag('REDUX_UNIT_MANAGEMENT');
  
  const unlockNextUnit = useCallback(async (currentUnitId: string) => {
    if (useRedux) {
      console.log('🔓 Redux: Unlocking next unit after:', currentUnitId);
      // Unlock logic would be implemented here
    } else {
      console.log('🔓 Legacy: Unlocking next unit after:', currentUnitId);
    }
  }, [useRedux]);
  
  const markUnitComplete = useCallback(async (unitId: string) => {
    if (useRedux) {
      console.log('✅ Redux: Marking unit complete:', unitId);
      // Completion logic would be implemented here
    } else {
      console.log('✅ Legacy: Marking unit complete:', unitId);
    }
  }, [useRedux]);
  
  const resetUnitProgress = useCallback(async (unitId: string) => {
    if (useRedux) {
      console.log('🔄 Redux: Resetting unit progress:', unitId);
      // Reset logic would be implemented here
    } else {
      console.log('🔄 Legacy: Resetting unit progress:', unitId);
    }
  }, [useRedux]);
  
  return {
    unlockNextUnit,
    markUnitComplete,
    resetUnitProgress,
  };
};