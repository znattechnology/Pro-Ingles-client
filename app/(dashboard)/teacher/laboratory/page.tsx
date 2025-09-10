"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import CourseBanner from "@/components/course/CourseBanner";
import { useRouter } from "next/navigation";
import { 
  Plus,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Layers,
  Play,
  Settings,
  BarChart3,
  GraduationCap
} from "lucide-react";

const LaboratoryDashboard = () => {
  const { user, isAuthenticated } = useDjangoAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalChallenges: 0,
    completionRate: 0
  });

  useEffect(() => {
    // Simular carregamento dos dados
    setTimeout(() => {
      setStats({
        totalCourses: 2,
        totalStudents: 77,
        totalChallenges: 270,
        completionRate: 73
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full space-y-6">
      <CourseBanner 
        title="Laboratório de Práticas - Duolingo Style" 
        subtitle="Sistema completo de criação e gestão de cursos interativos"
        rightElement={
          <Button 
            className="bg-violet-800 hover:bg-violet-900"
            onClick={() => router.push('/teacher/laboratory/create-course')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Curso
          </Button>
        }
      />

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Cursos Ativos</CardTitle>
            <BookOpen className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{stats.totalCourses}</div>
            <p className="text-xs text-gray-400">
              +2 desde o mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Estudantes Ativos</CardTitle>
            <Users className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{stats.totalStudents}</div>
            <p className="text-xs text-gray-400">
              +12 novos esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Desafios</CardTitle>
            <Target className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{stats.totalChallenges}</div>
            <p className="text-xs text-gray-400">
              Distribuídos em todos os cursos
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{stats.completionRate}%</div>
            <p className="text-xs text-gray-400">
              +5% desde o mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Course Card */}
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-xl hover:border-violet-500/50 transition-all duration-200 cursor-pointer group"
              onClick={() => router.push('/teacher/laboratory/create-course')}>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-customgreys-darkGrey rounded-lg group-hover:bg-violet-600/20 transition-colors">
                <Plus className="h-5 w-5 text-violet-400 group-hover:text-violet-300" />
              </div>
              <CardTitle className="text-lg text-white">Criar Novo Curso</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base mb-4 text-gray-300">
              Inicie um novo curso do zero com nosso wizard inteligente
            </CardDescription>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Templates por categoria</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Preview em tempo real</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Salvamento automático</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manage Courses Card */}
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-xl hover:border-violet-500/50 transition-all duration-200 cursor-pointer group"
              onClick={() => router.push('/teacher/laboratory/manage-courses')}>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-customgreys-darkGrey rounded-lg group-hover:bg-violet-600/20 transition-colors">
                <Layers className="h-5 w-5 text-violet-400 group-hover:text-violet-300" />
              </div>
              <CardTitle className="text-lg text-white">Gerenciar Cursos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base mb-4 text-gray-300">
              Edite e organize seus cursos existentes
            </CardDescription>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Editar unidades e lições</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Reorganizar conteúdo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Status e publicação</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lesson Constructor Card */}
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-xl hover:border-violet-500/50 transition-all duration-200 cursor-pointer group"
              onClick={() => router.push('/teacher/laboratory/lesson-constructor')}>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-customgreys-darkGrey rounded-lg group-hover:bg-violet-600/20 transition-colors">
                <BookOpen className="h-5 w-5 text-violet-400 group-hover:text-violet-300" />
              </div>
              <CardTitle className="text-lg text-white">Construtor de Lições</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base mb-4 text-gray-300">
              Crie lições estruturadas com preview em tempo real
            </CardDescription>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Templates pré-definidos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Objetivos de aprendizagem</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Preview Duolingo-style</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-xl hover:border-violet-500/50 transition-all duration-200 cursor-pointer group"
              onClick={() => router.push('/teacher/laboratory/analytics')}>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-customgreys-darkGrey rounded-lg group-hover:bg-violet-600/20 transition-colors">
                <BarChart3 className="h-5 w-5 text-violet-400 group-hover:text-violet-300" />
              </div>
              <CardTitle className="text-lg text-white">Analytics Avançado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base mb-4 text-gray-300">
              Acompanhe o desempenho detalhado dos seus cursos
            </CardDescription>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Progresso dos estudantes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Performance por exercício</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>Relatórios exportáveis</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
        <CardHeader>
          <CardTitle className="text-white">Ações Rápidas</CardTitle>
          <CardDescription className="text-gray-300">
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-2 border-customgreys-darkerGrey bg-customgreys-darkGrey hover:bg-violet-600/10 hover:border-violet-500 text-gray-300 hover:text-white"
              onClick={() => router.push('/teacher/laboratory/lesson-constructor')}
            >
              <BookOpen className="h-5 w-5 text-violet-400" />
              <span className="text-sm">Construtor de Lições</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-2 border-customgreys-darkerGrey bg-customgreys-darkGrey hover:bg-violet-600/10 hover:border-violet-500 text-gray-300 hover:text-white"
              onClick={() => router.push('/teacher/laboratory/challenge-constructor')}
            >
              <Target className="h-5 w-5 text-violet-400" />
              <span className="text-sm">Construtor de Desafios</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-2 border-customgreys-darkerGrey bg-customgreys-darkGrey hover:bg-violet-600/10 hover:border-violet-500 text-gray-300 hover:text-white"
              onClick={() => router.push('/teacher/laboratory/student-progress')}
            >
              <GraduationCap className="h-5 w-5 text-violet-400" />
              <span className="text-sm">Progresso dos Alunos</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-2 border-customgreys-darkerGrey bg-customgreys-darkGrey hover:bg-violet-600/10 hover:border-violet-500 text-gray-300 hover:text-white"
              onClick={() => router.push('/teacher/laboratory/test-course')}
            >
              <Play className="h-5 w-5 text-violet-400" />
              <span className="text-sm">Testar Curso</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-2 border-customgreys-darkerGrey bg-customgreys-darkGrey hover:bg-violet-600/10 hover:border-violet-500 text-gray-300 hover:text-white"
              onClick={() => router.push('/teacher/laboratory/settings')}
            >
              <Settings className="h-5 w-5 text-violet-400" />
              <span className="text-sm">Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
        <CardHeader>
          <CardTitle className="text-white">Atividade Recente</CardTitle>
          <CardDescription className="text-gray-300">
            Últimas ações e atualizações nos seus cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-customgreys-darkGrey rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Curso "Inglês para Tecnologia" foi publicado</p>
                <p className="text-xs text-gray-400">2 horas atrás</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-customgreys-darkGrey rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">15 novos exercícios adicionados ao curso "Business English"</p>
                <p className="text-xs text-gray-400">1 dia atrás</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-customgreys-darkGrey rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Relatório semanal disponível para download</p>
                <p className="text-xs text-gray-400">3 dias atrás</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaboratoryDashboard;