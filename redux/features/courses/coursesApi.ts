import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from '../api/baseQueryWithReauth';

// Types - Match the global Course interface
export interface Course {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  category: string;
  price?: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Draft' | 'Published' | 'Archived';
  teacher: string;
  teacherId: string;
  teacherName: string;
  image?: string;
  created_at: string;
  updated_at: string;
  sections?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseCreateData {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  status?: 'Draft' | 'Published' | 'Archived';
}

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: createBaseQueryWithReauth(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/courses/`),
  tagTypes: ['Course'],
  endpoints: (builder) => ({
    createCourse: builder.mutation<Course, Partial<CourseCreateData>>({
      query: (data = {}) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { message: string; data: Course }) => {
        const course = response.data;
        // Ensure backward compatibility by setting id to courseId (since API returns courseId)
        return {
          ...course,
          id: course.courseId, // Set id from courseId for compatibility
          createdAt: course.created_at,
          updatedAt: course.updated_at,
          sections: course.sections || []
        };
      },
      invalidatesTags: ['Course'],
    }),
    getAllCourses: builder.query<Course[], { category?: string }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add view_mode=teacher_courses to get only teacher's own courses
        searchParams.append('view_mode', 'teacher_courses');
        
        if (params.category && params.category !== 'all') {
          searchParams.append('category', params.category);
        }
        
        const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return {
          url: queryString,
          method: 'GET',
        };
      },
      transformResponse: (response: { message: string; data: Course[] }) => {
        const courses = response.data || [];
        // Ensure backward compatibility by setting id to courseId (since API returns courseId)
        return courses.map(course => ({
          ...course,
          id: course.courseId, // Set id from courseId for compatibility
          createdAt: course.created_at,
          updatedAt: course.updated_at,
          sections: course.sections || []
        }));
      },
      providesTags: ['Course'],
    }),
    deleteCourse: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    updateCourse: builder.mutation<Course, { id: string; data: Partial<Course> }>({
      query: ({ id, data }) => ({
        url: `${id}/`,
        body: data,
        method: 'PUT',
      }),
      transformResponse: (response: { message: string; data: Course }) => {
        return response.data;
      },
      invalidatesTags: ['Course'],
    }),
    getCourseDetails: builder.query<Course, string>({
      query: (id) => ({
        url: `${id}/`,
        method: 'GET',
      }),
      transformResponse: (response: { message: string; data: Course }) => {
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),
    // Legacy endpoints - these will need to be updated when Django backend implements them
    getCourseContent: builder.query({
      query: (id) => ({
        url: `${id}/content/`,
        method: 'GET',
      }),
    }),
    // Note: The following endpoints need to be implemented in Django backend
    // For now keeping them as placeholders
    addNewQuestion: builder.mutation({
      query: ({ question, courseId, contentId }) => ({
        url: `${courseId}/questions/`,
        body: { question, contentId },
        method: 'POST',
      }),
    }),
    addAnswerInQuestion: builder.mutation({
      query: ({ answer, courseId, contentId, questionId }) => ({
        url: `${courseId}/questions/${questionId}/answers/`,
        body: { answer, contentId },
        method: 'POST',
      }),
    }),
    addReviewInCourse: builder.mutation({
      query: ({ review, rating, courseId }: any) => ({
        url: `${courseId}/reviews/`,
        body: { review, rating },
        method: 'POST',
      }),
    }),
    addReplyInReview: builder.mutation({
      query: ({ comment, courseId, reviewId }: any) => ({
        url: `${courseId}/reviews/${reviewId}/replies/`,
        body: { comment },
        method: 'POST',
      }),
    }),
    getStreamVideoToken: builder.query({
      query: () => ({
        url: 'stream-token/',
        method: 'GET',
      }),
    }),
       
    
    }),
});

export const {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetAllCoursesQuery,
  useUpdateCourseMutation,
  useGetCourseDetailsQuery,
  useGetCourseContentQuery,
  useAddNewQuestionMutation,
  useAddAnswerInQuestionMutation,
  useAddReviewInCourseMutation,
  useAddReplyInReviewMutation,
  useGetStreamVideoTokenQuery,
} = courseApi;