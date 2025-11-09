/**
 * UserProgress Component - Modern src/domains Implementation
 * 
 * ✅ MIGRATED: Este componente agora usa os hooks modernos do src/domains
 * removendo dependência do Redux e feature flags.
 */

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  useUserProgress, 
  usePointsSystem, 
  useHeartsSystem,
  useActiveCourse 
} from '@/src/domains/student/practice-courses/hooks';
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
  // Legacy props for backward compatibility (optional)
  activeCourse?: Course;
  hearts?: number;
  points?: number;
  hasActiveSubscription?: boolean;
};

export const UserProgressRedux = ({}: Props = {}) => {
  // Modern src/domains hooks
  const { 
    activeCourse, 
    hearts, 
    points, 
    hasActiveSubscription,
    level,
    isLoading,
    error 
  } = useUserProgress();
  
  const { heartsCount, isLowOnHearts } = useHeartsSystem();
  
  // Debug migration
  if (process.env.NODE_ENV === 'development') {
    console.log('👤 UserProgress Modern Implementation:', {
      activeCourse: activeCourse?.title,
      hearts: heartsCount,
      points,
      hasActiveSubscription,
      level: level.level,
      timestamp: new Date().toISOString()
    });
  }
  
  // Get level icon based on level name
  const getLevelIcon = (levelName: string) => {
    switch (levelName) {
      case "Master": return Crown;
      case "Expert": return Star; 
      case "Advanced": return TrendingUp;
      case "Beginner":
      default: return Sparkles;
    }
  };

  const LevelIcon = getLevelIcon(level.level);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="p-4 text-center">
            <p className="text-customgreys-dirtyGrey text-sm">
              Carregando progresso...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-red-400 text-sm">
              Erro ao carregar progresso do usuário
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render if no active course
  if (!activeCourse) {
    return (
      <div className="space-y-4">
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="p-4 text-center">
            <p className="text-customgreys-dirtyGrey text-sm">
              Nenhum curso ativo
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
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-xs sm:text-sm truncate mb-1">
                {activeCourse.title}
              </h3>
              <Badge 
                className={`bg-gradient-to-r ${level.color} text-white text-xs font-medium`}
              >
                <LevelIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                <span className="text-xs">{level.level}</span>
                <span className="ml-1 opacity-75 text-xs">Lv.{level.levelNumber}</span>
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
                      Pontos
                    </p>
                    <p className="text-white text-base sm:text-lg font-bold">{points.toLocaleString()}</p>
                    {level.nextLevelPoints > 0 && (
                      <p className="text-yellow-300 text-xs">
                        {level.nextLevelPoints} para próximo nível
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
                      {hasActiveSubscription ? 'Premium' : 'Corações'}
                    </p>
                    <div className="flex items-center gap-1">
                      {hasActiveSubscription ? (
                        <InfinityIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white font-bold" />
                      ) : (
                        <>
                          <span className="text-white text-base sm:text-lg font-bold">{heartsCount}</span>
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
                        i < heartsCount 
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
      {!hasActiveSubscription && isLowOnHearts && (
        <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border-violet-500/30 animate-pulse">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-violet-400 text-xs font-medium mb-2">
                Corações Baixos!
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
      
      {/* Level Progress Bar */}
      {level.progress < 100 && (
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-violet-400 text-xs font-medium">Progresso do Nível</p>
              <p className="text-white text-xs font-bold">Nível {level.levelNumber}</p>
            </div>
            <div className="w-full bg-customgreys-darkGrey rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${level.progress}%` }}
              />
            </div>
            <p className="text-customgreys-dirtyGrey text-xs mt-1">
              {level.nextLevelPoints} pontos para o próximo nível
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};