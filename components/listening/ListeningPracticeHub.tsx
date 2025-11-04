"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/course/Loading";
import { 
  Headphones, 
  PenTool, 
  Globe, 
  TrendingUp, 
  Heart, 
  Zap, 
  Clock, 
  Flame,
  Target,
  Play,
  Star,
  Volume2,
  MessageCircle,
  BookOpen
} from "lucide-react";
import { useRouter } from "next/navigation";

// Types
interface ListeningCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
}

interface ListeningExercise {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimatedDuration: number;
  pointsReward: number;
  accent?: string;
  category: string;
}

interface Props {
  categoryType?: string;
  pageTitle?: string;
  pageDescription?: string;
  exercises?: ListeningExercise[];
}

// Mock data - will be replaced with API calls
const mockStats = {
  todayMinutes: 12,
  weeklyStreak: 5,
  comprehensionScore: 82,
  heartsRemaining: 4
};

// Category configurations
const categoryConfigs: Record<string, ListeningCategory> = {
  practice: {
    id: 'practice',
    title: 'Compreensão Auditiva',
    description: 'Escute áudios e responda perguntas para melhorar sua compreensão',
    icon: Headphones,
    color: 'bg-blue-500',
    gradient: 'from-blue-600 to-cyan-600'
  },
  dictation: {
    id: 'dictation',
    title: 'Ditado',
    description: 'Escute e escreva exatamente o que ouviu para aprimorar sua precisão',
    icon: PenTool,
    color: 'bg-green-500',
    gradient: 'from-green-600 to-emerald-600'
  },
  accents: {
    id: 'accents',
    title: 'Sotaques',
    description: 'Pratique com diferentes sotaques do inglês ao redor do mundo',
    icon: Globe,
    color: 'bg-purple-500',
    gradient: 'from-purple-600 to-violet-600'
  },
  conversation: {
    id: 'conversation',
    title: 'Conversação',
    description: 'Diálogos e conversas naturais do dia a dia',
    icon: MessageCircle,
    color: 'bg-orange-500',
    gradient: 'from-orange-600 to-amber-600'
  },
  stories: {
    id: 'stories',
    title: 'Histórias',
    description: 'Narrativas e contos em áudio para desenvolver compreensão',
    icon: BookOpen,
    color: 'bg-indigo-500',
    gradient: 'from-indigo-600 to-blue-600'
  },
  news: {
    id: 'news',
    title: 'Notícias',
    description: 'Notícias e reportagens atuais em inglês',
    icon: Volume2,
    color: 'bg-red-500',
    gradient: 'from-red-600 to-rose-600'
  }
};

const mockExerciseCategories = [
  {
    id: 'comprehension',
    title: 'Compreensão Auditiva',
    description: 'Escute áudios e responda perguntas',
    exerciseCount: 15,
    icon: Headphones,
    color: 'bg-blue-500',
    route: '/user/laboratory/listening/practice'
  },
  {
    id: 'dictation',
    title: 'Ditado',
    description: 'Escute e escreva o que ouviu',
    exerciseCount: 10,
    icon: PenTool,
    color: 'bg-green-500',
    route: '/user/laboratory/listening/dictation'
  },
  {
    id: 'accents',
    title: 'Sotaques',
    description: 'Pratique com diferentes sotaques',
    exerciseCount: 8,
    icon: Globe,
    color: 'bg-purple-500',
    route: '/user/laboratory/listening/accents'
  },
  {
    id: 'conversation',
    title: 'Conversação',
    description: 'Diálogos e conversas naturais',
    exerciseCount: 12,
    icon: MessageCircle,
    color: 'bg-orange-500',
    route: '/user/laboratory/listening/conversation'
  },
  {
    id: 'stories',
    title: 'Histórias',
    description: 'Narrativas e contos em áudio',
    exerciseCount: 6,
    icon: BookOpen,
    color: 'bg-indigo-500',
    route: '/user/laboratory/listening/stories'
  },
  {
    id: 'news',
    title: 'Notícias',
    description: 'Notícias e reportagens atuais',
    exerciseCount: 9,
    icon: Volume2,
    color: 'bg-red-500',
    route: '/user/laboratory/listening/news'
  }
];

