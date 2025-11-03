"use client";

import React from "react";
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
  MessageCircle,
  Mic,
  ArrowLeft,
  Star,
  Trophy,
  Flame,
  Heart,
  BarChart3,
  PieChart,
  Activity,
  BookOpen
} from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data - will be replaced with API calls
const mockProgressData = {
  overall: {
    totalSessions: 15,
    totalMinutes: 127,
    averageScore: 84,
    currentStreak: 5,
    heartsUsed: 8,
    level: "B2",
    nextLevel: "C1",
    progressToNextLevel: 68
  },
  weeklyStats: {
    sessionsThisWeek: 4,
    minutesThisWeek: 32,
    averageScoreThisWeek: 86,
    bestDayThisWeek: "Segunda"
  },
  skillBreakdown: {
    pronunciation: 88,
    fluency: 82,
    accuracy: 85,
    confidence: 80
  },
  recentSessions: [
    {
      id: "1",
      title: "Business Introduction",
      date: "2024-01-15",
      duration: 12,
      score: 89,
      exerciseType: "CONVERSATION",
      hearts: 5
    },
    {
      id: "2",
      title: "Restaurant Ordering",
      date: "2024-01-14",
      duration: 8,
      score: 76,
      exerciseType: "PRONUNCIATION",
      hearts: 4
    },
    {
      id: "3", 
      title: "Daily Routine Discussion",
      date: "2024-01-13",
      duration: 15,
      score: 92,
      exerciseType: "CONVERSATION",
      hearts: 5
    }
  ],
  achievements: [
    {
      id: "first_conversation",
      title: "Primeira Conversa",
      description: "Complete a sua primeira sessão de conversação",
      icon: MessageCircle,
      earned: true,
      earnedDate: "2024-01-10"
    },
    {
      id: "pronunciation_master",
      title: "Mestre da Pronúncia",
      description: "Obtenha 90+ pontos em pronúncia 5 vezes",
      icon: Volume2,
      earned: true,
      earnedDate: "2024-01-14"
    },
    {
      id: "streak_master",
      title: "Sequência de 7 Dias",
      description: "Pratique por 7 dias consecutivos",
      icon: Flame,
      earned: false,
      earnedDate: null
    },
    {
      id: "perfect_session",
      title: "Sessão Perfeita",
      description: "Complete uma sessão com 100% sem perder vidas",
      icon: Star,
      earned: false,
      earnedDate: null
    }
  ],
  weeklyChart: [
    { day: "Dom", sessions: 1, avgScore: 85 },
    { day: "Seg", sessions: 2, avgScore: 89 },
    { day: "Ter", sessions: 0, avgScore: 0 },
    { day: "Qua", sessions: 1, avgScore: 76 },
    { day: "Qui", sessions: 0, avgScore: 0 },
    { day: "Sex", sessions: 1, avgScore: 92 },
    { day: "Sáb", sessions: 0, avgScore: 0 }
  ]
};

