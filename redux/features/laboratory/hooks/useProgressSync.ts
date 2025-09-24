/**
 * Custom Hook - Progress Synchronization
 * 
 * Manages synchronization between course progress and laboratory progress
 */

import { useCallback } from 'react';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useSyncChapterProgressMutation,
  useSubmitExerciseProgressMutation 
} from '../laboratoryApiSlice';

export interface ProgressSyncResult {
  syncChapterCompletion: (chapterId: string, exerciseId: string, completed: boolean) => Promise<void>;
  submitExerciseWithSync: (params: {
    exerciseId: string;
    challengeId: string;
    selectedOptionId: string;
    courseId?: string;
    chapterId?: string;
  }) => Promise<any>;
}

/**
 * Hook para sincronizar progresso entre curso e laboratório
 */
export const useProgressSync = (): ProgressSyncResult => {
  const useRedux = useFeatureFlag('REDUX_COURSE_SELECTION');
  
  const [syncChapterMutation] = useSyncChapterProgressMutation();
  const [submitExerciseMutation] = useSubmitExerciseProgressMutation();

  const syncChapterCompletion = useCallback(async (
    chapterId: string, 
    exerciseId: string, 
    completed: boolean
  ) => {
    if (!useRedux) {
      console.log('🔄 Redux disabled, skipping progress sync');
      return;
    }

    try {
      console.log('🔄 Syncing chapter completion with lab:', {
        chapterId,
        exerciseId,
        completed
      });

      await syncChapterMutation({
        chapterId,
        exerciseId,
        completed
      }).unwrap();

      console.log('✅ Chapter progress synced successfully');
    } catch (error) {
      console.error('❌ Failed to sync chapter progress:', error);
      // Don't throw - sync failures shouldn't break the user experience
    }
  }, [useRedux, syncChapterMutation]);

  const submitExerciseWithSync = useCallback(async (params: {
    exerciseId: string;
    challengeId: string;
    selectedOptionId: string;
    courseId?: string;
    chapterId?: string;
  }) => {
    if (!useRedux) {
      console.log('🔄 Redux disabled, using legacy exercise submission');
      // TODO: Implement legacy fallback if needed
      throw new Error('Legacy exercise submission not implemented');
    }

    try {
      console.log('📤 Submitting exercise with sync:', params);

      const result = await submitExerciseMutation(params).unwrap();

      console.log('✅ Exercise submitted with sync:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to submit exercise with sync:', error);
      throw error;
    }
  }, [useRedux, submitExerciseMutation]);

  return {
    syncChapterCompletion,
    submitExerciseWithSync,
  };
};

/**
 * Hook para debugging e monitoramento da sincronização
 */
export const useProgressSyncDebug = () => {
  const flags = {
    courseSelection: useFeatureFlag('REDUX_COURSE_SELECTION'),
    userProgress: useFeatureFlag('REDUX_USER_PROGRESS'),
    practiceSession: useFeatureFlag('REDUX_PRACTICE_SESSION'),
  };

  const syncStatus = {
    enabled: Object.values(flags).every(Boolean),
    partialSync: Object.values(flags).some(Boolean),
    totalFlags: Object.keys(flags).length,
    activeFlags: Object.values(flags).filter(Boolean).length,
  };

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Progress Sync Debug:', { flags, syncStatus });
  }

  return { flags, syncStatus };
};