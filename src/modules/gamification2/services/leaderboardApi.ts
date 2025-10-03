/**
 * Leaderboard API - Real-time rankings and competition data
 * 
 * Integrates with Django backend leaderboard endpoints for
 * global rankings, leagues, competitions, and user stats.
 */

import { apiSlice } from "../../../../redux/features/api/apiSlice";

// Interface definitions matching the leaderboard page
export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar?: string;
  points: number;
  streak: number;
  league: 'bronze' | 'silver' | 'gold' | 'diamond';
  change: 'up' | 'down' | 'same' | 'new';
  changeAmount?: number;
  isCurrentUser?: boolean;
}

export interface League {
  id: string;
  name: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints?: number;
  participants: number;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  startDate: string;
  endDate: string;
  participants: number;
  currentPosition?: number;
  prize: string;
}

export interface GlobalLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUser?: LeaderboardEntry;
}

export interface UserPosition {
  rank: number;
  points: number;
  hearts: number;
  streak: number;
  league: {
    id: string;
    name: string;
    icon: string;
    min_points: number;
    max_points?: number;
  };
}

export const leaderboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Get global leaderboard with top users
     * Returns top 10 users + current user position
     */
    getGlobalLeaderboard: builder.query<GlobalLeaderboardResponse, void>({
      query: () => ({
        url: "/practice/leaderboard/global/",
        method: "GET",
        credentials: "include" as const
      }),
      providesTags: ['Leaderboard'],
    }),

    /**
     * Get leagues information with participant counts
     * Returns all available leagues and their stats
     */
    getLeaguesInfo: builder.query<League[], void>({
      query: () => ({
        url: "/practice/leaderboard/leagues/",
        method: "GET", 
        credentials: "include" as const
      }),
      providesTags: ['Leagues'],
    }),

    /**
     * Get active competitions
     * Returns competitions that users can participate in
     */
    getActiveCompetitions: builder.query<Competition[], void>({
      query: () => ({
        url: "/practice/leaderboard/competitions/",
        method: "GET",
        credentials: "include" as const
      }),
      providesTags: ['Competitions'],
    }),

    /**
     * Get user position in leaderboard  
     * Returns current user's rank, points, and league info
     */
    getUserLeaderboardPosition: builder.query<UserPosition, void>({
      query: () => ({
        url: "/practice/leaderboard/user-position/",
        method: "GET",
        credentials: "include" as const
      }),
      providesTags: ['UserPosition'],
    }),

    /**
     * Join a competition
     * Allows user to participate in active competitions
     */
    joinCompetition: builder.mutation<
      { message: string; participant_id: string; current_rank: number },
      string
    >({
      query: (competitionId) => ({
        url: `/practice/leaderboard/competitions/${competitionId}/join/`,
        method: "POST",
        credentials: "include" as const
      }),
      invalidatesTags: ['Competitions', 'UserPosition'],
    }),

    /**
     * Update user streak
     * Called after completing practice activities
     */
    updateUserStreak: builder.mutation<
      { current_streak: number; longest_streak: number; last_practice_date: string },
      void
    >({
      query: () => ({
        url: "/practice/leaderboard/update-streak/",
        method: "PUT",
        credentials: "include" as const
      }),
      invalidatesTags: ['Leaderboard', 'UserPosition'],
    }),

  }),
});

export const {
  useGetGlobalLeaderboardQuery,
  useGetLeaguesInfoQuery,
  useGetActiveCompetitionsQuery,
  useGetUserLeaderboardPositionQuery,
  useJoinCompetitionMutation,
  useUpdateUserStreakMutation,
} = leaderboardApi;