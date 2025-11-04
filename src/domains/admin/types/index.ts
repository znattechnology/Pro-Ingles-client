/**
 * Admin Domain Types
 * 
 * Type definitions for admin functionality including
 * user management, analytics, and system administration
 */

// Base admin types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: AdminPermission[];
  created_at: string;
  last_login?: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  codename: string;
  description: string;
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Dashboard analytics types
export interface AdminDashboardData {
  userMetrics: UserMetrics;
  courseMetrics: CourseMetrics;
  revenueMetrics: RevenueMetrics;
  systemMetrics: SystemMetrics;
  recentActivity: ActivityLog[];
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: {
    students: number;
    teachers: number;
    admins: number;
  };
  usersByStatus: {
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  };
}

export interface CourseMetrics {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  coursesByType: {
    video: number;
    practice: number;
  };
  totalEnrollments: number;
  averageCompletionRate: number;
  topPerformingCourses: CoursePerformance[];
}

export interface RevenueMetrics {
  totalRevenue: number; // in AOA
  monthlyRevenue: number; // in AOA
  dailyRevenue: number; // in AOA
  revenueGrowth: number; // percentage
  revenueByMonth: MonthlyRevenue[];
  revenueBySource: {
    videoCourses: number;
    practiceCourses: number;
    subscriptions: number;
  };
}

export interface SystemMetrics {
  uptime: number; // in hours
  responseTime: number; // in milliseconds
  errorRate: number; // percentage
  activeConnections: number;
  systemLoad: number; // percentage
  storageUsed: number; // in GB
  bandwidthUsed: number; // in GB
}

export interface ActivityLog {
  id: string;
  type: 'user_registration' | 'course_creation' | 'enrollment' | 'payment' | 'system_event';
  description: string;
  user_id?: string;
  user_name?: string;
  course_id?: string;
  course_title?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CoursePerformance {
  id: string;
  title: string;
  type: 'video' | 'practice';
  teacher_name: string;
  enrollments: number;
  completion_rate: number;
  revenue: number; // in AOA
  rating: number;
  created_at: string;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number; // in AOA
  enrollments: number;
  growth_percentage: number;
}

// User management types
export interface UserManagement {
  filters: UserFilters;
  sorting: UserSorting;
  pagination: PaginationInfo;
}

export interface UserFilters {
  role?: 'all' | 'student' | 'teacher' | 'admin';
  status?: 'all' | 'active' | 'inactive';
  verified?: 'all' | 'verified' | 'unverified';
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

export interface UserSorting {
  field: 'name' | 'email' | 'role' | 'created_at' | 'last_login';
  direction: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// System administration types
export interface SystemConfiguration {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxFileUploadSize: number; // in MB
  allowedFileTypes: string[];
  defaultLanguage: string;
  timezone: string;
  currency: 'AOA' | 'USD' | 'EUR';
  features: SystemFeatures;
}

export interface SystemFeatures {
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableFileUploads: boolean;
  enableVideoStreaming: boolean;
  enableLiveChat: boolean;
  enableCertificates: boolean;
  enableGamification: boolean;
}

// Notification types
export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  target: 'all' | 'students' | 'teachers' | 'admins';
  sent_at: string;
  read_by: string[]; // user IDs who have read this notification
  expires_at?: string;
}

// Export and reporting types
export interface ExportRequest {
  type: 'users' | 'courses' | 'enrollments' | 'revenue' | 'analytics';
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filters?: Record<string, any>;
  dateRange?: {
    start: string;
    end: string;
  };
  includeHeaders: boolean;
}

export interface ExportJob {
  id: string;
  type: ExportRequest['type'];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // percentage
  downloadUrl?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

// Analytics and reporting types
export interface AnalyticsFilter {
  period: '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';
  customRange?: {
    start: string;
    end: string;
  };
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
  segments?: string[];
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }>;
}

// Admin action types
export interface AdminAction {
  type: 'user_action' | 'system_action' | 'content_action';
  action: string;
  description: string;
  performed_by: string;
  target_id?: string;
  target_type?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error?: string;
}