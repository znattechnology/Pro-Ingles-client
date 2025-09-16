"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useGetAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import Loading from "@/components/course/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Clock
} from "lucide-react";

const TeacherDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetAllCoursesQuery({ category: "all" });

  // Calculate teacher stats
  const teacherStats = React.useMemo(() => {
    if (!courses || !user?.id) return {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      avgRating: 0
    };
    
    const teacherCourses = courses.filter(course => course.teacherId === user.id);
    const publishedCourses = teacherCourses.filter(course => course.status === 'Published');
    const draftCourses = teacherCourses.filter(course => course.status === 'Draft');
    const totalStudents = teacherCourses.reduce((sum, course) => sum + ((course as any).enrollments?.length || 0), 0);
    
    // Mock data for revenue and rating (replace with real data when available)
    const totalRevenue = totalStudents * 49.99; // Assuming average price
    const avgRating = 4.8;
    
    return {
      totalCourses: teacherCourses.length,
      publishedCourses: publishedCourses.length,
      draftCourses: draftCourses.length,
      totalStudents,
      totalRevenue,
      avgRating
    };
  }, [courses, user?.id]);

  // Recent courses (last 3)
  const recentCourses = React.useMemo(() => {
    if (!courses || !user?.id) return [];
    
    return courses
      .filter(course => course.teacherId === user.id)
      .sort((a, b) => new Date(b.created_at || '2024-01-01').getTime() - new Date(a.created_at || '2024-01-01').getTime())
      .slice(0, 3);
  }, [courses, user?.id]);

  // Show loading while auth is being checked or courses are loading
  if (authLoading || isLoading) {
    return <Loading />;
  }
  
  // Show error if courses couldn't load
  if (isError || !courses) {
    return <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center text-white">Erro ao carregar dados.</div>;
  }
  
  // Simple auth check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para acessar seu dashboard.</p>
          <Button
            onClick={() => router.push('/signin')}
            className="mt-4 bg-violet-600 hover:bg-violet-700"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Bem-vindo, {user.name || 'Professor'}! 👋
            </h1>
            <p className="text-gray-400">
              Aqui está um resumo da sua atividade como instrutor
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              onClick={() => router.push('/teacher/courses')}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Meus Cursos
            </Button>
            <Button
              onClick={() => router.push('/teacher/billing')}
              variant="outline"
              className="border-violet-500/30 text-gray-300 hover:text-white hover:bg-violet-800/20"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Faturamento
            </Button>
            <Button
              onClick={() => router.push('/teacher/laboratory')}
              variant="outline"
              className="border-violet-500/30 text-gray-300 hover:text-white hover:bg-violet-800/20"
            >
              <Target className="w-4 h-4 mr-2" />
              Laboratório
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total de Cursos</p>
                  <p className="text-2xl font-bold text-white">{teacherStats.totalCourses}</p>
                </div>
                <div className="p-3 bg-violet-600/20 rounded-full">
                  <BookOpen className="w-6 h-6 text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Cursos Publicados</p>
                  <p className="text-2xl font-bold text-white">{teacherStats.publishedCourses}</p>
                </div>
                <div className="p-3 bg-green-600/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total de Alunos</p>
                  <p className="text-2xl font-bold text-white">{teacherStats.totalStudents}</p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-full">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Avaliação Média</p>
                  <p className="text-2xl font-bold text-white">{teacherStats.avgRating}</p>
                </div>
                <div className="p-3 bg-yellow-600/20 rounded-full">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Cursos Recentes
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/teacher/courses')}
                  className="border-violet-500/30 text-gray-300 hover:text-white hover:bg-violet-800/20"
                >
                  Ver Todos
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCourses.length > 0 ? (
                  recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-customgreys-darkGrey/50 rounded-lg hover:bg-customgreys-darkGrey/70 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-400">
                          {(course as any).enrollments?.length || 0} alunos • {course.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/course/${course.id}`)}
                          className="text-gray-400 hover:text-white hover:bg-violet-800/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/teacher/courses/${course.id}`)}
                          className="text-gray-400 hover:text-white hover:bg-violet-800/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Nenhum curso criado ainda</p>
                    <Button
                      onClick={() => router.push('/teacher/courses')}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Curso
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Rascunhos</span>
                  <span className="text-white font-medium">{teacherStats.draftCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Este Mês</span>
                  <span className="text-white font-medium">
                    {new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Última Atualização</span>
                  <span className="text-white font-medium">Hoje</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push('/teacher/courses')}
                  className="w-full justify-start bg-violet-600/20 hover:bg-violet-600/30 text-violet-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Novo Curso
                </Button>
                <Button
                  onClick={() => router.push('/teacher/laboratory')}
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Acessar Laboratório
                </Button>
                <Button
                  onClick={() => router.push('/teacher/settings')}
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;