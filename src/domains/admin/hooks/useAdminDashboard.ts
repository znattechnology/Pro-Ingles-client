import { useMemo } from 'react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import { 
  useGetAdminDashboardQuery,
  useGetAdminStatsQuery,
} from '../api';

// Conversão USD para Kwanza Angolano (taxa aproximada: 1 USD = 800 AOA)
const USD_TO_AOA_RATE = 800;

export interface AdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  activeUsers: number;
  verifiedUsers: number;
  totalCourses: number;
  videoCourses: number;
  practiceCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalRevenue: number; // em AOA
  monthlyRevenue: number; // em AOA
  growthRate: number;
  engagementRate: number;
  recentEnrollments: number;
  topPerformingCourses: Array<{
    id: string;
    title: string;
    students: number;
    revenue: number; // em AOA
    type: 'video' | 'practice';
    teacher_name: string;
  }>;
}

export interface RecentStudent {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  dateJoined: string;
  lastLogin: string | null;
}

export interface ChartData {
  name: string;
  value: number;
}

// Dados mock para quando a API não estiver disponível
const generateMockData = (): {
  stats: AdminDashboardStats;
  recentStudents: RecentStudent[];
  enrollmentChartData: ChartData[];
  revenueChartData: ChartData[];
} => {
  const stats: AdminDashboardStats = {
    totalUsers: 2547,
    totalStudents: 2145,
    totalTeachers: 87,
    totalAdmins: 15,
    activeUsers: 1876,
    verifiedUsers: 2234,
    totalCourses: 156,
    videoCourses: 89,
    practiceCourses: 67,
    publishedCourses: 134,
    draftCourses: 22,
    totalRevenue: 45_680_000, // em AOA
    monthlyRevenue: 8_920_000, // em AOA
    growthRate: 23.5,
    engagementRate: 78.3,
    recentEnrollments: 147,
    topPerformingCourses: [
      {
        id: '1',
        title: 'Inglês Avançado para Negócios',
        students: 234,
        revenue: 9_360_000, // em AOA
        type: 'video',
        teacher_name: 'Prof. Maria Santos'
      },
      {
        id: '2',
        title: 'Conversação Inglesa',
        students: 189,
        revenue: 7_560_000, // em AOA
        type: 'practice',
        teacher_name: 'Prof. João Silva'
      },
      {
        id: '3',
        title: 'TOEFL Preparação',
        students: 156,
        revenue: 6_240_000, // em AOA
        type: 'video',
        teacher_name: 'Prof. Ana Costa'
      },
      {
        id: '4',
        title: 'Inglês Básico',
        students: 298,
        revenue: 5_960_000, // em AOA
        type: 'practice',
        teacher_name: 'Prof. Carlos Mendes'
      },
      {
        id: '5',
        title: 'Business English',
        students: 123,
        revenue: 4_920_000, // em AOA
        type: 'video',
        teacher_name: 'Prof. Rita Fernandes'
      }
    ],
  };

  const recentStudents: RecentStudent[] = [
    {
      id: '1',
      name: 'António Cardoso',
      email: 'antonio.cardoso@email.com',
      role: 'student',
      isActive: true,
      dateJoined: '2024-10-28T10:30:00Z',
      lastLogin: '2024-10-31T08:15:00Z'
    },
    {
      id: '2',
      name: 'Beatriz Nunes',
      email: 'beatriz.nunes@email.com',
      role: 'student',
      isActive: true,
      dateJoined: '2024-10-27T14:20:00Z',
      lastLogin: '2024-10-30T16:45:00Z'
    },
    {
      id: '3',
      name: 'Carlos Miguel',
      email: 'carlos.miguel@email.com',
      role: 'student',
      isActive: true,
      dateJoined: '2024-10-26T09:15:00Z',
      lastLogin: '2024-10-31T07:30:00Z'
    },
    {
      id: '4',
      name: 'Diana Sousa',
      email: 'diana.sousa@email.com',
      role: 'student',
      isActive: false,
      dateJoined: '2024-10-25T11:45:00Z',
      lastLogin: '2024-10-29T13:20:00Z'
    },
    {
      id: '5',
      name: 'Eduardo Lima',
      email: 'eduardo.lima@email.com',
      role: 'student',
      isActive: true,
      dateJoined: '2024-10-24T16:00:00Z',
      lastLogin: null
    }
  ];

  const enrollmentChartData: ChartData[] = [
    { name: 'Jun', value: 145 },
    { name: 'Jul', value: 167 },
    { name: 'Ago', value: 189 },
    { name: 'Set', value: 201 },
    { name: 'Out', value: 234 },
    { name: 'Nov', value: 189 }
  ];

  const revenueChartData: ChartData[] = [
    { name: 'Jun', value: 6_800_000 },
    { name: 'Jul', value: 7_200_000 },
    { name: 'Ago', value: 7_900_000 },
    { name: 'Set', value: 8_100_000 },
    { name: 'Out', value: 8_900_000 },
    { name: 'Nov', value: 8_920_000 }
  ];

  return {
    stats,
    recentStudents,
    enrollmentChartData,
    revenueChartData
  };
};

