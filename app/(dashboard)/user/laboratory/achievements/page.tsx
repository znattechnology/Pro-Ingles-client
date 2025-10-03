"use client";

/**
 * Student Achievements Page - Modern Gamification System
 * 
 * This page displays all student achievements, badges, and progress milestones.
 * Provides motivation through visual rewards and progress tracking with modern design.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from "framer-motion";
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
  CheckCircle,
  Sparkles,
  Brain,
  Rocket,
  TrendingUp,
  X,
  Info,
  Share,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/course/Loading';
import { 
  useGetUserAchievementsQuery,
  useGetAchievementStatsQuery,
  type Achievement,
  type AchievementStats
} from '@/src/domains/student/achievements/api';


export default function AchievementsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleAchievementClick = (achievement: any) => {
    if (achievement.isUnlocked) {
      setSelectedAchievement(achievement);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-12"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              onClick={() => router.push('/user/dashboard')}
              className="bg-customgreys-secondarybg/50 backdrop-blur-sm border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </motion.div>

          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-6 py-2 mb-6"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-medium">Sistema de Conquistas</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              Suas <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Conquistas</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              Desbloqueie badges e celebre seus marcos de aprendizagem
            </motion.p>
          </div>

          {/* Stats Overview */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats?.totalUnlocked}/{stats?.totalAvailable}</div>
              <div className="text-sm text-gray-400">Desbloqueadas</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats?.totalPoints}</div>
              <div className="text-sm text-gray-400">Pontos</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats?.rareAchievements}</div>
              <div className="text-sm text-gray-400">Raras</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats?.recentUnlocked}</div>
              <div className="text-sm text-gray-400">Recentes</div>
            </motion.div>
          </motion.div>

          {/* Category Filter */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex justify-center mb-8"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 bg-customgreys-secondarybg/50 backdrop-blur-sm rounded-2xl p-2 border border-customgreys-darkerGrey">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id 
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700" 
                      : "text-customgreys-dirtyGrey hover:bg-customgreys-darkerGrey hover:text-white"
                    }
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Achievements Section */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Galeria de Conquistas</h2>
            <p className="text-gray-400 text-lg">Sua jornada de aprendizado em badges</p>
          </motion.div>

          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 + (index * 0.1) }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAchievementClick(achievement)}
                className={`group ${achievement.isUnlocked ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`relative bg-customgreys-secondarybg rounded-3xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl h-full ${
                  achievement.isUnlocked 
                    ? `${rarityColors[achievement.rarity]} hover:border-opacity-60` 
                    : 'border-customgreys-darkerGrey hover:border-customgreys-dirtyGrey'
                }`}>
                  {/* Background Gradient for unlocked achievements */}
                  {achievement.isUnlocked && (
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-yellow-500 to-orange-500" />
                  )}
                  
                  {/* Header Section */}
                  <div className="relative">
                    <div className={`relative mb-0 overflow-hidden h-32 ${
                      achievement.isUnlocked 
                        ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20' 
                        : 'bg-gradient-to-br from-gray-600/10 to-gray-700/10'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                      
                      {/* Animated particles for unlocked achievements */}
                      {achievement.isUnlocked && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-60" />
                          <div className="absolute top-12 right-8 w-1 h-1 bg-orange-400 rounded-full animate-pulse delay-100 opacity-60" />
                          <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-200 opacity-60" />
                        </div>
                      )}
                      
                      {/* Rarity Badge */}
                      <div className="absolute top-3 left-3 z-20">
                        <div className={`inline-flex items-center gap-1.5 backdrop-blur-sm rounded-full px-3 py-1 ${rarityColors[achievement.rarity]}`}>
                          <Star className="w-3 h-3" />
                          <span className="text-xs font-medium capitalize">{achievement.rarity}</span>
                        </div>
                      </div>
                      
                      {/* Lock/Unlock Status */}
                      <div className="absolute top-3 right-3 z-20">
                        {achievement.isUnlocked ? (
                          <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/40 backdrop-blur-sm rounded-full px-3 py-1 group-hover:bg-green-500/30">
                            <CheckCircle className="w-3 h-3 text-green-300" />
                            <span className="text-xs font-medium text-green-200">Clique para detalhes</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-gray-500/20 border border-gray-400/40 backdrop-blur-sm rounded-full px-3 py-1">
                            <Lock className="w-3 h-3 text-gray-300" />
                            <span className="text-xs font-medium text-gray-200">Bloqueado</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Main Icon */}
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl ${
                          achievement.isUnlocked 
                            ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500' 
                            : 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 opacity-50'
                        }`}>
                          <span className="text-2xl text-white drop-shadow-lg">
                            {achievement.isUnlocked ? achievement.icon : '🔒'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 px-6 py-5 flex flex-col">
                    {/* Title and Description */}
                    <div className="mb-4 flex-1">
                      <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${
                        achievement.isUnlocked 
                          ? 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-yellow-300' 
                          : 'text-gray-200'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm line-clamp-2 mb-3 ${
                        achievement.isUnlocked ? 'text-customgreys-dirtyGrey' : 'text-gray-300'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      {/* Points Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          +{achievement.points} pontos
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Status Section */}
                    <div className="space-y-3">
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <div className="text-center bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                          <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                            <Trophy className="h-4 w-4" />
                            <span className="font-semibold text-sm">Conquistado!</span>
                          </div>
                          <p className="text-xs text-green-300">
                            Desbloqueado {achievement.unlockedAt}
                          </p>
                        </div>
                      )}
                      
                      {!achievement.isUnlocked && achievement.progress && (
                        <div className="bg-customgreys-primarybg/50 rounded-lg p-3 border border-customgreys-darkerGrey">
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
                            <p className="text-xs text-gray-500 text-center">
                              {Math.round((achievement.progress.current / achievement.progress.target) * 100)}% concluído
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!achievement.isUnlocked && !achievement.progress && (
                        <div className="text-center bg-gray-500/10 rounded-lg p-3 border border-gray-500/30">
                          <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                            <Target className="h-4 w-4" />
                            <span className="font-semibold text-sm">Aguardando</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Continue aprendendo para desbloquear
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Next Achievements Section */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="px-6 mt-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-8 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5" />
            <div className="absolute top-4 right-4 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60" />
            <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-200 opacity-60" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Próximas Conquistas</h3>
                  <p className="text-gray-400">Continue progredindo para desbloquear</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                {filteredAchievements
                  .filter(a => !a.isUnlocked && a.progress)
                  .slice(0, 3)
                  .map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.1 + (index * 0.1) }}
                      className="relative bg-customgreys-primarybg/50 backdrop-blur-sm rounded-2xl border border-customgreys-darkerGrey p-6 hover:border-violet-500/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center opacity-70 group-hover:opacity-90 transition-opacity">
                          <span className="text-xl text-white">{achievement.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">{achievement.title}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{achievement.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-violet-400 font-medium">+{achievement.points} pts</div>
                        </div>
                      </div>
                      
                      {achievement.progress && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Progresso atual</span>
                            <span className="text-white font-medium">
                              {achievement.progress.current}/{achievement.progress.target} {achievement.progress.unit}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="h-3 bg-customgreys-darkGrey rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }}
                                transition={{ duration: 1, delay: 1.2 + (index * 0.1) }}
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full relative"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                              </motion.div>
                            </div>
                            <div className="text-center mt-2">
                              <span className="text-xs text-gray-500">
                                {Math.round((achievement.progress.current / achievement.progress.target) * 100)}% concluído
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </motion.div>
                  ))}
              </div>
              
              {filteredAchievements.filter(a => !a.isUnlocked && a.progress).length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-400 mb-2">Nenhuma conquista em progresso</h4>
                  <p className="text-gray-500 text-sm">Continue praticando para desbloquear novas conquistas!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievement Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-customgreys-secondarybg border-customgreys-darkerGrey text-white">
          {selectedAchievement && (
            <>
              <DialogHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      selectedAchievement.isUnlocked 
                        ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500' 
                        : 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700'
                    }`}>
                      <span className="text-2xl text-white drop-shadow-lg">
                        {selectedAchievement.icon}
                      </span>
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-white">
                        {selectedAchievement.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${rarityColors[selectedAchievement.rarity as keyof typeof rarityColors]} capitalize`}>
                          <Star className="w-3 h-3 mr-1" />
                          {selectedAchievement.rarity}
                        </Badge>
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          +{selectedAchievement.points} pontos
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Description */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Descrição</h4>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedAchievement.description}
                  </p>
                </div>

                {/* Achievement Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-customgreys-primarybg/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Data de Desbloqueio</span>
                    </div>
                    <p className="text-white font-medium">
                      {selectedAchievement.unlockedAt || 'Há 2 dias'}
                    </p>
                  </div>
                  
                  <div className="bg-customgreys-primarybg/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Categoria</span>
                    </div>
                    <p className="text-white font-medium capitalize">
                      {selectedAchievement.category}
                    </p>
                  </div>
                </div>

                {/* Detailed Progress */}
                {selectedAchievement.isUnlocked && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h4 className="text-lg font-semibold text-white">Conquista Desbloqueada!</h4>
                    </div>
                    <p className="text-green-300 text-sm">
                      Parabéns! Você conquistou esta badge e ganhou {selectedAchievement.points} pontos de experiência.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-customgreys-darkerGrey">
                  <Button
                    variant="outline"
                    className="flex-1 bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Ver Mais Conquistas
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}