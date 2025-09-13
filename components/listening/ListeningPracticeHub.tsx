"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

// Mock data - will be replaced with API calls
const mockStats = {
  todayMinutes: 12,
  weeklyStreak: 5,
  comprehensionScore: 82,
  heartsRemaining: 4
};

const mockRecommendation = {
  id: "1",
  title: "Business Meeting Listening",
  description: "Pratique compreensão em reuniões de negócios",
  type: "AUDIO_COMPREHENSION",
  difficulty: "INTERMEDIATE",
  estimatedDuration: 8,
  pointsReward: 30,
  accent: "AMERICAN"
};

const mockExerciseCategories = [
  {
    id: 'comprehension',
    title: 'Compreensão Auditiva',
    description: 'Escute áudios e responda perguntas',
    exerciseCount: 15,
    icon: Headphones,
    color: 'bg-blue-500',
    route: '/user/listening/practice'
  },
  {
    id: 'dictation',
    title: 'Ditado',
    description: 'Escute e escreva o que ouviu',
    exerciseCount: 10,
    icon: PenTool,
    color: 'bg-green-500',
    route: '/user/listening/dictation'
  },
  {
    id: 'accents',
    title: 'Sotaques',
    description: 'Pratique com diferentes sotaques',
    exerciseCount: 8,
    icon: Globe,
    color: 'bg-purple-500',
    route: '/user/listening/accents'
  },
  {
    id: 'conversation',
    title: 'Conversação',
    description: 'Diálogos e conversas naturais',
    exerciseCount: 12,
    icon: MessageCircle,
    color: 'bg-orange-500',
    route: '/user/listening/conversation'
  },
  {
    id: 'stories',
    title: 'Histórias',
    description: 'Narrativas e contos em áudio',
    exerciseCount: 6,
    icon: BookOpen,
    color: 'bg-indigo-500',
    route: '/user/listening/stories'
  },
  {
    id: 'news',
    title: 'Notícias',
    description: 'Notícias e reportagens atuais',
    exerciseCount: 9,
    icon: Volume2,
    color: 'bg-red-500',
    route: '/user/listening/news'
  }
];

export default function ListeningPracticeHub() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartExercise = (exerciseId: string) => {
    setIsLoading(true);
    // Navigate to listening practice
    router.push(`/user/listening/exercise/${exerciseId}`);
  };

  const handleCategoryExplore = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Listening Practice</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Desenvolva sua compreensão auditiva com exercícios adaptados ao seu nível. 
            Pratique com diferentes sotaques e velocidades.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{mockStats.todayMinutes}</div>
              <div className="text-sm text-gray-400">Min Hoje</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-white">{mockStats.weeklyStreak}</div>
              <div className="text-sm text-gray-400">Sequência</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <Headphones className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{mockStats.comprehensionScore}%</div>
              <div className="text-sm text-gray-400">Compreensão</div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: mockStats.heartsRemaining }).map((_, i) => (
                  <Heart key={i} className="w-4 h-4 text-red-400 fill-current" />
                ))}
              </div>
              <div className="text-2xl font-bold text-white">{mockStats.heartsRemaining}</div>
              <div className="text-sm text-gray-400">Vidas</div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Exercise */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <CardTitle className="text-white">Recomendado para Você</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {mockRecommendation.title}
              </h3>
              <p className="text-gray-300 mb-4">
                {mockRecommendation.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                  {mockRecommendation.difficulty}
                </Badge>
                <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                  {mockRecommendation.accent}
                </Badge>
                <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {mockRecommendation.estimatedDuration} min
                </Badge>
                <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300">
                  <Zap className="w-3 h-3 mr-1" />
                  +{mockRecommendation.pointsReward} pontos
                </Badge>
              </div>
            </div>
            
            <Button 
              onClick={() => handleStartExercise(mockRecommendation.id)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-700 hover:to-blue-700"
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              {isLoading ? "Carregando..." : "Começar Agora"}
            </Button>
          </CardContent>
        </Card>

        {/* Exercise Categories */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6" />
            Categorias de Exercícios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockExerciseCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-blue-600 transition-all duration-200 group cursor-pointer"
                      onClick={() => handleCategoryExplore(category.route)}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`mx-auto w-16 h-16 ${category.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {category.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {category.description}
                        </p>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {category.exerciseCount} exercícios
                        </Badge>
                      </div>
                      
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-blue-600 hover:border-blue-600">
                        Explorar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="text-center space-y-4">
          <Separator className="bg-customgreys-darkGrey" />
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/user/listening/progress")}
              className="text-gray-300 hover:text-white hover:bg-customgreys-darkGrey"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Progresso
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push("/user/listening/achievements")}
              className="text-gray-300 hover:text-white hover:bg-customgreys-darkGrey"
            >
              <Star className="w-4 h-4 mr-2" />
              Conquistas
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push("/user/listening/statistics")}
              className="text-gray-300 hover:text-white hover:bg-customgreys-darkGrey"
            >
              <Target className="w-4 h-4 mr-2" />
              Estatísticas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}