export default function SpeakingProgressDashboard() {
  // const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const router = useRouter();

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case "CONVERSATION": return MessageCircle;
      case "PRONUNCIATION": return Volume2;
      case "READING_ALOUD": return BookOpen;
      default: return Mic;
    }
  };

  const getExerciseTypeLabel = (type: string) => {
    switch (type) {
      case "CONVERSATION": return "Conversação";
      case "PRONUNCIATION": return "Pronúncia";
      case "READING_ALOUD": return "Leitura";
      default: return "Speaking";
    }
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
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="truncate">Progresso Speaking</span>
              </h1>
              <p className="text-gray-300 mt-1 text-sm sm:text-base">Acompanhe a sua evolução na prática de conversação</p>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push("/user/laboratory/speaking/practice")}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 w-full sm:w-auto"
            size="sm"
          >
            <Mic className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Praticar Agora</span><span className="sm:hidden">Praticar</span>
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-400" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{mockProgressData.overall.totalMinutes}</div>
              <div className="text-xs sm:text-sm text-gray-400">Minutos Totais</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-400" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{mockProgressData.overall.totalSessions}</div>
              <div className="text-xs sm:text-sm text-gray-400">Sessões</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-400" />
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${getScoreColor(mockProgressData.overall.averageScore)}`}>
                {mockProgressData.overall.averageScore}%
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Pontuação Média</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 text-center">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-orange-400" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{mockProgressData.overall.currentStreak}</div>
              <div className="text-xs sm:text-sm text-gray-400">Sequência (dias)</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 h-auto p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600 text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Visão Geral</span><span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-violet-600 text-xs sm:text-sm py-2">
              Habilidades
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-violet-600 text-xs sm:text-sm py-2">
              Histórico
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-violet-600 text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Conquistas</span><span className="sm:hidden">Conquistas</span>
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
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="text-center space-y-1 sm:space-y-2">
                    <div className="text-3xl sm:text-4xl font-bold text-white">{mockProgressData.overall.level}</div>
                    <p className="text-gray-400 text-sm sm:text-base">Progresso para {mockProgressData.overall.nextLevel}</p>
                  </div>
                  <Progress 
                    value={mockProgressData.overall.progressToNextLevel} 
                    className="h-2 sm:h-3 bg-customgreys-darkGrey"
                  />
                  <div className="flex justify-between text-xs sm:text-sm text-gray-400">
                    <span>{mockProgressData.overall.level}</span>
                    <span>{mockProgressData.overall.progressToNextLevel}%</span>
                    <span>{mockProgressData.overall.nextLevel}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Activity Chart */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    Atividade Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {mockProgressData.weeklyChart.map((day, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 sm:w-8 text-xs sm:text-sm text-gray-400 flex-shrink-0">{day.day}</div>
                        <div className="flex-1 bg-customgreys-darkGrey rounded-full h-4 sm:h-6 relative">
                          {day.sessions > 0 && (
                            <div 
                              className={`h-full rounded-full ${getScoreBg(day.avgScore)}`}
                              style={{ width: `${Math.max(20, (day.sessions / 3) * 100)}%` }}
                            />
                          )}
                        </div>
                        <div className="w-12 sm:w-16 text-right text-xs sm:text-sm text-gray-300 flex-shrink-0">
                          {day.sessions > 0 ? (
                            <>
                              <span className="hidden sm:inline">{day.sessions} sessões</span>
                              <span className="sm:hidden">{day.sessions}</span>
                            </>
                          ) : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Resumo da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{mockProgressData.weeklyStats.sessionsThisWeek}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Sessões</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{mockProgressData.weeklyStats.minutesThisWeek}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Minutos</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(mockProgressData.weeklyStats.averageScoreThisWeek)}`}>
                      {mockProgressData.weeklyStats.averageScoreThisWeek}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Pontuação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{mockProgressData.weeklyStats.bestDayThisWeek}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Melhor Dia</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Skills Breakdown */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    Análise de Habilidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {Object.entries(mockProgressData.skillBreakdown).map(([skill, score]) => (
                    <div key={skill} className="space-y-1 sm:space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white capitalize text-sm sm:text-base">
                          {skill === 'pronunciation' ? 'Pronúncia' :
                           skill === 'fluency' ? 'Fluência' :
                           skill === 'accuracy' ? 'Precisão' :
                           skill === 'confidence' ? 'Confiança' : skill}
                        </span>
                        <span className={`font-semibold text-sm sm:text-base ${getScoreColor(score)}`}>{score}%</span>
                      </div>
                      <Progress value={score} className="h-1.5 sm:h-2 bg-customgreys-darkGrey" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skill Recommendations */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Recomendações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="p-2 sm:p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span className="text-white font-semibold text-sm sm:text-base">Melhore a Fluência</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                        Sua fluência está em 82%. Pratique mais conversação livre para melhorar.
                      </p>
                    </div>
                    
                    <div className="p-2 sm:p-3 bg-green-900/20 rounded-lg border border-green-800">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        <span className="text-white font-semibold text-sm sm:text-base">Excelente Pronúncia</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                        Sua pronúncia está ótima (88%)! Continue praticando para manter.
                      </p>
                    </div>

                    <div className="p-2 sm:p-3 bg-yellow-900/20 rounded-lg border border-yellow-800">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                        <span className="text-white font-semibold text-sm sm:text-base">Ganhe Confiança</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                        Pratique mais diálogos simples para aumentar a sua confiança (80%).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Sessões Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {mockProgressData.recentSessions.map((session) => {
                    const IconComponent = getExerciseIcon(session.exerciseType);
                    return (
                      <div key={session.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-customgreys-darkGrey/50 rounded-lg">
                        <div className="p-1.5 sm:p-2 bg-purple-600 rounded-full flex-shrink-0">
                          <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h4 className="text-white font-semibold text-sm sm:text-base truncate">{session.title}</h4>
                            <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs self-start sm:self-auto flex-shrink-0">
                              {getExerciseTypeLabel(session.exerciseType)}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs sm:text-sm">
                            {new Date(session.date).toLocaleDateString('pt-BR')} • {session.duration} min
                          </p>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className={`text-base sm:text-lg font-bold ${getScoreColor(session.score)}`}>
                            {session.score}%
                          </div>
                          <div className="flex gap-0.5 sm:gap-1 justify-end">
                            {Array.from({ length: session.hearts }).map((_, i) => (
                              <Heart key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 fill-current" />
                            ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {mockProgressData.achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <Card key={achievement.id} className={`border-gray-800 ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-800' 
                      : 'bg-gray-900/50'
                  }`}>
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                          achievement.earned 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <h4 className="text-white font-semibold text-sm sm:text-base truncate">{achievement.title}</h4>
                            {achievement.earned && (
                              <Badge className="bg-yellow-600 text-black text-xs self-start sm:self-auto flex-shrink-0">
                                Conquistado
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">
                            {achievement.description}
                          </p>
                          {achievement.earned && achievement.earnedDate && (
                            <p className="text-yellow-400 text-xs">
                              Conquistado em {new Date(achievement.earnedDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
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