import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetCourseByIdQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation,
} from "@/redux/features/api/coursesApiSlice";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";

export const useCourseProgressData = () => {
  const { courseId, chapterId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [updateProgress] = useUpdateUserCourseProgressMutation();

  const { data: courseResponse, isLoading: courseLoading } = useGetCourseByIdQuery(
    (courseId as string) ?? "",
    {
      skip: !courseId,
    }
  );

  const course = courseResponse?.data;

  const { data: userProgressResponse, isLoading: progressLoading } =
    useGetUserCourseProgressQuery(
      {
        userId: user?.id ?? "",
        courseId: (courseId as string) ?? "",
      },
      {
        skip: !isAuthenticated || !user || !courseId,
      }
    );

  const userProgress = userProgressResponse?.data;

  const isLoading = authLoading || courseLoading || progressLoading;

  const currentSection = course?.sections?.find((s) =>
    s.chapters?.some((c) => c.chapterId === chapterId)
  );

  const currentChapter = currentSection?.chapters?.find(
    (c) => c.chapterId === chapterId
  );

  const isChapterCompleted = () => {
    if (!currentSection || !currentChapter || !userProgress?.sections)
      return false;

    const section = userProgress.sections.find(
      (s) => s.sectionId === currentSection.sectionId
    );
    return (
      section?.chapters.some(
        (c) => c.chapterId === currentChapter.chapterId && c.completed
      ) ?? false
    );
  };

  const updateChapterProgress = async (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => {
    if (!user) return;

    const updatedSections = [
      {
        sectionId,
        chapters: [
          {
            chapterId,
            completed,
          },
        ],
      },
    ];

    try {
      await updateProgress({
        userId: user.id,
        courseId: (courseId as string) ?? "",
        data: {
          sections: updatedSections,
        },
      }).unwrap();
    } catch (error) {
      console.error('Error updating chapter progress:', error);
      throw error;
    }
  };

  return {
    user,
    courseId,
    chapterId,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  };
};
