import { apiSlice } from '@/redux/features/api/apiSlice';

// Types for Student Progress Management
export interface UserProgress {
  id: string;
  user_id: string;
  active_course: Course;
  hearts: number;
  points: number;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
  practice_units?: any[];
  total_lessons?: number;
  course_type?: string;
  status?: string;
}

export interface UpdateUserProgressData {
  active_course: Course;
}

export interface ReduceHeartsData {
  challenge_id: string;
}

export interface ReduceHeartsResponse {
  hearts: number;
  message: string;
}

export interface ReduceHeartsError {
  error: 'hearts' | 'practice' | string;
  message?: string;
}

// Student Progress API
export const studentProgressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user progress
    getUserProgress: builder.query<UserProgress, void>({
      query: () => ({
        url: '/practice/user-progress/',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['UserProgress'],
    }),

    // Update user's active course (replaces upsertUserProgress)
    updateUserProgress: builder.mutation<UserProgress, UpdateUserProgressData>({
      query: (data) => ({
        url: '/practice/user-progress/',
        method: 'PUT',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    // Update user's active course by course ID (alternative method)
    updateActiveCourse: builder.mutation<UserProgress, string>({
      query: (courseId) => ({
        url: '/practice/user-progress/set-active-course/',
        method: 'POST',
        credentials: 'include' as const,
        body: { course_id: courseId },
      }),
      invalidatesTags: ['UserProgress'],
    }),

    // Reduce user hearts when they get an answer wrong
    reduceHearts: builder.mutation<ReduceHeartsResponse, ReduceHeartsData>({
      query: (data) => ({
        url: '/practice/reduce-hearts/',
        method: 'POST',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    // Get all available courses for user selection
    getAvailableCourses: builder.query<Course[], void>({
      query: () => ({
        url: '/practice/courses/',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['Course'],
    }),

    // Get user's completed lessons
    getUserCompletedLessons: builder.query<any[], void>({
      query: () => ({
        url: '/practice/user-progress/completed-lessons/',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['UserProgress'],
    }),

    // Mark lesson as completed
    markLessonCompleted: builder.mutation<any, { lesson_id: string; score?: number }>({
      query: (data) => ({
        url: '/practice/user-progress/complete-lesson/',
        method: 'POST',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    // Add points to user
    addPoints: builder.mutation<any, { points: number; source?: string }>({
      query: (data) => ({
        url: '/practice/user-progress/add-points/',
        method: 'POST',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    // Restore hearts (e.g., after watching ad or daily reset)
    restoreHearts: builder.mutation<any, { hearts?: number }>({
      query: (data = {}) => ({
        url: '/practice/user-progress/restore-hearts/',
        method: 'POST',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    // Challenge Progress endpoints
    updateChallengeProgress: builder.mutation<any, { challenge_id: string; [key: string]: any }>({
      query: (data) => ({
        url: '/practice/challenge-progress/',
        method: 'PUT',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    getChallengeProgress: builder.query<any, string>({
      query: (challengeId) => ({
        url: `/practice/challenge-progress/${challengeId}/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['UserProgress'],
    }),

    resetChallengeProgress: builder.mutation<any, string>({
      query: (challengeId) => ({
        url: `/practice/challenge-progress/${challengeId}/reset/`,
        method: 'POST',
        credentials: 'include' as const,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    // Additional endpoints for compatibility
    getLesson: builder.query<any, string>({
      query: (lessonId) => ({
        url: `/practice/lessons/${lessonId}/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['LessonDetail'],
    }),

    getCourseUnits: builder.query<any, string>({
      query: (courseId) => ({
        url: `/practice/courses/${courseId}/units/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['CourseUnits'],
    }),

    getCourseProgress: builder.query<any, string>({
      query: (courseId) => ({
        url: `/practice/courses/${courseId}/progress/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['UserProgress'],
    }),

    getLessonProgress: builder.query<any, string>({
      query: (lessonId) => ({
        url: `/practice/lessons/${lessonId}/progress/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['UserProgress'],
    }),

    getCourseDetails: builder.query<any, string>({
      query: (courseId) => ({
        url: `/practice/courses/${courseId}/details/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['Course'],
    }),
  }),
});

// Export hooks
export const {
  useGetUserProgressQuery,
  useUpdateUserProgressMutation,
  useUpdateActiveCourseMutation,
  useReduceHeartsMutation,
  useGetAvailableCoursesQuery,
  useGetUserCompletedLessonsQuery,
  useMarkLessonCompletedMutation,
  useAddPointsMutation,
  useRestoreHeartsMutation,
  useUpdateChallengeProgressMutation,
  useGetChallengeProgressQuery,
  useResetChallengeProgressMutation,
  useGetLessonQuery,
  useGetCourseUnitsQuery,
  useGetCourseProgressQuery,
  useGetLessonProgressQuery,
  useGetCourseDetailsQuery,
} = studentProgressApi;