/**
 * Teacher Achievements API - Management interface for teachers
 * 
 * Allows teachers to create, edit, delete and manage achievements/badges
 * for their students through the gamification system.
 */

import { apiSlice } from "../api/apiSlice";

// Interface for teacher achievement management
export interface TeacherAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'milestone' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement_type: string;
  requirement_target: number;
  requirement_unit: string;
  is_active: boolean;
  is_secret: boolean;
  order: number;
  created_at: string;
  unlocked_count?: number;
}

export interface TeacherAchievementStats {
  total: number;
  active: number;
  inactive: number;
  totalUnlocked: number;
  categoryStats: Array<{
    category: string;
    count: number;
  }>;
  rarityStats: Array<{
    rarity: string;
    count: number;
  }>;
}

export interface CreateAchievementData {
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'milestone' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement_type: string;
  requirement_target: number;
  requirement_unit: string;
  is_secret: boolean;
}

export const teacherAchievementsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Get all achievements for teacher management
     */
    getTeacherAchievements: builder.query<TeacherAchievement[], void>({
      query: () => ({
        url: "/practice/teacher/achievements/",
        method: "GET",
        credentials: "include" as const
      }),
      transformResponse: (response: any[]) => {
        return response.map((achievement) => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          rarity: achievement.rarity,
          points: achievement.points,
          requirement_type: achievement.requirement_type,
          requirement_target: achievement.requirement_target,
          requirement_unit: achievement.requirement_unit,
          is_active: achievement.is_active,
          is_secret: achievement.is_secret,
          order: achievement.order,
          created_at: achievement.created_at,
          unlocked_count: achievement.unlocked_count || 0
        }));
      },
      providesTags: ['TeacherAchievements'],
    }),

    /**
     * Create new achievement
     */
    createAchievement: builder.mutation<TeacherAchievement, CreateAchievementData>({
      query: (achievementData) => ({
        url: "/practice/teacher/achievements/",
        method: "POST",
        body: achievementData,
        credentials: "include" as const
      }),
      invalidatesTags: ['TeacherAchievements', 'TeacherAchievementStats'],
    }),

    /**
     * Update existing achievement
     */
    updateAchievement: builder.mutation<
      TeacherAchievement, 
      { id: string; data: Partial<CreateAchievementData> }
    >({
      query: ({ id, data }) => ({
        url: `/practice/teacher/achievements/${id}/`,
        method: "PATCH",
        body: data,
        credentials: "include" as const
      }),
      invalidatesTags: ['TeacherAchievements', 'TeacherAchievementStats'],
    }),

    /**
     * Delete achievement
     */
    deleteAchievement: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/practice/teacher/achievements/${id}/`,
        method: "DELETE",
        credentials: "include" as const
      }),
      invalidatesTags: ['TeacherAchievements', 'TeacherAchievementStats'],
    }),

    /**
     * Toggle achievement active/inactive status
     */
    toggleAchievementStatus: builder.mutation<
      { message: string }, 
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/practice/teacher/achievements/${id}/toggle-status/`,
        method: "POST",
        credentials: "include" as const
      }),
      invalidatesTags: ['TeacherAchievements', 'TeacherAchievementStats'],
    }),

    /**
     * Get achievement statistics for teacher dashboard
     */
    getTeacherAchievementStats: builder.query<TeacherAchievementStats, void>({
      query: () => ({
        url: "/practice/teacher/achievements/stats/",
        method: "GET",
        credentials: "include" as const
      }),
      providesTags: ['TeacherAchievementStats'],
    }),

    /**
     * Bulk update achievements (for reordering)
     */
    bulkUpdateAchievements: builder.mutation<
      { message: string },
      Array<{ id: string; order: number }>
    >({
      query: (updates) => ({
        url: "/practice/teacher/achievements/bulk-update/",
        method: "POST",
        body: { updates },
        credentials: "include" as const
      }),
      invalidatesTags: ['TeacherAchievements'],
    }),

  }),
});

export const {
  useGetTeacherAchievementsQuery,
  useCreateAchievementMutation,
  useUpdateAchievementMutation,
  useDeleteAchievementMutation,
  useToggleAchievementStatusMutation,
  useGetTeacherAchievementStatsQuery,
  useBulkUpdateAchievementsMutation,
} = teacherAchievementsApi;