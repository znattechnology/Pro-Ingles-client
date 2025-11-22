import { createApi } from '@reduxjs/toolkit/query/react';
import { studentPracticeCoursesBaseQuery } from '../../../shared/api/baseQuery';
import type {
  StudentPracticeCourse,
  StudentUserProgress,
  PracticeLesson,
  ChallengeSubmission,
  ChallengeResult,
  CourseSelectionData,
  ProgressUpdateData,
  CourseUnitsWithProgress,
  HeartsSystem,
  HeartAction,
  StudentLeaderboard,
  StudyStreak,
  PracticeRecommendation,
  StudentAnalytics,
  LearningSession,
  SessionSummary,
  StudentAchievement,
} from '../types';

// Legacy type aliases for compatibility
export interface LessonDetail {
  id: string;
  title: string;
  order: number;
  unit: {
    id: string;
    title: string;
    description: string;
    course: {
      id: string;
      title: string;
    };
  };
  challenges: any[];
  estimated_time: number;
  difficulty_level: string;
  learning_objectives: string[];
}

// Student Practice Course API slice
export const studentPracticeApiSlice = createApi({
  reducerPath: 'studentPracticeApi',
  baseQuery: studentPracticeCoursesBaseQuery,
  tagTypes: [
    'StudentCourse',
    'StudentProgress',
    'StudentUnit',
    'StudentLesson',
    'StudentChallenge',
    'StudentLeaderboard',
    'StudentStreak',
    'StudentAnalytics',
    'StudentSession',
    'StudentAchievement',
  ],
  endpoints: (builder) => ({
    
    // ===== COURSE DISCOVERY & SELECTION =====
    
    getAvailableCourses: builder.query<StudentPracticeCourse[], void>({
      query: () => ({
        url: '/courses/',
        params: { 
          include_stats: 'true',
          published_only: 'true' // Only published courses for students
        },
      }),
      transformResponse: (response: any[]) => {
        return response.map(course => ({
          ...course,
          // Normalize statistics fields for UI
          totalUnits: course.units_count || course.totalUnits || 0,
          total_lessons: course.lessons_count || course.total_lessons || 0,
          total_challenges: course.challenges_count || course.total_challenges || 0,
        }));
      },
      providesTags: ['StudentCourse'],
    }),

    getCourseDetail: builder.query<StudentPracticeCourse, string>({
      query: (courseId) => `/courses/${courseId}/`,
      providesTags: (result, error, courseId) => [
        { type: 'StudentCourse', id: courseId },
      ],
    }),

    // ===== USER PROGRESS MANAGEMENT =====
    
    getStudentProgress: builder.query<StudentUserProgress, void>({
      query: () => '/user-progress/',
      transformResponse: (response: any) => ({
        ...response,
        hearts: response.hearts || 5,
        points: response.points || 0,
        user_image_src: response.user_image_src || '/mascot.jpg',
        streak: response.streak || 0,
      }),
      providesTags: ['StudentProgress'],
    }),

    // Update active course - copied exactly from working old system
    selectActiveCourse: builder.mutation<StudentUserProgress, string>({
      queryFn: async (courseId, _queryApi, __, baseQuery) => {
        try {
          console.log('🔍 selectActiveCourse: Starting for courseId:', courseId);
          
          // First get the course object
          const coursesResult = await baseQuery('courses/');
          console.log('🔍 selectActiveCourse: Courses result:', coursesResult);
          
          if (coursesResult.error) {
            console.error('🔍 selectActiveCourse: Error fetching courses:', coursesResult.error);
            return { error: coursesResult.error };
          }
          
          const courses = coursesResult.data as any[];
          const course = courses.find((c: any) => c.id === courseId);
          console.log('🔍 selectActiveCourse: Found course:', course);
          
          if (!course) {
            console.error('🔍 selectActiveCourse: Course not found for ID:', courseId);
            return { error: { status: 404, data: { message: 'Course not found' } } };
          }
          
          // Update user progress with the selected course
          console.log('🔍 selectActiveCourse: Updating user progress with course:', course);
          const updateResult = await baseQuery({
            url: 'user-progress/',
            method: 'PUT',
            body: { active_course: course }
          });
          
          console.log('🔍 selectActiveCourse: Update result:', updateResult);
          return updateResult.error ? { error: updateResult.error } : { data: updateResult.data };
        } catch (error) {
          console.error('🔍 selectActiveCourse: Caught error:', error);
          return { error: { status: 500, data: { message: 'Failed to update active course' } } };
        }
      },
      invalidatesTags: [
        "StudentProgress",
        "StudentUnit", 
        "StudentLesson",
        "StudentCourse"
      ],
    }),

    updateProgress: builder.mutation<StudentUserProgress, ProgressUpdateData>({
      query: (data) => ({
        url: '/user-progress/',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentProgress', 'StudentCourse'],
    }),

    // ===== HEARTS SYSTEM =====
    
    getHeartsStatus: builder.query<HeartsSystem, void>({
      query: () => '/hearts-status/',
      providesTags: ['StudentProgress'],
    }),

    useHeart: builder.mutation<{ hearts: number }, void>({
      query: () => ({
        url: '/reduce-hearts/',
        method: 'POST',
      }),
      invalidatesTags: ['StudentProgress'],
      // Optimistic update
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          studentPracticeApiSlice.util.updateQueryData('getStudentProgress', undefined, (draft) => {
            draft.hearts = Math.max(0, draft.hearts - 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    refillHearts: builder.mutation<{ hearts: number }, HeartAction>({
      query: (data) => ({
        url: '/refill-hearts/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentProgress'],
      // Optimistic update
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          studentPracticeApiSlice.util.updateQueryData('getStudentProgress', undefined, (draft) => {
            draft.hearts = 5; // Maximum hearts
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // ===== COURSE CONTENT & PROGRESS =====
    
    getCourseUnitsWithProgress: builder.query<CourseUnitsWithProgress, string>({
      query: (courseId) => `/courses/${courseId}/units-with-progress/`,
      transformResponse: (response: any) => {
        if (response.units && Array.isArray(response.units)) {
          return {
            course: response.course,
            units: response.units,
            overall_progress: response.overall_progress || {
              completed_units: 0,
              total_units: response.units.length,
              completed_lessons: 0,
              total_lessons: 0,
              completed_challenges: 0,
              total_challenges: 0,
              percentage: 0,
            },
          };
        }
        return {
          course: null,
          units: [],
          overall_progress: {
            completed_units: 0,
            total_units: 0,
            completed_lessons: 0,
            total_lessons: 0,
            completed_challenges: 0,
            total_challenges: 0,
            percentage: 0,
          },
        };
      },
      providesTags: (result, error, courseId) => [
        { type: 'StudentUnit', id: courseId },
      ],
    }),

    getLessonDetail: builder.query<LessonDetail, string>({
      query: (lessonId) => `/lessons/${lessonId}/`,
      transformResponse: (response: any) => ({
        ...response,
        challenges: response.challenges || [],
        estimated_time: response.estimated_time || 10,
        difficulty_level: response.difficulty_level || 'medium',
        learning_objectives: response.learning_objectives || [],
      }),
      providesTags: (result, error, lessonId) => [
        { type: 'StudentLesson', id: lessonId },
      ],
    }),

    getLessonProgress: builder.query<{ percentage: number; completed_challenges: number; total_challenges: number }, string>({
      query: (lessonId) => `/lessons/${lessonId}/percentage/`,
      providesTags: (result, error, lessonId) => [
        { type: 'StudentLesson', id: lessonId },
      ],
    }),

    // ===== CHALLENGE INTERACTION =====
    
    // Complete challenge - adapted for new structure
    submitChallenge: builder.mutation<{
      challenge_progress: any;
      user_progress: { hearts: number; points: number };
    }, {
      challengeId: string;
      selectedOptionId: string;
      timeSpent?: number;
      attempts?: number;
    }>({
      query: (data) => {
        console.log('🔍 submitChallenge: Sending data:', data);
        // Adapt new data structure to backend expected format
        const bodyData = {
          challenge: data.challengeId,
          completed: true, // Assume completion for now
          selected_option: data.selectedOptionId,
          time_spent: data.timeSpent,
          attempts: data.attempts,
        };
        console.log('🔍 submitChallenge: Adapted body data:', bodyData);
        return {
          url: "challenge-progress/",
          method: "POST",
          body: bodyData,
        };
      },
      invalidatesTags: [
        "StudentProgress", 
        "StudentUnit", 
        "StudentLesson",
        "StudentCourse"
      ],
    }),


    // ===== LEARNING SESSIONS =====
    
    startLearningSession: builder.mutation<LearningSession, { courseId: string; lessonId?: string }>({
      query: (data) => ({
        url: '/learning-sessions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentSession'],
    }),

    endLearningSession: builder.mutation<SessionSummary, string>({
      query: (sessionId) => ({
        url: `/learning-sessions/${sessionId}/end/`,
        method: 'POST',
      }),
      invalidatesTags: ['StudentSession', 'StudentProgress', 'StudentAnalytics'],
    }),

    // ===== ACHIEVEMENTS & GAMIFICATION =====
    
    getStudentAchievements: builder.query<StudentAchievement[], void>({
      query: () => '/achievements/',
      providesTags: ['StudentAchievement'],
    }),

    getStudyStreak: builder.query<StudyStreak, void>({
      query: () => '/study-streak/',
      providesTags: ['StudentStreak'],
    }),

    getLeaderboard: builder.query<StudentLeaderboard, { timeframe?: 'week' | 'month' | 'all' }>({
      query: ({ timeframe = 'week' } = {}) => ({
        url: '/leaderboard/',
        params: { timeframe },
      }),
      providesTags: ['StudentLeaderboard'],
    }),

    // ===== PERSONALIZED RECOMMENDATIONS =====
    
    getPracticeRecommendations: builder.query<PracticeRecommendation[], void>({
      query: () => '/recommendations/',
      providesTags: ['StudentAnalytics'],
    }),

    getStudentAnalytics: builder.query<StudentAnalytics, void>({
      query: () => '/student-analytics/',
      providesTags: ['StudentAnalytics'],
    }),

    // ===== REVIEW & PRACTICE =====
    
    getWeakSkills: builder.query<Array<{ skill: string; accuracy: number; recommendation: string }>, void>({
      query: () => '/weak-skills/',
      providesTags: ['StudentAnalytics'],
    }),

    markLessonCompleted: builder.mutation<any, { lessonId: string; score?: number; timeSpent?: number }>({
      query: (data) => ({
        url: '/complete-lesson/',
        method: 'POST',
        body: {
          lesson_id: data.lessonId,
          score: data.score,
          time_spent: data.timeSpent,
        },
      }),
      invalidatesTags: ['StudentProgress', 'StudentUnit', 'StudentLesson', 'StudentCourse'],
    }),

    // ===== SOCIAL FEATURES =====
    
    followUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: '/follow-user/',
        method: 'POST',
        body: { user_id: userId },
      }),
      invalidatesTags: ['StudentLeaderboard'],
    }),

    unfollowUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: '/unfollow-user/',
        method: 'POST',
        body: { user_id: userId },
      }),
      invalidatesTags: ['StudentLeaderboard'],
    }),

  }),
});

// Export hooks
export const {
  // Course discovery
  useGetAvailableCoursesQuery,
  useGetCourseDetailQuery,
  
  // User progress
  useGetStudentProgressQuery,
  useSelectActiveCourseMutation,
  useUpdateProgressMutation,
  
  // Hearts system
  useGetHeartsStatusQuery,
  useUseHeartMutation,
  useRefillHeartsMutation,
  
  // Course content
  useGetCourseUnitsWithProgressQuery,
  useGetLessonDetailQuery,
  useGetLessonProgressQuery,
  
  // Challenge interaction
  useSubmitChallengeMutation,
  
  // Learning sessions
  useStartLearningSessionMutation,
  useEndLearningSessionMutation,
  
  // Achievements & gamification
  useGetStudentAchievementsQuery,
  useGetStudyStreakQuery,
  useGetLeaderboardQuery,
  
  // Recommendations
  useGetPracticeRecommendationsQuery,
  useGetStudentAnalyticsQuery,
  
  // Review & practice
  useGetWeakSkillsQuery,
  useMarkLessonCompletedMutation,
  
  // Social features
  useFollowUserMutation,
  useUnfollowUserMutation,
  
} = studentPracticeApiSlice;