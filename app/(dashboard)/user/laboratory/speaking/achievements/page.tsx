"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Award, 
  Star, 
  Target,
  Mic,
  Volume2,
  Clock,
  TrendingUp
} from 'lucide-react';

const SpeakingAchievementsPage = () => {
  // Dados simulados para demonstração
  const achievements = [
    {
      id: 1,
      title: "Primeiro Passo",
      description: "Complete sua primeira sessão de pronúncia",
      icon: Mic,
      earned: true,
      earnedDate: "2024-01-15",
      points: 50
    },
    {
      id: 2,
      title: "Conversador Dedicado",
      description: "Complete 10 sessões de conversação",
      icon: Volume2,
      earned: true,
      earnedDate: "2024-02-01",
      points: 200
    },
    {
      id: 3,
      title: "Mestre da Pronúncia",
      description: "Alcance 90% de precisão em 5 exercícios consecutivos",
      icon: Star,
      earned: false,
      progress: 3,
      total: 5,
      points: 500
    },
    {
      id: 4,
      title: "Falante Constante",
      description: "Pratique speaking por 7 dias consecutivos",
      icon: Target,
      earned: false,
      progress: 4,
      total: 7,
      points: 300
    }
  ];

  const stats = {
    totalPoints: 250,
    achievementsEarned: 2,
    totalAchievements: 4,
    rank: "Aprendiz"
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Conquistas de Speaking</h1>
          <p className="text-gray-300 text-sm sm:text-base">Acompanhe seu progresso e desbloqueie conquistas especiais</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-lg flex-shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-300 text-xs sm:text-sm">Pontos Totais</p>
                  <p className="text-white text-base sm:text-lg lg:text-xl font-bold">{stats.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg flex-shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-300 text-xs sm:text-sm">Conquistas</p>
                  <p className="text-white text-base sm:text-lg lg:text-xl font-bold">
                    {stats.achievementsEarned}/{stats.totalAchievements}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-300 text-xs sm:text-sm">Ranking</p>
                  <p className="text-white text-base sm:text-lg lg:text-xl font-bold truncate">{stats.rank}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-300 text-xs sm:text-sm">Esta Semana</p>
                  <p className="text-white text-base sm:text-lg lg:text-xl font-bold">4 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`bg-customgreys-secondarybg border transition-all duration-300 hover:transform hover:scale-105 ${
                achievement.earned 
                  ? 'border-green-500/50 bg-gradient-to-br from-customgreys-secondarybg to-green-900/20' 
                  : 'border-violet-900/30'
              }`}
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                      achievement.earned 
                        ? 'bg-green-500/20' 
                        : 'bg-gray-500/20'
                    }`}>
                      <achievement.icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${
                        achievement.earned 
                          ? 'text-green-400' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-white text-base sm:text-lg">{achievement.title}</CardTitle>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.earned && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs self-start sm:self-auto flex-shrink-0">
                      Conquistado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span className="text-gray-300 text-xs sm:text-sm">{achievement.points} pontos</span>
                  </div>
                  
                  {achievement.earned ? (
                    <span className="text-green-400 text-xs sm:text-sm">
                      Conquistado em {new Date(achievement.earnedDate).toLocaleDateString('pt-BR')}
                    </span>
                  ) : (
                    <div className="text-left sm:text-right">
                      <span className="text-gray-300 text-xs sm:text-sm">
                        {achievement.progress}/{achievement.total}
                      </span>
                      <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-1.5 sm:h-2 mt-1">
                        <div 
                          className="bg-violet-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-8 sm:mt-12 text-center">
          <Card className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-violet-500/30">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-yellow-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-white text-lg sm:text-xl font-bold mb-2">Continue Praticando!</h3>
              <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
                Pratique mais para desbloquear novas conquistas e subir no ranking
              </p>
              <Button className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto">
                Ir para Prática
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeakingAchievementsPage;