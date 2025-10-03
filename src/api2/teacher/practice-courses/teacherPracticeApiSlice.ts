import { createApi } from '@reduxjs/toolkit/query/react';
import { sharedBaseQuery } from '../../shared/baseQuery';

// Types for Practice Management (copied from working implementation)
export interface PracticeCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  course_type: string;
  units_count?: number;
  lessons_count?: number;
  challenges_count?: number;
  total_progress?: number;
  created_at: string;
  updated_at: string;
  teacher?: string;
  teacher_id?: string;
  teacher_email?: string;
  teacher_name?: string;
  // Additional properties for UI compatibility
  units?: number;
  lessons?: number;
  challenges?: number;
  students?: number;
  completionRate?: number;
}

export interface PracticeUnit {
  id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  lessons?: PracticeLesson[];
}

export interface CourseUnitsResponse {
  course: PracticeCourse;
  units: PracticeUnit[];
}

export interface PracticeLesson {
  id: string;
  unit: string;
  title: string;
  order: number;
  challenges?: PracticeCourse[];
}

export interface PracticeChallenge {
  id: string;
  lesson: string;
  type: string;
  question: string;
  order: number;
  options?: CourseOption[];
}

export interface CourseOption {
  id?: string;
  text: string;
  is_correct: boolean;
  image_url?: string;
  audio_url?: string;
  order: number;
}

export interface CreatePracticeCourseData {
  title: string;
  description: string;
  category: string;
  level: string;
  template?: string;
  teacher_id?: string;
  teacher_email?: string;
  teacher_name?: string;
  course_type?: string;
  status?: string;
  created_by?: string;
  language?: string;
  difficulty_level?: string;
  learningObjectives?: string[];
  targetAudience?: string;
  hearts?: number;
  pointsPerCourse?: number;
  passingScore?: number;
}

export interface CreatePracticeUnitData {
  course: string;
  title: string;
  description: string;
  order: number;
}

export interface CreatePracticeLessonData {
  unit: string;
  title: string;
  order: number;
}

export interface CreatePracticeChallengeData {
  lesson: string;
  type: string;
  question: string;
  order: number;
  options: Array<{
    text: string;
    is_correct: boolean;
    image_url?: string;
    audio_url?: string;
    order: number;
  }>;
}

export interface Analytics {
  total_students: number;
  total_courses: number;
  total_challenges: number;
  avg_completion_rate: number;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  student_name: string;
  name: string;
  email: string;
  course_id: string;
  course_name: string;
  active_course: string;
  progress_percentage: number;
  last_activity: string;
  total_points: number;
  hearts: number;
  completed_lessons: number;
  total_lessons: number;
  average_accuracy: number;
}

export interface PracticeAnalytics {
  total_students: number;
  total_courses: number;
  total_challenges: number;
  avg_completion_rate: number;
}

