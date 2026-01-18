/**
 * Reusable base query with automatic token refresh for Redux RTK Query
 *
 * ✅ Updated to use TokenRefreshCoordinator to prevent race conditions
 */

import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { tokenRefreshCoordinator } from '@/lib/token-refresh-coordinator';

export const createBaseQueryWithReauth = (baseUrl: string): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // ✅ Use TokenRefreshCoordinator to prevent race conditions
      try {
        console.log('[BaseQuery] Token expired, attempting coordinated refresh...');

        // Use coordinator - it will queue this request if refresh is already in progress
        await tokenRefreshCoordinator.refreshToken();

        console.log('[BaseQuery] Token refreshed successfully, retrying request...');

        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);
      } catch (refreshError) {
        console.error('[BaseQuery] Token refresh failed:', refreshError);

        // Refresh failed, clear auth and redirect to login
        tokenRefreshCoordinator.clearTokens();

        if (typeof window !== 'undefined') {
          // Use a slight delay to avoid immediate redirect issues
          setTimeout(() => {
            window.location.href = '/signin?reason=session_expired';
          }, 100);
        }
      }
    }

    return result;
  };
};