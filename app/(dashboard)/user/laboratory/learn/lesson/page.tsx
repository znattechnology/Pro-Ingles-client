"use client";

/**
 * Lesson Page - Enhanced with Redux Migration
 * 
 * 🔄 REDUX MIGRATION: This component now supports Redux with feature flags
 */

import { getLesson, getUserProgress } from "@/db/django-queries";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Quiz } from "./quiz";
import Loading from "@/components/course/Loading";
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useGetLessonDetailQuery,
  useGetUserProgressQuery,
} from '@/redux/features/laboratory/laboratoryApiSlice';
import { 
  useLearnPageNavigation 
} from '@/redux/features/laboratory/hooks/useMainLearnPage';
import {
  useFullUserProgressManagement
} from '@/redux/features/laboratory/hooks/useUserProgress';

const LessonPage = () => {
  const router = useRouter();
  
  // Feature flags
  const useReduxLesson = useFeatureFlag('REDUX_PRACTICE_SESSION');
  const useReduxProgress = useFeatureFlag('REDUX_USER_PROGRESS');
  
  // Redux hooks
  const {
    userProgress: reduxUserProgress,
    isLoading: reduxProgressLoading,
    error: reduxProgressError,
    hearts: reduxHearts,
  } = useFullUserProgressManagement();
  
  // Get active lesson ID from user progress
  const activeLessonId = reduxUserProgress?.active_course?.id;
  
  // Redux lesson data (only if we have an active lesson)
  const { 
    data: reduxLesson, 
    isLoading: reduxLessonLoading, 
    error: reduxLessonError 
  } = useGetLessonDetailQuery(activeLessonId, {
    skip: !useReduxLesson || !activeLessonId,
  });
  
  // Legacy state
  const [legacyLesson, setLegacyLesson] = useState(null);
  const [legacyUserProgress, setLegacyUserProgress] = useState(null);
  const [legacyIsLoading, setLegacyIsLoading] = useState(true);
  
  // Determine data source
  const lesson = useReduxLesson ? reduxLesson : legacyLesson;
  const userProgress = useReduxProgress ? reduxUserProgress : legacyUserProgress;
  const isLoading = useReduxLesson ? (reduxLessonLoading || reduxProgressLoading) : legacyIsLoading;
  const error = useReduxLesson ? (reduxLessonError || reduxProgressError) : null;
  
  // Navigation helpers
  const navigation = useLearnPageNavigation();

  // Debug migration
  if (process.env.NODE_ENV === 'development') {
    console.log('📝 Lesson Page Migration Status:', {
      useReduxLesson,
      useReduxProgress,
      hasReduxLesson: !!reduxLesson,
      hasReduxUserProgress: !!reduxUserProgress,
      activeLessonId,
      reduxLessonLoading,
      reduxProgressLoading,
      timestamp: new Date().toISOString()
    });
  }

  // Legacy data loading (fallback when Redux is disabled)
  useEffect(() => {
    if (!useReduxLesson || !useReduxProgress) {
      const fetchData = async () => {
        try {
          setLegacyIsLoading(true);
          console.log('🔄 Legacy: Loading lesson page data...');
          
          const [lessonData, userProgressData] = await Promise.all([
            getLesson(),
            getUserProgress(),
          ]);

          if (!lessonData || !userProgressData) {
            console.warn('🔄 Legacy: No lesson or user progress data, redirecting...');
            router.push("/user/laboratory/learn");
            return;
          }

          setLegacyLesson(lessonData);
          setLegacyUserProgress(userProgressData);
        } catch (error) {
          console.error("🔄 Legacy: Error fetching lesson data:", error);
          router.push("/user/laboratory/learn");
        } finally {
          setLegacyIsLoading(false);
        }
      };

      fetchData();
    }
  }, [router, useReduxLesson, useReduxProgress]);
  
  // Handle Redux navigation and redirects
  useEffect(() => {
    if (useReduxProgress && reduxUserProgress && !reduxProgressLoading) {
      const shouldContinue = navigation.navigateToActiveCourse(router, reduxUserProgress);
      if (!shouldContinue) {
        return;
      }
    }
  }, [useReduxProgress, reduxUserProgress, reduxProgressLoading, router, navigation]);

  if (isLoading) {
    return <Loading />;
  }

  // Show error state
  if (error) {
    console.error('Lesson page error:', error);
    router.push("/user/laboratory/learn");
    return null;
  }

  if (!lesson || !userProgress) {
    return null; // Will redirect via useEffect
  }

  // Calculate initial percentage
  const initialPercentage = lesson?.challenges?.length
    ? (lesson.challenges.filter((challenge: any) => challenge.completed).length /
        lesson.challenges.length) * 100
    : 0;

  // Get hearts count based on source
  const hearts = useReduxProgress ? reduxHearts?.heartsCount : (userProgress as any)?.hearts;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges || []}
      initialHearts={hearts || 5}
      initialPercentage={initialPercentage}
      userSubscription={null}
    />
  );
};

export default LessonPage;