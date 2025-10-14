/**
 * Custom Hooks - Practice Session Management
 * 
 * Hooks para gerenciar sessões de prática, incluindo navegação
 * entre challenges, submissão de respostas, e tracking de progresso.
 */

import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useGetCourseUnitsWithProgressQuery,
  useGetLessonDetailQuery,
  useSubmitChallengeMutation as useSubmitChallengeProgressMutation,
  useUseHeartMutation as useReduceHeartsRedux,
} from '@/src/domains/student/practice-courses/api/studentPracticeApiSlice';
import {
  startPracticeSession,
  nextChallenge,
  submitChallengeAnswer,
  endPracticeSession,
  setSelectedLesson,
} from '../laboratorySlice';

// Remove legacy imports - using Redux directly now

// Types
export interface PracticeSessionState {
  isActive: boolean;
  currentChallenge: any | null;
  currentIndex: number;
  totalChallenges: number;
  progress: {
    correctAnswers: number;
    totalAnswers: number;
    heartsUsed: number;
    pointsEarned: number;
  };
}

export interface UnitsManagementResult {
  units: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface LessonManagementResult {
  lesson: any | null;
  challenges: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface ChallengeActions {
  submitAnswer: (challengeId: string, selectedOptionId: string) => Promise<any>;
  skipChallenge: () => void;
  nextChallenge: () => void;
  endSession: () => void;
}

/**
 * Hook para gerenciar unidades de um curso
 */
export const useCourseUnits = (courseId: string | null): UnitsManagementResult => {
  const useRedux = useFeatureFlag('REDUX_PRACTICE_SESSION');
  
  if (useRedux && courseId) {
    const { 
      data, 
      isLoading, 
      error, 
      refetch 
    } = useGetCourseUnitsWithProgressQuery(courseId);
    
    return {
      units: data?.units || [],
      isLoading,
      error: error ? 'Failed to load units' : null,
      refetch,
    };
  } else {
    // Legacy implementation seria aqui
    return {
      units: [],
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
};

/**
 * Hook para gerenciar detalhes de uma lição
 */
export const useLessonDetail = (lessonId: string | null): LessonManagementResult => {
  const useRedux = useFeatureFlag('REDUX_PRACTICE_SESSION');
  
  if (useRedux && lessonId) {
    const { 
      data, 
      isLoading, 
      error, 
      refetch 
    } = useGetLessonDetailQuery(lessonId);
    
    return {
      lesson: data || null,
      challenges: data?.challenges || [],
      isLoading,
      error: error ? 'Failed to load lesson' : null,
      refetch,
    };
  } else {
    // Legacy implementation seria aqui
    return {
      lesson: null,
      challenges: [],
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
};

/**
 * Hook principal para gerenciar sessão de prática
 */
export const usePracticeSession = (lessonId: string | null) => {
  const dispatch = useDispatch();
  const useRedux = useFeatureFlag('REDUX_PRACTICE_SESSION');
  const useOptimistic = useFeatureFlag('OPTIMISTIC_UPDATES');
  
  // Redux mutations
  const [submitChallengeRedux] = useSubmitChallengeProgressMutation();
  const [reduceHeartsRedux] = useReduceHeartsRedux();
  
  // Get lesson details
  const { lesson, challenges, isLoading, error } = useLessonDetail(lessonId);
  
  // Initialize session when lesson loads
  useEffect(() => {
    if (lesson && challenges.length > 0 && useRedux) {
      dispatch(startPracticeSession());
      dispatch(setSelectedLesson(lesson));
    }
  }, [lesson, challenges, useRedux, dispatch]);
  
  const submitAnswer = useCallback(async (challengeId: string, selectedOptionId: string) => {
    if (useRedux) {
      try {
        console.log('🧪 Using Redux for challenge submission', { challengeId, selectedOptionId });
        const result = await submitChallengeRedux({
          challengeId,
          selectedOptionId,
          timeSpent: Date.now(), // This would be calculated properly
          attempts: 1,
        }).unwrap();
        
        // Update local session state
        dispatch(submitChallengeAnswer({
          correct: result.correct,
          pointsEarned: result.pointsEarned,
          heartsUsed: result.heartsUsed,
        }));
        
        return result;
      } catch (error) {
        console.error('Failed to submit challenge:', error);
        throw error;
      }
    } else {
      // Legacy implementation
      return await upsertChallengeProgress(challengeId, selectedOptionId);
    }
  }, [useRedux, submitChallengeRedux, dispatch]);
  
  const skipChallenge = useCallback(() => {
    if (useRedux) {
      dispatch(nextChallenge());
    }
  }, [useRedux, dispatch]);
  
  const nextChallengeHandler = useCallback(() => {
    if (useRedux) {
      dispatch(nextChallenge());
    }
  }, [useRedux, dispatch]);
  
  const endSession = useCallback(() => {
    if (useRedux) {
      dispatch(endPracticeSession());
    }
  }, [useRedux, dispatch]);
  
  const actions: ChallengeActions = {
    submitAnswer,
    skipChallenge,
    nextChallenge: nextChallengeHandler,
    endSession,
  };
  
  return {
    lesson,
    challenges,
    isLoading,
    error,
    actions,
  };
};

/**
 * Hook para gerenciar hearts/lives do usuário
 */
export const useHeartsManagement = () => {
  const useRedux = useFeatureFlag('REDUX_USER_PROGRESS');
  const [reduceHeartsRedux] = useReduceHeartsRedux();
  
  const reduceUserHearts = useCallback(async (challengeId?: string) => {
    if (useRedux) {
      const result = await reduceHeartsRedux().unwrap();
      return result;
    } else {
      // Fallback - should not be used anymore
      throw new Error('Legacy hearts system not available');
    }
  }, [useRedux, reduceHeartsRedux]);
  
  return {
    reduceHearts: reduceUserHearts,
  };
};

/**
 * Hook para navegação entre lições/challenges
 */
export const usePracticeNavigation = () => {
  const dispatch = useDispatch();
  const useRedux = useFeatureFlag('REDUX_PRACTICE_SESSION');
  
  const goToLesson = useCallback((lesson: any) => {
    if (useRedux) {
      dispatch(setSelectedLesson(lesson));
    }
  }, [useRedux, dispatch]);
  
  const startSession = useCallback(() => {
    if (useRedux) {
      dispatch(startPracticeSession());
    }
  }, [useRedux, dispatch]);
  
  const endSession = useCallback(() => {
    if (useRedux) {
      dispatch(endPracticeSession());
    }
  }, [useRedux, dispatch]);
  
  return {
    goToLesson,
    startSession,
    endSession,
  };
};

/**
 * Hook para tracking de performance da sessão
 */
export const useSessionPerformance = () => {
  const useRedux = useFeatureFlag('REDUX_PRACTICE_SESSION');
  
  // Esta funcionalidade seria mais complexa na implementação real
  // incluindo tracking de tempo, accuracy, streaks, etc.
  
  const trackChallengeStart = useCallback((challengeId: string) => {
    if (useRedux && process.env.NODE_ENV === 'development') {
      console.log('📊 Challenge started:', challengeId);
    }
  }, [useRedux]);
  
  const trackChallengeComplete = useCallback((challengeId: string, correct: boolean, timeSpent: number) => {
    if (useRedux && process.env.NODE_ENV === 'development') {
      console.log('📊 Challenge completed:', { challengeId, correct, timeSpent });
    }
  }, [useRedux]);
  
  return {
    trackChallengeStart,
    trackChallengeComplete,
  };
};

/**
 * Hook combinado para funcionalidade completa de prática
 */
export const useFullPracticeManagement = (courseId: string | null, lessonId: string | null) => {
  const unitsResult = useCourseUnits(courseId);
  const sessionResult = usePracticeSession(lessonId);
  const heartsResult = useHeartsManagement();
  const navigationResult = usePracticeNavigation();
  const performanceResult = useSessionPerformance();
  
  return {
    // Units management
    ...unitsResult,
    
    // Session management
    ...sessionResult,
    
    // Hearts management
    ...heartsResult,
    
    // Navigation
    ...navigationResult,
    
    // Performance tracking
    ...performanceResult,
  };
};