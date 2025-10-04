/**
 * Legacy Compatibility Layer for Student Progress
 * 
 * Provides wrapper functions that maintain the original API signature
 * while using the new Redux implementation underneath.
 * This allows for gradual migration of existing components.
 */

import { makeStore } from '@/state/redux';
import { studentProgressApi } from '../services/studentProgressApi';

/**
 * Legacy wrapper for upsertUserProgress
 * Maintains original function signature while using Redux underneath
 */
export const upsertUserProgress = async (courseId: string) => {
  try {
    const store = makeStore();
    
    // First, fetch available courses to get the full course object
    const availableCoursesPromise = store.dispatch(
      studentProgressApi.endpoints.getAvailableCourses.initiate()
    );
    
    const coursesResult = await availableCoursesPromise;
    
    if ('error' in coursesResult) {
      throw new Error('Failed to fetch courses');
    }

    const courses = coursesResult.data || [];
    const course = courses.find((c) => c.id === courseId);

    if (!course) {
      throw new Error('Course not found');
    }

    // Update user progress with the selected course
    const updatePromise = store.dispatch(
      studentProgressApi.endpoints.updateUserProgress.initiate({
        active_course: course
      })
    );

    const result = await updatePromise;

    if ('error' in result) {
      throw new Error('Failed to update user progress');
    }

    // Return success in the expected format
    return { success: true, data: result.data };

  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

/**
 * Legacy wrapper for reduceHearts
 * Maintains original function signature while using Redux underneath
 */
export const reduceHearts = async (challengeId: string) => {
  try {
    const store = makeStore();
    
    const promise = store.dispatch(
      studentProgressApi.endpoints.reduceHearts.initiate({
        challenge_id: challengeId
      })
    );

    const result = await promise;

    if ('error' in result) {
      const error = result.error;
      
      // Handle specific error types (matching original logic)
      if (error && 'status' in error && error.status === 400) {
        const errorData = 'data' in error ? error.data : null;
        
        if (errorData && typeof errorData === 'object') {
          const data = errorData as any;
          if (data.error === 'hearts') {
            return { error: "hearts" };
          }
          if (data.error === 'practice') {
            return { error: "practice" };
          }
        }
      }
      
      throw new Error('Failed to reduce hearts');
    }

    return { success: true, data: result.data };

  } catch (error) {
    console.error('Error reducing hearts:', error);
    throw error;
  }
};

/**
 * Challenge Progress functions for backward compatibility
 */
export const updateChallengeProgress = async (challengeId: string, progress: any) => {
  try {
    const store = makeStore();
    
    const promise = store.dispatch(
      studentProgressApi.endpoints.updateChallengeProgress.initiate({
        challenge_id: challengeId,
        ...progress
      })
    );

    const result = await promise;

    if ('error' in result) {
      throw new Error('Failed to update challenge progress');
    }

    return { success: true, data: result.data };

  } catch (error) {
    console.error('Error updating challenge progress:', error);
    throw error;
  }
};

export const getChallengeProgress = async (challengeId: string) => {
  try {
    const store = makeStore();
    
    const promise = store.dispatch(
      studentProgressApi.endpoints.getChallengeProgress.initiate(challengeId)
    );

    const result = await promise;

    if ('error' in result) {
      throw new Error('Failed to get challenge progress');
    }

    return result.data;

  } catch (error) {
    console.error('Error getting challenge progress:', error);
    throw error;
  }
};

export const resetChallengeProgress = async (challengeId: string) => {
  try {
    const store = makeStore();
    
    const promise = store.dispatch(
      studentProgressApi.endpoints.resetChallengeProgress.initiate(challengeId)
    );

    const result = await promise;

    if ('error' in result) {
      throw new Error('Failed to reset challenge progress');
    }

    return { success: true, data: result.data };

  } catch (error) {
    console.error('Error resetting challenge progress:', error);
    throw error;
  }
};