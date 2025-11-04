"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useTeacherDashboardAnalytics } from "@/hooks/useTeacherDashboardAnalytics";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import Loading from "@/components/course/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  DollarSign,
  Calendar,
  BarChart3,
  Award,
  Target,
  ArrowRight,
  GraduationCap,
  Zap,
  PlayCircle,
  FileText,
  Activity,
  CheckCircle,
  AlertCircle,
  Layers,
  Star,
  Timer,
  Flame,
  Brain
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  
  // Use our new analytics hook for real data
  const {
    teacherStats,
    recentCourses,
    isLoading,
    isError
  } = useTeacherDashboardAnalytics();

  // Performance metrics for the current month
  const performanceMetrics = React.useMemo(() => {
    return {
      monthlyGrowth: teacherStats.growthRate,
      engagementRate: teacherStats.avgCompletionRate,
      studentRetention: Math.min(95, (teacherStats.activeStudents / Math.max(1, teacherStats.totalStudents)) * 100),
      contentQuality: teacherStats.avgRating * 20, // Convert to percentage
    };
  }, [teacherStats]);

  // Quick insights based on real data
  const quickInsights = React.useMemo(() => {
    const insights = [];
    
    if (teacherStats.growthRate > 0) {
      insights.push({
        type: 'positive',
        icon: TrendingUp,
        title: 'Crescimento Positivo',
        description: `${teacherStats.growthRate}% de crescimento no último mês`
      });
    }
    
    if (teacherStats.avgCompletionRate > 70) {
      insights.push({
        type: 'positive',
        icon: Award,
        title: 'Alta Taxa de Conclusão',
        description: `${teacherStats.avgCompletionRate.toFixed(1)}% dos estudantes completam os cursos`
      });
    }
    
    if (teacherStats.avgRating >= 4.5) {
      insights.push({
        type: 'positive',
        icon: Star,
        title: 'Excelente Avaliação',
        description: `Média de ${teacherStats.avgRating} estrelas`
      });
    } else if (teacherStats.draftCourses > 0) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Cursos em Rascunho',
        description: `${teacherStats.draftCourses} curso(s) aguardando publicação`
      });
    }
    
    return insights.slice(0, 2); // Limit to 2 insights
  }, [teacherStats]);

  // Show loading while auth is being checked or courses are loading
  if (authLoading || isLoading) {
    return <Loading />;
  }
  
  // Show error if courses couldn't load
  if (isError) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-400 mb-4">Tente recarregar a página</p>
          <Button onClick={() => window.location.reload()} className="bg-violet-600 hover:bg-violet-700">
            Recarregar
          </Button>
        </div>
      </div>
    );
  }
  
  // Simple auth check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400 mb-4">Faça login para acessar seu dashboard.</p>
          <Button
            onClick={() => router.push('/signin')}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Modern Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-4 sm:py-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
        
        <div className='relative max-w-7xl mx-auto'>
          <div className="mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-full">
                <GraduationCap className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-violet-300 font-medium text-sm">Professor Dashboard</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white"
            >
              Bem-vindo, <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{user.name || 'Professor'}</span>! 
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                👋
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl"
            >
              Acompanhe o progresso dos seus cursos e estudantes na plataforma ProEnglish
            </motion.p>
          </div>
          
          {/* Quick Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap gap-3 sm:gap-4"
          >
            <Button
              onClick={() => router.push('/teacher/courses')}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm sm:text-base"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Meus Cursos</span>
              <span className="sm:hidden">Cursos</span>
            </Button>
            <Button
              onClick={() => router.push('/teacher/laboratory')}
              variant="outline"
              className="border-violet-500/30 text-gray-300 hover:text-white hover:bg-violet-800/20 text-sm sm:text-base"
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Laboratório</span>
              <span className="sm:hidden">Lab</span>
            </Button>
            <Button
              onClick={() => router.push('/teacher/billing')}
              variant="outline"
              className="border-violet-500/30 text-gray-300 hover:text-white hover:bg-violet-800/20 text-sm sm:text-base"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Faturamento</span>
              <span className="sm:hidden">$$$</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8"
        >
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 sm:col-span-1 lg:col-span-2">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-violet-600/20 rounded-lg"
                >
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Total de Cursos</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{teacherStats.totalCourses}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-violet-600/20 text-violet-300 text-xs">
                      {teacherStats.videoCourses} vídeo
                    </Badge>
                    <Badge className="bg-purple-600/20 text-purple-300 text-xs">
                      {teacherStats.practiceCourses} prática
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-green-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-green-600/20 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Publicados</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{teacherStats.publishedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-blue-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-blue-600/20 rounded-lg"
                >
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Total Estudantes</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{teacherStats.totalStudents}</p>
                  <p className="text-xs text-blue-400">{teacherStats.activeStudents} ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-orange-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-orange-600/20 rounded-lg"
                >
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Lições</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{teacherStats.totalLessons}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-yellow-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-yellow-600/20 rounded-lg"
                >
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Avaliação</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {teacherStats.avgRating > 0 ? teacherStats.avgRating.toFixed(1) : '--'}
                  </p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(teacherStats.avgRating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Performance Metrics */}
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-pink-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-pink-600/20 rounded-lg"
                >
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Taxa Conclusão</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{teacherStats.avgCompletionRate.toFixed(1)}%</p>
                  <p className="text-xs text-pink-400">dos estudantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-red-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-red-600/20 rounded-lg"
                >
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Crescimento</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {teacherStats.growthRate > 0 ? '+' : ''}{teacherStats.growthRate}%
                  </p>
                  <p className="text-xs text-red-400">último mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Insights Section */}
        {quickInsights.length > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              Insights Rápidos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <Card className={`bg-customgreys-secondarybg/60 backdrop-blur-sm ${
                    insight.type === 'positive' 
                      ? 'border-green-900/30' 
                      : 'border-orange-900/30'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'positive' 
                            ? 'bg-green-600/20' 
                            : 'bg-orange-600/20'
                        }`}>
                          <insight.icon className={`w-4 h-4 ${
                            insight.type === 'positive' 
                              ? 'text-green-400' 
                              : 'text-orange-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white text-sm">{insight.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analytics and Activity Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mb-8"
        >
          <div className="lg:col-span-2">
            <PerformanceChart data={performanceMetrics} />
          </div>
          <div className="lg:col-span-2">
            <ActivityFeed stats={{
              totalStudents: teacherStats.totalStudents,
              activeStudents: teacherStats.activeStudents,
              recentActivity: teacherStats.recentActivity,
              totalCourses: teacherStats.totalCourses,
              publishedCourses: teacherStats.publishedCourses,
              avgCompletionRate: teacherStats.avgCompletionRate
            }} />
          </div>
        </motion.div>

        {/* Main Grid - More responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Courses - Enhanced */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Activity className="w-5 h-5" />
                    Cursos Recentes
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Últimos cursos criados ou editados
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/teacher/courses')}
                  className="border-violet-500/30 text-gray-300 hover:text-white hover:bg-violet-800/20"
                >
                  Ver Todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {recentCourses.length > 0 ? (
                  recentCourses.slice(0, 4).map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center justify-between p-3 sm:p-4 bg-customgreys-darkGrey/20 rounded-lg border border-gray-600/20 hover:bg-customgreys-darkGrey/40 transition-all group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${
                          (course as any).type === 'video' 
                            ? 'bg-blue-600/20' 
                            : 'bg-purple-600/20'
                        }`}>
                          {(course as any).type === 'video' ? (
                            <PlayCircle className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Target className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white mb-1 truncate text-sm sm:text-base">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                            <Badge className={`text-xs ${
                              course.status === 'Published' || course.status === 'published'
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-orange-600/20 text-orange-400'
                            }`}>
                              {course.status === 'Published' || course.status === 'published' ? 'Publicado' : 'Rascunho'}
                            </Badge>
                            <span>•</span>
                            <span>{(course as any).type === 'video' ? 'Vídeo' : 'Prática'}</span>
                            {(course as any).lessons_count && (
                              <>
                                <span>•</span>
                                <span>{(course as any).lessons_count} lições</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push((course as any).type === 'video' 
                            ? `/course/${(course as any).courseId || course.id}` 
                            : `/teacher/laboratory/courses/${course.id}`
                          )}
                          className="text-gray-400 hover:text-white hover:bg-violet-800/20 p-2"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push((course as any).type === 'video'
                            ? `/teacher/courses/${(course as any).courseId || course.id}`
                            : `/teacher/laboratory/edit-course/${course.id}`
                          )}
                          className="text-gray-400 hover:text-white hover:bg-violet-800/20 p-2"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Nenhum curso criado ainda</p>
                    <Button
                      onClick={() => router.push('/teacher/laboratory/create-course')}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Curso
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Quick Stats and Actions */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Rascunhos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{teacherStats.draftCourses}</span>
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <Separator className="bg-gray-600/30" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Desafios</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{teacherStats.totalChallenges}</span>
                    <Layers className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <Separator className="bg-gray-600/30" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Tempo Total</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{Math.floor(teacherStats.totalWatchTime / 60)}h</span>
                    <Timer className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
                <Separator className="bg-gray-600/30" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Atividade Recente</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{teacherStats.recentActivity}</span>
                    <Activity className="w-3 h-3 text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push('/teacher/laboratory/create-course')}
                  className="w-full justify-start bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 group"
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Criar Novo Curso
                </Button>
                <Button
                  onClick={() => router.push('/teacher/laboratory/lesson-constructor')}
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 group"
                >
                  <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Construtor de Lições
                </Button>
                <Button
                  onClick={() => router.push('/teacher/laboratory/analytics')}
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 group"
                >
                  <BarChart3 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Ver Analytics
                </Button>
                <Button
                  onClick={() => router.push('/teacher/settings')}
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 group"
                >
                  <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Configurações
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}