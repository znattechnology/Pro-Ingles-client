import { apiSlice } from "./apiSlice";

// Types based on Django models
export interface Course {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
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
    // Get all courses
    getCourses: builder.query<Course[], void>({
      query: () => ({
        url: "practice/courses/",
        method: "GET",
      }),
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
      invalidatesTags: ["UserProgress"],
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
  useGetUserProgressQuery,
  useUpdateUserProgressMutation,
  useGetCourseUnitsQuery,
  useGetCourseUnitsWithProgressQuery,
  useGetLessonDetailQuery,
  useGetLessonPercentageQuery,
  useCompleteChallengeProgressMutation,
  useReduceHeartsMutation,
  useRefillHeartsMutation,
} = practiceApiSlice;