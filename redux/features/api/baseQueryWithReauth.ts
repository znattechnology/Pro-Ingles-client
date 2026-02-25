/**
 * Reusable base query with automatic token refresh for Redux RTK Query
 *
 * Security: Uses HttpOnly cookies for authentication.
 * - Backend middleware reads access_token from cookie and injects Authorization header
 * - Frontend only needs to include credentials with requests
 * - No localStorage token access needed
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
    credentials: 'include', // Sends HttpOnly cookies automatically
    prepareHeaders: (headers) => {
      // No Authorization header needed - backend middleware reads from HttpOnly cookie
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // Use TokenRefreshCoordinator to prevent race conditions
      try {
        // Coordinator will queue this request if refresh is already in progress
        await tokenRefreshCoordinator.refreshToken();

        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);
      } catch {
        // Refresh failed - clear auth and redirect to login

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