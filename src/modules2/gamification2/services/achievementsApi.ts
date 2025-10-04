/**
 * Achievements API - Gamification and badge system
 * 
 * Integrates with Django backend achievement endpoints for
 * user achievements, progress tracking, and badge management.
 */

import { apiSlice } from "../../../../redux/features/api/apiSlice";

// Interface definitions matching the achievements page
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
}

export interface AchievementStats {
  totalUnlocked: number;
  totalAvailable: number;
  totalPoints: number;
  rareAchievements: number;
  recentUnlocked: number;
}

export interface AchievementCategory {
  name: string;
  display_name: string;
  description: string;
  icon_class: string;
  color: string;
  order: number;
  achievement_count: number;
  unlocked_count: number;
}

export interface AchievementNotification {
  id: string;
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    points: number;
  };
  is_read: boolean;
  is_celebrated: boolean;
  created_at: string;
  time_ago: string;
}

export const achievementsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Get user achievements with progress
     * Returns all achievements with user's progress and unlock status
     */
    getUserAchievements: builder.query<Achievement[], void>({
      query: () => ({
        url: "/practice/achievements/",
        method: "GET",
        credentials: "include" as const
      }),
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
      query: () => ({
        url: "/practice/achievements/stats/",
        method: "GET", 
        credentials: "include" as const
      }),
      providesTags: ['AchievementStats'],
    }),

    /**
     * Get achievement categories
     * Returns category information with counts
     */
    getAchievementCategories: builder.query<AchievementCategory[], void>({
      query: () => ({
        url: "/practice/achievements/categories/",
        method: "GET",
        credentials: "include" as const
      }),
      providesTags: ['AchievementCategories'],
    }),

    /**
     * Get achievement notifications
     * Returns unread achievement notifications
     */
    getAchievementNotifications: builder.query<AchievementNotification[], void>({
      query: () => ({
        url: "/practice/achievements/notifications/",
        method: "GET",
        credentials: "include" as const
      }),
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
        url: `/practice/achievements/notifications/${notification_id}/read/`,
        method: "POST",
        credentials: "include" as const
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
        url: `/practice/achievements/${achievement_id}/celebrate/`,
        method: "POST",
        credentials: "include" as const
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
} = achievementsApi;