/**
 * Student Leaderboard API Slice - Real-time rankings and competition data
 * 
 * Integrates with Django backend leaderboard endpoints for
 * global rankings, leagues, competitions, and user stats.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { sharedBaseQuery } from '../../../shared/api/baseQuery';
import type {
  LeaderboardEntry,
  League,
  Competition,
  GlobalLeaderboardResponse,
  UserPosition,
} from '../types';

// Student Leaderboard API slice
export const studentLeaderboardApiSlice = createApi({
  reducerPath: 'studentLeaderboardApi',
  baseQuery: sharedBaseQuery,
  tagTypes: [
    'Leaderboard',
    'Leagues', 
    'Competitions',
    'UserPosition',
  ],
  endpoints: (builder) => ({
    
    /**
     * Get global leaderboard with top users
     * Returns top 10 users + current user position
     */
    getGlobalLeaderboard: builder.query<GlobalLeaderboardResponse, void>({
      query: () => "/practice/leaderboard/global/",
      providesTags: ['Leaderboard'],
    }),

    /**
     * Get leagues information with participant counts
     * Returns all available leagues and their stats
     */
    getLeaguesInfo: builder.query<League[], void>({
      query: () => "/practice/leaderboard/leagues/",
      providesTags: ['Leagues'],
    }),

    /**
     * Get active competitions
     * Returns competitions that users can participate in
     */
    getActiveCompetitions: builder.query<Competition[], void>({
      query: () => "/practice/leaderboard/competitions/",
      providesTags: ['Competitions'],
    }),

    /**
     * Get user position in leaderboard  
     * Returns current user's rank, points, and league info
     */
    getUserLeaderboardPosition: builder.query<UserPosition, void>({
      query: () => "/practice/leaderboard/user-position/",
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
} = studentLeaderboardApiSlice;