"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Headphones, 
  TrendingUp, 
  Users,
  ArrowLeft,
  BarChart3,
  Target,
  Clock,
  Award,
  Calendar,
  Filter,
  Volume2,
  PenTool
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";

// Mock data - será substituído por chamadas API
const mockAnalytics = {
  totalExercises: 16,
  totalStudents: 92,
  totalSessions: 312,
  avgCompletionRate: 82.3,
  avgScore: 81.7,
  totalMinutesPracticed: 1876,
  weeklyData: [
    { week: 'Sem 1', sessions: 67, avgScore: 79 },
    { week: 'Sem 2', sessions: 71, avgScore: 81 },
    { week: 'Sem 3', sessions: 84, avgScore: 83 },
    { week: 'Sem 4', sessions: 90, avgScore: 84 }
  ],
  topExercises: [
    {
      id: "1",
      title: "Business Meeting Comprehension",
      completions: 78,
      avgScore: 86.4,
      difficulty: "INTERMEDIATE",
      type: "COMPREHENSION"
    },
    {
      id: "2", 
      title: "Dictation Practice - Basic",
      completions: 89,
      avgScore: 91.2,
      difficulty: "BEGINNER",
      type: "DICTATION"
    },
    {
      id: "3",
      title: "News Report Analysis", 
      completions: 67,
      avgScore: 88.5,
      difficulty: "INTERMEDIATE",
      type: "NEWS"
    }
  ],
  studentProgress: [
    {
      id: "1",
      name: "Ana Costa",
      sessionsCompleted: 22,
      avgScore: 94.8,
      improvementRate: 18.3
    },
    {
      id: "2",
      name: "Carlos Silva", 
      sessionsCompleted: 19,
      avgScore: 89.2,
      improvementRate: 14.7
    },
    {
      id: "3",
      name: "Beatriz Santos",
      sessionsCompleted: 25,
      avgScore: 92.1,
      improvementRate: 16.9
    }
  ],
  exerciseTypes: [
    { type: 'COMPREHENSION', count: 6, avgScore: 84.2 },
    { type: 'DICTATION', count: 4, avgScore: 88.7 },
    { type: 'ACCENTS', count: 3, avgScore: 76.5 },
    { type: 'NEWS', count: 3, avgScore: 82.1 }
  ]
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'BEGINNER': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'INTERMEDIATE': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'ADVANCED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'COMPREHENSION': return Volume2;
    case 'DICTATION': return PenTool;
    case 'ACCENTS': return Target;
    default: return Headphones;
  }
};

export default function ListeningAnalyticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    // Simular carregamento dos dados
    const loadData = async () => {
      try {
        setIsLoading(true);
        // TODO: Implementar chamadas reais para a API
        // const analyticsData = await fetchListeningAnalytics(timeRange);
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const handleBackToLab = () => {
    router.push('/teacher/laboratory');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-orange-950/20 to-red-950/30 border-b border-orange-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Botão de Voltar */}
          <Button
            onClick={handleBackToLab}
            variant="ghost"
            className="mb-6 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Laboratório
          </Button>

          <div className="text-center space-y-6">
            {/* Icon and Title */}
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-gradient-to-br from-orange-600 to-red-600 p-4 rounded-2xl shadow-2xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                  Analytics - Listening Practice
                </h1>
                <p className="text-orange-300 text-lg font-medium">Métricas e insights sobre práticas de listening</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Acompanhe o desempenho dos seus alunos em compreensão auditiva, 
              identifique exercícios mais eficazes e monitore o progresso geral.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Time Range Filter */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Visão Geral</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-customgreys-secondarybg border border-orange-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="1year">Último ano</option>
            </select>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-customgreys-secondarybg border-orange-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Exercícios</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalExercises}</p>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-xl">
                    <Headphones className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-customgreys-secondarybg border-green-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Alunos Ativos</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalStudents}</p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-customgreys-secondarybg border-yellow-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Sessões Completadas</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalSessions}</p>
                  </div>
                  <div className="bg-yellow-500/20 p-3 rounded-xl">
                    <Target className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-customgreys-secondarybg border-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pontuação Média</p>
                    <p className="text-3xl font-bold text-white">{analytics.avgScore}%</p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Exercises */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-customgreys-secondarybg border-orange-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Exercícios Mais Populares
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Exercícios com mais completações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topExercises.map((exercise, index) => {
                    const TypeIcon = getTypeIcon(exercise.type);
                    return (
                      <div key={exercise.id} className="flex items-center justify-between p-3 rounded-lg bg-customgreys-darkGrey/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="bg-orange-500/20 p-2 rounded-lg">
                            <TypeIcon className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{exercise.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                                {exercise.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{exercise.completions}</p>
                          <p className="text-gray-400 text-xs">{exercise.avgScore}% média</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Student Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-customgreys-secondarybg border-green-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top Estudantes
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Alunos com melhor desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.studentProgress.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-customgreys-darkGrey/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{student.name}</p>
                          <p className="text-gray-400 text-xs">{student.sessionsCompleted} sessões</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{student.avgScore}%</p>
                        <p className="text-green-400 text-xs">+{student.improvementRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Exercise Types Analysis */}
        <Card className="bg-customgreys-secondarybg border-orange-900/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Análise por Tipo de Exercício
            </CardTitle>
            <CardDescription className="text-gray-400">
              Performance por categoria de exercício
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.exerciseTypes.map((type) => {
                const TypeIcon = getTypeIcon(type.type);
                return (
                  <div key={type.type} className="p-4 rounded-lg bg-customgreys-darkGrey/50 text-center">
                    <div className="bg-orange-500/20 p-3 rounded-xl w-fit mx-auto mb-3">
                      <TypeIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">{type.type}</h4>
                    <p className="text-2xl font-bold text-white mb-1">{type.count}</p>
                    <p className="text-gray-400 text-sm mb-2">exercícios</p>
                    <p className="text-orange-400 font-medium">{type.avgScore}% média</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-customgreys-secondarybg border-orange-900/30">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{analytics.totalMinutesPracticed}</p>
              <p className="text-gray-400 text-sm">Minutos Praticados</p>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-green-900/30">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{analytics.avgCompletionRate}%</p>
              <p className="text-gray-400 text-sm">Taxa de Conclusão</p>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-purple-900/30">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">
                {(analytics.totalSessions / 30).toFixed(1)}
              </p>
              <p className="text-gray-400 text-sm">Sessões/Dia (Média)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}