"use client";

import { getLesson, getUserProgress } from "@/db/django-queries";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Quiz } from "./quiz";
import Loading from "@/components/course/Loading";

const LessonPage = () => {
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [lessonData, userProgressData] = await Promise.all([
          getLesson(),
          getUserProgress(),
        ]);

        if (!lessonData || !userProgressData) {
          router.push("/user/laboratory/learn");
          return;
        }

        setLesson(lessonData);
        setUserProgress(userProgressData);
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        router.push("/user/laboratory/learn");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!lesson || !userProgress) {
    return null; // Will redirect via useEffect
  }

  const initialPercentage = lesson.challenges?.length
    ? (lesson.challenges.filter((challenge: any) => challenge.completed).length /
        lesson.challenges.length) * 100
    : 0;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges || []}
      initialHearts={(userProgress as any).hearts}
      initialPercentage={initialPercentage}
      userSubscription={null}
    />
  );
};

export default LessonPage;