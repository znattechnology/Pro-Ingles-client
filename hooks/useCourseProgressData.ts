import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetVideoCourseByIdQuery,
  useGetVideoCourseProgressQuery,
  studentVideoCourseApiSlice,
} from "@/src/domains/student/video-courses/api/studentVideoCourseApiSlice";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useAppDispatch } from "@/redux/hooks";

export const useCourseProgressData = () => {
  const { courseId, chapterId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const dispatch = useAppDispatch();
  const { data: courseResponse, isLoading: courseLoading, error: courseError } = useGetVideoCourseByIdQuery(
    (courseId as string) ?? "",
    {
      skip: !courseId,
    }
  );

  const course = courseResponse; // courseResponse já é transformado na API
  
  // Debug logging
  console.log('📚 Course hook debug:', {
    courseId,
    chapterId,
    courseResponse,
    course,
    courseError,
    courseLoading
  });

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
      console.log('🔄 Updating chapter progress via correct endpoint:', {
        userId: user.id,
        courseId,
        sectionId,
        chapterId,
        completed
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/student/video-courses/users/${user.id}/progress/${courseId}/update/`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sections: updatedSections,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Progress update failed:', response.status, errorData);
        throw new Error(`Failed to update progress: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Chapter progress updated successfully:', result);

      // Invalidate the progress query to refresh the data
      dispatch(
        studentVideoCourseApiSlice.util.invalidateTags([
          { type: 'VideoProgress', id: courseId as string },
          'VideoProgress'
        ])
      );
      
    } catch (error) {
      console.error('❌ Error updating chapter progress:', error);
      throw error;
    }
  };

  const markChapterAsCompleted = async () => {
    if (!currentSection || !currentChapter) return;
    
    try {
      await updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
      setHasMarkedComplete(true);
    } catch (error) {
      console.error('Error marking chapter as completed:', error);
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
    markChapterAsCompleted,
    hasMarkedComplete,
    setHasMarkedComplete,
  };
};
