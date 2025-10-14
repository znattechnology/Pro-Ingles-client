"use client";

/**
 * Student Personal Analytics Page - Phase 3 Implementation
 * 
 * This page provides detailed analytics and insights for students about their
 * learning progress, strengths, weaknesses, and personalized recommendations.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock, 
  Target, 
  Brain,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Zap,
  Star,
  Trophy,
  BookOpen,
  Users,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/course/Loading';

interface AnalyticsData {
  overview: {
    totalStudyTime: number; // in minutes
    lessonsCompleted: number;
    averageAccuracy: number;
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    weeklyGoalProgress: number;
  };
  performance: {
    accuracyTrend: Array<{ date: string; accuracy: number }>;
    categoryPerformance: Array<{ category: string; accuracy: number; timeSpent: number }>;
    weakAreas: Array<{ topic: string; accuracy: number; improvements: string[] }>;
    strengths: Array<{ topic: string; accuracy: number; examples: string[] }>;
  };
  progress: {
    weekly: Array<{ day: string; lessons: number; timeSpent: number }>;
    monthly: Array<{ week: string; progress: number }>;
    comparison: {
      vsLastWeek: number;
      vsAverage: number;
      rankPosition: number;
      totalStudents: number;
    };
  };
  recommendations: Array<{
    id: string;
    type: 'practice' | 'review' | 'challenge' | 'break';
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function StudentAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API calls
      const mockAnalytics: AnalyticsData = {
        overview: {
          totalStudyTime: 420, // 7 hours
          lessonsCompleted: 45,
          averageAccuracy: 85,
          currentStreak: 7,
          longestStreak: 15,
          totalPoints: 1890,
          weeklyGoalProgress: 80
        },
        performance: {
          accuracyTrend: [
            { date: 'Seg', accuracy: 78 },
            { date: 'Ter', accuracy: 82 },
            { date: 'Qua', accuracy: 88 },
            { date: 'Qui', accuracy: 85 },
            { date: 'Sex', accuracy: 91 },
            { date: 'Sáb', accuracy: 87 },
            { date: 'Dom', accuracy: 89 }
          ],
          categoryPerformance: [
            { category: 'Gramática', accuracy: 92, timeSpent: 120 },
            { category: 'Vocabulário', accuracy: 88, timeSpent: 150 },
            { category: 'Pronuncia', accuracy: 76, timeSpent: 90 },
            { category: 'Compreensão', accuracy: 84, timeSpent: 60 }
          ],
          weakAreas: [
            {
              topic: 'Present Perfect',
              accuracy: 64,
              improvements: ['Revisar formação', 'Praticar mais exemplos', 'Usar em contexto']
            },
            {
              topic: 'Pronúncia de TH',
              accuracy: 58,
              improvements: ['Exercícios específicos', 'Gravações práticas', 'Feedback de IA']
            }
          ],
          strengths: [
            {
              topic: 'Present Simple',
              accuracy: 96,
              examples: ['Statements', 'Questions', 'Negatives']
            },
            {
              topic: 'Basic Vocabulary',
              accuracy: 94,
              examples: ['Family words', 'Daily activities', 'Colors and numbers']
            }
          ]
        },
        progress: {
          weekly: [
            { day: 'Seg', lessons: 3, timeSpent: 45 },
            { day: 'Ter', lessons: 2, timeSpent: 30 },
            { day: 'Qua', lessons: 4, timeSpent: 60 },
            { day: 'Qui', lessons: 2, timeSpent: 30 },
            { day: 'Sex', lessons: 5, timeSpent: 75 },
            { day: 'Sáb', lessons: 3, timeSpent: 45 },
            { day: 'Dom', lessons: 1, timeSpent: 15 }
          ],
          monthly: [
            { week: 'Sem 1', progress: 65 },
            { week: 'Sem 2', progress: 78 },
            { week: 'Sem 3', progress: 85 },
            { week: 'Sem 4', progress: 92 }
          ],
          comparison: {
            vsLastWeek: 15,
            vsAverage: 8,
            rankPosition: 15,
            totalStudents: 342
          }
        },
        recommendations: [
          {
            id: '1',
            type: 'practice',
            title: 'Foque em Present Perfect',
            description: 'Sua precisão neste tópico está abaixo da média (64%)',
            action: 'Praticar agora',
            priority: 'high'
          },
          {
            id: '2',
            type: 'challenge',
            title: 'Desafio de Pronúncia',
            description: 'Melhore sua pronúncia com exercícios específicos',
            action: 'Aceitar desafio',
            priority: 'medium'
          },
          {
            id: '3',
            type: 'review',
            title: 'Revisar Vocabulário',
            description: 'Reforce palavras aprendidas há mais de 7 dias',
            action: 'Revisar agora',
            priority: 'medium'
          },
          {
            id: '4',
            type: 'break',
            title: 'Pausa Recomendada',
            description: 'Você estudou muito hoje! Uma pausa pode ajudar na absorção.',
            action: 'Entendi',
            priority: 'low'
          }
        ]
      };

      setAnalytics(mockAnalytics);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!analytics) {
    return <div className="text-white">Erro ao carregar dados</div>;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/user/dashboard')}
            className="bg-customgreys-secondarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Meus Analytics
            </h1>
            <p className="text-customgreys-dirtyGrey">
              Insights detalhados sobre seu progresso e performance
            </p>
          </div>
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Tempo Total</p>
                  <p className="text-xl font-bold text-white">
                    {Math.floor(analytics.overview.totalStudyTime / 60)}h {analytics.overview.totalStudyTime % 60}m
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Precisão</p>
                  <p className="text-xl font-bold text-white">{analytics.overview.averageAccuracy}%</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Sequência</p>
                  <p className="text-xl font-bold text-white">{analytics.overview.currentStreak} dias</p>
                </div>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Ranking</p>
                  <p className="text-xl font-bold text-white">#{analytics.progress.comparison.rankPosition}</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-customgreys-secondarybg">
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Progresso
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          
          {/* Accuracy Trend */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-400" />
                Tendência de Precisão (7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.performance.accuracyTrend.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-green-500 rounded-t min-h-[20px] flex items-end justify-center pb-2"
                      style={{ height: `${(day.accuracy / 100) * 200}px` }}
                    >
                      <span className="text-white text-xs font-bold">{day.accuracy}%</span>
                    </div>
                    <span className="text-customgreys-dirtyGrey text-xs mt-2">{day.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white">Performance por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performance.categoryPerformance.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">{category.category}</span>
                      <span className="text-customgreys-dirtyGrey">
                        {category.accuracy}% • {category.timeSpent}min
                      </span>
                    </div>
                    <Progress value={category.accuracy} className="h-3 bg-customgreys-darkGrey" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          
          {/* Weekly Progress */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                Atividade Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {analytics.progress.weekly.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-customgreys-primarybg rounded-lg p-3 border border-customgreys-darkerGrey">
                      <p className="text-customgreys-dirtyGrey text-xs mb-1">{day.day}</p>
                      <p className="text-white font-bold">{day.lessons}</p>
                      <p className="text-customgreys-dirtyGrey text-xs">{day.timeSpent}m</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <p className="text-customgreys-dirtyGrey">vs. Semana Passada</p>
                </div>
                <p className="text-2xl font-bold text-green-400">+{analytics.progress.comparison.vsLastWeek}%</p>
              </CardContent>
            </Card>
            
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <p className="text-customgreys-dirtyGrey">vs. Média Geral</p>
                </div>
                <p className="text-2xl font-bold text-blue-400">+{analytics.progress.comparison.vsAverage}%</p>
              </CardContent>
            </Card>
            
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  <p className="text-customgreys-dirtyGrey">Posição no Ranking</p>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  #{analytics.progress.comparison.rankPosition} / {analytics.progress.comparison.totalStudents}
                </p>
              </CardContent>
            </Card>
          </div>
          
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          
          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.strengths.map((strength, index) => (
                    <div key={index} className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-green-300 font-medium">{strength.topic}</h4>
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          {strength.accuracy}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {strength.examples.map((example, idx) => (
                          <span key={idx} className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded">
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weak Areas */}
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-400" />
                  Áreas para Melhorar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.weakAreas.map((weakness, index) => (
                    <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-red-300 font-medium">{weakness.topic}</h4>
                        <Badge variant="outline" className="border-red-500 text-red-400">
                          {weakness.accuracy}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {weakness.improvements.map((improvement, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                            <span className="text-red-200 text-sm">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personalized Recommendations */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-violet-400" />
                Recomendações Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recommendations.map((rec) => (
                  <div key={rec.id} className={`p-4 rounded-lg border ${
                    rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                    rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium flex items-center gap-2">
                          {rec.type === 'practice' && <BookOpen className="w-4 h-4" />}
                          {rec.type === 'challenge' && <Zap className="w-4 h-4" />}
                          {rec.type === 'review' && <Star className="w-4 h-4" />}
                          {rec.type === 'break' && <Clock className="w-4 h-4" />}
                          {rec.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          rec.priority === 'high' ? 'text-red-200' :
                          rec.priority === 'medium' ? 'text-yellow-200' :
                          'text-blue-200'
                        }`}>
                          {rec.description}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${
                        rec.priority === 'high' ? 'border-red-500 text-red-400' :
                        rec.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                        'border-blue-500 text-blue-400'
                      }`}>
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      {rec.action}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
        </TabsContent>
      </Tabs>
      
    </div>
  );
}