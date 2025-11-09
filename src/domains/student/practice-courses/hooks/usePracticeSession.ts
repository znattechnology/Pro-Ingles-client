/**
 * Modern Practice Session Hooks
 * 
 * Clean, simple hooks that replace the complex Redux practice session system.
 * These hooks use direct RTK Query APIs and provide a cleaner interface
 * for managing practice sessions, challenge submissions, and progress tracking.
 */

import { useCallback, useState, useEffect } from 'react';
import { 
  useGetStudentProgressQuery,
  useGetLessonDetailQuery,
  useSubmitChallengeMutation,
  useMarkLessonCompletedMutation,
  useUseHeartMutation
} from '../api';

// Types
export interface PracticeSessionStats {
  correctAnswers: number;
  totalAnswers: number;
  currentChallengeIndex: number;
  totalChallenges: number;
  pointsEarned: number;
  heartsUsed: number;
  timeSpent: number;
  accuracy: number;
}

export interface ChallengeSubmissionResult {
  correct: boolean;
  pointsEarned: number;
  newHeartsCount: number;
  explanation?: string;
}

/**
 * Hook for managing a complete practice session
 */
export const usePracticeSession = (lessonId: string | null) => {
  // API hooks
  const { 
    data: userProgress, 
    refetch: refetchProgress 
  } = useGetStudentProgressQuery();
  
  const { 
    data: lessonDetail, 
    isLoading: lessonLoading,
    error: lessonError 
  } = useGetLessonDetailQuery(lessonId || '', {
    skip: !lessonId
  });

  const [submitChallenge] = useSubmitChallengeMutation();
  const [useHeart] = useUseHeartMutation();
  const [markLessonCompleted] = useMarkLessonCompletedMutation();

  // Session state
  const [sessionStats, setSessionStats] = useState<PracticeSessionStats>({
    correctAnswers: 0,
    totalAnswers: 0,
    currentChallengeIndex: 0,
    totalChallenges: lessonDetail?.challenges?.length || 0,
    pointsEarned: 0,
    heartsUsed: 0,
    timeSpent: 0,
    accuracy: 0,
  });

  const [sessionStartTime] = useState(Date.now());
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Update total challenges when lesson loads
  useEffect(() => {
    if (lessonDetail?.challenges) {
      setSessionStats(prev => ({
        ...prev,
        totalChallenges: lessonDetail.challenges.length
      }));
    }
  }, [lessonDetail]);

  // Start session
  const startSession = useCallback(() => {
    setIsSessionActive(true);
    setSessionStats({
      correctAnswers: 0,
      totalAnswers: 0,
      currentChallengeIndex: 0,
      totalChallenges: lessonDetail?.challenges?.length || 0,
      pointsEarned: 0,
      heartsUsed: 0,
      timeSpent: 0,
      accuracy: 0,
    });
  }, [lessonDetail]);

  // Submit challenge answer
  const submitAnswer = useCallback(async (
    challengeId: string, 
    selectedOptionId: string
  ): Promise<ChallengeSubmissionResult> => {
    try {
      const result = await submitChallenge({
        challengeId,
        selectedOptionId,
        timeSpent: Date.now() - sessionStartTime,
        attempts: 1,
      }).unwrap();

      const isCorrect = result.challenge_progress?.correct || false;
      const pointsEarned = result.user_progress?.points || 0;
      const heartsRemaining = result.user_progress?.hearts || 5;

      // Update session stats
      setSessionStats(prev => {
        const newStats = {
          ...prev,
          totalAnswers: prev.totalAnswers + 1,
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          pointsEarned: pointsEarned,
          heartsUsed: !isCorrect ? prev.heartsUsed + 1 : prev.heartsUsed,
          timeSpent: Date.now() - sessionStartTime,
        };
        
        newStats.accuracy = newStats.totalAnswers > 0 
          ? Math.round((newStats.correctAnswers / newStats.totalAnswers) * 100) 
          : 0;
          
        return newStats;
      });

      // Refetch user progress to update hearts/points
      await refetchProgress();

      return {
        correct: isCorrect,
        pointsEarned: pointsEarned,
        newHeartsCount: heartsRemaining,
        explanation: result.challenge_progress?.explanation,
      };
    } catch (error) {
      console.error('Failed to submit challenge:', error);
      throw error;
    }
  }, [submitChallenge, sessionStartTime, refetchProgress]);

  // Move to next challenge
  const nextChallenge = useCallback(() => {
    setSessionStats(prev => ({
      ...prev,
      currentChallengeIndex: Math.min(
        prev.currentChallengeIndex + 1, 
        prev.totalChallenges - 1
      )
    }));
  }, []);

  // Complete the lesson
  const completeLesson = useCallback(async () => {
    if (!lessonId) return;

    try {
      await markLessonCompleted({
        lessonId,
        score: sessionStats.accuracy,
        timeSpent: sessionStats.timeSpent,
      }).unwrap();

      setIsSessionActive(false);
      await refetchProgress();
      
      return {
        completed: true,
        stats: sessionStats,
      };
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      throw error;
    }
  }, [lessonId, markLessonCompleted, sessionStats, refetchProgress]);

  // Skip challenge (costs a heart)
  const skipChallenge = useCallback(async () => {
    try {
      await useHeart().unwrap();
      
      setSessionStats(prev => ({
        ...prev,
        heartsUsed: prev.heartsUsed + 1,
        currentChallengeIndex: Math.min(
          prev.currentChallengeIndex + 1, 
          prev.totalChallenges - 1
        )
      }));

      await refetchProgress();
    } catch (error) {
      console.error('Failed to skip challenge:', error);
      throw error;
    }
  }, [useHeart, refetchProgress]);

  // Get current challenge
  const currentChallenge = lessonDetail?.challenges?.[sessionStats.currentChallengeIndex];
  
  // Check if session is complete
  const isSessionComplete = sessionStats.currentChallengeIndex >= sessionStats.totalChallenges - 1;
  
  // Progress percentage
  const progressPercentage = sessionStats.totalChallenges > 0 
    ? Math.round(((sessionStats.currentChallengeIndex + 1) / sessionStats.totalChallenges) * 100)
    : 0;

  return {
    // Session state
    isSessionActive,
    isSessionComplete,
    progressPercentage,
    sessionStats,
    
    // Current data
    lesson: lessonDetail,
    currentChallenge,
    challenges: lessonDetail?.challenges || [],
    
    // Loading states
    isLoading: lessonLoading,
    error: lessonError,
    
    // Actions
    startSession,
    submitAnswer,
    nextChallenge,
    skipChallenge,
    completeLesson,
  };
};

