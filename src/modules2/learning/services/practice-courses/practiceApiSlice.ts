import { apiSlice } from "../../../../../redux/features/api/apiSlice";

// Types based on Django models
export interface Course {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
  // Statistics fields from Django API
  units?: number;
  lessons?: number;
  challenges?: number;
  units_count?: number;
  lessons_count?: number;
  challenges_count?: number;
  totalUnits?: number;
  total_lessons?: number;
  total_challenges?: number;
  total_progress?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChallengeOption {
  id: string;
  text: string;
  is_correct?: boolean;
  image_url?: string;
  audio_url?: string;
  order: number;
}

export interface Challenge {
  id: string;
  type: 'SELECT' | 'ASSIST';
  question: string;
  order: number;
  options: ChallengeOption[];
  challenge_progress: any[];
  completed: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  challenges: Challenge[];
  completed: boolean;
}

export interface LessonDetail {
  id: string;
  title: string;
  order: number;
  unit: {
    id: string;
    title: string;
    description: string;
  };
  challenges: Challenge[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface UserProgress {
  hearts: number;
  points: number;
  user_image_src: string;
  active_course: Course | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeProgress {
  id: string;
  completed: boolean;
  completed_at: string;
}

// API endpoints
export const practiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all courses with statistics (published only - for students)
    getCourses: builder.query<Course[], void>({
      query: () => ({
        url: "practice/courses/",
        method: "GET",
        params: { 
          include_stats: 'true' // Include statistics for course cards
        },
      }),
      transformResponse: (response: any[]) => {
        console.log('🎓 Practice courses with statistics (published only):', response);
        // Map Django API statistics fields to expected format
        return response.map(course => ({
          ...course,
          // Ensure consistent property naming for statistics
          units: course.units_count || course.totalUnits || 0,
          lessons: course.lessons_count || course.total_lessons || 0,
          challenges: course.challenges_count || course.total_challenges || 0,
          totalUnits: course.units_count || course.totalUnits || 0,
          total_lessons: course.lessons_count || course.total_lessons || 0,
          total_challenges: course.challenges_count || course.total_challenges || 0,
        }));
      },
      providesTags: ["Course"],
    }),

    // Get all courses with statistics including drafts (for teachers)
    getTeacherCourses: builder.query<Course[], void>({
      query: () => ({
        url: "practice/courses/",
        method: "GET",
        params: { 
          include_stats: 'true',
          include_drafts: 'true' // Include draft courses for teachers
        },
      }),
      transformResponse: (response: any[]) => {
        console.log('🎓 Teacher courses with statistics (including drafts):', response);
        // Map Django API statistics fields to expected format
        return response.map(course => ({
          ...course,
          // Ensure consistent property naming for statistics
          units: course.units_count || course.totalUnits || 0,
          lessons: course.lessons_count || course.total_lessons || 0,
          challenges: course.challenges_count || course.total_challenges || 0,
          totalUnits: course.units_count || course.totalUnits || 0,
          total_lessons: course.lessons_count || course.total_lessons || 0,
          total_challenges: course.challenges_count || course.total_challenges || 0,
        }));
      },
      providesTags: ["Course"],
    }),
    // Get user progress
    getUserProgress: builder.query<UserProgress, void>({
      query: () => ({
        url: "practice/user-progress/",
        method: "GET",
      }),
      providesTags: ["UserProgress"],
    }),

    // Update user progress
    updateUserProgress: builder.mutation<UserProgress, Partial<UserProgress>>({
      query: (updates) => ({
        url: "practice/user-progress/",
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: [
        "UserProgress",
        "CourseUnits", 
        "CourseUnitsWithProgress"
      ],
    }),

    // Update active course - more specific mutation for course selection
    updateActiveCourse: builder.mutation<UserProgress, string>({
      queryFn: async (courseId, _queryApi, __, baseQuery) => {
        try {
          // First get the course object
          const coursesResult = await baseQuery('practice/courses/');
          if (coursesResult.error) return { error: coursesResult.error };
          
          const courses = coursesResult.data as any[];
          const course = courses.find((c: any) => c.id === courseId);
          
          if (!course) {
            return { error: { status: 404, data: { message: 'Course not found' } } };
          }
          
          // Update user progress with the selected course
          const updateResult = await baseQuery({
            url: 'practice/user-progress/',
            method: 'PUT',
            body: { active_course: course }
          });
          
          return updateResult.error ? { error: updateResult.error } : { data: updateResult.data };
        } catch (error) {
          return { error: { status: 500, data: { message: 'Failed to update active course' } } };
        }
      },
      invalidatesTags: [
        "UserProgress",
        "CourseUnits", 
        "CourseUnitsWithProgress",
        "LessonDetail",
        "LessonPercentage"
      ],
    }),

    // Get course units
    getCourseUnits: builder.query<Unit[], string>({
      query: (courseId) => ({
        url: `practice/courses/${courseId}/units/`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "CourseUnits", id: courseId },
      ],
    }),

    // Get course units with progress
    getCourseUnitsWithProgress: builder.query<Unit[], string>({
      query: (courseId) => ({
        url: `practice/courses/${courseId}/units-with-progress/`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "CourseUnitsWithProgress", id: courseId },
      ],
    }),

    // Get lesson detail
    getLessonDetail: builder.query<LessonDetail, string>({
      query: (lessonId) => ({
        url: `practice/lessons/${lessonId}/`,
        method: "GET",
      }),
      providesTags: (result, error, lessonId) => [
        { type: "LessonDetail", id: lessonId },
      ],
    }),

    // Get lesson percentage
    getLessonPercentage: builder.query<{ percentage: number; completed_challenges: number; total_challenges: number }, string>({
      query: (lessonId) => ({
        url: `practice/lessons/${lessonId}/percentage/`,
        method: "GET",
      }),
      providesTags: (result, error, lessonId) => [
        { type: "LessonPercentage", id: lessonId },
      ],
    }),

    // Complete challenge
    completeChallengeProgress: builder.mutation<{
      challenge_progress: ChallengeProgress;
      user_progress: { hearts: number; points: number };
    }, {
      challenge: string;
      completed: boolean;
    }>({
      query: (data) => ({
        url: "practice/challenge-progress/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "UserProgress", 
        "CourseUnits", 
        "CourseUnitsWithProgress",
        "LessonDetail",
        "LessonPercentage"
      ],
    }),

    // Reduce hearts
    reduceHearts: builder.mutation<{ hearts: number; points: number }, void>({
      query: () => ({
        url: "practice/reduce-hearts/",
        method: "POST",
      }),
      invalidatesTags: ["UserProgress"],
    }),

    // Refill hearts
    refillHearts: builder.mutation<{ hearts: number; points: number }, void>({
      query: () => ({
        url: "practice/refill-hearts/",
        method: "POST",
      }),
      invalidatesTags: ["UserProgress"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetTeacherCoursesQuery,
  useGetUserProgressQuery,
  useUpdateUserProgressMutation,
  useUpdateActiveCourseMutation,
  useGetCourseUnitsQuery,
  useGetCourseUnitsWithProgressQuery,
  useGetLessonDetailQuery,
  useGetLessonPercentageQuery,
  useCompleteChallengeProgressMutation,
  useReduceHeartsMutation,
  useRefillHeartsMutation,
} = practiceApiSlice;