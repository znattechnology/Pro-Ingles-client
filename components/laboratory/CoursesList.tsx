"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CourseCard } from "./CourseCard";
import { useUpdateUserProgressMutation } from "@/src/domains/student/practice-courses/api";

type Course = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
};

type Props = {
  courses: Course[];
  activeCourseId?: string;
};

export const CoursesList = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updateUserProgress] = useUpdateUserProgressMutation();

  const onClick = (courseId: string) => {
    if (isPending) return;

    if (courseId === activeCourseId) {
      // If clicking on the already active course, go to practice
      return router.push("/user/laboratory/learn");
    }

    // Update user's active course
    startTransition(() => {
      updateUserProgress({
        active_course: { id: courseId }
      })
        .unwrap()
        .then(() => {
          toast.success("Course selected successfully!");
          router.push("/user/laboratory/learn");
        })
        .catch(() => {
          toast.error("Failed to select course. Please try again.");
        });
    });
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No courses available at the moment.</p>
        <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          description={course.description}
          imageSrc={course.image}
          category={course.category}
          level={course.level}
          onClick={onClick}
          disabled={isPending}
          active={course.id === activeCourseId}
        />
      ))}
    </div>
  );
};