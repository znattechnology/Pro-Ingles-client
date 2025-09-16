/**
 * Admin API for user management
 * 
 * Provides complete CRUD operations for user administration
 * including listing, filtering, role changes, and user details
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from '../api/baseQueryWithReauth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  date_joined: string;
  last_login?: string | null;
  avatar?: string | null;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  student_users: number;
  teacher_users: number;
  admin_users: number;
  verified_users: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: Pagination;
  stats: UserStats;
}

export interface UserDetailResponse {
  user: User & {
    google_id?: string | null;
  };
}

export interface UpdateUserRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateUserRoleRequest {
  id: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | 'student' | 'teacher' | 'admin';
  status?: 'all' | 'active' | 'inactive';
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: createBaseQueryWithReauth(`${BASE_URL}/api/v1/users/admin/`),
  tagTypes: ['User', 'UsersList', 'UserStats'],
  endpoints: (builder) => ({
    // List all users with pagination and filtering
    getUsers: builder.query<UsersResponse, UsersListParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.role && params.role !== 'all') searchParams.append('role', params.role);
        if (params.status && params.status !== 'all') searchParams.append('status', params.status);
        
        return `users/?${searchParams.toString()}`;
      },
      providesTags: ['UsersList', 'UserStats'],
    }),

    // Get user details by ID
    getUserById: builder.query<UserDetailResponse, string>({
      query: (id) => `users/${id}/`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Update user basic information
    updateUser: builder.mutation<{ message: string; user: User }, UpdateUserRequest>({
      query: ({ id, ...body }) => ({
        url: `users/${id}/update/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'UsersList',
        'UserStats',
      ],
    }),

    // Update user role
    updateUserRole: builder.mutation<{ message: string; user: User }, UpdateUserRoleRequest>({
      query: ({ id, role }) => ({
        url: `users/${id}/role/`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'UsersList',
        'UserStats',
      ],
    }),

    // Toggle user active status
    toggleUserStatus: builder.mutation<{ message: string; user: User }, string>({
      query: (id) => ({
        url: `users/${id}/status/`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        'UsersList',
        'UserStats',
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<{ message: string; cascade_test: any }, string>({
      query: (id) => ({
        url: `users/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        'UsersList',
        'UserStats',
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} = adminApi;