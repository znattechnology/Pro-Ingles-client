import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';

const DJANGO_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

// Shared base query with reauth logic
export const createSharedBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: DJANGO_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      // Get token from localStorage for Django API
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
    console.log('🔄 API Call:', args);
    let result = await baseQuery(args, api, extraOptions);

    // Handle 401 errors with token refresh
    if (result.error && result.error.status === 401) {
      console.log('🚨 401 Error on:', args);
      console.log('🚨 Error details:', result.error);
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Try to refresh token
          const refreshResult = await baseQuery(
            {
              url: '/auth/token/refresh/',
              method: 'POST',
              body: { refresh: refreshToken },
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            // Store new token
            const { access } = refreshResult.data as { access: string };
            localStorage.setItem('access_token', access);
            
            // Retry original request
            result = await baseQuery(args, api, extraOptions);
          } else {
            // Refresh failed - redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/sign-in';
          }
        } catch {
          // Refresh failed - redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/sign-in';
        }
      } else {
        // No refresh token - redirect to login
        window.location.href = '/sign-in';
      }
    }

    return result;
  };
};

// Export for use in different API slices
export const sharedBaseQuery = createSharedBaseQuery();