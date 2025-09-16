import { apiSlice } from "./apiSlice";

export interface Course {
  courseId: string;
  teacher: string;
  teacherName: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Draft' | 'Published';
  template: 'general' | 'business' | 'technology' | 'medical' | 'legal';
  created_at: string;
  updated_at: string;
  total_sections?: number;
  total_chapters?: number;
  total_enrollments?: number;
  sections?: CourseSection[];
  enrollments?: {userId: string}[];
}

export interface CourseSection {
  id: string;
  sectionId: string;
  course: string;
  sectionTitle: string;
  sectionDescription?: string;
  order: number;
  created_at: string;
  updated_at: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  chapterId: string;
  section: string;
  title: string;
  content: string;
  type: 'Text' | 'Quiz' | 'Video';
  video?: string;
  order: number;
  created_at: string;
  updated_at: string;
  comments?: ChapterComment[];
  
  // 🆕 PHASE 1 BRIDGE - Novos campos
  transcript?: string;
  quiz_enabled?: boolean;
  resources_data?: ChapterResource[];
  practice_lesson?: string;
}

export interface ChapterComment {
  id: string;
  commentId: string;
  chapter: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface CourseEnrollment {
  id: string;
  user: string;
  course: string;
  enrollment_date: string;
}

export interface UserCourseProgress {
  id: string;
  user: string;
  course: string;
  enrollmentDate: string;
  overallProgress: number;
  lastAccessedTimestamp: string;
  sections: SectionProgress[];
}

export interface SectionProgress {
  sectionId: string;
  chapters: ChapterProgress[];
}

export interface ChapterProgress {
  chapterId: string;
  completed: boolean;
  completed_at?: string;
}

// 🆕 PHASE 1 BRIDGE - Novas interfaces
export interface ChapterResource {
  id?: string;
  title: string;
  description?: string;
  resource_type: "PDF" | "LINK" | "VIDEO" | "CODE" | "WORKSHEET" | "AUDIO" | "IMAGE";
  file?: string;
  external_url?: string;
  file_size?: number;
  download_count?: number;
  order?: number;
  is_featured?: boolean;
  created_by?: string;
  created_by_name?: string;
  file_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChapterQuiz {
  id?: string;
  chapter?: string;
  chapter_title?: string;
  practice_lesson: string;
  practice_lesson_title?: string;
  title: string;
  description?: string;
  points_reward?: number;
  hearts_cost?: number;
  passing_score?: number;
  time_limit?: number;
  max_attempts?: number;
  total_attempts?: number;
  total_completions?: number;
  average_score?: number;
  completion_rate?: number;
  is_active?: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentQuizAttempt {
  id?: string;
  student?: string;
  student_name?: string;
  chapter_quiz: string;
  quiz_title?: string;
  chapter_title?: string;
  score: number;
  max_score: number;
  score_percentage?: number;
  time_taken?: number;
  hearts_lost?: number;
  points_earned?: number;
  is_completed?: boolean;
  is_passed?: boolean;
  attempt_number?: number;
  completed_at?: string;
  practice_progress?: string;
  created_at?: string;
}

export const coursesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List all published courses
    getCourses: builder.query<{message: string, data: Course[]}, {category?: string}>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.category) {
          searchParams.append('category', params.category);
        }
        return `/courses/?${searchParams.toString()}`;
      },
      providesTags: ['Course'],
    }),

    // Get course details
    getCourseById: builder.query<{message: string, data: Course}, string>({
      query: (courseId) => `/courses/${courseId}/`,
      providesTags: (_result, _error, courseId) => [{ type: 'Course', id: courseId }],
    }),

    // Get user enrolled courses
    getUserEnrolledCourses: builder.query<{message: string, data: Course[]}, string>({
      query: (userId) => `/courses/users/${userId}/enrolled/`,
      providesTags: ['Course'],
    }),

    // Get all courses with detailed enrollment data
    getCoursesWithEnrollments: builder.query<{message: string, data: Course[]}, void>({
      queryFn: async (_, _queryApi, __, baseQuery) => {
        try {
          // First get all courses
          const coursesResult = await baseQuery('/courses/');
          if (coursesResult.error) return { error: coursesResult.error };
          
          const coursesData = coursesResult.data as {message: string, data: Course[]};
          
          // Then get detailed info for each course to get enrollments
          const detailedCourses = await Promise.all(
            coursesData.data.map(async (course) => {
              const detailResult = await baseQuery(`/courses/${course.courseId}/`);
              if (detailResult.error) return course; // Return basic course if detail fails
              
              const detailData = detailResult.data as {message: string, data: Course};
              return detailData.data;
            })
          );
          
          return {
            data: {
              message: 'Cursos com dados de inscrição recuperados',
              data: detailedCourses
            }
          };
        } catch (error) {
          return { error: { status: 500, data: { message: 'Error fetching courses with enrollments' } } };
        }
      },
      providesTags: ['Course'],
    }),

    // Get user progress in specific course
    getUserCourseProgress: builder.query<{message: string, data: UserCourseProgress}, {userId: string, courseId: string}>({
      query: ({userId, courseId}) => `/courses/users/${userId}/progress/${courseId}/`,
      providesTags: ['UserProgress'],
    }),

    // Update user progress
    updateUserCourseProgress: builder.mutation<{message: string, data: UserCourseProgress}, {userId: string, courseId: string, data: Partial<UserCourseProgress>}>({
      query: ({userId, courseId, data}) => ({
        url: `/courses/users/${userId}/progress/${courseId}/update/`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({userId, courseId, data}, {dispatch, queryFulfilled}) {
        // Optimistic update
        const patchResult = dispatch(
          coursesApiSlice.util.updateQueryData('getUserCourseProgress', {userId, courseId}, (draft) => {
            // Update the sections data optimistically
            if (data.sections && draft.data) {
              data.sections.forEach((sectionUpdate: any) => {
                const existingSection = draft.data.sections.find((s: any) => s.sectionId === sectionUpdate.sectionId);
                if (existingSection && sectionUpdate.chapters) {
                  sectionUpdate.chapters.forEach((chapterUpdate: any) => {
                    const existingChapter = existingSection.chapters.find((c: any) => c.chapterId === chapterUpdate.chapterId);
                    if (existingChapter) {
                      existingChapter.completed = chapterUpdate.completed;
                    } else {
                      // Add new chapter progress if it doesn't exist
                      existingSection.chapters.push({
                        chapterId: chapterUpdate.chapterId,
                        completed: chapterUpdate.completed
                      });
                    }
                  });
                }
              });
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, {courseId}) => [
        'UserProgress',
        { type: 'Course', id: courseId },
        'Course'
      ],
    }),

    // Create course enrollment (purchase)
    createCourseEnrollment: builder.mutation<{message: string, data: {transaction: any, courseProgress: UserCourseProgress}}, {courseId: string, transactionId: string, amount: number}>({
      query: (data) => ({
        url: '/courses/transactions/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Course', 'UserProgress'],
    }),

    // Get Stripe payment intent
    createStripePaymentIntent: builder.mutation<{message: string, data: {clientSecret: string}}, {amount: number}>({
      query: (data) => ({
        url: '/courses/payments/stripe/intent/',
        method: 'POST',
        body: data,
      }),
    }),

    // 🆕 PHASE 1 BRIDGE - Chapter Resources
    getChapterResources: builder.query<{message: string, data: ChapterResource[]}, string>({
      query: (chapterId) => `/courses/chapters/${chapterId}/resources/`,
      providesTags: (_result, _error, chapterId) => [{ type: 'ChapterResource', id: chapterId }],
    }),

    createChapterResource: builder.mutation<{message: string, data: ChapterResource}, {chapterId: string, resource: Omit<ChapterResource, 'id'>}>({
      query: ({chapterId, resource}) => ({
        url: `/courses/chapters/${chapterId}/resources/`,
        method: 'POST',
        body: resource,
      }),
      invalidatesTags: (_result, _error, {chapterId}) => [{ type: 'ChapterResource', id: chapterId }],
    }),

    updateChapterResource: builder.mutation<{message: string, data: ChapterResource}, {chapterId: string, resourceId: string, resource: Partial<ChapterResource>}>({
      query: ({chapterId, resourceId, resource}) => ({
        url: `/courses/chapters/${chapterId}/resources/${resourceId}/`,
        method: 'PUT',
        body: resource,
      }),
      invalidatesTags: (_result, _error, {chapterId}) => [{ type: 'ChapterResource', id: chapterId }],
    }),

    deleteChapterResource: builder.mutation<{message: string}, {chapterId: string, resourceId: string}>({
      query: ({chapterId, resourceId}) => ({
        url: `/courses/chapters/${chapterId}/resources/${resourceId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, {chapterId}) => [{ type: 'ChapterResource', id: chapterId }],
    }),

    // 🆕 PHASE 1 BRIDGE - Chapter Quiz
    getChapterQuiz: builder.query<{message: string, data: ChapterQuiz | null}, string>({
      query: (chapterId) => `/courses/chapters/${chapterId}/quiz/`,
      providesTags: (_result, _error, chapterId) => [{ type: 'ChapterQuiz', id: chapterId }],
    }),

    createChapterQuiz: builder.mutation<{message: string, data: ChapterQuiz}, {chapterId: string, quiz: Omit<ChapterQuiz, 'id'>}>({
      query: ({chapterId, quiz}) => ({
        url: `/courses/chapters/${chapterId}/quiz/`,
        method: 'POST',
        body: quiz,
      }),
      invalidatesTags: (_result, _error, {chapterId}) => [
        { type: 'ChapterQuiz', id: chapterId },
        { type: 'Course' } // Invalidate course to refresh chapter quiz_enabled
      ],
    }),

    updateChapterQuiz: builder.mutation<{message: string, data: ChapterQuiz}, {chapterId: string, quizId: string, quiz: Partial<ChapterQuiz>}>({
      query: ({chapterId, quizId, quiz}) => ({
        url: `/courses/chapters/${chapterId}/quiz/${quizId}/`,
        method: 'PUT',
        body: quiz,
      }),
      invalidatesTags: (_result, _error, {chapterId}) => [{ type: 'ChapterQuiz', id: chapterId }],
    }),

    deleteChapterQuiz: builder.mutation<{message: string}, {chapterId: string, quizId: string}>({
      query: ({chapterId, quizId}) => ({
        url: `/courses/chapters/${chapterId}/quiz/${quizId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, {chapterId}) => [
        { type: 'ChapterQuiz', id: chapterId },
        { type: 'Course' } // Invalidate course to refresh chapter quiz_enabled
      ],
    }),

    // 🆕 PHASE 1 BRIDGE - Quiz Attempts
    getQuizAttempts: builder.query<{message: string, data: StudentQuizAttempt[]}, string>({
      query: (chapterId) => `/courses/chapters/${chapterId}/quiz/attempts/`,
      providesTags: (_result, _error, chapterId) => [{ type: 'QuizAttempt', id: chapterId }],
    }),

    createQuizAttempt: builder.mutation<{message: string, data: StudentQuizAttempt}, {chapterId: string, attempt: Omit<StudentQuizAttempt, 'id' | 'student' | 'attempt_number'>}>({
      query: ({chapterId, attempt}) => ({
        url: `/courses/chapters/${chapterId}/quiz/attempts/`,
        method: 'POST',
        body: attempt,
      }),
      invalidatesTags: (_result, _error, {chapterId}) => [
        { type: 'QuizAttempt', id: chapterId },
        { type: 'ChapterQuiz', id: chapterId } // Update quiz statistics
      ],
    }),

    getQuizSummary: builder.query<{message: string, data: any}, string>({
      query: (chapterId) => `/courses/chapters/${chapterId}/quiz/summary/`,
      providesTags: (_result, _error, chapterId) => [{ type: 'QuizSummary', id: chapterId }],
    }),

    // 📹 VIDEO UPLOAD - Get presigned S3 URL from Django
    getVideoUploadUrl: builder.mutation<
      {message: string, data: {uploadUrl: string, videoUrl: string}}, 
      {courseId: string, sectionId: string, chapterId: string, fileName: string, fileType: string}
    >({
      query: ({courseId, sectionId, chapterId, fileName, fileType}) => ({
        url: `/courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-upload-url/`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileName,
          fileType: fileType
        }),
      }),
    }),

    // 🔄 UPDATE COURSE - Update course with sections and chapters
    updateCourse: builder.mutation<
      {message: string, data: Course}, 
      {courseId: string, courseData: any}
    >({
      query: ({courseId, courseData}) => ({
        url: `/courses/${courseId}/`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      }),
      invalidatesTags: (_result, _error, {courseId}) => [
        { type: 'Course', id: courseId },
        'Course'
      ],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetUserEnrolledCoursesQuery,
  useGetCoursesWithEnrollmentsQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation,
  useCreateCourseEnrollmentMutation,
  useCreateStripePaymentIntentMutation,
  
  // 🆕 PHASE 1 BRIDGE - New hooks
  useGetChapterResourcesQuery,
  useCreateChapterResourceMutation,
  useUpdateChapterResourceMutation,
  useDeleteChapterResourceMutation,
  useGetChapterQuizQuery,
  useCreateChapterQuizMutation,
  useUpdateChapterQuizMutation,
  useDeleteChapterQuizMutation,
  useGetQuizAttemptsQuery,
  useCreateQuizAttemptMutation,
  useGetQuizSummaryQuery,
  
  // 📹 VIDEO UPLOAD hooks
  useGetVideoUploadUrlMutation,
  
  // 🔄 COURSE UPDATE hooks
  useUpdateCourseMutation,
} = coursesApiSlice;