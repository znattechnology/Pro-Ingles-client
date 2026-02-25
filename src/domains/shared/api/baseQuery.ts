import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';
import { tokenRefreshCoordinator } from '@/lib/token-refresh-coordinator';

const DJANGO_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

/**
 * Centralized token refresh handler using TokenRefreshCoordinator
 * Works with HttpOnly cookies - backend handles token reading/writing
 */
async function handleTokenRefresh(
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any,
  baseQuery: any
) {
  try {
    console.log('🔄 Token expired, refreshing via HttpOnly cookies...');

    // Coordinator calls backend which reads refresh token from cookie
    await tokenRefreshCoordinator.refreshToken();

    console.log('✅ Token refreshed, retrying original request...');

    // Retry the original request - cookies updated by backend
    return await baseQuery(args, api, extraOptions);
  } catch (error) {
    console.error('❌ Token refresh failed:', error);

    // Clear auth state and redirect to login
    tokenRefreshCoordinator.clearTokens();
    window.location.href = '/signin?reason=session_expired';

    return {
      error: {
        status: 401,
        data: { message: 'Session expired' }
      }
    };
  }
}

/**
 * Shared base query with HttpOnly cookie authentication
 * - credentials: 'include' sends HttpOnly cookies automatically
 * - Backend middleware reads cookies and injects Authorization header
 */
export const createSharedBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: DJANGO_BASE_URL,
    credentials: 'include', // Sends HttpOnly cookies automatically
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    // Handle 401 errors with centralized token refresh
    if (result.error && result.error.status === 401) {
      console.log('🚨 401 Error, attempting token refresh...');
      result = await handleTokenRefresh(args, api, extraOptions, baseQuery);
    }

    return result;
  };
};

// Export for use in different API slices
export const sharedBaseQuery = createSharedBaseQuery();

// Student-specific base queries
export const createStudentVideoCoursesBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${DJANGO_BASE_URL}/student/video-courses`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      result = await handleTokenRefresh(args, api, extraOptions, baseQuery);
    }

    return result;
  };
};

export const createStudentPracticeCoursesBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${DJANGO_BASE_URL}/student/practice-courses`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      result = await handleTokenRefresh(args, api, extraOptions, baseQuery);
    }

    return result;
  };
};

// Teacher-specific base queries
export const createTeacherVideoCoursesBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${DJANGO_BASE_URL}/teacher/video-courses`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      result = await handleTokenRefresh(args, api, extraOptions, baseQuery);
    }

    return result;
  };
};

// Admin-specific base query
export const createAdminBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${DJANGO_BASE_URL}`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      result = await handleTokenRefresh(args, api, extraOptions, baseQuery);
    }

    return result;
  };
};

export const createStudentSpeakingPracticeBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${DJANGO_BASE_URL}/practice/speaking`,
    credentials: 'include',
    prepareHeaders: (headers, { endpoint }) => {
      // Don't set Content-Type for file upload endpoints to allow FormData
      if (!['createSpeakingTurn', 'analyzeSpeech'].includes(endpoint || '')) {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  });

  return async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      result = await handleTokenRefresh(args, api, extraOptions, baseQuery);
    }

    return result;
  };
};

// Export all base queries
export const studentVideoCoursesBaseQuery = createStudentVideoCoursesBaseQuery();
export const studentPracticeCoursesBaseQuery = createStudentPracticeCoursesBaseQuery();
export const studentSpeakingPracticeBaseQuery = createStudentSpeakingPracticeBaseQuery();
export const teacherVideoCoursesBaseQuery = createTeacherVideoCoursesBaseQuery();
export const adminBaseQuery = createAdminBaseQuery();
