/**
 * UserProgress Component - Enhanced with Redux
 * 
 * 🔄 REDUX MIGRATION: Este componente agora suporta Redux com feature flags
 * para migração gradual mantendo compatibilidade com implementação legacy.
 */

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useUserProgress, 
  usePointsSystem, 
  useHeartsSystem,
  useActiveCourse 
} from '@/redux/features/laboratory/hooks/useUserProgress';
import { 
  HeartIcon, 
  InfinityIcon, 
  Star, 
  TrendingUp, 
  Crown,
  Sparkles,
  ShoppingBag
} from "lucide-react";

// Django API types
interface Course {
  id: string;
  title: string;
  imageSrc: string | null;
}

type Props = {
  activeCourse?: Course;
  hearts?: number;
  points?: number;
  hasActiveSubscription?: boolean;
  // Redux mode indicator
  useRedux?: boolean;
};

export const UserProgressRedux = ({
  activeCourse: legacyActiveCourse,
  hasActiveSubscription: legacyHasActiveSubscription = false,
  hearts: legacyHearts,
  points: legacyPoints,
  useRedux = false,
}: Props) => {
  // Feature flags
  const useReduxProgress = useFeatureFlag('REDUX_USER_PROGRESS') && useRedux;
  
  // Redux hooks (only if enabled)
  const { userProgress } = useUserProgress();
  const { currentPoints, levelInfo } = usePointsSystem();
  const { heartsCount, isLowOnHearts } = useHeartsSystem();
  const { activeCourse: reduxActiveCourse } = useActiveCourse();
  
  // Determine data source
  const activeCourse = useReduxProgress ? reduxActiveCourse : legacyActiveCourse;
  const hearts = useReduxProgress ? heartsCount : (legacyHearts ?? 5);
  const points = useReduxProgress ? currentPoints : (legacyPoints ?? 0);
  const hasActiveSubscription = useReduxProgress ? false : legacyHasActiveSubscription; // Subscription logic would be implemented in Redux
  
  // Debug migration
  if (process.env.NODE_ENV === 'development') {
    console.log('👤 UserProgress Migration Status:', {
      useReduxProgress,
      useRedux,
      hasUserProgress: !!userProgress,
      activeCourse: activeCourse?.title,
      hearts,
      points,
      timestamp: new Date().toISOString()
    });
  }
  
  // Calculate user level based on points
  const getUserLevel = (points: number) => {
    if (useReduxProgress && levelInfo) {
      // Use Redux level calculation
      const { level } = levelInfo;
      if (level >= 10) return { level: "Master", color: "from-purple-500 to-purple-600", icon: Crown };
      if (level >= 5) return { level: "Expert", color: "from-blue-500 to-blue-600", icon: Star };
      if (level >= 3) return { level: "Advanced", color: "from-green-500 to-green-600", icon: TrendingUp };
      return { level: "Beginner", color: "from-gray-500 to-gray-600", icon: Sparkles };
    } else {
      // Legacy level calculation
      if (points >= 10000) return { level: "Master", color: "from-purple-500 to-purple-600", icon: Crown };
      if (points >= 5000) return { level: "Expert", color: "from-blue-500 to-blue-600", icon: Star };
      if (points >= 2000) return { level: "Advanced", color: "from-green-500 to-green-600", icon: TrendingUp };
      return { level: "Beginner", color: "from-gray-500 to-gray-600", icon: Sparkles };
    }
  };

  const userLevel = getUserLevel(points);
  const LevelIcon = userLevel.icon;
  
  // Don't render if no active course
  if (!activeCourse) {
    return (
      <div className="space-y-4">
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="p-4 text-center">
            <p className="text-customgreys-dirtyGrey text-sm">
              {useReduxProgress ? '🔄 Carregando progresso...' : 'Nenhum curso ativo'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Course Card */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:border-violet-500/30 transition-all duration-300 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="relative p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/user/laboratory/learn/courses" className="flex-shrink-0">
              <div className="relative group-hover:scale-105 transition-transform duration-200">
                <Image
                  src={activeCourse.imageSrc || "/placeholder.png"}
                  alt={activeCourse.title}
                  className="rounded-lg border-2 border-customgreys-darkerGrey object-cover"
                  width={48}
                  height={48}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
                {/* Redux indicator */}
                {useReduxProgress && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔄</span>
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-xs sm:text-sm truncate mb-1">
                {activeCourse.title} {useReduxProgress && '🔄'}
              </h3>
              <Badge 
                className={`bg-gradient-to-r ${userLevel.color} text-white text-xs font-medium`}
              >
                <LevelIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                <span className="text-xs">{userLevel.level}</span>
                {useReduxProgress && levelInfo && (
                  <span className="ml-1 opacity-75 text-xs">Lv.{levelInfo.level}</span>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3">
        {/* Points Card */}
        <Link href="/user/laboratory/learn/shop">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-1.5 sm:p-2 group-hover:scale-110 transition-transform duration-200">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-yellow-400 text-xs font-medium uppercase tracking-wide">
                      Pontos {useReduxProgress && '🔄'}
                    </p>
                    <p className="text-white text-base sm:text-lg font-bold">{points.toLocaleString()}</p>
                    {useReduxProgress && levelInfo && (
                      <p className="text-yellow-300 text-xs">
                        {levelInfo.nextLevelPoints} para próximo nível
                      </p>
                    )}
                  </div>
                </div>
                <div className="opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Hearts Card */}
        <Link href="/user/laboratory/learn/shop">
          <Card className={`bg-gradient-to-br from-red-500/10 to-pink-500/5 border-red-500/20 hover:border-red-500/40 transition-all duration-300 group cursor-pointer ${
            hearts <= 1 ? 'animate-pulse' : ''
          }`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-1.5 sm:p-2 group-hover:scale-110 transition-transform duration-200">
                    <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-medium uppercase tracking-wide">
                      {hasActiveSubscription ? 'Premium' : `Corações ${useReduxProgress ? '🔄' : ''}`}
                    </p>
                    <div className="flex items-center gap-1">
                      {hasActiveSubscription ? (
                        <InfinityIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white font-bold" />
                      ) : (
                        <>
                          <span className="text-white text-base sm:text-lg font-bold">{hearts}</span>
                          <span className="text-customgreys-dirtyGrey text-xs sm:text-sm">/5</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                </div>
              </div>
              
              {/* Hearts Visual Indicator */}
              {!hasActiveSubscription && (
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        i < hearts 
                          ? 'bg-red-500' 
                          : 'bg-customgreys-darkGrey'
                      }`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Premium Upgrade CTA (only if not subscribed and hearts are low) */}
      {!hasActiveSubscription && (useReduxProgress ? isLowOnHearts : hearts <= 2) && (
        <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border-violet-500/30 animate-pulse">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-violet-400 text-xs font-medium mb-2">
                Corações Baixos! {useReduxProgress && '🔄'}
              </p>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs w-full min-h-[36px]"
                asChild
              >
                <Link href="/user/laboratory/learn/shop">
                  Recarregar Corações
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Redux Level Progress Bar */}
      {useReduxProgress && levelInfo && (
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-violet-400 text-xs font-medium">Progresso do Nível 🔄</p>
              <p className="text-white text-xs font-bold">Nível {levelInfo.level}</p>
            </div>
            <div className="w-full bg-customgreys-darkGrey rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <p className="text-customgreys-dirtyGrey text-xs mt-1">
              {levelInfo.nextLevelPoints} pontos para o próximo nível
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};