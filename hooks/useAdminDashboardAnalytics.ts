import { useMemo } from 'react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import { useGetUsersQuery } from '@/src/modules2/admin/services/adminApi';
import { useGetAllTeacherCoursesQuery } from '@/src/domains/teacher/video-courses/api';
import { useGetTeacherCoursesQuery } from '@/src/domains/teacher/practice-courses/api';

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

export function useAdminDashboardAnalytics() {
  const { user } = useDjangoAuth();

  // Fetch all users data
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    isError: isUsersError,
  } = useGetUsersQuery({ limit: 1000 }); // Get all users for stats

  // Fetch all video courses for analytics
  const {
    data: videoCoursesResponse,
    isLoading: isLoadingVideoCourses,
    isError: isVideoCoursesError,
  } = useGetAllTeacherCoursesQuery({ category: "all" });

  // Fetch all practice courses for analytics
  const {
    data: practiceCoursesResponse,
    isLoading: isLoadingPracticeCourses,
    isError: isPracticeCoursesError,
  } = useGetTeacherCoursesQuery({ includeDrafts: true });

  const users = usersResponse?.users || [];
  const userStats = usersResponse?.stats;
  const videoCourses = videoCoursesResponse?.data || [];
  const practiceCourses = practiceCoursesResponse || [];

  // Calculate comprehensive admin stats
  const adminStats: AdminDashboardStats = useMemo(() => {
    if (!user?.id) {
      return {
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        totalCourses: 0,
        videoCourses: 0,
        practiceCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        growthRate: 0,
        engagementRate: 0,
        recentEnrollments: 0,
        topPerformingCourses: [],
      };
    }

    // User statistics from API
    const totalUsers = userStats?.total_users || users.length;
    const totalStudents = userStats?.student_users || users.filter(u => u.role === 'student').length;
    const totalTeachers = userStats?.teacher_users || users.filter(u => u.role === 'teacher').length;
    const totalAdmins = userStats?.admin_users || users.filter(u => u.role === 'admin').length;
    const activeUsers = userStats?.active_users || users.filter(u => u.is_active).length;
    const verifiedUsers = userStats?.verified_users || users.filter(u => u.email_verified).length;

    // Course statistics
    const allCourses = [...videoCourses, ...practiceCourses];
    const totalCourses = allCourses.length;
    const videoCoursesCount = videoCourses.length;
    const practiceCoursesCount = practiceCourses.length;

    const publishedCourses = allCourses.filter(course => 
      course.status === 'Published' || course.status === 'published'
    ).length;
    const draftCourses = allCourses.filter(course => 
      course.status === 'Draft' || course.status === 'draft'
    ).length;

    // Revenue calculations (converted to AOA)
    const totalEnrollments = videoCourses.reduce((sum, course) => 
      sum + ((course as any).total_enrollments || (course as any).enrollments?.length || 0), 0
    );

    // Estimate revenue based on enrollments (average course price in USD converted to AOA)
    const averageCoursePriceUSD = 50; // Estimated average price
    const totalRevenueAOA = totalEnrollments * averageCoursePriceUSD * USD_TO_AOA_RATE;

    // Calculate monthly revenue (estimate based on recent activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = users.filter(user => {
      const joinedDate = new Date(user.date_joined);
      return joinedDate > thirtyDaysAgo;
    });
    
    const monthlyRevenueAOA = recentUsers.length * averageCoursePriceUSD * USD_TO_AOA_RATE;

    // Calculate growth rate
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const usersLast30Days = users.filter(user => {
      const joinedDate = new Date(user.date_joined);
      return joinedDate > thirtyDaysAgo;
    }).length;
    
    const usersPrevious30Days = users.filter(user => {
      const joinedDate = new Date(user.date_joined);
      return joinedDate > sixtyDaysAgo && joinedDate <= thirtyDaysAgo;
    }).length;

    const growthRate = usersPrevious30Days > 0 
      ? ((usersLast30Days - usersPrevious30Days) / usersPrevious30Days) * 100
      : usersLast30Days > 0 ? 100 : 0;

    // Calculate engagement rate
    const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    // Top performing courses
    const topPerformingCourses = videoCourses
      .map(course => ({
        id: course.id,
        title: course.title,
        students: (course as any).total_enrollments || (course as any).enrollments?.length || 0,
        revenue: ((course as any).total_enrollments || 0) * averageCoursePriceUSD * USD_TO_AOA_RATE,
        type: 'video' as const,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);

    return {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      activeUsers,
      verifiedUsers,
      totalCourses,
      videoCourses: videoCoursesCount,
      practiceCourses: practiceCoursesCount,
      publishedCourses,
      draftCourses,
      totalRevenue: totalRevenueAOA,
      monthlyRevenue: monthlyRevenueAOA,
      growthRate: Number(growthRate.toFixed(1)),
      engagementRate: Number(engagementRate.toFixed(1)),
      recentEnrollments: recentUsers.length,
      topPerformingCourses,
    };
  }, [users, userStats, videoCourses, practiceCourses, user?.id]);

  // Recent students (last 10)
  const recentStudents: RecentStudent[] = useMemo(() => {
    return users
      .filter(user => user.role === 'student')
      .sort((a, b) => new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime())
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        dateJoined: user.date_joined,
        lastLogin: user.last_login,
      }));
  }, [users]);

  // Chart data for enrollments (last 6 months)
  const enrollmentChartData: ChartData[] = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index) + 1, 1);
      
      const usersInMonth = users.filter(user => {
        const joinedDate = new Date(user.date_joined);
        return joinedDate >= monthDate && joinedDate < nextMonthDate;
      }).length;
      
      return {
        name: month,
        value: usersInMonth,
      };
    });
  }, [users]);

  // Chart data for revenue (last 6 months in AOA)
  const revenueChartData: ChartData[] = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index) + 1, 1);
      
      const usersInMonth = users.filter(user => {
        const joinedDate = new Date(user.date_joined);
        return joinedDate >= monthDate && joinedDate < nextMonthDate;
      }).length;
      
      // Estimate revenue for the month in AOA
      const monthlyRevenueAOA = usersInMonth * 50 * USD_TO_AOA_RATE; // 50 USD average per user
      
      return {
        name: month,
        value: Math.round(monthlyRevenueAOA),
      };
    });
  }, [users]);

  const isLoading = isLoadingUsers || isLoadingVideoCourses || isLoadingPracticeCourses;
  const isError = isUsersError || isVideoCoursesError || isPracticeCoursesError;

  return {
    adminStats,
    recentStudents,
    enrollmentChartData,
    revenueChartData,
    isLoading,
    isError,
    rawData: {
      users,
      userStats,
      videoCourses,
      practiceCourses,
    },
  };
}

// Helper function to format currency in AOA
export function formatAOA(amount: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to format numbers in Portuguese (Angola)
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-AO').format(num);
}