/**
 * Hook for managing hearts/lives
 */
export const useHeartsManagement = () => {
  const { data: userProgress } = useGetStudentProgressQuery();
  const [useHeart] = useUseHeartMutation();
  
  const currentHearts = userProgress?.hearts || 5;
  const maxHearts = 5;
  const hasHearts = currentHearts > 0;
  
  const reduceHeart = useCallback(async () => {
    if (currentHearts <= 0) {
      throw new Error('No hearts remaining');
    }
    
    try {
      const result = await useHeart().unwrap();
      return result;
    } catch (error) {
      console.error('Failed to use heart:', error);
      throw error;
    }
  }, [useHeart, currentHearts]);
  
  return {
    currentHearts,
    maxHearts,
    hasHearts,
    heartsPercentage: Math.round((currentHearts / maxHearts) * 100),
    reduceHeart,
  };
};

/**
 * Hook for lesson navigation and completion tracking
 */
export const useLessonNavigation = (courseId: string | null) => {
  const { data: userProgress } = useGetStudentProgressQuery();
  
  // Get next available lesson
  const getNextLesson = useCallback((currentLessonId: string) => {
    // This would implement logic to find the next incomplete lesson
    // Based on course units and lesson progression
    console.log('Getting next lesson after:', currentLessonId);
    // Implementation would go here
  }, []);
  
  // Check if lesson is unlocked
  const isLessonUnlocked = useCallback((lessonId: string) => {
    // Implementation would check if prerequisites are met
    console.log('Checking if lesson is unlocked:', lessonId);
    return true; // Simplified for now
  }, []);
  
  return {
    getNextLesson,
    isLessonUnlocked,
    userProgress,
  };
};

/**
 * Hook for tracking performance and analytics
 */
export const useSessionPerformance = () => {
  const [performanceData, setPerformanceData] = useState({
    averageTimePerChallenge: 0,
    strongSkills: [] as string[],
    weakSkills: [] as string[],
    streakCount: 0,
  });
  
  const trackChallengePerformance = useCallback((
    challengeId: string,
    timeSpent: number,
    correct: boolean,
    skill: string
  ) => {
    console.log('Tracking performance:', { challengeId, timeSpent, correct, skill });
    
    setPerformanceData(prev => {
      // Update performance tracking
      // This would be more sophisticated in a real implementation
      return {
        ...prev,
        averageTimePerChallenge: (prev.averageTimePerChallenge + timeSpent) / 2,
        streakCount: correct ? prev.streakCount + 1 : 0,
      };
    });
  }, []);
  
  return {
    performanceData,
    trackChallengePerformance,
  };
};

/**
 * Combined hook that provides complete practice session functionality
 */
export const useFullPracticeSession = (lessonId: string | null, courseId: string | null) => {
  const sessionHook = usePracticeSession(lessonId);
  const heartsHook = useHeartsManagement();
  const navigationHook = useLessonNavigation(courseId);
  const performanceHook = useSessionPerformance();
  
  return {
    ...sessionHook,
    ...heartsHook,
    ...navigationHook,
    ...performanceHook,
  };
};