// Teacher Practice API (copied from working implementation)
export const teacherPracticeApiSlice = createApi({
  reducerPath: 'teacherPracticeApi',
  baseQuery: sharedBaseQuery,
  tagTypes: ['Course', 'CourseUnits', 'LessonDetail', 'Analytics', 'UserProgress'],
  endpoints: (builder) => ({
    // Course Management
    getTeacherCourses: builder.query<PracticeCourse[], { includeDrafts?: boolean }>({
      query: ({ includeDrafts = true } = {}) => ({
        url: '/practice/courses/?include_drafts=true&course_type=practice&include_stats=true',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['Course'],
    }),

    getPracticeCourseById: builder.query<PracticeCourse, string>({
      query: (courseId) => {
        console.log('🎯 CORRECT API: Fetching practice course by ID:', courseId);
        console.log('🎯 CORRECT API: URL will be:', `/practice/courses/${courseId}/units-with-progress/`);
        return {
          url: `/practice/courses/${courseId}/units-with-progress/`,
          method: 'GET',
          credentials: 'include' as const,
        };
      },
      transformResponse: (response: any) => {
        console.log('🔍 API Response structure:', response);
        // If response has nested course data, extract it
        if (response?.course) {
          return response.course;
        }
        // Otherwise return the response as is
        return response;
      },
      providesTags: (result, error, courseId) => [
        { type: 'Course', id: courseId },
      ],
    }),

    createTeacherCourse: builder.mutation<PracticeCourse, CreatePracticeCourseData>({
      query: (courseData) => ({
        url: '/practice/courses/create/',
        method: 'POST',
        credentials: 'include' as const,
        body: {
          ...courseData,
          status: courseData.status || 'draft',
          course_type: courseData.course_type || 'practice',
        },
      }),
      invalidatesTags: ['Course'],
    }),

    updatePracticeCourse: builder.mutation<
      PracticeCourse,
      { courseId: string; data: Partial<CreatePracticeCourseData> }
    >({
      query: ({ courseId, data }) => {
        console.log('🔧 UPDATE API - Tentando POST no endpoint base:', {
          courseId,
          data: JSON.stringify(data, null, 2),
          url: `/practice/courses/${courseId}/`,
          method: 'POST',
          body: data
        });
        return {
          url: `/practice/courses/${courseId}/`,
          method: 'POST',
          credentials: 'include' as const,
          body: data,
        };
      },
      transformErrorResponse: (response: any) => {
        console.error('❌ UPDATE API - Error response:', JSON.stringify(response, null, 2));
        console.error('❌ UPDATE API - Error status:', response.status);
        console.error('❌ UPDATE API - Error data:', JSON.stringify(response.data, null, 2));
        return response;
      },
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Course', id: courseId },
        'Course',
      ],
    }),

    publishTeacherCourse: builder.mutation<
      PracticeCourse,
      { courseId: string; publish: boolean }
    >({
      query: ({ courseId, publish }) => ({
        url: `/practice/courses/${courseId}/`,
        method: 'PUT',
        credentials: 'include' as const,
        body: {
          action: publish ? 'publish' : 'unpublish',
        },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Course', id: courseId },
        'Course',
      ],
    }),

    deleteTeacherCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/practice/courses/${courseId}/`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
      invalidatesTags: ['Course'],
    }),

    // Unit Management
    getCourseUnits: builder.query<CourseUnitsResponse, string>({
      query: (courseId) => ({
        url: `/practice/courses/${courseId}/units-with-progress/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result, error, courseId) => [
        { type: 'CourseUnits', id: courseId },
      ],
    }),

    createTeacherUnit: builder.mutation<PracticeUnit, CreatePracticeUnitData>({
      query: (unitData) => ({
        url: '/practice/units/',
        method: 'POST',
        credentials: 'include' as const,
        body: unitData,
      }),
      invalidatesTags: (result, error, { course }) => [
        { type: 'CourseUnits', id: course },
        'CourseUnits', // Invalidate all CourseUnits queries
        'Course',
      ],
    }),

    updateTeacherUnit: builder.mutation<
      PracticeUnit,
      { unitId: string; data: Partial<CreatePracticeUnitData> }
    >({
      query: ({ unitId, data }) => ({
        url: `/practice/units/${unitId}/`,
        method: 'PATCH',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: (result, error, { unitId }) => [
        { type: 'CourseUnits', id: unitId },
        'Course',
      ],
    }),

    deleteTeacherUnit: builder.mutation<void, string>({
      query: (unitId) => ({
        url: `/practice/units/${unitId}/`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
      invalidatesTags: ['CourseUnits', 'Course'],
    }),

    // Lesson Management
    getUnitLessons: builder.query<PracticeLesson[], string>({
      query: (unitId) => ({
        url: `/practice/units/${unitId}/lessons/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result, error, unitId) => [
        { type: 'LessonDetail', id: unitId },
      ],
    }),

    createTeacherLesson: builder.mutation<PracticeLesson, CreatePracticeLessonData>({
      query: (lessonData) => ({
        url: '/practice/lessons/',
        method: 'POST',
        credentials: 'include' as const,
        body: lessonData,
      }),
      invalidatesTags: (result, error, { unit }) => [
        { type: 'LessonDetail', id: unit },
        'CourseUnits', // This will invalidate all CourseUnits queries
        'Course', // Also invalidate Course queries for good measure
      ],
    }),

    updateTeacherLesson: builder.mutation<
      PracticeLesson,
      { lessonId: string; data: Partial<CreatePracticeLessonData> }
    >({
      query: ({ lessonId, data }) => ({
        url: `/practice/lessons/${lessonId}/`,
        method: 'PATCH',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: (result, error, { lessonId }) => [
        { type: 'LessonDetail', id: lessonId },
        'CourseUnits',
      ],
    }),

    deleteTeacherLesson: builder.mutation<void, string>({
      query: (lessonId) => ({
        url: `/practice/lessons/${lessonId}/`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
      invalidatesTags: ['LessonDetail', 'CourseUnits'],
    }),

    getPracticeLessonDetails: builder.query<PracticeLesson, string>({
      query: (lessonId) => ({
        url: `/practice/lessons/${lessonId}/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result, error, lessonId) => [
        { type: 'LessonDetail', id: lessonId },
      ],
    }),

    // Challenge Management
    getLessonChallenges: builder.query<PracticeChallenge[], string>({
      query: (lessonId) => ({
        url: `/practice/lessons/${lessonId}/`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      transformResponse: (response: any) => response.challenges || [],
      providesTags: (result, error, lessonId) => [
        { type: 'LessonDetail', id: lessonId },
      ],
    }),

    createTeacherChallenge: builder.mutation<PracticeChallenge, CreatePracticeChallengeData>({
      query: ({ options, ...challengeData }) => ({
        url: '/practice/challenges/',
        method: 'POST',
        credentials: 'include' as const,
        body: challengeData,
      }),
      invalidatesTags: (result, error, { lesson }) => [
        { type: 'LessonDetail', id: lesson },
        'Course',
      ],
    }),

    updateTeacherChallenge: builder.mutation<
      PracticeChallenge,
      { challengeId: string; data: Partial<CreatePracticeChallengeData> }
    >({
      query: ({ challengeId, data }) => ({
        url: `/practice/challenges/${challengeId}/`,
        method: 'PATCH',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: (result, error, { challengeId }) => [
        { type: 'Course', id: challengeId },
      ],
    }),

    deleteTeacherChallenge: builder.mutation<void, string>({
      query: (challengeId) => ({
        url: `/practice/challenges/${challengeId}/`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
      invalidatesTags: ['Course', 'LessonDetail'],
    }),

    // Analytics
    getCourseAnalytics: builder.query<PracticeAnalytics, string>({
      query: (courseId) => ({
        url: `/practice/analytics/?course=${courseId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result, error, courseId) => [
        { type: 'Analytics', id: courseId },
      ],
    }),

    getStudentProgressList: builder.query<StudentProgress[], string>({
      query: (courseId) => ({
        url: `/practice/student-progress/?course=${courseId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['UserProgress'],
    }),

    getTeacherDashboard: builder.query<PracticeAnalytics, void>({
      query: () => ({
        url: '/practice/analytics/',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: ['Analytics'],
    }),

    // File Upload Helpers
    getAudioUploadUrl: builder.mutation<
      { uploadUrl: string; audioUrl: string },
      { lessonId: string; challengeId: string; fileName: string; fileType: string }
    >({
      query: ({ challengeId, ...payload }) => ({
        url: `/practice/challenges/${challengeId}/get-audio-upload-url/`,
        method: 'POST',
        credentials: 'include' as const,
        body: payload,
      }),
    }),

    getImageUploadUrl: builder.mutation<
      { uploadUrl: string; imageUrl: string },
      { lessonId: string; challengeId: string; fileName: string; fileType: string }
    >({
      query: ({ challengeId, ...payload }) => ({
        url: `/practice/challenges/${challengeId}/get-image-upload-url/`,
        method: 'POST',
        credentials: 'include' as const,
        body: payload,
      }),
    }),

    updateChallengeOption: builder.mutation<
      CourseOption,
      { optionId: string; data: { audioSrc?: string; imageSrc?: string } }
    >({
      query: ({ optionId, data }) => ({
        url: `/practice/challenge-options/${optionId}/`,
        method: 'PATCH',
        credentials: 'include' as const,
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),

    // AI Functions
    validateTranslationWithAI: builder.mutation<
      any,
      {
        sourceText: string;
        userTranslation: string;
        challengeId?: string;
        difficultyLevel?: string;
      }
    >({
      query: (payload) => ({
        url: '/practice/validate-ai-translation/',
        method: 'POST',
        credentials: 'include' as const,
        body: {
          source_text: payload.sourceText,
          user_translation: payload.userTranslation,
          challenge_id: payload.challengeId,
          difficulty_level: payload.difficultyLevel || 'intermediate',
        },
      }),
    }),

    generateTranslationSuggestions: builder.mutation<
      any,
      { sourceText: string; difficultyLevel?: string; count?: number }
    >({
      query: (payload) => ({
        url: '/practice/generate-translation-suggestions/',
        method: 'POST',
        credentials: 'include' as const,
        body: {
          source_text: payload.sourceText,
          difficulty_level: payload.difficultyLevel || 'intermediate',
          count: payload.count || 3,
        },
      }),
    }),

    // Note: For file uploads like pronunciation analysis, you'll need custom fetch
    // since RTK Query doesn't handle FormData well
  }),
});

// Export hooks (using the exact same names from working implementation)
export const {
  useGetTeacherCoursesQuery,
  useGetPracticeCourseByIdQuery,
  useCreateTeacherCourseMutation,
  useUpdatePracticeCourseMutation,
  usePublishTeacherCourseMutation,
  useDeleteTeacherCourseMutation,
  useGetCourseUnitsQuery,
  useCreateTeacherUnitMutation,
  useUpdateTeacherUnitMutation,
  useDeleteTeacherUnitMutation,
  useGetUnitLessonsQuery,
  useCreateTeacherLessonMutation,
  useUpdateTeacherLessonMutation,
  useDeleteTeacherLessonMutation,
  useGetPracticeLessonDetailsQuery,
  useGetLessonChallengesQuery,
  useCreateTeacherChallengeMutation,
  useUpdateTeacherChallengeMutation,
  useDeleteTeacherChallengeMutation,
  useGetCourseAnalyticsQuery,
  useGetStudentProgressListQuery,
  useGetTeacherDashboardQuery,
  useGetAudioUploadUrlMutation,
  useGetImageUploadUrlMutation,
  useUpdateChallengeOptionMutation,
  useValidateTranslationWithAIMutation,
  useGenerateTranslationSuggestionsMutation,
} = teacherPracticeApiSlice;