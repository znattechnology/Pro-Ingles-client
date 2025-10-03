import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetVideoCourseByIdQuery,
  useGetVideoCourseProgressQuery,
  useUpdateVideoProgressMutation,
} from "@/src/domains/student/video-courses/api/studentVideoCourseApiSlice";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";

export const useCourseProgressData = () => {
  const { courseId, chapterId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [updateProgress] = useUpdateVideoProgressMutation();

  const { data: courseResponse, isLoading: courseLoading } = useGetVideoCourseByIdQuery(
    (courseId as string) ?? "",
    {
      skip: !courseId,
    }
  );

  const course = courseResponse?.data;

  const { data: userProgressResponse, isLoading: progressLoading } =
    useGetVideoCourseProgressQuery(
      {
        courseId: (courseId as string) ?? "",
        userId: user?.id ?? ""
      },
      {
        skip: !isAuthenticated || !user || !courseId,
      }
    );

  const userProgress = userProgressResponse?.data?.data || userProgressResponse?.data;

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
