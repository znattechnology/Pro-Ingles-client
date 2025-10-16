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
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.back()} 
              variant="ghost" 
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Progresso Listening
              </h1>
              <p className="text-gray-300 mt-1">Acompanhe sua evolução na compreensão auditiva</p>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push("/user/laboratory/listening/practice")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Headphones className="w-4 h-4 mr-2" />
            Praticar Agora
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{mockProgressData.overall.totalMinutes}</div>
              <div className="text-sm text-gray-400">Min Totais</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <Headphones className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
              <div className="text-2xl font-bold text-white">{mockProgressData.overall.totalSessions}</div>
              <div className="text-sm text-gray-400">Sessões</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className={`text-2xl font-bold ${getScoreColor(mockProgressData.overall.overallScore)}`}>
                {mockProgressData.overall.overallScore}%
              </div>
              <div className="text-sm text-gray-400">Score Médio</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-white">{mockProgressData.overall.currentStreak}</div>
              <div className="text-sm text-gray-400">Sequência</div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <Volume2 className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-white">{mockProgressData.overall.totalHoursListened}</div>
              <div className="text-sm text-gray-400">Horas Ouvidas</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Visão Geral</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-blue-600">Habilidades</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">Analytics</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">Histórico</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Level Progress */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Nível Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-blue-400">
                      {mockProgressData.overall.level}
                    </div>
                    <Progress 
                      value={mockProgressData.overall.progressToNextLevel} 
                      className="w-full h-3"
                    />
                    <p className="text-gray-300">
                      {mockProgressData.overall.progressToNextLevel}% para {mockProgressData.overall.nextLevel}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Summary */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    Esta Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Sessões</span>
                      <span className="text-white font-bold">{mockProgressData.weeklyStats.sessionsThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Minutos</span>
                      <span className="text-white font-bold">{mockProgressData.weeklyStats.minutesThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Score Médio</span>
                      <span className={`font-bold ${getScoreColor(mockProgressData.weeklyStats.averageScoreThisWeek)}`}>
                        {mockProgressData.weeklyStats.averageScoreThisWeek}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Melhor Dia</span>
                      <span className="text-white font-bold">{mockProgressData.weeklyStats.bestDayThisWeek}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Chart */}
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Atividade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {mockProgressData.weeklyChart.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-400 mb-2">{day.day}</div>
                      <div className="bg-customgreys-darkGrey rounded-lg p-3 space-y-1">
                        <div className="text-white font-bold text-sm">{day.sessions}</div>
                        <div className="text-xs text-gray-400">sessões</div>
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

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Skill Breakdown */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Habilidades por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(mockProgressData.skillBreakdown).map(([skill, score]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{skill === 'comprehension' ? 'Compreensão' : skill === 'dictation' ? 'Ditado' : skill === 'vocabulary' ? 'Vocabulário' : 'Reconhecimento de Sotaque'}</span>
                        <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Exercise Type Stats */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    Tipos de Exercício
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(mockProgressData.exerciseTypeStats).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {React.createElement(getExerciseIcon(type.toUpperCase()), { 
                          className: "w-4 h-4 text-blue-400" 
                        })}
                        <span className="text-gray-300">{getExerciseTypeLabel(type.toUpperCase())}</span>
                      </div>
                      <Badge variant="outline" className="border-blue-600 text-blue-300">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Difficulty Distribution */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-yellow-400" />
                    Distribuição por Dificuldade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(mockProgressData.difficultyBreakdown).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor(level.toUpperCase())}`} />
                        <span className="text-gray-300 capitalize">{level}</span>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {count} sessões
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Accent Distribution */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Sotaques Praticados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(mockProgressData.accentBreakdown).map(([accent, count]) => (
                    <div key={accent} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getAccentFlag(accent.toUpperCase())}</span>
                        <span className="text-gray-300 capitalize">{accent}</span>
                      </div>
                      <Badge variant="outline" className="border-cyan-600 text-cyan-300">
                        {count} sessões
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Speed Preferences */}
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-green-400" />
                  Preferências de Velocidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(mockProgressData.speedPreferences).map(([speed, percentage]) => (
                    <div key={speed} className="text-center">
                      <div className="bg-customgreys-darkGrey rounded-lg p-3 space-y-2">
                        <div className="text-white font-bold">{speed}</div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-gray-400">{percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Sessões Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProgressData.recentSessions.map((session) => {
                    const IconComponent = getExerciseIcon(session.exerciseType);
                    return (
                      <div key={session.id} className="bg-customgreys-darkGrey rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-900/30 rounded-lg">
                            <IconComponent className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{session.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span>{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                              <span>•</span>
                              <span>{session.duration} min</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {getAccentFlag(session.accentType)} {session.accentType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`font-bold ${getScoreColor(session.comprehensionScore)}`}>
                              {session.comprehensionScore}%
                            </div>
                            <div className="text-xs text-gray-400">Compreensão</div>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: session.hearts }).map((_, i) => (
                              <Heart key={i} className="w-3 h-3 text-red-400 fill-current" />
                            ))}
                          </div>
                          <Badge className={`${getDifficultyColor(session.difficulty)} text-white`}>
                            {session.difficulty}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProgressData.achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <Card key={achievement.id} className={`border-2 transition-all ${
                    achievement.earned 
                      ? "bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-600/50" 
                      : "bg-customgreys-secondarybg/60 border-gray-600/30"
                  }`}>
                    <CardContent className="p-6 text-center">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                        achievement.earned ? "bg-yellow-600" : "bg-gray-700"
                      }`}>
                        <IconComponent className={`w-8 h-8 ${
                          achievement.earned ? "text-white" : "text-gray-400"
                        }`} />
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${
                        achievement.earned ? "text-yellow-300" : "text-gray-300"
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedDate && (
                        <Badge variant="outline" className="border-yellow-600 text-yellow-300">
                          {new Date(achievement.earnedDate).toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                      {!achievement.earned && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          Não conquistado
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