// Mock exercises by category
const mockExercisesByCategory: Record<string, ListeningExercise[]> = {
  practice: [
    {
      id: "1",
      title: "Business Meeting Listening",
      description: "Pratique compreensão em reuniões de negócios",
      type: "AUDIO_COMPREHENSION",
      difficulty: "INTERMEDIATE",
      estimatedDuration: 8,
      pointsReward: 30,
      accent: "AMERICAN",
      category: "practice"
    }
  ],
  dictation: [
    {
      id: "2",
      title: "Daily Routine Dictation",
      description: "Escute e escreva sobre rotinas diárias",
      type: "DICTATION",
      difficulty: "BEGINNER",
      estimatedDuration: 10,
      pointsReward: 40,
      accent: "BRITISH",
      category: "dictation"
    }
  ],
  accents: [
    {
      id: "3",
      title: "Australian Accent Practice",
      description: "Familiarize-se com o sotaque australiano",
      type: "ACCENT_TRAINING",
      difficulty: "INTERMEDIATE",
      estimatedDuration: 12,
      pointsReward: 35,
      accent: "AUSTRALIAN",
      category: "accents"
    }
  ],
  conversation: [
    {
      id: "4",
      title: "Coffee Shop Conversation",
      description: "Conversas naturais em uma cafeteria",
      type: "CONVERSATION",
      difficulty: "BEGINNER",
      estimatedDuration: 6,
      pointsReward: 25,
      accent: "AMERICAN",
      category: "conversation"
    }
  ],
  stories: [
    {
      id: "5",
      title: "The Lost Treasure",
      description: "Uma aventura sobre um tesouro perdido",
      type: "STORY",
      difficulty: "INTERMEDIATE",
      estimatedDuration: 15,
      pointsReward: 50,
      accent: "BRITISH",
      category: "stories"
    }
  ],
  news: [
    {
      id: "6",
      title: "Technology News Report",
      description: "Reportagem sobre avanços tecnológicos",
      type: "NEWS",
      difficulty: "ADVANCED",
      estimatedDuration: 8,
      pointsReward: 45,
      accent: "AMERICAN",
      category: "news"
    }
  ]
};

