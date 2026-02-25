import { apiSlice } from "../../../../redux/features/api/apiSlice";
import {
  userLoggedIn,
  userRegistration,
  userLoggedOut,
  setPendingVerification,
  setLoading,
  User
} from "./authSlice";
import { tokenRefreshCoordinator } from "@/lib/token-refresh-coordinator";

/**
 * ✅ Helper to store tokens consistently in both localStorage and cookies
 */
const storeTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;

  // Primary: localStorage
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);

  // Secondary: Cookies (for SSR middleware access)
  const accessMaxAge = 3600; // 1 hour
  const refreshMaxAge = 604800; // 7 days

  document.cookie = `access_token=${accessToken}; path=/; max-age=${accessMaxAge}; SameSite=strict; Secure`;
  document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${refreshMaxAge}; SameSite=strict; Secure`;
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

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegistrationResponse, RegistrationData>({
      query: (data) => ({
        url: `/users/register/`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
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
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;

          // ✅ Store tokens in both localStorage AND cookies
          storeTokens(result.data.access, result.data.refresh);

          dispatch(
            userLoggedIn({
              accessToken: result.data.access,
              refreshToken: result.data.refresh,
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

          // ✅ Store tokens in both localStorage AND cookies (with Secure flag)
          storeTokens(result.data.access, result.data.refresh);

          dispatch(
            userLoggedIn({
              accessToken: result.data.access,
              refreshToken: result.data.refresh,
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
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      }),
      providesTags: ['User'],
      async onQueryStarted(_, {queryFulfilled, dispatch}){
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: localStorage.getItem('access_token') || '',
              refreshToken: localStorage.getItem('refresh_token') || '',
              user: result.data,
            })
          )
        } catch (error:any) {
          console.log(error);
        }
      }
    }),

    // Alias for backward compatibility
    loadUser: builder.query<User, void>({
      query: () => ({
        url: `/users/profile/`,
        method: "GET",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      }),
      providesTags: ['User'],
      async onQueryStarted(_, {queryFulfilled, dispatch}){
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: localStorage.getItem('access_token') || '',
              refreshToken: localStorage.getItem('refresh_token') || '',
              user: result.data,
            })
          )
        } catch (error:any) {
          console.log(error);
        }
      }
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: `/users/profile/`,
        method: "PUT",
        body: data,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      }),
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
} = authApi;