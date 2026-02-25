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

// Extended data for complex challenge types (camelCase to match quiz.tsx)
export interface ExtendedChallengeData {
  textAnswer?: string;              // For FILL_BLANK/TRANSLATION (single blank)
  textAnswers?: string[];           // For FILL_BLANK (multiple blanks)
  orderedOptions?: string[];        // For SENTENCE_ORDER
  pairedOptions?: { [key: string]: string }; // For MATCH_PAIRS
  pronunciationScore?: number;      // For SPEAKING
}

export interface ChallengeActions {
  submitAnswer: (challengeId: string, selectedOptionId?: string, extendedData?: ExtendedChallengeData) => Promise<any>;
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
  
  const submitAnswer = useCallback(async (
    challengeId: string,
    selectedOptionId?: string,
    extendedData?: ExtendedChallengeData
  ) => {
    if (useRedux) {
      try {
        console.log('🧪 Using Redux for challenge submission', { challengeId, selectedOptionId, extendedData });

        // Build payload with correct field names (snake_case for backend)
        const payload: {
          challenge_id: string;
          selected_option?: string;
          text_answer?: string;
          text_answers?: string[];
          ordered_options?: string[];
          paired_options?: { [key: string]: string };
          pronunciation_score?: number;
          time_spent?: number;
          attempts?: number;
        } = {
          challenge_id: challengeId,
          time_spent: Date.now(),
          attempts: 1,
        };

        // Add extended data for complex challenge types (convert camelCase to snake_case)
        // Process extendedData FIRST, before selected_option
        if (extendedData) {
          if (extendedData.textAnswer) {
            payload.text_answer = extendedData.textAnswer;
          }
          // Handle multiple blanks - IMPORTANT: send array for multi-blank validation
          if (extendedData.textAnswers && extendedData.textAnswers.length > 0) {
            payload.text_answers = extendedData.textAnswers;
          }
          if (extendedData.orderedOptions) {
            payload.ordered_options = extendedData.orderedOptions;
          }
          if (extendedData.pairedOptions) {
            payload.paired_options = extendedData.pairedOptions;
          }
          if (extendedData.pronunciationScore !== undefined) {
            payload.pronunciation_score = extendedData.pronunciationScore;
          }
        } else if (selectedOptionId) {
          // Only add selected_option for simple challenge types when no extendedData
          // and when it's a valid UUID (not a placeholder like 'text-input' or 'match-pairs')
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(selectedOptionId)) {
            payload.selected_option = selectedOptionId;
          }
        }

        console.log('🧪 Submitting with payload:', payload);
        const result = await submitChallengeRedux(payload).unwrap();

        // Update local session state
        dispatch(submitChallengeAnswer({
          correct: result.correct,
          pointsEarned: result.user_progress?.points || 0,
          heartsUsed: result.heartsUsed || 0,
        }));

        return result;
      } catch (error: any) {
        console.error('Failed to submit challenge:', error);

        // Check if it's a hearts error from the backend
        const errorData = error?.data || error?.response?.data;
        if (errorData?.error === 'hearts') {
          // Return a special response for hearts error so quiz.tsx can handle it
          return {
            success: false,
            correct: false,
            error: 'hearts',
            message: errorData?.message || 'No hearts remaining',
          };
        }

        throw error;
      }
    } else {
      // Legacy implementation is no longer supported
      throw new Error('Legacy practice session system not available. Enable REDUX_PRACTICE_SESSION feature flag.');
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