"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  TrendingUp, 
  Users,
  ArrowLeft,
  BarChart3,
  Target,
  Clock,
  Award,
  Calendar,
  Filter
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";

// Mock data - será substituído por chamadas API
const mockAnalytics = {
  totalExercises: 12,
  totalStudents: 89,
  totalSessions: 245,
  avgCompletionRate: 78.5,
  avgScore: 85.2,
  totalMinutesPracticed: 1420,
  weeklyData: [
    { week: 'Sem 1', sessions: 45, avgScore: 82 },
    { week: 'Sem 2', sessions: 52, avgScore: 84 },
    { week: 'Sem 3', sessions: 48, avgScore: 87 },
    { week: 'Sem 4', sessions: 51, avgScore: 85 }
  ],
  topExercises: [
    {
      id: "1",
      title: "Business Introduction Practice",
      completions: 67,
      avgScore: 89.2,
      difficulty: "INTERMEDIATE"
    },
    {
      id: "2", 
      title: "Pronunciation Drills - TH Sounds",
      completions: 54,
      avgScore: 82.8,
      difficulty: "BEGINNER"
    },
    {
      id: "3",
      title: "Job Interview Scenarios", 
      completions: 31,
      avgScore: 91.5,
      difficulty: "ADVANCED"
    }
  ],
  studentProgress: [
    {
      id: "1",
      name: "João Silva",
      sessionsCompleted: 15,
      avgScore: 92.3,
      improvementRate: 12.5
    },
    {
      id: "2",
      name: "Maria Santos", 
      sessionsCompleted: 12,
      avgScore: 87.1,
      improvementRate: 8.2
    },
    {
      id: "3",
      name: "Pedro Costa",
      sessionsCompleted: 18,
      avgScore: 94.7,
      improvementRate: 15.1
    }
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

export default function SpeakingAnalyticsPage() {
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
        // const analyticsData = await fetchSpeakingAnalytics(timeRange);
        
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
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-blue-950/20 to-indigo-950/30 border-b border-blue-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Botão de Voltar */}
          <Button
            onClick={handleBackToLab}
            variant="ghost"
            className="mb-6 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Laboratório
          </Button>

          <div className="text-center space-y-6">
            {/* Icon and Title */}
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  Analytics - Speaking Practice
                </h1>
                <p className="text-blue-300 text-lg font-medium">Métricas e insights sobre práticas de speaking</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Acompanhe o desempenho dos seus alunos, identifique exercícios mais populares 
              e monitore o progresso geral das práticas de speaking.
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
              className="bg-customgreys-secondarybg border border-blue-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
            <Card className="bg-customgreys-secondarybg border-blue-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Exercícios</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalExercises}</p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <Mic className="w-6 h-6 text-blue-400" />
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
            <Card className="bg-customgreys-secondarybg border-blue-900/30">
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
                  {analytics.topExercises.map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 rounded-lg bg-customgreys-darkGrey/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">
                          {index + 1}
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
                  ))}
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

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-customgreys-secondarybg border-blue-900/30">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
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