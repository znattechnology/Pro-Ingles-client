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

    // Get the URL from the args to check if it's an auth endpoint
    const url = typeof args === 'string' ? args : args.url;

    // Auth endpoints that should NOT trigger token refresh on 401
    // These endpoints return 401 for invalid credentials, not expired tokens
    const authEndpoints = [
      '/users/login/',
      '/users/register/',
      '/users/password-reset/',
      '/users/password-reset-confirm/',
      '/users/verify-email/',
      '/users/resend-verification/',
      '/users/refresh-token/',
      '/oauth/google/'
    ];

    const isAuthEndpoint = authEndpoints.some(endpoint => url?.includes(endpoint));

    if (result.error && result.error.status === 401 && !isAuthEndpoint) {
      // Use TokenRefreshCoordinator to prevent race conditions
      // Only for non-auth endpoints (protected routes)
      try {
        // Coordinator will queue this request if refresh is already in progress
        await tokenRefreshCoordinator.refreshToken();

        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);
      } catch {
        // Refresh failed - clear auth and redirect to login
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