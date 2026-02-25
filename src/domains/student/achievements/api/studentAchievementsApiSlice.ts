/**
 * Student Achievements API Slice - Gamification and badge system
 * 
 * Integrates with Django backend achievement endpoints for
 * user achievements, progress tracking, and badge management.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { sharedBaseQuery } from '../../../shared/api/baseQuery';
import type {
  Achievement,
  AchievementStats,
  AchievementCategory,
  AchievementNotification,
} from '../types';

// Student Achievements API slice
export const studentAchievementsApiSlice = createApi({
  reducerPath: 'studentAchievementsApi',
  baseQuery: sharedBaseQuery,
  tagTypes: [
    'Achievements',
    'AchievementStats',
    'AchievementCategories',
    'AchievementNotifications',
  ],
  endpoints: (builder) => ({
    
    /**
     * Get user achievements with progress
     * Returns all achievements with user's progress and unlock status
     */
    getUserAchievements: builder.query<Achievement[], void>({
      query: () => "/student/practice-courses/achievements/",
      transformResponse: (response: any[]) => {
        // Check if data is already transformed (has isUnlocked property)
        if (response.length > 0 && 'isUnlocked' in response[0]) {
          // Data is already transformed by backend
          return response;
        }
        
        // Data needs transformation (legacy format)
        return response
          .filter((userAchievement) => userAchievement.achievement) // Filter out items without achievement
          .map((userAchievement) => ({
            id: userAchievement.achievement.id,
            title: userAchievement.achievement.title,
            description: userAchievement.achievement.description,
            icon: userAchievement.achievement.icon,
            category: userAchievement.achievement.category,
            rarity: userAchievement.achievement.rarity,
            points: userAchievement.achievement.points,
            isUnlocked: userAchievement.is_unlocked,
            unlockedAt: userAchievement.unlocked_at_formatted,
            progress: userAchievement.is_unlocked ? undefined : {
              current: userAchievement.current_progress,
              target: userAchievement.achievement.requirement_target,
              unit: userAchievement.achievement.requirement_unit
            }
          }));
      },
      providesTags: ['Achievements'],
    }),

    /**
     * Get achievement statistics
     * Returns summary stats for user's achievement progress
     */
    getAchievementStats: builder.query<AchievementStats, void>({
      query: () => "/student/practice-courses/achievements/stats/",
      providesTags: ['AchievementStats'],
    }),

    /**
     * Get achievement categories
     * Returns category information with counts
     */
    getAchievementCategories: builder.query<AchievementCategory[], void>({
      query: () => "/student/practice-courses/achievements/categories/",
      providesTags: ['AchievementCategories'],
    }),

    /**
     * Get achievement notifications
     * Returns unread achievement notifications
     */
    getAchievementNotifications: builder.query<AchievementNotification[], void>({
      query: () => "/student/practice-courses/achievements/notifications/",
      providesTags: ['AchievementNotifications'],
    }),

    /**
     * Mark notification as read
     * Marks a specific achievement notification as read
     */
    markNotificationRead: builder.mutation<
      { message: string },
      { notification_id: string }
    >({
      query: ({ notification_id }) => ({
        url: `/student/practice-courses/achievements/notifications/${notification_id}/read/`,
        method: "POST",
      }),
      invalidatesTags: ['AchievementNotifications'],
    }),

    /**
     * Mark achievement as celebrated
     * Marks an achievement as celebrated (popup shown)
     */
    markAchievementCelebrated: builder.mutation<
      { message: string },
      { achievement_id: string }
    >({
      query: ({ achievement_id }) => ({
        url: `/student/practice-courses/achievements/${achievement_id}/celebrate/`,
        method: "POST",
      }),
      invalidatesTags: ['AchievementNotifications'],
    }),

  }),
});

export const {
  useGetUserAchievementsQuery,
  useGetAchievementStatsQuery,
  useGetAchievementCategoriesQuery,
  useGetAchievementNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAchievementCelebratedMutation,
} = studentAchievementsApiSlice;