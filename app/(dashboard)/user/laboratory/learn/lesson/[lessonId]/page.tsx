"use client";

/**
 * Lesson [ID] Page - Enhanced with Redux Migration
 * 
 * 🔄 REDUX MIGRATION: This component now supports Redux with feature flags
 * for individual lesson practice sessions.
 */

// Direct Redux imports
import { useGetLessonDetailQuery, useGetStudentProgressQuery } from '@/src/domains/student/practice-courses/api';
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Quiz } from "../quiz";
import Loading from "@/components/course/Loading";
// Remove feature flags - using Redux directly now

type Props = {
  params: {
    lessonId: string; // Changed to string for UUID
  }
}

const LessonIdPage = ({ params }: Props) => {
  const router = useRouter();
  
  // Redux hooks - direct usage now
  const { 
    data: lesson, 
    isLoading: lessonLoading, 
    error: lessonError 
  } = useGetLessonDetailQuery(params.lessonId);
  
  const { 
    data: userProgress, 
    isLoading: progressLoading 
  } = useGetStudentProgressQuery();
  
  const isLoading = lessonLoading || progressLoading;

  // Handle Redux errors
  useEffect(() => {
    if (lessonError) {
      console.error("Lesson error:", lessonError);
      router.push("/user/laboratory/learn");
    }
  }, [lessonError, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!lesson || !userProgress) {
    return null; // Will redirect via useEffect
  }

  // Get challenges from lesson
  const challenges = lesson?.challenges || [];
  
  const initialPercentage = challenges.length
    ? (challenges.filter((challenge: any) => challenge.completed).length /
        challenges.length) * 100
    : 0;

  // Get hearts count from user progress
  const hearts = (userProgress as any)?.hearts || 5;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={challenges}
      initialHearts={hearts}
      initialPercentage={initialPercentage}
      userSubscription={null}
      useReduxPractice={true}
    />
  );
};

export default LessonIdPage;