import { createApi } from '@reduxjs/toolkit/query/react';
import { sharedBaseQuery } from '../../../shared/api/baseQuery';
import {
  TeacherVideoCourse,
  CreateVideoCourseData,
  UpdateVideoCourseData,
  CourseSection,
  CreateSectionData,
  UpdateSectionData,
  CreateChapterData,
  UpdateChapterData,
  VideoUploadRequest,
  VideoUploadResponse,
  VideoCourseAnalytics,
  StudentVideoProgress,
} from '../types';

// Teacher Video Course API slice
export const teacherVideoCourseApiSlice = createApi({
  reducerPath: 'teacherVideoCourseApi',
  baseQuery: sharedBaseQuery,
  tagTypes: [
    'TeacherVideoCourse',
    'VideoSection',
    'VideoChapter',
    'VideoCourseAnalytics',
    'VideoEnrollment',
  ],
  endpoints: (builder) => ({
    
    // ===== VIDEO COURSE MANAGEMENT =====
    
    getAllTeacherCourses: builder.query<{ data: TeacherVideoCourse[] }, { category?: string }>({
      query: ({ category = 'all' } = {}) => {
        return {
          url: '/courses/',
          params: { 
            view_mode: 'teacher_courses',
            include_drafts: true, 
            course_type: 'video',
            page_size: 100, // Get up to 100 courses (enough for most teachers)
            ...(category !== 'all' ? { category } : {}) 
          },
        };
      },
      transformResponse: (response: any) => {
        console.log('🔍 API Response:', response);
        
        // Handle both paginated and non-paginated responses
        let courses = [];
        if (response?.data) {
          // If response.data is an array, it's a direct course list (teacher mode)
          if (Array.isArray(response.data)) {
            courses = response.data;
          } 
          // If response.data has results, it's paginated (public mode)
          else if (response.data.results) {
            courses = response.data.results;
          }
          
          console.log('🔍 Total courses from API:', courses.length);
          console.log('🔍 All courses teacher IDs:', courses.map((c: any) => ({
            title: c.title,
            teacherId: c.teacherId,
            teacher: c.teacher,
            id: c.id,
            courseId: c.courseId
          })));
          
          // Return normalized response format
          return {
            message: response.message,
            data: courses
          };
        }
        return response;
      },
      providesTags: ['TeacherVideoCourse'],
    }),

    getTeacherCourseById: builder.query<TeacherVideoCourse, string>({
      query: (courseId) => `/courses/${courseId}/`,
      providesTags: (result, error, courseId) => [
        { type: 'TeacherVideoCourse', id: courseId },
      ],
    }),

    createTeacherVideoCourse: builder.mutation<TeacherVideoCourse, CreateVideoCourseData>({
      query: (courseData) => ({
        url: '/courses/',
        method: 'POST',
        body: courseData,
      }),
      invalidatesTags: ['TeacherVideoCourse'],
    }),

    updateTeacherVideoCourse: builder.mutation<TeacherVideoCourse, UpdateVideoCourseData>({
      query: ({ courseId, ...data }) => ({
        url: `/courses/${courseId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'TeacherVideoCourse', id: courseId },
        'TeacherVideoCourse',
      ],
    }),

    deleteTeacherVideoCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeacherVideoCourse'],
    }),

    // ===== SECTION MANAGEMENT =====

    getCourseSections: builder.query<CourseSection[], string>({
      query: (courseId) => `/courses/${courseId}/sections/`,
      providesTags: (result, error, courseId) => [
        { type: 'VideoSection', id: courseId },
      ],
    }),

    createCourseSection: builder.mutation<CourseSection, CreateSectionData>({
      query: (sectionData) => ({
        url: '/sections/',
        method: 'POST',
        body: sectionData,
      }),
      invalidatesTags: (result, error, { course }) => [
        { type: 'VideoSection', id: course },
        { type: 'TeacherVideoCourse', id: course },
      ],
    }),

    updateCourseSection: builder.mutation<CourseSection, UpdateSectionData>({
      query: ({ sectionId, ...data }) => ({
        url: `/sections/${sectionId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['VideoSection'],
    }),

    deleteCourseSection: builder.mutation<void, string>({
      query: (sectionId) => ({
        url: `/sections/${sectionId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VideoSection', 'TeacherVideoCourse'],
    }),

    // ===== CHAPTER MANAGEMENT =====

    getSectionChapters: builder.query<any[], string>({
      query: (sectionId) => `/sections/${sectionId}/chapters/`,
      providesTags: (result, error, sectionId) => [
        { type: 'VideoChapter', id: sectionId },
      ],
    }),

    createChapter: builder.mutation<any, CreateChapterData>({
      query: (chapterData) => ({
        url: '/chapters/',
        method: 'POST',
        body: chapterData,
      }),
      invalidatesTags: (result, error, { section }) => [
        { type: 'VideoChapter', id: section },
        { type: 'VideoSection', id: section },
      ],
    }),

    updateChapter: builder.mutation<any, UpdateChapterData>({
      query: ({ chapterId, ...data }) => ({
        url: `/chapters/${chapterId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['VideoChapter'],
    }),

    deleteChapter: builder.mutation<void, string>({
      query: (chapterId) => ({
        url: `/chapters/${chapterId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VideoChapter', 'VideoSection'],
    }),

    // ===== VIDEO UPLOAD =====

    getVideoUploadUrl: builder.mutation<VideoUploadResponse, VideoUploadRequest>({
      query: ({ courseId, chapterId, sectionId, fileName, fileType }) => ({
        url: `/courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-upload-url/`,
        method: 'POST',
        body: { fileName, fileType },
      }),
    }),

    // ===== ANALYTICS =====

    getVideoCourseAnalytics: builder.query<VideoCourseAnalytics, string>({
      query: (courseId) => `/courses/${courseId}/analytics/`,
      providesTags: (result, error, courseId) => [
        { type: 'VideoCourseAnalytics', id: courseId },
      ],
    }),

    getVideoEnrollments: builder.query<StudentVideoProgress[], string>({
      query: (courseId) => `/courses/${courseId}/enrollments/`,
      providesTags: ['VideoEnrollment'],
    }),

    // ===== COURSE PUBLISHING =====

    publishVideoCourse: builder.mutation<TeacherVideoCourse, { courseId: string; publish: boolean }>({
      query: ({ courseId, publish }) => ({
        url: `/courses/${courseId}/`,
        method: 'PATCH',
        body: { status: publish ? 'Published' : 'Draft' },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'TeacherVideoCourse', id: courseId },
        'TeacherVideoCourse',
      ],
    }),

  }),
});

// Export hooks
export const {
  // Course management
  useGetAllTeacherCoursesQuery,
  useGetTeacherCourseByIdQuery,
  useCreateTeacherVideoCourseMutation,
  useUpdateTeacherVideoCourseMutation,
  useDeleteTeacherVideoCourseMutation,
  
  // Section management
  useGetCourseSectionsQuery,
  useCreateCourseSectionMutation,
  useUpdateCourseSectionMutation,
  useDeleteCourseSectionMutation,
  
  // Chapter management
  useGetSectionChaptersQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  
  // Video upload
  useGetVideoUploadUrlMutation,
  
  // Analytics
  useGetVideoCourseAnalyticsQuery,
  useGetVideoEnrollmentsQuery,
  
  // Publishing
  usePublishVideoCourseMutation,
  
} = teacherVideoCourseApiSlice;