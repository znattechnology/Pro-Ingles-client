/**
 * Admin API for platform management
 * 
 * Endpoints específicos para administradores com permissões adequadas
 * Não depende de endpoints de teacher/student para evitar problemas de permissões
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { adminBaseQuery } from '../../shared/api/baseQuery';

// Types for Admin API
export interface AdminUser {
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

export interface AdminStats {
  total_users: number;
  active_users: number;
  student_users: number;
  teacher_users: number;
  admin_users: number;
  verified_users: number;
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  total_revenue: number; // em USD, será convertido para AOA no frontend
  monthly_revenue: number;
  growth_rate: number;
  engagement_rate: number;
}

export interface AdminDashboardResponse {
  stats: AdminStats;
  recent_users: AdminUser[];
  top_courses: Array<{
    id: string;
    title: string;
    type: 'video' | 'practice';
    students: number;
    revenue: number;
    teacher_name: string;
  }>;
  revenue_chart: Array<{
    month: string;
    revenue: number;
  }>;
  user_growth_chart: Array<{
    month: string;
    users: number;
  }>;
}

export interface AdminUsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | 'student' | 'teacher' | 'admin';
  status?: 'all' | 'active' | 'inactive';
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  stats: AdminStats;
}

// API Slice específico para Admin
export const adminApiSlice = createApi({
  reducerPath: 'adminApi',
  baseQuery: adminBaseQuery,
  tagTypes: ['AdminDashboard', 'AdminUsers', 'AdminStats'],
  endpoints: (builder) => ({
    
    // ===== DASHBOARD ADMIN =====
    
    // Endpoint principal para dashboard - dados agregados
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => '/admin/dashboard/',
      providesTags: ['AdminDashboard'],
    }),

    // ===== GESTÃO DE UTILIZADORES =====
    
    // Listar todos os utilizadores com filtros
    getAdminUsers: builder.query<AdminUsersResponse, AdminUsersListParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.role && params.role !== 'all') searchParams.append('role', params.role);
        if (params.status && params.status !== 'all') searchParams.append('status', params.status);
        
        return `/admin/users/?${searchParams.toString()}`;
      },
      providesTags: ['AdminUsers'],
    }),

    // Obter detalhes de um utilizador específico
    getAdminUserById: builder.query<{ user: AdminUser }, string>({
      query: (userId) => `/admin/users/${userId}/`,
      providesTags: (result, error, id) => [{ type: 'AdminUsers', id }],
    }),

    // Atualizar estado de um utilizador (ativar/desativar)
    updateUserStatus: builder.mutation<
      { message: string; user: AdminUser },
      { userId: string; is_active: boolean }
    >({
      query: ({ userId, is_active }) => ({
        url: `/admin/users/${userId}/status/`,
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: ['AdminUsers', 'AdminDashboard'],
    }),

    // Atualizar role de um utilizador
    updateUserRole: builder.mutation<
      { message: string; user: AdminUser },
      { userId: string; role: 'student' | 'teacher' | 'admin' }
    >({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role/`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['AdminUsers', 'AdminDashboard'],
    }),

    // Eliminar um utilizador (soft delete - apenas desativa)
    deleteUser: builder.mutation<
      { message: string; user_id: string; action: string },
      string
    >({
      query: (userId) => ({
        url: `/admin/users/${userId}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUsers', 'AdminDashboard'],
    }),

    // ===== ESTATÍSTICAS ADMIN =====
    
    // Obter estatísticas gerais da plataforma
    getAdminStats: builder.query<AdminStats, { period?: '7d' | '30d' | '90d' | '1y' }>({
      query: ({ period = '30d' } = {}) => `/admin/stats/?period=${period}`,
      providesTags: ['AdminStats'],
    }),

    // ===== SISTEMA =====
    
    // Verificar saúde do sistema
    getSystemHealth: builder.query<{
      status: 'healthy' | 'warning' | 'error';
      uptime: number;
      memory_usage: number;
      disk_usage: number;
      active_users: number;
      response_time: number;
    }, void>({
      query: () => '/admin/system/health/',
    }),

  }),
});

// Export hooks
export const {
  useGetAdminDashboardQuery,
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetAdminStatsQuery,
  useGetSystemHealthQuery,
} = adminApiSlice;