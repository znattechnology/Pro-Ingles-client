import { apiSlice } from "../../../../redux/features/api/apiSlice";
import {
  userLoggedIn,
  userRegistration,
  userLoggedOut,
  setPendingVerification,
  setLoading,
  User
} from "./authSlice";

/**
 * Helper to mark user as authenticated (UI state only)
 * Actual tokens are stored in HttpOnly cookies by the backend
 */
const markAuthenticated = (user: User) => {
  if (typeof window === 'undefined') return;

  // Set auth state cookie (non-HttpOnly) for quick UI checks
  const maxAge = 604800; // 7 days
  document.cookie = `auth_state=authenticated; path=/; max-age=${maxAge}; SameSite=Lax`;

  // Set user role cookie for middleware redirects
  document.cookie = `user_role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;

  // Store user info for quick UI access (not for auth)
  localStorage.setItem('user_info', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  }));
};

type RegistrationResponse = {
  message: string;
  email: string;
  requires_verification: boolean;
};

type RegistrationData = {
  email: string;
  name: string;
  password: string;
  password_confirm?: string;
  role?: 'student' | 'teacher';
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: User;
};

type LoginData = {
  email: string;
  password: string;
};

type EmailVerificationResponse = {
  message: string;
  access: string;
  refresh: string;
  user: User;
};

type EmailVerificationData = {
  email: string;
  code: string;
};

type PasswordResetData = {
  email: string;
};

type PasswordResetConfirmData = {
  email: string;
  code: string;
  newPassword: string;
};

type PasswordChangeData = {
  old_password: string;
  new_password: string;
};

type NotificationSettings = {
  id?: string;
  email_bookings: boolean;
  email_messages: boolean;
  email_ratings: boolean;
  email_orders: boolean;
  email_marketing: boolean;
  push_bookings: boolean;
  push_messages: boolean;
  push_ratings: boolean;
  push_orders: boolean;
  digest_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegistrationResponse, RegistrationData>({
      query: (data) => ({
        url: `/users/register/`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;
          dispatch(
            userRegistration({
              email: result.data.email,
            })
          );
        } catch (error: any) {
          console.error('Registration error:', error);
          dispatch(setLoading(false));
          throw error;
        }
      }
    }),

    verifyEmail: builder.mutation<EmailVerificationResponse, EmailVerificationData>({
      query: (data) => ({
        url: `/users/verify-email/`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;

          // Mark as authenticated (tokens are in HttpOnly cookies set by backend)
          markAuthenticated(result.data.user);

          dispatch(
            userLoggedIn({
              accessToken: '', // Tokens are in HttpOnly cookies
              refreshToken: '',
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.error('Email verification error:', error);
          dispatch(setLoading(false));
          throw error;
        }
      }
    }),

    resendVerificationCode: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: `/users/resend-verification/`,
        method: "POST",
        body: data,
      }),
    }),

    login: builder.mutation<LoginResponse, LoginData>({
      query: (data) => ({
        url: `/users/login/`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;

          // Mark as authenticated (tokens are in HttpOnly cookies set by backend)
          markAuthenticated(result.data.user);

          dispatch(
            userLoggedIn({
              accessToken: '', // Tokens are in HttpOnly cookies
              refreshToken: '',
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.error('Login error:', error);
          dispatch(setLoading(false));

          // Extract error message safely (could be string, object, or array)
          const errorMessage = typeof error?.error?.message === 'string'
            ? error.error.message
            : (typeof error?.data?.error === 'string' ? error.data.error : null);

          // Check if it's an email verification error
          if (errorMessage?.includes('Email não verificado')) {
            dispatch(setPendingVerification({
              email: arg.email,
              isRegistration: false,
            }));
          }
          throw error;
        }
      }
    }),

    refreshToken: builder.mutation<{ access: string }, { refresh: string }>({
      query: (data) => ({
        url: `/users/refresh-token/`,
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation<void, { refresh_token?: string }>({
      query: (data) => ({
        url: `/users/logout/`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          console.error('Logout error:', error);
        } finally {
          // Use comprehensive auth data clearing
          const { clearAllAuthData } = await import('@/lib/clear-auth');
          clearAllAuthData();
          
          dispatch(userLoggedOut());
        }
      }
    }),

    requestPasswordReset: builder.mutation<{ message: string }, PasswordResetData>({
      query: (data) => ({
        url: `/users/password-reset/`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(setPendingVerification({
            email: arg.email,
            isRegistration: false,
          }));
        } catch (error: any) {
          console.error('Password reset request error:', error);
          throw error;
        }
      }
    }),

    confirmPasswordReset: builder.mutation<{ message: string }, PasswordResetConfirmData>({
      query: (data) => ({
        url: `/users/password-reset-confirm/`,
        method: "POST",
        body: data,
      }),
    }),

    getProfile: builder.query<User, void>({
      query: () => ({
        url: `/users/profile/`,
        method: "GET",
        // No Authorization header needed - sent via HttpOnly cookie
      }),
      providesTags: ['User'],
      async onQueryStarted(_, {queryFulfilled, dispatch}){
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: '', // Tokens are in HttpOnly cookies
              refreshToken: '',
              user: result.data,
            })
          )
        } catch {
          // Profile fetch failed - user will remain unauthenticated
        }
      }
    }),

    // Alias for backward compatibility
    loadUser: builder.query<User, void>({
      query: () => ({
        url: `/users/profile/`,
        method: "GET",
        // No Authorization header needed - sent via HttpOnly cookie
      }),
      providesTags: ['User'],
      async onQueryStarted(_, {queryFulfilled, dispatch}){
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: '', // Tokens are in HttpOnly cookies
              refreshToken: '',
              user: result.data,
            })
          )
        } catch {
          // Profile fetch failed - user will remain unauthenticated
        }
      }
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: `/users/profile/`,
        method: "PUT",
        body: data,
        // No Authorization header needed - sent via HttpOnly cookie
      }),
      invalidatesTags: ['User'],
    }),

    // Notification settings
    getNotificationSettings: builder.query<NotificationSettings, void>({
      query: () => ({
        url: `/users/notification-settings/`,
        method: "GET",
      }),
      providesTags: ['NotificationSettings'],
    }),

    updateNotificationSettings: builder.mutation<NotificationSettings, Partial<NotificationSettings>>({
      query: (data) => ({
        url: `/users/notification-settings/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['NotificationSettings'],
    }),

    // Password change
    changePassword: builder.mutation<{ message: string }, PasswordChangeData>({
      query: (data) => ({
        url: `/users/change-password/`,
        method: "POST",
        body: data,
      }),
    }),

    // Google OAuth
    getGoogleOAuthUrl: builder.query<{ auth_url: string; message: string }, void>({
      query: () => ({
        url: `/users/oauth/google/url/`,
        method: "GET",
      }),
    }),

    googleOAuthLogin: builder.mutation<LoginResponse, { code?: string; access_token?: string; id_token?: string }>({
      query: (data) => ({
        url: `/users/oauth/google/login/`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;

          // Mark as authenticated (tokens are in HttpOnly cookies set by backend)
          markAuthenticated(result.data.user);

          dispatch(
            userLoggedIn({
              accessToken: '', // Tokens are in HttpOnly cookies
              refreshToken: '',
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.error('Google OAuth error:', error);
          dispatch(setLoading(false));
          throw error;
        }
      }
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationCodeMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useGetProfileQuery,
  useLoadUserQuery, // Backward compatibility alias
  useUpdateProfileMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useChangePasswordMutation,
  // Google OAuth
  useGetGoogleOAuthUrlQuery,
  useLazyGetGoogleOAuthUrlQuery,
  useGoogleOAuthLoginMutation,
} = authApi;

// Export types for use in components
export type { NotificationSettings, PasswordChangeData };