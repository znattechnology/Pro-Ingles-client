"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Volume2,
  Headphones,
  PenTool,
  Globe,
  ArrowLeft,
  Star,
  Trophy,
  Flame,
  Heart,
  BarChart3,
  PieChart,
  Activity,
  MessageCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data - will be replaced with API calls
const mockProgressData = {
  overall: {
    totalSessions: 22,
    totalMinutes: 186,
    totalHoursListened: 3.1,
    averageComprehensionScore: 79,
    averageDictationScore: 82,
    overallScore: 80,
    currentStreak: 7,
    longestStreak: 12,
    heartsUsed: 12,
    level: "B1",
    nextLevel: "B2",
    progressToNextLevel: 73
  },
  weeklyStats: {
    sessionsThisWeek: 6,
    minutesThisWeek: 45,
    averageScoreThisWeek: 84,
    bestDayThisWeek: "Terça"
  },
  skillBreakdown: {
    comprehension: 79,
    dictation: 82,
    vocabulary: 85,
    accent_recognition: 74
  },
  difficultyBreakdown: {
    beginner: 15,
    intermediate: 6,
    advanced: 1
  },
  accentBreakdown: {
    american: 12,
    british: 6,
    neutral: 3,
    other: 1
  },
  exerciseTypeStats: {
    audio_comprehension: 10,
    dictation: 7,
    conversation_listening: 3,
    accent_recognition: 2
  },
  recentSessions: [
    {
      id: "1",
      title: "Business Presentation",
      date: "2024-01-15",
      duration: 10,
      comprehensionScore: 85,
      dictationScore: 78,
      exerciseType: "AUDIO_COMPREHENSION",
      accentType: "AMERICAN",
      difficulty: "INTERMEDIATE",
      hearts: 5
    },
    {
      id: "2",
      title: "Restaurant Conversation",
      date: "2024-01-14",
      duration: 6,
      comprehensionScore: 92,
      dictationScore: 88,
      exerciseType: "CONVERSATION_LISTENING",
      accentType: "BRITISH",
      difficulty: "BEGINNER",
      hearts: 5
    },
    {
      id: "3", 
      title: "News Report",
      date: "2024-01-13",
      duration: 12,
      comprehensionScore: 72,
      dictationScore: 75,
      exerciseType: "DICTATION",
      accentType: "NEUTRAL",
      difficulty: "ADVANCED",
      hearts: 3
    }
  ],
  achievements: [
    {
      id: "first_listening",
      title: "Primeira Escuta",
      description: "Complete sua primeira sessão de listening",
      icon: Headphones,
      earned: true,
      earnedDate: "2024-01-08"
    },
    {
      id: "dictation_master",
      title: "Mestre do Ditado",
      description: "Obtenha 90+ pontos em ditado 5 vezes",
      icon: PenTool,
      earned: true,
      earnedDate: "2024-01-12"
    },
    {
      id: "accent_explorer",
      title: "Explorador de Sotaques",
      description: "Pratique com 3 sotaques diferentes",
      icon: Globe,
      earned: true,
      earnedDate: "2024-01-10"
    },
    {
      id: "marathon_listener",
      title: "Maratonista da Escuta",
      description: "Escute por mais de 60 minutos em um dia",
      icon: Clock,
      earned: false,
      earnedDate: null
    },
    {
      id: "perfect_comprehension",
      title: "Compreensão Perfeita",
      description: "Obtenha 100% de compreensão em uma sessão",
      icon: Star,
      earned: false,
      earnedDate: null
    }
  ],
  weeklyChart: [
    { day: "Dom", sessions: 1, avgScore: 78, minutes: 8 },
    { day: "Seg", sessions: 2, avgScore: 85, minutes: 15 },
    { day: "Ter", sessions: 3, avgScore: 91, minutes: 18 },
    { day: "Qua", sessions: 0, avgScore: 0, minutes: 0 },
    { day: "Qui", sessions: 1, avgScore: 72, minutes: 6 },
    { day: "Sex", sessions: 2, avgScore: 88, minutes: 12 },
    { day: "Sáb", sessions: 1, avgScore: 83, minutes: 10 }
  ],
  speedPreferences: {
    "0.5x": 12,
    "0.75x": 25,
    "1.0x": 45,
    "1.25x": 15,
    "1.5x": 3
  }
};

