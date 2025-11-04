"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Download,
  RefreshCw,
  PlayCircle,
  Gamepad2,
  Star,
  Clock,
  Target,
  Award,
  BarChart3,
  Settings,
  Crown
} from "lucide-react";
import Loading from "@/components/course/Loading";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { djangoAuth } from "@/lib/django-auth";

// Types para analytics
interface CourseAnalytics {
  overview: {
    total_courses: number;
    published_courses: number;
    draft_courses: number;
    video_courses: number;
    practice_courses: number;
    courses_growth_percentage: number;
  };
  engagement: {
    total_enrollments: number;
    active_enrollments: number;
    daily_active_users: number;
    weekly_active_users: number;
    enrollment_growth: number;
    average_completion_rate: number;
  };
  performance: {
    top_courses: Array<{
      id: string;
      title: string;
      course_type: string;
      enrollments: number;
      completion_rate: number;
      average_rating: number;
    }>;
    completion_trends: Array<{
      month: string;
      completions: number;
      enrollments: number;
    }>;
  };
  revenue: {
    total_revenue: string;
    monthly_revenue: string;
    revenue_growth: number;
    revenue_by_template: Record<string, string>;
  };
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function CourseAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data para demonstração
  const mockAnalytics: CourseAnalytics = {
    overview: {
      total_courses: 127,
      published_courses: 89,
      draft_courses: 38,
      video_courses: 76,
      practice_courses: 51,
      courses_growth_percentage: 12.5
    },
    engagement: {
      total_enrollments: 3456,
      active_enrollments: 2891,
      daily_active_users: 234,
      weekly_active_users: 1456,
      enrollment_growth: 18.7,
      average_completion_rate: 68.3
    },
    performance: {
      top_courses: [
        {
          id: '1',
          title: 'Business English Advanced',
          course_type: 'video',
          enrollments: 456,
          completion_rate: 72.1,
          average_rating: 4.6
        },
        {
          id: '2',
          title: 'Oil & Gas Technical English',
          course_type: 'practice',
          enrollments: 389,
          completion_rate: 78.5,
          average_rating: 4.8
        },
        {
          id: '3',
          title: 'Executive Communication',
          course_type: 'video',
          enrollments: 267,
          completion_rate: 65.3,
          average_rating: 4.4
        }
      ],
      completion_trends: [
        { month: 'Jan', completions: 45, enrollments: 156 },
        { month: 'Fev', completions: 52, enrollments: 178 },
        { month: 'Mar', completions: 68, enrollments: 203 },
        { month: 'Abr', completions: 71, enrollments: 234 },
        { month: 'Mai', completions: 63, enrollments: 198 },
        { month: 'Jun', completions: 78, enrollments: 267 }
      ]
    },
    revenue: {
      total_revenue: '2,345,678 AOA',
      monthly_revenue: '234,567 AOA',
      revenue_growth: 22.3,
      revenue_by_template: {
        'business': '567,890 AOA',
        'oil-gas': '345,678 AOA',
        'technology': '234,567 AOA',
        'executive': '198,543 AOA'
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Get JWT token using the proper auth service
      const token = djangoAuth.getAccessToken();
      
      if (!token) {
        setError('Token de autenticação não encontrado. Faça login novamente.');
        setAnalytics(mockAnalytics); // Fallback to mock data
        return;
      }

      const response = await fetch('/api/v1/courses/analytics?endpoint=overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics:', response.status);
        setError('Erro ao carregar analytics dos cursos. Usando dados de demonstração.');
        setAnalytics(mockAnalytics); // Fallback to mock data
      }
    } catch (err) {
      setError('Erro de conexão. Usando dados de demonstração.');
      console.error('Analytics fetch error:', err);
      setAnalytics(mockAnalytics); // Fallback to mock data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [isAuthenticated, user]);

  const handleExportCSV = () => {
    if (!analytics) return;

    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Cursos', analytics.overview.total_courses],
      ['Cursos Publicados', analytics.overview.published_courses],
      ['Total de Inscrições', analytics.engagement.total_enrollments],
      ['Taxa de Conclusão Média', `${analytics.engagement.average_completion_rate}%`],
      ['Receita Total', analytics.revenue.total_revenue],
      ['Receita Mensal', analytics.revenue.monthly_revenue]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `course_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Loading 
        title="Analytics de Cursos"
        subtitle="Dashboard Administrativo"
        description="Carregando métricas e relatórios dos cursos..."
        icon={BarChart3}
        progress={75}
        theme={{
          primary: "blue",
          secondary: "indigo",
          accent: "cyan"
        }}
        size="lg"
      />
    );
  }

  if (!isAuthenticated || !user) {
    return <div>Faça login para acessar esta página.</div>;
  }

  if (user.role !== 'admin') {
    return <div>Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  if (loading || !analytics) {
    return (
      <Loading 
        title="Processando Analytics"
        subtitle="Análise de Dados"
        description="Compilando métricas dos cursos..."
        icon={BarChart3}
        progress={60}
        theme={{
          primary: "green",
          secondary: "emerald",
          accent: "teal"
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Enhanced Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-6 sm:py-8"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-indigo-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm shadow-lg shadow-blue-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </motion.div>
              <span className="text-blue-300 font-semibold text-sm sm:text-base lg:text-lg">Analytics Avançado</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight"
            >
              Insights{' '}
              <motion.span 
                className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Poderosos
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                📊
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 font-light"
            >
              Análise completa de <motion.span className="text-blue-400 font-medium" whileHover={{ scale: 1.05 }}>performance</motion.span>,{' '}
              <motion.span className="text-indigo-400 font-medium" whileHover={{ scale: 1.05 }}>engajamento</motion.span> e{' '}
              <motion.span className="text-cyan-400 font-medium" whileHover={{ scale: 1.05 }}>métricas avançadas</motion.span>
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/50 transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={fetchAnalytics}
                disabled={refreshing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border border-red-700 rounded-lg p-4"
          >
            <div className="text-red-300">{error}</div>
          </motion.div>
        )}

        {/* Enhanced KPI Cards */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative"
        >
          {/* Background glow effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-cyan-600/5 rounded-2xl blur-xl" />
          
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-black backdrop-blur-sm shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Total de Cursos</p>
                    <motion.p 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                      className="text-2xl font-bold text-white"
                    >
                      {analytics.overview.total_courses}
                    </motion.p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{analytics.overview.courses_growth_percentage}% este mês
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <BookOpen className="w-8 h-8 text-blue-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-black backdrop-blur-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-lg" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Estudantes Ativos</p>
                    <motion.p 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: "spring" }}
                      className="text-2xl font-bold text-white"
                    >
                      {analytics.engagement.active_enrollments.toLocaleString()}
                    </motion.p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{analytics.engagement.enrollment_growth}% este mês
                    </p>
                  </div>
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Users className="w-8 h-8 text-indigo-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative border border-green-500/30 bg-gradient-to-br from-green-950/50 to-black backdrop-blur-sm shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Taxa de Conclusão</p>
                    <motion.p 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.0, type: "spring" }}
                      className="text-2xl font-bold text-white"
                    >
                      {analytics.engagement.average_completion_rate}%
                    </motion.p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +5.2% este mês
                    </p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Target className="w-8 h-8 text-green-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative border border-yellow-500/30 bg-gradient-to-br from-yellow-950/50 to-black backdrop-blur-sm shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Receita Mensal</p>
                    <motion.p 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.1, type: "spring" }}
                      className="text-2xl font-bold text-white"
                    >
                      {analytics.revenue.monthly_revenue}
                    </motion.p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{analytics.revenue.revenue_growth}% este mês
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Tabs Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-cyan-600/10 rounded-xl blur-lg" />
              <TabsList className="relative bg-gradient-to-r from-blue-950/50 via-indigo-950/50 to-cyan-950/50 border border-blue-500/30 grid grid-cols-2 sm:grid-cols-4 w-full backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/30 data-[state=active]:to-indigo-600/30 data-[state=active]:text-white transition-all duration-300 hover:bg-blue-600/10"
                >
                  <motion.span whileHover={{ scale: 1.05 }}>Visão Geral</motion.span>
                </TabsTrigger>
                <TabsTrigger 
                  value="performance" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/30 data-[state=active]:to-purple-600/30 data-[state=active]:text-white transition-all duration-300 hover:bg-indigo-600/10"
                >
                  <motion.span whileHover={{ scale: 1.05 }}>Performance</motion.span>
                </TabsTrigger>
                <TabsTrigger 
                  value="engagement" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/30 data-[state=active]:to-pink-600/30 data-[state=active]:text-white transition-all duration-300 hover:bg-purple-600/10"
                >
                  <motion.span whileHover={{ scale: 1.05 }}>Engajamento</motion.span>
                </TabsTrigger>
                <TabsTrigger 
                  value="revenue" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600/30 data-[state=active]:to-emerald-600/30 data-[state=active]:text-white transition-all duration-300 hover:bg-green-600/10"
                >
                  <motion.span whileHover={{ scale: 1.05 }}>Receita</motion.span>
                </TabsTrigger>
              </TabsList>
            </div>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Enhanced Course Types Distribution */}
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-black backdrop-blur-sm shadow-lg shadow-blue-500/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg" />
                  <CardHeader className="relative">
                    <CardTitle className="text-white flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <PlayCircle className="w-5 h-5 text-blue-400" />
                      </motion.div>
                      Distribuição por Tipo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">Cursos de Vídeo</span>
                        </div>
                        <motion.span 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-white font-medium"
                        >
                          {analytics.overview.video_courses}
                        </motion.span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">Cursos Práticos</span>
                        </div>
                        <motion.span 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-white font-medium"
                        >
                          {analytics.overview.practice_courses}
                        </motion.span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                        <span className="text-gray-400">Total</span>
                        <span className="text-white font-bold">{analytics.overview.total_courses}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Status Distribution */}
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-green-500/30 bg-gradient-to-br from-green-950/30 to-black backdrop-blur-sm shadow-lg shadow-green-500/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg" />
                  <CardHeader className="relative">
                    <CardTitle className="text-white flex items-center gap-2">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </motion.div>
                      Status dos Cursos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-600">Publicados</Badge>
                        </div>
                        <motion.span 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-white font-medium"
                        >
                          {analytics.overview.published_courses}
                        </motion.span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-600">Rascunhos</Badge>
                        </div>
                        <motion.span 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-white font-medium"
                        >
                          {analytics.overview.draft_courses}
                        </motion.span>
                      </div>
                      <div className="pt-2 border-t border-gray-600">
                        <div className="text-sm text-gray-400">
                          Taxa de Publicação: {Math.round((analytics.overview.published_courses / analytics.overview.total_courses) * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Enhanced Completion Trends Chart */}
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-black backdrop-blur-sm shadow-lg shadow-indigo-500/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent rounded-lg" />
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <CardTitle className="text-white flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <BarChart3 className="w-5 h-5 text-indigo-400" />
                        </motion.div>
                        Tendências de Conclusão
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.performance.completion_trends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="completions" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            name="Conclusões"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="enrollments" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            name="Inscrições"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Top Courses Table */}
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-black backdrop-blur-sm shadow-lg shadow-purple-500/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded-lg" />
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <CardTitle className="text-white flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Award className="w-5 h-5 text-purple-400" />
                        </motion.div>
                        Top Cursos
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      {analytics.performance.top_courses.map((course, index) => (
                        <motion.div 
                          key={course.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.5 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-transparent border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div 
                              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              {index + 1}
                            </motion.div>
                            <div>
                              <p className="text-white font-medium">{course.title}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                {course.course_type === 'video' ? (
                                  <PlayCircle className="w-3 h-3" />
                                ) : (
                                  <Gamepad2 className="w-3 h-3" />
                                )}
                                <span>{course.enrollments} estudantes</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <motion.div 
                              className="flex items-center gap-1"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-white">{course.average_rating}</span>
                            </motion.div>
                            <div className="text-sm text-green-400">
                              {course.completion_rate}% conclusão
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="relative border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-black backdrop-blur-sm shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Usuários Diários</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {analytics.engagement.daily_active_users}
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock className="w-8 h-8 text-blue-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="relative border border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-black backdrop-blur-sm shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Usuários Semanais</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {analytics.engagement.weekly_active_users}
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Award className="w-8 h-8 text-purple-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="relative border border-green-500/30 bg-gradient-to-br from-green-950/50 to-black backdrop-blur-sm shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Inscrições</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {analytics.engagement.total_enrollments.toLocaleString()}
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Users className="w-8 h-8 text-green-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-black backdrop-blur-sm shadow-lg shadow-emerald-500/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-lg" />
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <CardTitle className="text-white flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <DollarSign className="w-5 h-5 text-emerald-400" />
                        </motion.div>
                        Receita por Template
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      {Object.entries(analytics.revenue.revenue_by_template).map(([template, revenue], index) => (
                        <motion.div 
                          key={template} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.5 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-500/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            />
                            <span className="text-gray-300 capitalize">{template.replace('-', ' & ')}</span>
                          </div>
                          <motion.span 
                            className="text-white font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            {revenue}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-green-500/30 bg-gradient-to-br from-green-950/30 to-black backdrop-blur-sm shadow-lg shadow-green-500/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg" />
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <CardTitle className="text-white flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </motion.div>
                        Resumo Financeiro
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <motion.div 
                        className="flex items-center justify-between"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-gray-400">Receita Total</span>
                        <motion.span 
                          className="text-white font-bold"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                        >
                          {analytics.revenue.total_revenue}
                        </motion.span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center justify-between"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-gray-400">Receita Mensal</span>
                        <motion.span 
                          className="text-white font-bold"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          {analytics.revenue.monthly_revenue}
                        </motion.span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center justify-between pt-2 border-t border-gray-600"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-gray-400">Crescimento</span>
                        <motion.span 
                          className="text-green-400 font-bold flex items-center gap-1"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6, type: "spring" }}
                        >
                          <TrendingUp className="w-4 h-4" />
                          +{analytics.revenue.revenue_growth}%
                        </motion.span>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </div>
  );
}