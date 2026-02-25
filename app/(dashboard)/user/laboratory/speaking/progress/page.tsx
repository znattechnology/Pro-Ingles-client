"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  MessageCircle,
  Mic,
  BookOpen,
  Zap,
  Trophy,
  Flame
} from "lucide-react";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";

interface DashboardData {
  user_info: {
    name: string;
    email: string;
    current_level: string;
    member_since: string;
  };
  overall_stats: {
    total_sessions: number;
    total_hours: number;
    total_words_spoken: number;
    overall_average_score: number;
    personal_best_score: number;
    current_streak_days: number;
    longest_streak_days: number;
  };
  recent_performance: {
    last_30_days_sessions: number;
    recent_average_score: number;
    recent_fluency: number;
    recent_pronunciation: number;
    recent_grammar: number;
    recent_vocabulary: number;
    recent_practice_hours: number;
    recent_corrections_total: number;
  };
  session_history: Array<{
    session_id: string;
    date: string;
    time: string;
    duration_minutes: number;
    overall_score: number;
    fluency_score: number;
    pronunciation_score: number;
    grammar_score: number;
    vocabulary_score: number;
    improvement_from_previous: number;
    level: string;
    domain: string;
  }>;
  insights_and_recommendations: Array<{
    type: 'positive' | 'suggestion' | 'achievement' | 'milestone';
    title: string;
    message: string;
  }>;
}

export default function SpeakingProgressPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useDjangoAuth();

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const userEmail = user?.email || 'adao_vivaldo@hotmail.com'; // fallback for development
        console.log('🔍 Fetching progress data for user:', userEmail);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(`/api/django/practice/vapi/dashboard?user_email=${userEmail}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Received data:', data);
        
        if (data.success && data.dashboard) {
          console.log('✅ Setting dashboard data');
          setDashboardData(data.dashboard);
        } else {
          console.log('❌ Invalid response structure:', data);
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        console.error('❌ Error fetching progress data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load progress data');
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    console.log('🎯 useEffect triggered, user:', user?.email);
    fetchProgressData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Carregando Dashboard de Progresso</p>
                <p className="text-sm text-gray-600">Analisando suas sessões de conversação...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Erro ao carregar dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <p className="text-xs text-gray-500 text-center">
              Se o problema persistir, verifique sua conexão com a internet
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Nenhum dado encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Comece a praticar conversação para ver seu progresso!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user_info, overall_stats, recent_performance, session_history, insights_and_recommendations } = dashboardData;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10 text-violet-600" />
            Progresso de Conversação
          </h1>
          <p className="text-xl text-gray-600">
            Acompanhe sua evolução em prática de conversação com IA
          </p>
        </div>

        {/* User Info Card */}
        <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user_info.name}</h2>
                <p className="text-violet-200">Nível atual: {user_info.current_level}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Membro desde {new Date(user_info.member_since).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                <span>{overall_stats.current_streak_days} dias consecutivos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overall_stats.total_sessions}</div>
              <p className="text-xs text-muted-foreground">
                {recent_performance.last_30_days_sessions} nos últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Praticadas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overall_stats.total_hours}h</div>
              <p className="text-xs text-muted-foreground">
                {recent_performance.recent_practice_hours}h este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(overall_stats.overall_average_score)}`}>
                {overall_stats.overall_average_score}%
              </div>
              <p className="text-xs text-muted-foreground">
                Melhor: {overall_stats.personal_best_score}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maior Sequência</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{overall_stats.longest_streak_days}</div>
              <p className="text-xs text-muted-foreground">
                Atual: {overall_stats.current_streak_days} dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Recente (Últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fluência</span>
                  <span className={`text-sm font-bold ${getScoreColor(recent_performance.recent_fluency)}`}>
                    {recent_performance.recent_fluency}%
                  </span>
                </div>
                <Progress value={recent_performance.recent_fluency} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Pronúncia</span>
                  <span className={`text-sm font-bold ${getScoreColor(recent_performance.recent_pronunciation)}`}>
                    {recent_performance.recent_pronunciation}%
                  </span>
                </div>
                <Progress value={recent_performance.recent_pronunciation} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Gramática</span>
                  <span className={`text-sm font-bold ${getScoreColor(recent_performance.recent_grammar)}`}>
                    {recent_performance.recent_grammar}%
                  </span>
                </div>
                <Progress value={recent_performance.recent_grammar} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Vocabulário</span>
                  <span className={`text-sm font-bold ${getScoreColor(recent_performance.recent_vocabulary)}`}>
                    {recent_performance.recent_vocabulary}%
                  </span>
                </div>
                <Progress value={recent_performance.recent_vocabulary} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Histórico de Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session_history.slice(0, 10).map((session, index) => (
                <div key={session.session_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-violet-600">#{index + 1}</div>
                      <div className="text-xs text-gray-500">{session.time}</div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {new Date(session.date).toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.duration_minutes} min • {session.level} • {session.domain}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getScoreBadgeColor(session.overall_score)}>
                      {session.overall_score}%
                    </Badge>
                    {session.improvement_from_previous !== 0 && (
                      <div className={`flex items-center gap-1 text-sm ${
                        session.improvement_from_previous > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`w-4 h-4 ${
                          session.improvement_from_previous < 0 ? 'rotate-180' : ''
                        }`} />
                        {session.improvement_from_previous > 0 ? '+' : ''}{session.improvement_from_previous}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights and Recommendations */}
        {insights_and_recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Insights e Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights_and_recommendations.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'positive' ? 'bg-green-50 border-green-400' :
                    insight.type === 'achievement' ? 'bg-yellow-50 border-yellow-400' :
                    insight.type === 'milestone' ? 'bg-purple-50 border-purple-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {insight.type === 'positive' && <Trophy className="w-5 h-5 text-green-600 mt-0.5" />}
                      {insight.type === 'achievement' && <Award className="w-5 h-5 text-yellow-600 mt-0.5" />}
                      {insight.type === 'milestone' && <Target className="w-5 h-5 text-purple-600 mt-0.5" />}
                      {insight.type === 'suggestion' && <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />}
                      <div>
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}