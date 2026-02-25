import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  activeCourse: Course;
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const UserProgress = ({
  activeCourse,
  hasActiveSubscription,
  hearts,
  points,
}: Props) => {
  // Calculate user level based on points
  const getUserLevel = (points: number) => {
    if (points >= 10000) return { level: "Master", color: "from-purple-500 to-purple-600", icon: Crown };
    if (points >= 5000) return { level: "Expert", color: "from-blue-500 to-blue-600", icon: Star };
    if (points >= 2000) return { level: "Advanced", color: "from-green-500 to-green-600", icon: TrendingUp };
    return { level: "Beginner", color: "from-gray-500 to-gray-600", icon: Sparkles };
  };

  const userLevel = getUserLevel(points);
  const LevelIcon = userLevel.icon;

  return (
    <div className="space-y-4">
      {/* Active Course Card */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:border-violet-500/30 transition-all duration-300 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="relative p-4">
          <div className="flex items-center gap-4">
            <Link href="/user/laboratory/learn/courses" className="flex-shrink-0">
              <div className="relative group-hover:scale-105 transition-transform duration-200">
                <Image
                  src={activeCourse.imageSrc || "/placeholder.png"}
                  alt={activeCourse.title}
                  className="rounded-lg border-2 border-customgreys-darkerGrey object-cover"
                  width={60}
                  height={60}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm truncate mb-1">
                {activeCourse.title}
              </h3>
              <Badge 
                className={`bg-gradient-to-r ${userLevel.color} text-white text-xs font-medium`}
              >
                <LevelIcon className="w-3 h-3 mr-1" />
                {userLevel.level}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3">
        {/* Points Card */}
        <Link href="/user/subscription">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-2 group-hover:scale-110 transition-transform duration-200">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-yellow-400 text-xs font-medium uppercase tracking-wide">Pontos</p>
                    <p className="text-white text-lg font-bold">{points.toLocaleString()}</p>
                  </div>
                </div>
                <div className="opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                  <ShoppingBag className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Hearts Card */}
        <Link href="/user/subscription">
          <Card className={`bg-gradient-to-br from-red-500/10 to-pink-500/5 border-red-500/20 hover:border-red-500/40 transition-all duration-300 group cursor-pointer ${
            hearts <= 1 ? 'animate-pulse' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-2 group-hover:scale-110 transition-transform duration-200">
                    <HeartIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-medium uppercase tracking-wide">
                      {hasActiveSubscription ? 'Premium' : 'Corações'}
                    </p>
                    <div className="flex items-center gap-1">
                      {hasActiveSubscription ? (
                        <InfinityIcon className="w-5 h-5 text-white font-bold" />
                      ) : (
                        <>
                          <span className="text-white text-lg font-bold">{hearts}</span>
                          <span className="text-customgreys-dirtyGrey text-sm">/5</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                  <ShoppingBag className="w-4 h-4 text-red-400" />
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
      {!hasActiveSubscription && hearts <= 2 && (
        <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border-violet-500/30 animate-pulse">
          <CardContent className="p-4">
            <div className="text-center">
              <Crown className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-violet-400 text-xs font-medium mb-2">Corações Baixos!</p>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs w-full"
                asChild
              >
                <Link href="/user/subscription">
                  Recarregar Corações
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
