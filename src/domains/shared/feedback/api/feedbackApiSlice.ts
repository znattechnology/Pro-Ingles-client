import { createApi } from '@reduxjs/toolkit/query/react';
import { sharedBaseQuery } from '../../api/baseQuery';

// Types
export type FeedbackType =
  | 'general'
  | 'feature'
  | 'bug'
  | 'lesson'
  | 'ai_tutor'
  | 'content'
  | 'testimonial';

export type FeedbackTrigger =
  | 'first_lesson'
  | 'milestone_lessons'
  | 'course_complete'
  | 'ai_sessions'
  | 'days_active'
  | 'manual'
  | 'prompt';

export interface FeedbackStatus {
  should_show_prompt: boolean;
  trigger: FeedbackTrigger | null;
  last_feedback_at: string | null;
  total_feedbacks_given: number;
  engagement_summary: {
    lessons_completed: number;
    courses_completed: number;
    ai_sessions: number;
    days_active: number;
    current_streak: number;
  };
}

export interface SubmitFeedbackRequest {
  feedback_type?: FeedbackType;
  rating?: number;
  nps_score?: number;
  comment?: string;
  trigger?: FeedbackTrigger;
  context_data?: Record<string, any>;
  allow_public?: boolean;
  allow_contact?: boolean;
}

export interface UserFeedback {
  id: string;
  user: string;
  user_name: string;
  feedback_type: FeedbackType;
  rating: number | null;
  nps_score: number | null;
  comment: string;
  trigger: FeedbackTrigger;
  context_data: Record<string, any>;
  allow_public: boolean;
  allow_contact: boolean;
  created_at: string;
}

export interface SubmitFeedbackResponse {
  message: string;
  feedback: UserFeedback;
}

export interface DismissFeedbackRequest {
  trigger?: FeedbackTrigger;
  action?: 'dismissed' | 'skipped';
  context_data?: Record<string, any>;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  feedback_type: FeedbackType;
  created_at: string;
}

// Admin types
export interface AdminFeedback extends UserFeedback {
  is_reviewed: boolean;
  admin_notes: string;
}

export interface AdminFeedbackListParams {
  type?: FeedbackType;
  rating?: number;
  allow_public?: boolean;
  is_reviewed?: boolean;
  limit?: number;
  offset?: number;
}

export interface AdminFeedbackListResponse {
  total: number;
  limit: number;
  offset: number;
  feedbacks: AdminFeedback[];
}

export interface AdminFeedbackStats {
  total: number;
  reviewed: number;
  pending_review: number;
  public_testimonials: number;
  average_rating: number;
  recent_count: number;
  by_type: { feedback_type: string; count: number }[];
  by_rating: { rating: number; count: number }[];
  by_trigger: { trigger: string; count: number }[];
}

export interface UpdateFeedbackRequest {
  is_reviewed?: boolean;
  admin_notes?: string;
  allow_public?: boolean;
}

export const feedbackApi = createApi({
  reducerPath: 'feedbackApi',
  baseQuery: sharedBaseQuery,
  tagTypes: ['FeedbackStatus', 'MyFeedback', 'Testimonials', 'AdminFeedback', 'AdminFeedbackStats'],
  endpoints: (builder) => ({
    // Check if should show feedback prompt
    getFeedbackStatus: builder.query<FeedbackStatus, void>({
      query: () => '/users/feedback/status/',
      providesTags: ['FeedbackStatus'],
    }),

    // Submit feedback
    submitFeedback: builder.mutation<SubmitFeedbackResponse, SubmitFeedbackRequest>({
      query: (data) => ({
        url: '/users/feedback/submit/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FeedbackStatus', 'MyFeedback'],
    }),

    // Dismiss feedback prompt
    dismissFeedbackPrompt: builder.mutation<{ message: string }, DismissFeedbackRequest>({
      query: (data) => ({
        url: '/users/feedback/dismiss/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FeedbackStatus'],
    }),

    // Get user's own feedback history
    getMyFeedback: builder.query<{ count: number; feedbacks: UserFeedback[] }, void>({
      query: () => '/users/feedback/my-feedback/',
      providesTags: ['MyFeedback'],
    }),

    // Get public testimonials (for landing page)
    getTestimonials: builder.query<{ count: number; testimonials: Testimonial[] }, void>({
      query: () => '/users/feedback/testimonials/',
      providesTags: ['Testimonials'],
    }),

    // Admin: Get all feedbacks with filters
    getAdminFeedbackList: builder.query<AdminFeedbackListResponse, AdminFeedbackListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.type) searchParams.append('type', params.type);
        if (params.rating !== undefined) searchParams.append('rating', String(params.rating));
        if (params.allow_public !== undefined) searchParams.append('allow_public', String(params.allow_public));
        if (params.is_reviewed !== undefined) searchParams.append('is_reviewed', String(params.is_reviewed));
        if (params.limit) searchParams.append('limit', String(params.limit));
        if (params.offset !== undefined) searchParams.append('offset', String(params.offset));

        const queryString = searchParams.toString();
        return `/users/feedback/admin/list/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['AdminFeedback'],
    }),

    // Admin: Get feedback statistics
    getAdminFeedbackStats: builder.query<AdminFeedbackStats, void>({
      query: () => '/users/feedback/admin/stats/',
      providesTags: ['AdminFeedbackStats'],
    }),

    // Admin: Update feedback
    updateAdminFeedback: builder.mutation<{ message: string; feedback: AdminFeedback }, { id: string; data: UpdateFeedbackRequest }>({
      query: ({ id, data }) => ({
        url: `/users/feedback/admin/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AdminFeedback', 'AdminFeedbackStats', 'Testimonials'],
    }),
  }),
});

export const {
  useGetFeedbackStatusQuery,
  useSubmitFeedbackMutation,
  useDismissFeedbackPromptMutation,
  useGetMyFeedbackQuery,
  useGetTestimonialsQuery,
  // Admin hooks
  useGetAdminFeedbackListQuery,
  useGetAdminFeedbackStatsQuery,
  useUpdateAdminFeedbackMutation,
} = feedbackApi;
