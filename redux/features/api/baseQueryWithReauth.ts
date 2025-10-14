/**
 * Reusable base query with automatic token refresh for Redux RTK Query
 */

import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { djangoAuth } from '@/lib/django-auth';

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
      // Try to refresh the token
      try {
        console.log('Token expired, attempting refresh...');
        await djangoAuth.refreshToken();
        console.log('Token refreshed successfully, retrying request...');
        
        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
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