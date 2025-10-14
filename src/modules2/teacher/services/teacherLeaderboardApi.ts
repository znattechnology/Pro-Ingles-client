/**
 * Teacher Leaderboard API - Analytics and Management for Teachers
 * 
 * Allows teachers to view student rankings, competition analytics,
 * and manage class competitions for better engagement tracking.
 */

import { apiSlice } from "../../../../redux/features/api/apiSlice";

// Teacher-specific interfaces
export interface TeacherStudentRanking {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar?: string;
  points: number;
  streak: number;
  league: 'bronze' | 'silver' | 'gold' | 'diamond';
  weeklyPoints: number;
  monthlyPoints: number;
  completedLessons: number;
  totalLessons: number;
  change: 'up' | 'down' | 'same' | 'new';
  changeAmount?: number;
  lastActivity: string;
  engagementScore: number;
}

export interface TeacherCompetition {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'custom';
  status: 'active' | 'upcoming' | 'finished';
  createdBy: string;
  participants: number;
  maxParticipants?: number;
  startDate: string;
  endDate: string;
  prize: string;
  targetMetric: string;
  targetValue: number;
  leaderboard?: TeacherStudentRanking[];
  created_at: string;
}

export interface TeacherLeaderboardStats {
  totalStudents: number;
  activeStudents: number;
  averagePoints: number;
  averageStreak: number;
  activeCompetitions: number;
  completedCompetitions: number;
  engagementRate: number;
  leagueDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    diamond: number;
  };
  weeklyActivity: Array<{
    day: string;
    activeStudents: number;
    pointsEarned: number;
    lessonsCompleted: number;
  }>;
  topPerformers: TeacherStudentRanking[];
  strugglingStudents: TeacherStudentRanking[];
}

export interface CreateCompetitionData {
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'custom';
  duration?: number; // in days for custom competitions
  prize: string;
  targetMetric: 'points' | 'lessons' | 'streak' | 'words' | 'challenges';
  targetValue: number;
  maxParticipants?: number;
  autoEnroll?: boolean; // automatically enroll all students
}

export interface CompetitionAnalytics {
  competitionId: string;
  participationRate: number;
  averageProgress: number;
  topParticipants: TeacherStudentRanking[];
  progressChart: Array<{
    date: string;
    participants: number;
    averageProgress: number;
  }>;
  engagementMetrics: {
    dailyActiveParticipants: number;
    dropoffRate: number;
    completionRate: number;
  };
}

export const teacherLeaderboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Get teacher's class rankings
     * Returns all students in teacher's classes with their rankings
     */
    getTeacherClassRankings: builder.query<TeacherStudentRanking[], {
      timeRange?: 'week' | 'month' | 'all';
      courseId?: string;
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.timeRange) searchParams.append('time_range', params.timeRange);
        if (params.courseId) searchParams.append('course_id', params.courseId);
        
        return {
          url: `/practice/teacher/leaderboard/rankings/?${searchParams.toString()}`,
          method: "GET",
          credentials: "include" as const
        };
      },
      providesTags: ['Leaderboard'],
    }),

    /**
     * Get teacher leaderboard statistics
     * Returns comprehensive analytics for teacher dashboard
     */
    getTeacherLeaderboardStats: builder.query<TeacherLeaderboardStats, {
      timeRange?: 'week' | 'month' | 'all';
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.timeRange) searchParams.append('time_range', params.timeRange);
        
        return {
          url: `/practice/teacher/leaderboard/stats/?${searchParams.toString()}`,
          method: "GET",
          credentials: "include" as const
        };
      },
      providesTags: ['Leaderboard'],
    }),

    /**
     * Get teacher's competitions
     * Returns competitions created by or involving the teacher's students
     */
    getTeacherCompetitions: builder.query<TeacherCompetition[], {
      status?: 'active' | 'upcoming' | 'finished' | 'all';
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status && params.status !== 'all') {
          searchParams.append('status', params.status);
        }
        
        return {
          url: `/practice/teacher/leaderboard/competitions/?${searchParams.toString()}`,
          method: "GET",
          credentials: "include" as const
        };
      },
      providesTags: ['Leaderboard'],
    }),

    /**
     * Create new competition
     * Allows teachers to create custom competitions for their students
     */
    createTeacherCompetition: builder.mutation<TeacherCompetition, CreateCompetitionData>({
      query: (competitionData) => ({
        url: "/practice/teacher/leaderboard/competitions/",
        method: "POST",
        body: competitionData,
        credentials: "include" as const
      }),
      invalidatesTags: ['Leaderboard'],
    }),

    /**
     * Update existing competition
     * Modify competition details (only if created by teacher)
     */
    updateTeacherCompetition: builder.mutation<
      TeacherCompetition, 
      { id: string; data: Partial<CreateCompetitionData> }
    >({
      query: ({ id, data }) => ({
        url: `/practice/teacher/leaderboard/competitions/${id}/`,
        method: "PATCH",
        body: data,
        credentials: "include" as const
      }),
      invalidatesTags: ['Leaderboard'],
    }),

    /**
     * Delete competition
     * Remove competition (only if created by teacher and not started)
     */
    deleteTeacherCompetition: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/practice/teacher/leaderboard/competitions/${id}/`,
        method: "DELETE",
        credentials: "include" as const
      }),
      invalidatesTags: ['Leaderboard'],
    }),

    /**
     * Get competition analytics
     * Detailed analytics for a specific competition
     */
    getCompetitionAnalytics: builder.query<CompetitionAnalytics, string>({
      query: (competitionId) => ({
        url: `/practice/teacher/leaderboard/competitions/${competitionId}/analytics/`,
        method: "GET",
        credentials: "include" as const
      }),
      providesTags: (result, error, competitionId) => [
        { type: 'CompetitionAnalytics', id: competitionId }
      ],
    }),

    /**
     * Get student engagement details
     * Detailed view of a specific student's engagement and progress
     */
    getStudentEngagementDetails: builder.query<{
      student: TeacherStudentRanking;
      weeklyProgress: Array<{
        date: string;
        points: number;
        lessons: number;
        streak: number;
      }>;
      competitionHistory: Array<{
        competition: string;
        rank: number;
        completed: boolean;
        progress: number;
      }>;
      achievements: Array<{
        title: string;
        unlockedAt: string;
        points: number;
      }>;
    }, string>({
      query: (studentId) => ({
        url: `/practice/teacher/leaderboard/students/${studentId}/details/`,
        method: "GET",
        credentials: "include" as const
      }),
      providesTags: (result, error, studentId) => [
        { type: 'StudentEngagement', id: studentId }
      ],
    }),

    /**
     * Bulk enroll students in competition
     * Enroll multiple students in a competition at once
     */
    bulkEnrollStudents: builder.mutation<
      { enrolled: number; message: string },
      { competitionId: string; studentIds: string[] }
    >({
      query: ({ competitionId, studentIds }) => ({
        url: `/practice/teacher/leaderboard/competitions/${competitionId}/enroll/`,
        method: "POST",
        body: { student_ids: studentIds },
        credentials: "include" as const
      }),
      invalidatesTags: ['Leaderboard'],
    }),

  }),
});

export const {
  useGetTeacherClassRankingsQuery,
  useGetTeacherLeaderboardStatsQuery,
  useGetTeacherCompetitionsQuery,
  useCreateTeacherCompetitionMutation,
  useUpdateTeacherCompetitionMutation,
  useDeleteTeacherCompetitionMutation,
  useGetCompetitionAnalyticsQuery,
  useGetStudentEngagementDetailsQuery,
  useBulkEnrollStudentsMutation,
} = teacherLeaderboardApi;