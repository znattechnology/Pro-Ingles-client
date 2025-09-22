"use client";

/**
 * Lesson [ID] Page - Enhanced with Redux Migration
 * 
 * 🔄 REDUX MIGRATION: This component now supports Redux with feature flags
 * for individual lesson practice sessions.
 */

import { getLesson, getUserProgress } from "@/db/django-queries";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Quiz } from "../quiz";
import Loading from "@/components/course/Loading";
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useLessonDetail, 
  usePracticeSession,
  usePracticeNavigation
} from '@/redux/features/laboratory/hooks/usePracticeSession';
import { 
  useUserProgress,
  useHeartsSystem 
} from '@/redux/features/laboratory/hooks/useUserProgress';

type Props = {
  params: {
    lessonId: string; // Changed to string for UUID
  }
}

const LessonIdPage = ({ params }: Props) => {
  const router = useRouter();
  
  // Feature flags
  const useReduxPractice = useFeatureFlag('REDUX_PRACTICE_SESSION');
  const useReduxProgress = useFeatureFlag('REDUX_USER_PROGRESS');
  
  // Redux hooks
  const { 
    lesson: reduxLesson, 
    challenges: reduxChallenges, 
    isLoading: reduxLessonLoading, 
    error: reduxLessonError 
  } = useLessonDetail(useReduxPractice ? params.lessonId : null);
  
  const { 
    userProgress: reduxUserProgress, 
    isLoading: reduxProgressLoading 
  } = useUserProgress();
  
  const { heartsCount } = useHeartsSystem();
  
  // Legacy state
  const [legacyLesson, setLegacyLesson] = useState(null);
  const [legacyUserProgress, setLegacyUserProgress] = useState(null);
  const [legacyIsLoading, setLegacyIsLoading] = useState(true);

  // Determine data source
  const lesson = useReduxPractice ? reduxLesson : legacyLesson;
  const userProgress = useReduxProgress ? reduxUserProgress : legacyUserProgress;
  const isLoading = useReduxPractice 
    ? reduxLessonLoading || reduxProgressLoading 
    : legacyIsLoading;

  // Debug migration
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Practice Session Migration Status:', {
      useReduxPractice,
      useReduxProgress,
      hasLesson: !!lesson,
      hasUserProgress: !!userProgress,
      challengesCount: useReduxPractice ? reduxChallenges.length : lesson?.challenges?.length || 0,
      timestamp: new Date().toISOString()
    });
  }

  // Legacy data loading (fallback when Redux is disabled)
  useEffect(() => {
    if (!useReduxPractice || !useReduxProgress) {
      const fetchData = async () => {
        try {
          setLegacyIsLoading(true);
          
          const [lessonData, userProgressData] = await Promise.all([
            getLesson(params.lessonId),
            getUserProgress(),
          ]);

          if (!lessonData || !userProgressData) {
            router.push("/user/laboratory/learn");
            return;
          }

          setLegacyLesson(lessonData);
          setLegacyUserProgress(userProgressData);
        } catch (error) {
          console.error("Error fetching lesson data:", error);
          router.push("/user/laboratory/learn");
        } finally {
          setLegacyIsLoading(false);
        }
      };

      fetchData();
    }
  }, [params.lessonId, router, useReduxPractice, useReduxProgress]);

  // Handle Redux errors
  useEffect(() => {
    if (reduxLessonError) {
      console.error("Redux lesson error:", reduxLessonError);
      router.push("/user/laboratory/learn");
    }
  }, [reduxLessonError, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!lesson || !userProgress) {
    return null; // Will redirect via useEffect
  }

  // Get challenges from Redux or legacy
  const challenges = useReduxPractice ? reduxChallenges : lesson.challenges || [];
  
  const initialPercentage = challenges.length
    ? (challenges.filter((challenge: any) => challenge.completed).length /
        challenges.length) * 100
    : 0;

  // Get hearts count based on source
  const hearts = useReduxProgress ? heartsCount : (userProgress as any)?.hearts;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={challenges}
      initialHearts={hearts || 5}
      initialPercentage={initialPercentage}
      userSubscription={null}
      useReduxPractice={useReduxPractice}
    />
  );
};

export default LessonIdPage;