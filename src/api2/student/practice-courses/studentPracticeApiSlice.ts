import { createApi } from '@reduxjs/toolkit/query/react';
import { sharedBaseQuery } from '../../shared/baseQuery';
import {
  StudentCourse,
  StudentUserProgress,
  LessonDetail,
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
} from './studentPracticeTypes';

// Student Practice Course API slice
export const studentPracticeApiSlice = createApi({
  reducerPath: 'studentPracticeApi',
  baseQuery: sharedBaseQuery,
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
    
    getAvailableCourses: builder.query<StudentCourse[], void>({
      query: () => ({
        url: '/practice/courses/',
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

    getCourseDetail: builder.query<StudentCourse, string>({
      query: (courseId) => `/practice/courses/${courseId}/`,
      providesTags: (result, error, courseId) => [
        { type: 'StudentCourse', id: courseId },
      ],
    }),

    // ===== USER PROGRESS MANAGEMENT =====
    
    getStudentProgress: builder.query<StudentUserProgress, void>({
      query: () => '/practice/user-progress/',
      transformResponse: (response: any) => ({
        ...response,
        hearts: response.hearts || 5,
        points: response.points || 0,
        user_image_src: response.user_image_src || '/mascot.jpg',
        streak: response.streak || 0,
      }),
      providesTags: ['StudentProgress'],
    }),

    selectActiveCourse: builder.mutation<StudentUserProgress, CourseSelectionData>({
      query: ({ courseId }) => ({
        url: '/practice/user-progress/set-active-course/',
        method: 'POST',
        body: { course_id: courseId },
      }),
      invalidatesTags: ['StudentProgress', 'StudentUnit'],
      // Optimistic update
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          studentPracticeApiSlice.util.updateQueryData('getStudentProgress', undefined, (draft) => {
            if (draft.active_course) {
              draft.active_course.id = courseId;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateProgress: builder.mutation<StudentUserProgress, ProgressUpdateData>({
      query: (data) => ({
        url: '/practice/user-progress/',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentProgress'],
    }),

    // ===== HEARTS SYSTEM =====
    
    getHeartsStatus: builder.query<HeartsSystem, void>({
      query: () => '/practice/hearts-status/',
      providesTags: ['StudentProgress'],
    }),

    useHeart: builder.mutation<{ hearts: number }, void>({
      query: () => ({
        url: '/practice/reduce-hearts/',
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
        url: '/practice/refill-hearts/',
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
      query: (courseId) => `/practice/courses/${courseId}/units-with-progress/`,
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
      query: (lessonId) => `/practice/lessons/${lessonId}/`,
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
      query: (lessonId) => `/practice/lessons/${lessonId}/percentage/`,
      providesTags: (result, error, lessonId) => [
        { type: 'StudentLesson', id: lessonId },
      ],
    }),

    // ===== CHALLENGE INTERACTION =====
    
    submitChallenge: builder.mutation<ChallengeResult, ChallengeSubmission>({
      query: ({ challenge, selected_option, user_answer, ...rest }) => ({
        url: '/practice/challenge-progress/',
        method: 'POST',
        body: {
          challenge,
          selected_option,
          user_answer,
          ...rest,
        },
      }),
      transformResponse: (response: any) => ({
        success: response.success || false,
        correct: response.correct || false,
        pointsEarned: response.points_earned || response.pointsEarned || 0,
        heartsUsed: response.hearts_used || response.heartsUsed || 0,
        explanation: response.explanation,
        correctAnswer: response.correct_answer,
        nextChallenge: response.next_challenge,
        levelUp: response.level_up || false,
        achievementUnlocked: response.achievement_unlocked,
      }),
      invalidatesTags: ['StudentProgress', 'StudentUnit', 'StudentLesson'],
      // Optimistic update for points/hearts
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          dispatch(
            studentPracticeApiSlice.util.updateQueryData('getStudentProgress', undefined, (draft) => {
              draft.points += data.pointsEarned;
              draft.hearts = Math.max(0, draft.hearts - data.heartsUsed);
            })
          );
        } catch {
          // Error handling by component
        }
      },
    }),

    // ===== LEARNING SESSIONS =====
    
    startLearningSession: builder.mutation<LearningSession, { courseId: string; lessonId?: string }>({
      query: (data) => ({
        url: '/practice/learning-sessions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentSession'],
    }),

    endLearningSession: builder.mutation<SessionSummary, string>({
      query: (sessionId) => ({
        url: `/practice/learning-sessions/${sessionId}/end/`,
        method: 'POST',
      }),
      invalidatesTags: ['StudentSession', 'StudentProgress', 'StudentAnalytics'],
    }),

    // ===== ACHIEVEMENTS & GAMIFICATION =====
    
    getStudentAchievements: builder.query<StudentAchievement[], void>({
      query: () => '/practice/achievements/',
      providesTags: ['StudentAchievement'],
    }),

    getStudyStreak: builder.query<StudyStreak, void>({
      query: () => '/practice/study-streak/',
      providesTags: ['StudentStreak'],
    }),

    getLeaderboard: builder.query<StudentLeaderboard, { timeframe?: 'week' | 'month' | 'all' }>({
      query: ({ timeframe = 'week' } = {}) => ({
        url: '/practice/leaderboard/',
        params: { timeframe },
      }),
      providesTags: ['StudentLeaderboard'],
    }),

    // ===== PERSONALIZED RECOMMENDATIONS =====
    
    getPracticeRecommendations: builder.query<PracticeRecommendation[], void>({
      query: () => '/practice/recommendations/',
      providesTags: ['StudentAnalytics'],
    }),

    getStudentAnalytics: builder.query<StudentAnalytics, void>({
      query: () => '/practice/student-analytics/',
      providesTags: ['StudentAnalytics'],
    }),

    // ===== REVIEW & PRACTICE =====
    
    getWeakSkills: builder.query<Array<{ skill: string; accuracy: number; recommendation: string }>, void>({
      query: () => '/practice/weak-skills/',
      providesTags: ['StudentAnalytics'],
    }),

    markLessonCompleted: builder.mutation<any, { lessonId: string; score?: number; timeSpent?: number }>({
      query: (data) => ({
        url: '/practice/complete-lesson/',
        method: 'POST',
        body: {
          lesson_id: data.lessonId,
          score: data.score,
          time_spent: data.timeSpent,
        },
      }),
      invalidatesTags: ['StudentProgress', 'StudentUnit', 'StudentLesson'],
    }),

    // ===== SOCIAL FEATURES =====
    
    followUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: '/practice/follow-user/',
        method: 'POST',
        body: { user_id: userId },
      }),
      invalidatesTags: ['StudentLeaderboard'],
    }),

    unfollowUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: '/practice/unfollow-user/',
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