export default function ListeningProgressDashboard() {
  // TODO: Implement timeframe selection
  // const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const router = useRouter();

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  // TODO: Implement score background color function
  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case "AUDIO_COMPREHENSION": return Headphones;
      case "DICTATION": return PenTool;
      case "CONVERSATION_LISTENING": return MessageCircle;
      case "ACCENT_RECOGNITION": return Globe;
      default: return Volume2;
    }
  };

  const getExerciseTypeLabel = (type: string) => {
    switch (type) {
      case "AUDIO_COMPREHENSION": return "Compreensão";
      case "DICTATION": return "Ditado";
      case "CONVERSATION_LISTENING": return "Conversação";
      case "ACCENT_RECOGNITION": return "Sotaque";
      default: return "Listening";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER": return "bg-green-500";
      case "INTERMEDIATE": return "bg-yellow-500";
      case "ADVANCED": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getAccentFlag = (accent: string) => {
    const flags = {
      'AMERICAN': '🇺🇸',
      'BRITISH': '🇬🇧',
      'CANADIAN': '🇨🇦',
      'AUSTRALIAN': '🇦🇺',
      'NEUTRAL': '🌍'
    };
    return flags[accent as keyof typeof flags] || '🌍';
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <Button 
              onClick={() => router.back()} 
              variant="ghost" 
              className="text-gray-300 hover:text-white flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="truncate">Progresso Listening</span>
              </h1>
              <p className="text-gray-300 mt-1 text-sm sm:text-base">Acompanhe sua evolução na compreensão auditiva</p>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push("/user/laboratory/listening/practice")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 w-full sm:w-auto"
            size="sm"
          >
            <Headphones className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Praticar Agora</span>
            <span className="sm:hidden">Praticar</span>
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 sm:mb-2 text-blue-400" />
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{mockProgressData.overall.totalMinutes}</div>
              <div className="text-xs sm:text-sm text-gray-400">
                <span className="hidden sm:inline">Min Totais</span>
                <span className="sm:hidden">Min</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 sm:mb-2 text-cyan-400" />
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{mockProgressData.overall.totalSessions}</div>
              <div className="text-xs sm:text-sm text-gray-400">Sessões</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 sm:mb-2 text-green-400" />
              <div className={`text-base sm:text-lg lg:text-2xl font-bold ${getScoreColor(mockProgressData.overall.overallScore)}`}>
                {mockProgressData.overall.overallScore}%
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                <span className="hidden sm:inline">Score Médio</span>
                <span className="sm:hidden">Score</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 sm:mb-2 text-orange-400" />
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{mockProgressData.overall.currentStreak}</div>
              <div className="text-xs sm:text-sm text-gray-400">
                <span className="hidden sm:inline">Sequência</span>
                <span className="sm:hidden">Seq.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 col-span-2 sm:col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 sm:mb-2 text-purple-400" />
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{mockProgressData.overall.totalHoursListened}</div>
              <div className="text-xs sm:text-sm text-gray-400">
                <span className="hidden sm:inline">Horas Ouvidas</span>
                <span className="sm:hidden">Horas</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 h-auto p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Habilidades</span>
              <span className="sm:hidden">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm py-2">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Conquistas</span>
              <span className="sm:hidden">Conq.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Level Progress */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Nível Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="text-3xl sm:text-4xl font-bold text-blue-400">
                      {mockProgressData.overall.level}
                    </div>
                    <Progress 
                      value={mockProgressData.overall.progressToNextLevel} 
                      className="w-full h-2 sm:h-3"
                    />
                    <p className="text-gray-300 text-sm sm:text-base">
                      {mockProgressData.overall.progressToNextLevel}% para {mockProgressData.overall.nextLevel}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Summary */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    Esta Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Sessões</span>
                      <span className="text-white font-bold text-sm sm:text-base">{mockProgressData.weeklyStats.sessionsThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Minutos</span>
                      <span className="text-white font-bold text-sm sm:text-base">{mockProgressData.weeklyStats.minutesThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Score Médio</span>
                      <span className={`font-bold text-sm sm:text-base ${getScoreColor(mockProgressData.weeklyStats.averageScoreThisWeek)}`}>
                        {mockProgressData.weeklyStats.averageScoreThisWeek}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Melhor Dia</span>
                      <span className="text-white font-bold text-sm sm:text-base">{mockProgressData.weeklyStats.bestDayThisWeek}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Chart */}
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Atividade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {mockProgressData.weeklyChart.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-400 mb-1 sm:mb-2">{day.day}</div>
                      <div className="bg-customgreys-darkGrey rounded-lg p-2 sm:p-3 space-y-1">
                        <div className="text-white font-bold text-xs sm:text-sm">{day.sessions}</div>
                        <div className="text-xs text-gray-400">
                          <span className="hidden sm:inline">sessões</span>
                          <span className="sm:hidden">s</span>
                        </div>
                        {day.avgScore > 0 && (
                          <div className={`text-xs font-semibold ${getScoreColor(day.avgScore)}`}>
                            {day.avgScore}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Skill Breakdown */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <span className="hidden sm:inline">Habilidades por Categoria</span>
                    <span className="sm:hidden">Habilidades</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {Object.entries(mockProgressData.skillBreakdown).map(([skill, score]) => (
                    <div key={skill} className="space-y-1 sm:space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize text-sm sm:text-base">{skill === 'comprehension' ? 'Compreensão' : skill === 'dictation' ? 'Ditado' : skill === 'vocabulary' ? 'Vocabulário' : 'Reconhecimento de Sotaque'}</span>
                        <span className={`font-bold text-sm sm:text-base ${getScoreColor(score)}`}>{score}%</span>
                      </div>
                      <Progress value={score} className="h-1.5 sm:h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Exercise Type Stats */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <span className="hidden sm:inline">Tipos de Exercício</span>
                    <span className="sm:hidden">Tipos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {Object.entries(mockProgressData.exerciseTypeStats).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {React.createElement(getExerciseIcon(type.toUpperCase()), { 
                          className: "w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" 
                        })}
                        <span className="text-gray-300 text-sm sm:text-base truncate">{getExerciseTypeLabel(type.toUpperCase())}</span>
                      </div>
                      <Badge variant="outline" className="border-blue-600 text-blue-300 text-xs flex-shrink-0">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Difficulty Distribution */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <span className="hidden sm:inline">Distribuição por Dificuldade</span>
                    <span className="sm:hidden">Dificuldade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {Object.entries(mockProgressData.difficultyBreakdown).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${getDifficultyColor(level.toUpperCase())}`} />
                        <span className="text-gray-300 capitalize text-sm sm:text-base">{level}</span>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        <span className="hidden sm:inline">{count} sessões</span>
                        <span className="sm:hidden">{count}</span>
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Accent Distribution */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <span className="hidden sm:inline">Sotaques Praticados</span>
                    <span className="sm:hidden">Sotaques</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {Object.entries(mockProgressData.accentBreakdown).map(([accent, count]) => (
                    <div key={accent} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base sm:text-lg flex-shrink-0">{getAccentFlag(accent.toUpperCase())}</span>
                        <span className="text-gray-300 capitalize text-sm sm:text-base truncate">{accent}</span>
                      </div>
                      <Badge variant="outline" className="border-cyan-600 text-cyan-300 text-xs flex-shrink-0">
                        <span className="hidden sm:inline">{count} sessões</span>
                        <span className="sm:hidden">{count}</span>
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Speed Preferences */}
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span className="hidden sm:inline">Preferências de Velocidade</span>
                  <span className="sm:hidden">Velocidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                  {Object.entries(mockProgressData.speedPreferences).map(([speed, percentage]) => (
                    <div key={speed} className="text-center">
                      <div className="bg-customgreys-darkGrey rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
                        <div className="text-white font-bold text-sm sm:text-base">{speed}</div>
                        <Progress value={percentage} className="h-1.5 sm:h-2" />
                        <div className="text-xs text-gray-400">{percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span className="hidden sm:inline">Sessões Recentes</span>
                  <span className="sm:hidden">Histórico</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {mockProgressData.recentSessions.map((session) => {
                    const IconComponent = getExerciseIcon(session.exerciseType);
                    return (
                      <div key={session.id} className="bg-customgreys-darkGrey rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-blue-900/30 rounded-lg flex-shrink-0">
                              <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-white font-semibold text-sm sm:text-base truncate">{session.title}</h4>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                                <span>{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{session.duration}min</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1">
                                  {getAccentFlag(session.accentType)} 
                                  <span className="hidden sm:inline">{session.accentType}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                            <div className="text-center sm:text-right">
                              <div className={`font-bold text-sm sm:text-base ${getScoreColor(session.comprehensionScore)}`}>
                                {session.comprehensionScore}%
                              </div>
                              <div className="text-xs text-gray-400">
                                <span className="hidden sm:inline">Compreensão</span>
                                <span className="sm:hidden">Score</span>
                              </div>
                            </div>
                            <div className="flex gap-0.5 sm:gap-1">
                              {Array.from({ length: session.hearts }).map((_, i) => (
                                <Heart key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 fill-current" />
                              ))}
                            </div>
                            <Badge className={`${getDifficultyColor(session.difficulty)} text-white text-xs flex-shrink-0`}>
                              <span className="hidden sm:inline">{session.difficulty}</span>
                              <span className="sm:hidden">{session.difficulty.charAt(0)}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {mockProgressData.achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <Card key={achievement.id} className={`border-2 transition-all ${
                    achievement.earned 
                      ? "bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-600/50" 
                      : "bg-customgreys-secondarybg/60 border-gray-600/30"
                  }`}>
                    <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                      <div className={`mx-auto w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 ${
                        achievement.earned ? "bg-yellow-600" : "bg-gray-700"
                      }`}>
                        <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${
                          achievement.earned ? "text-white" : "text-gray-400"
                        }`} />
                      </div>
                      <h3 className={`text-sm sm:text-base lg:text-lg font-bold mb-1 sm:mb-2 ${
                        achievement.earned ? "text-yellow-300" : "text-gray-300"
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4 leading-relaxed">
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedDate && (
                        <Badge variant="outline" className="border-yellow-600 text-yellow-300 text-xs">
                          {new Date(achievement.earnedDate).toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                      {!achievement.earned && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                          <span className="hidden sm:inline">Não conquistado</span>
                          <span className="sm:hidden">Bloqueado</span>
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}