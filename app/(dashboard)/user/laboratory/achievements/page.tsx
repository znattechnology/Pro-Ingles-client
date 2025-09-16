"use client";

/**
 * Student Achievements Page - Gamification System
 * 
 * This page displays all student achievements, badges, and progress milestones.
 * Provides motivation through visual rewards and progress tracking.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Crown, 
  Star, 
  Target, 
  Flame, 
  BookOpen, 
  Clock, 
  Zap,
  Award,
  Calendar,
  Users,
  ArrowLeft,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/course/Loading';
import { 
  useGetUserAchievementsQuery,
  useGetAchievementStatsQuery,
  type Achievement,
  type AchievementStats
} from '@/redux/features/achievements/achievementsApi';


export default function AchievementsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // RTK Query hooks for real data
  const { 
    data: achievements = [], 
    isLoading: achievementsLoading 
  } = useGetUserAchievementsQuery();
  
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useGetAchievementStatsQuery();

  const isLoading = achievementsLoading || statsLoading;


  const categories = [
    { id: 'all', name: 'Todas', icon: Trophy },
    { id: 'learning', name: 'Aprendizagem', icon: BookOpen },
    { id: 'streak', name: 'Sequência', icon: Flame },
    { id: 'milestone', name: 'Marcos', icon: Target },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'special', name: 'Especiais', icon: Crown }
  ];

  const rarityColors = {
    common: 'border-gray-500 bg-gray-500/10 text-gray-400',
    rare: 'border-blue-500 bg-blue-500/10 text-blue-400',
    epic: 'border-purple-500 bg-purple-500/10 text-purple-400',
    legendary: 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  if (isLoading) {
    return <Loading />;
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
              Conquistas
            </h1>
            <p className="text-customgreys-dirtyGrey">
              Desbloqueie badges e celebre seus marcos de aprendizagem
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Desbloqueadas</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUnlocked}/{stats?.totalAvailable}</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Pontos</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalPoints}</p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Raras</p>
                  <p className="text-2xl font-bold text-white">{stats?.rareAchievements}</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Crown className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Recentes</p>
                  <p className="text-2xl font-bold text-white">{stats?.recentUnlocked}</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id 
                  ? "bg-violet-600 text-white" 
                  : "bg-customgreys-secondarybg border-customgreys-darkerGrey text-customgreys-dirtyGrey hover:bg-customgreys-darkerGrey hover:text-white"
                }
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`bg-customgreys-secondarybg border-2 transition-all duration-200 ${
              achievement.isUnlocked 
                ? `${rarityColors[achievement.rarity]} hover:shadow-xl` 
                : 'border-customgreys-darkerGrey hover:border-customgreys-dirtyGrey'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`text-4xl rounded-lg p-3 ${
                  achievement.isUnlocked 
                    ? 'bg-customgreys-primarybg' 
                    : 'bg-customgreys-darkGrey opacity-50'
                }`}>
                  {achievement.isUnlocked ? achievement.icon : '🔒'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-bold ${achievement.isUnlocked ? 'text-white' : 'text-customgreys-dirtyGrey'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${achievement.isUnlocked ? 'text-customgreys-dirtyGrey' : 'text-customgreys-darkGrey'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {!achievement.isUnlocked && (
                      <Lock className="w-4 h-4 text-customgreys-darkGrey" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize ${rarityColors[achievement.rarity]}`}
                    >
                      {achievement.rarity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-customgreys-darkGrey text-customgreys-dirtyGrey">
                      +{achievement.points} pontos
                    </Badge>
                  </div>
                  
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      Desbloqueado {achievement.unlockedAt}
                    </div>
                  )}
                  
                  {!achievement.isUnlocked && achievement.progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-customgreys-dirtyGrey">Progresso</span>
                        <span className="text-white">
                          {achievement.progress.current}/{achievement.progress.target} {achievement.progress.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress.current / achievement.progress.target) * 100} 
                        className="h-2 bg-customgreys-darkGrey"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievement Progress Summary */}
      <Card className="mt-12 bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-violet-400" />
            Próximas Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAchievements
              .filter(a => !a.isUnlocked && a.progress)
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="bg-customgreys-primarybg/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{achievement.title}</h4>
                      <p className="text-gray-200 text-sm">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-200">Progresso</span>
                        <span className="text-white">
                          {achievement.progress.current}/{achievement.progress.target} {achievement.progress.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress.current / achievement.progress.target) * 100} 
                        className="h-2 bg-customgreys-darkGrey"
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}