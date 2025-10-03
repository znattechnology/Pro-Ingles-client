import { createApi } from '@reduxjs/toolkit/query/react';
import { sharedBaseQuery } from '../../shared/baseQuery';
import {
  StudentVideoCourse,
  CourseEnrollment,
  StudentCourseProgress,
  VideoProgressUpdate,
  ChapterCompletion,
  CourseEnrollmentRequest,
  CourseSearchParams,
  CourseReview,
  CreateReviewData,
  StudentVideoAnalytics,
  CourseCertificate,
  CourseRecommendation,
  StudentNote,
  StudentBookmark,
} from './studentVideoCourseTypes';

// Student Video Course API slice
export const studentVideoCourseApiSlice = createApi({
  reducerPath: 'studentVideoCourseApi',
  baseQuery: sharedBaseQuery,
  tagTypes: [
    'StudentVideoCourse',
    'CourseEnrollment',
    'VideoProgress',
    'CourseReview',
    'StudentVideoAnalytics',
    'CourseCertificate',
    'CourseRecommendation',
    'StudentNote',
    'StudentBookmark',
  ],
  endpoints: (builder) => ({
    
    // ===== COURSE DISCOVERY =====
    
    getAvailableVideoCourses: builder.query<{ data: StudentVideoCourse[]; total: number }, CourseSearchParams>({
      query: (params = {}) => ({
        url: '/courses/',
        params: {
          ...params,
          status: 'Published', // Only published courses for students
        },
      }),
      providesTags: ['StudentVideoCourse'],
    }),

    getVideoCourseById: builder.query<StudentVideoCourse, string>({
      query: (courseId) => `/courses/${courseId}/`,
      providesTags: (result, error, courseId) => [
        { type: 'StudentVideoCourse', id: courseId },
      ],
    }),

    getFeaturedVideoCourses: builder.query<StudentVideoCourse[], void>({
      query: () => ({
        url: '/courses/featured/',
      }),
      providesTags: ['StudentVideoCourse'],
    }),

    getPopularVideoCourses: builder.query<StudentVideoCourse[], { limit?: number }>({
      query: ({ limit = 10 } = {}) => ({
        url: '/courses/popular/',
        params: { limit },
      }),
      providesTags: ['StudentVideoCourse'],
    }),

    searchVideoCourses: builder.query<{ data: StudentVideoCourse[]; total: number }, { query: string; filters?: CourseSearchParams }>({
      query: ({ query, filters = {} }) => ({
        url: '/courses/search/',
        params: {
          q: query,
          ...filters,
        },
      }),
      providesTags: ['StudentVideoCourse'],
    }),

    // ===== COURSE ENROLLMENT =====
    
    enrollInVideoCourse: builder.mutation<CourseEnrollment, CourseEnrollmentRequest>({
      query: (enrollmentData) => ({
        url: '/enrollments/',
        method: 'POST',
        body: enrollmentData,
      }),
      invalidatesTags: ['CourseEnrollment', 'StudentVideoCourse', 'StudentVideoAnalytics'],
    }),

    getMyVideoEnrollments: builder.query<CourseEnrollment[], void>({
      query: () => '/enrollments/',
      providesTags: ['CourseEnrollment'],
    }),

    getVideoCourseEnrollment: builder.query<CourseEnrollment, string>({
      query: (courseId) => `/enrollments/course/${courseId}/`,
      providesTags: (result, error, courseId) => [
        { type: 'CourseEnrollment', id: courseId },
      ],
    }),

    // ===== COURSE PROGRESS =====
    
    getVideoCourseProgress: builder.query<StudentCourseProgress, string>({
      query: (courseId) => `/courses/${courseId}/progress/`,
      providesTags: (result, error, courseId) => [
        { type: 'VideoProgress', id: courseId },
      ],
    }),

    updateVideoProgress: builder.mutation<StudentCourseProgress, VideoProgressUpdate>({
      query: ({ chapterId, ...data }) => ({
        url: `/chapters/${chapterId}/progress/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VideoProgress', 'StudentVideoAnalytics'],
      // Optimistic update
      async onQueryStarted({ chapterId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Could update local progress here
        } catch {
          // Handle error
        }
      },
    }),

    markChapterComplete: builder.mutation<any, ChapterCompletion>({
      query: (data) => ({
        url: '/chapters/complete/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VideoProgress', 'CourseEnrollment', 'StudentVideoAnalytics'],
    }),

    // ===== COURSE CONTENT =====
    
    getVideoCourseSections: builder.query<any[], string>({
      query: (courseId) => `/courses/${courseId}/sections/`,
      providesTags: (result, error, courseId) => [
        { type: 'StudentVideoCourse', id: courseId },
      ],
    }),

    getSectionChapters: builder.query<any[], string>({
      query: (sectionId) => `/sections/${sectionId}/chapters/`,
      providesTags: ['StudentVideoCourse'],
    }),

    getChapterDetail: builder.query<any, string>({
      query: (chapterId) => `/chapters/${chapterId}/`,
      providesTags: ['StudentVideoCourse'],
    }),

    // ===== NOTES & BOOKMARKS =====
    
    getCourseNotes: builder.query<StudentNote[], string>({
      query: (courseId) => `/courses/${courseId}/notes/`,
      providesTags: ['StudentNote'],
    }),

    createNote: builder.mutation<StudentNote, Omit<StudentNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
      query: (noteData) => ({
        url: '/notes/',
        method: 'POST',
        body: noteData,
      }),
      invalidatesTags: ['StudentNote'],
    }),

    updateNote: builder.mutation<StudentNote, { noteId: string; data: Partial<StudentNote> }>({
      query: ({ noteId, data }) => ({
        url: `/notes/${noteId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['StudentNote'],
    }),

    deleteNote: builder.mutation<void, string>({
      query: (noteId) => ({
        url: `/notes/${noteId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentNote'],
    }),

    getCourseBookmarks: builder.query<StudentBookmark[], string>({
      query: (courseId) => `/courses/${courseId}/bookmarks/`,
      providesTags: ['StudentBookmark'],
    }),

    createBookmark: builder.mutation<StudentBookmark, Omit<StudentBookmark, 'id' | 'userId' | 'createdAt'>>({
      query: (bookmarkData) => ({
        url: '/bookmarks/',
        method: 'POST',
        body: bookmarkData,
      }),
      invalidatesTags: ['StudentBookmark'],
    }),

    deleteBookmark: builder.mutation<void, string>({
      query: (bookmarkId) => ({
        url: `/bookmarks/${bookmarkId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentBookmark'],
    }),

    // ===== REVIEWS & RATINGS =====
    
    getCourseReviews: builder.query<{ data: CourseReview[]; average: number; total: number }, { courseId: string; page?: number }>({
      query: ({ courseId, page = 1 }) => ({
        url: `/courses/${courseId}/reviews/`,
        params: { page },
      }),
      providesTags: ['CourseReview'],
    }),

    createCourseReview: builder.mutation<CourseReview, CreateReviewData>({
      query: (reviewData) => ({
        url: '/reviews/',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['CourseReview', 'StudentVideoCourse'],
    }),

    updateCourseReview: builder.mutation<CourseReview, { reviewId: string; data: Partial<CreateReviewData> }>({
      query: ({ reviewId, data }) => ({
        url: `/reviews/${reviewId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['CourseReview'],
    }),

    deleteCourseReview: builder.mutation<void, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CourseReview'],
    }),

    // ===== CERTIFICATES =====
    
    getMyCertificates: builder.query<CourseCertificate[], void>({
      query: () => '/certificates/',
      providesTags: ['CourseCertificate'],
    }),

    getCourseCertificate: builder.query<CourseCertificate, string>({
      query: (courseId) => `/courses/${courseId}/certificate/`,
      providesTags: (result, error, courseId) => [
        { type: 'CourseCertificate', id: courseId },
      ],
    }),

    generateCertificate: builder.mutation<CourseCertificate, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/generate-certificate/`,
        method: 'POST',
      }),
      invalidatesTags: ['CourseCertificate', 'StudentVideoAnalytics'],
    }),

    // ===== RECOMMENDATIONS =====
    
    getCourseRecommendations: builder.query<CourseRecommendation[], { courseId?: string; limit?: number }>({
      query: ({ courseId, limit = 5 } = {}) => ({
        url: '/courses/recommendations/',
        params: { courseId, limit },
      }),
      providesTags: ['CourseRecommendation'],
    }),

    // ===== ANALYTICS =====
    
    getStudentVideoAnalytics: builder.query<StudentVideoAnalytics, void>({
      query: () => '/analytics/video-learning/',
      providesTags: ['StudentVideoAnalytics'],
    }),

    updateLearningGoals: builder.mutation<any, { daily?: number; weekly?: number }>({
      query: (goals) => ({
        url: '/analytics/learning-goals/',
        method: 'POST',
        body: goals,
      }),
      invalidatesTags: ['StudentVideoAnalytics'],
    }),

    // ===== WISHLIST =====
    
    getWishlist: builder.query<StudentVideoCourse[], void>({
      query: () => '/wishlist/',
      providesTags: ['StudentVideoCourse'],
    }),

    addToWishlist: builder.mutation<void, string>({
      query: (courseId) => ({
        url: '/wishlist/',
        method: 'POST',
        body: { courseId },
      }),
      invalidatesTags: ['StudentVideoCourse'],
    }),

    removeFromWishlist: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/wishlist/${courseId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentVideoCourse'],
    }),

  }),
});

// Export hooks
export const {
  // Course discovery
  useGetAvailableVideoCoursesQuery,
  useGetVideoCourseByIdQuery,
  useGetFeaturedVideoCoursesQuery,
  useGetPopularVideoCoursesQuery,
  useSearchVideoCoursesQuery,
  
  // Enrollment
  useEnrollInVideoCourseMutation,
  useGetMyVideoEnrollmentsQuery,
  useGetVideoCourseEnrollmentQuery,
  
  // Progress
  useGetVideoCourseProgressQuery,
  useUpdateVideoProgressMutation,
  useMarkChapterCompleteMutation,
  
  // Content
  useGetVideoCourseSectionsQuery,
  useGetSectionChaptersQuery,
  useGetChapterDetailQuery,
  
  // Notes & Bookmarks
  useGetCourseNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetCourseBookmarksQuery,
  useCreateBookmarkMutation,
  useDeleteBookmarkMutation,
  
  // Reviews
  useGetCourseReviewsQuery,
  useCreateCourseReviewMutation,
  useUpdateCourseReviewMutation,
  useDeleteCourseReviewMutation,
  
  // Certificates
  useGetMyCertificatesQuery,
  useGetCourseCertificateQuery,
  useGenerateCertificateMutation,
  
  // Recommendations
  useGetCourseRecommendationsQuery,
  
  // Analytics
  useGetStudentVideoAnalyticsQuery,
  useUpdateLearningGoalsMutation,
  
  // Wishlist
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  
} = studentVideoCourseApiSlice;