export function useAdminDashboard() {
  const { user } = useDjangoAuth();

  // Tentar buscar dados da API admin dashboard
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useGetAdminDashboardQuery(undefined, {
    skip: !user?.id || user.role !== 'admin'
  });

  // Tentar buscar estatísticas específicas
  const {
    data: statsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useGetAdminStatsQuery({ period: '30d' }, {
    skip: !user?.id || user.role !== 'admin'
  });

  // Preparar dados com fallback para mock
  const { stats, recentStudents, enrollmentChartData, revenueChartData } = useMemo(() => {
    if (!user?.id || user.role !== 'admin') {
      return generateMockData();
    }

    // Se tivermos dados da API, use-os
    if (dashboardData && !isDashboardError) {
      const apiStats: AdminDashboardStats = {
        totalUsers: dashboardData.stats.total_users,
        totalStudents: dashboardData.stats.student_users,
        totalTeachers: dashboardData.stats.teacher_users,
        totalAdmins: dashboardData.stats.admin_users,
        activeUsers: dashboardData.stats.active_users,
        verifiedUsers: dashboardData.stats.verified_users,
        totalCourses: dashboardData.stats.total_courses,
        videoCourses: Math.floor(dashboardData.stats.total_courses * 0.6), // estimativa
        practiceCourses: Math.floor(dashboardData.stats.total_courses * 0.4), // estimativa
        publishedCourses: dashboardData.stats.published_courses,
        draftCourses: dashboardData.stats.draft_courses,
        totalRevenue: dashboardData.stats.total_revenue * USD_TO_AOA_RATE,
        monthlyRevenue: dashboardData.stats.monthly_revenue * USD_TO_AOA_RATE,
        growthRate: dashboardData.stats.growth_rate,
        engagementRate: dashboardData.stats.engagement_rate,
        recentEnrollments: dashboardData.recent_users.length,
        topPerformingCourses: dashboardData.top_courses.map(course => ({
          id: course.id,
          title: course.title,
          students: course.students,
          revenue: course.revenue * USD_TO_AOA_RATE,
          type: course.type,
          teacher_name: course.teacher_name,
        })),
      };

      const apiRecentStudents: RecentStudent[] = dashboardData.recent_users
        .filter(user => user.role === 'student')
        .slice(0, 10)
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.is_active,
          dateJoined: user.date_joined,
          lastLogin: user.last_login || null,
        }));

      const apiEnrollmentChartData: ChartData[] = dashboardData.user_growth_chart.map(item => ({
        name: item.month,
        value: item.users,
      }));

      const apiRevenueChartData: ChartData[] = dashboardData.revenue_chart.map(item => ({
        name: item.month,
        value: Math.round(item.revenue * USD_TO_AOA_RATE),
      }));

      return {
        stats: apiStats,
        recentStudents: apiRecentStudents,
        enrollmentChartData: apiEnrollmentChartData,
        revenueChartData: apiRevenueChartData
      };
    }

    // Fallback para dados mock
    console.log('📊 Admin Dashboard: Usando dados mock - API não disponível');
    return generateMockData();
  }, [dashboardData, isDashboardError, user?.id, user?.role]);

  const isLoading = isDashboardLoading || isStatsLoading;
  const isError = isDashboardError && isStatsError;

  return {
    adminStats: stats,
    recentStudents,
    enrollmentChartData,
    revenueChartData,
    systemHealth: null, // Será implementado posteriormente
    isLoading,
    isError,
    rawData: {
      dashboardData,
      statsData,
    },
  };
}