export default function ListeningPracticeHub({ 
  categoryType = 'practice', 
  pageTitle, 
  pageDescription, 
  exercises 
}: Props = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return (
      <Loading 
        title="Listening Practice"
        subtitle="Compreensão Auditiva"
        description="Carregando exercícios de escuta..."
        icon={Headphones}
        progress={75}
      />
    );
  }
  
  // Get category configuration
  const categoryConfig = categoryConfigs[categoryType] || categoryConfigs.practice;
  const IconComponent = categoryConfig.icon;
  
  // Get exercises for this category
  const categoryExercises = exercises || mockExercisesByCategory[categoryType] || [];
  const recommendedExercise = categoryExercises[0];
  
  // Use custom title/description or fallback to category config
  const displayTitle = pageTitle || categoryConfig.title;
  const displayDescription = pageDescription || categoryConfig.description;

  const handleStartExercise = (exerciseId: string) => {
    setIsLoading(true);
    // Navigate to listening practice
    router.push(`/user/laboratory/listening/exercise/${exerciseId}`);
  };

  const handleCategoryExplore = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-3 bg-gradient-to-r ${categoryConfig.gradient} rounded-full`}>
              <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{displayTitle}</h1>
          </div>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
            {displayDescription}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-2.5 sm:p-3 lg:p-4 text-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 text-blue-400" />
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{mockStats.todayMinutes}</div>
              <div className="text-xs text-gray-400">
                <span className="hidden sm:inline">Min Hoje</span>
                <span className="sm:hidden">Hoje</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-2.5 sm:p-3 lg:p-4 text-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 text-orange-400" />
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{mockStats.weeklyStreak}</div>
              <div className="text-xs text-gray-400">
                <span className="hidden sm:inline">Sequência</span>
                <span className="sm:hidden">Seq.</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-2.5 sm:p-3 lg:p-4 text-center">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 text-green-400" />
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{mockStats.comprehensionScore}%</div>
              <div className="text-xs text-gray-400">
                <span className="hidden sm:inline">Compreensão</span>
                <span className="sm:hidden">Score</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-2.5 sm:p-3 lg:p-4 text-center">
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: mockStats.heartsRemaining }).map((_, i) => (
                  <Heart key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-red-400 fill-current" />
                ))}
              </div>
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{mockStats.heartsRemaining}</div>
              <div className="text-xs text-gray-400">Vidas</div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Exercise */}
        {recommendedExercise && (
          <Card className={`bg-gradient-to-r ${categoryConfig.gradient.replace('600', '900/50')} border-gray-700`}>
            <CardHeader className="pb-2 sm:pb-3 lg:pb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                <CardTitle className="text-white text-sm sm:text-base lg:text-lg">
                  <span className="hidden sm:inline">Recomendado para Você</span>
                  <span className="sm:hidden">Recomendado</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2">
                  {recommendedExercise.title}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm lg:text-base mb-3 leading-relaxed">
                  {recommendedExercise.description}
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-1.5 lg:gap-2 mb-3">
                  <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 text-xs py-0.5 px-2">
                    {recommendedExercise.difficulty}
                  </Badge>
                  {recommendedExercise.accent && (
                    <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 text-xs py-0.5 px-2">
                      {recommendedExercise.accent}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-green-900/50 text-green-300 text-xs py-0.5 px-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {recommendedExercise.estimatedDuration}min
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 text-xs py-0.5 px-2">
                    <Zap className="w-3 h-3 mr-1" />
                    +{recommendedExercise.pointsReward}
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={() => handleStartExercise(recommendedExercise.id)}
                className={`w-full bg-gradient-to-r ${categoryConfig.gradient} hover:opacity-90 py-2 sm:py-3`}
                disabled={isLoading}
                size="sm"
              >
                <Play className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">{isLoading ? "Carregando..." : "Começar Agora"}</span>
                <span className="sm:hidden">{isLoading ? "..." : "Começar"}</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Exercise Categories */}
        {categoryType === 'practice' && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="truncate">Outras Categorias</span>
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {mockExerciseCategories.filter(cat => cat.id !== 'comprehension').map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-blue-600 transition-all duration-200 group cursor-pointer"
                        onClick={() => handleCategoryExplore(category.route)}>
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
                        <div className={`mx-auto w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 ${category.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="text-sm sm:text-base lg:text-xl font-bold text-white mb-1">
                            {category.title}
                          </h3>
                          <p className="text-gray-400 text-xs leading-relaxed hidden sm:block lg:text-sm mb-2">
                            {category.description}
                          </p>
                          <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                            {category.exerciseCount}
                          </Badge>
                        </div>
                        
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-blue-600 hover:border-blue-600 text-xs sm:text-sm py-1 sm:py-2" size="sm">
                          <span className="hidden sm:inline">Explorar</span>
                          <span className="sm:hidden">Ver</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Access */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Separator className="bg-customgreys-darkGrey" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/user/laboratory/listening/progress")}
              className="text-gray-300 hover:text-white hover:bg-customgreys-darkGrey w-full justify-start sm:justify-center"
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ver Progresso</span>
              <span className="sm:hidden">Progresso</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push("/user/laboratory/listening/achievements")}
              className="text-gray-300 hover:text-white hover:bg-customgreys-darkGrey w-full justify-start sm:justify-center"
              size="sm"
            >
              <Star className="w-4 h-4 mr-2" />
              Conquistas
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push("/user/laboratory/listening/statistics")}
              className="text-gray-300 hover:text-white hover:bg-customgreys-darkGrey w-full justify-start sm:justify-center"
              size="sm"
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="sm:hidden">Stats</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}