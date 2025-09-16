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
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Conquistas de Speaking</h1>
          <p className="text-gray-300">Acompanhe seu progresso e desbloqueie conquistas especiais</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Pontos Totais</p>
                  <p className="text-white text-xl font-bold">{stats.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Conquistas</p>
                  <p className="text-white text-xl font-bold">
                    {stats.achievementsEarned}/{stats.totalAchievements}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Ranking</p>
                  <p className="text-white text-xl font-bold">{stats.rank}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Esta Semana</p>
                  <p className="text-white text-xl font-bold">4 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`bg-customgreys-secondarybg border transition-all duration-300 hover:transform hover:scale-105 ${
                achievement.earned 
                  ? 'border-green-500/50 bg-gradient-to-br from-customgreys-secondarybg to-green-900/20' 
                  : 'border-violet-900/30'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      achievement.earned 
                        ? 'bg-green-500/20' 
                        : 'bg-gray-500/20'
                    }`}>
                      <achievement.icon className={`w-8 h-8 ${
                        achievement.earned 
                          ? 'text-green-400' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{achievement.title}</CardTitle>
                      <p className="text-gray-300 text-sm">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.earned && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Conquistado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300 text-sm">{achievement.points} pontos</span>
                  </div>
                  
                  {achievement.earned ? (
                    <span className="text-green-400 text-sm">
                      Conquistado em {new Date(achievement.earnedDate).toLocaleDateString('pt-BR')}
                    </span>
                  ) : (
                    <div className="text-right">
                      <span className="text-gray-300 text-sm">
                        {achievement.progress}/{achievement.total}
                      </span>
                      <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-violet-600 h-2 rounded-full transition-all duration-300"
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
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-violet-500/30">
            <CardContent className="p-8">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">Continue Praticando!</h3>
              <p className="text-gray-300 mb-6">
                Pratique mais para desbloquear novas conquistas e subir no ranking
              </p>
              <Button className="bg-violet-600 hover:bg-violet-700">
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