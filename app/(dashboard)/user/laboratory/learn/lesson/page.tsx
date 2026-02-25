"use client";

/**
 * Lesson Page - Enhanced with Redux Migration
 * 
 * 🔄 REDUX MIGRATION: This component now supports Redux with feature flags
 */

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Quiz } from "./quiz";
import Loading from "@/components/course/Loading";
import { Target } from "lucide-react";
// Direct Redux imports
import { 
  useGetLessonDetailQuery,
  useGetStudentProgressQuery 
} from '@/src/domains/student/practice-courses/api';

const LessonPage = () => {
  const router = useRouter();
  
  // Redux hooks - direct usage now
  const {
    data: userProgress,
    isLoading: progressLoading,
    error: progressError
  } = useGetStudentProgressQuery();
  
  // Get active lesson ID from user progress
  const activeLessonId = userProgress?.active_course?.id;
  
  // Redux lesson data (only if we have an active lesson)
  const { 
    data: lesson, 
    isLoading: lessonLoading, 
    error: lessonError 
  } = useGetLessonDetailQuery(activeLessonId, {
    skip: !activeLessonId,
  });
  
  const isLoading = lessonLoading || progressLoading;
  const error = lessonError || progressError;

  // Handle navigation and redirects
  useEffect(() => {
    if (userProgress && !progressLoading && !activeLessonId) {
      router.push("/user/laboratory/learn");
    }
  }, [userProgress, progressLoading, activeLessonId, router]);

  if (isLoading) {
    return (
      <Loading 
        title="Preparando Lição"
        subtitle="Exercícios Interativos"
        description="Carregando desafios de aprendizado..."
        icon={Target}
        progress={90}
      />
    );
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

  // Get hearts count and subscription status from user progress
  const hearts = (userProgress as any)?.hearts || 5;
  const hasActiveSubscription = (userProgress as any)?.hasActiveSubscription || false;
  const hasUnlimitedHearts = (userProgress as any)?.hasUnlimitedHearts || false;

  // Build subscription object for Quiz component
  const userSubscription = hasActiveSubscription ? {
    isActive: true,
    hasUnlimitedHearts: hasUnlimitedHearts
  } : null;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges || []}
      initialHearts={hasUnlimitedHearts ? 999 : hearts}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription}
      useReduxPractice={true}
    />
  );
};

export default LessonPage;