"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  MessageCircle, 
  Volume2, 
  TrendingUp, 
  Heart, 
  Zap, 
  Clock, 
  Flame,
  Target,
  Play,
  Star
} from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data - will be replaced with API calls
const mockStats = {
  todayMinutes: 5,
  weeklyStreak: 3,
  overallScore: 87,
  heartsRemaining: 5
};

const mockRecommendation = {
  id: "1",
  title: "Business Introduction Practice",
  description: "Practice introducing yourself in professional settings",
  type: "CONVERSATION",
  difficulty: "INTERMEDIATE",
  estimatedDuration: 10,
  pointsReward: 25
};

const mockExerciseCategories = [
  {
    id: 'pronunciation',
    title: 'Pronúncia',
    description: 'Pratique sons e palavras específicas',
    exerciseCount: 12,
    icon: Volume2,
    color: 'bg-emerald-500'
  },
  {
    id: 'conversation',
    title: 'Conversação',
    description: 'Diálogos com IA em tempo real',
    exerciseCount: 8,
    icon: MessageCircle,
    color: 'bg-blue-500'
  },
  {
    id: 'reading',
    title: 'Leitura em Voz Alta',
    description: 'Leia textos e receba feedback',
    exerciseCount: 15,
    icon: Volume2,
    color: 'bg-purple-500'
  }
];

export default function SpeakingPracticeHub() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartExercise = (exerciseId: string) => {
    setIsLoading(true);
    // Navigate to conversation practice
    router.push(`/user/laboratory/speaking/practice/${exerciseId}`);
  };

  const handleCategoryExplore = (categoryId: string) => {
    router.push(`/user/laboratory/speaking/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Speaking Practice</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Melhore sua pronúncia e fluência com nossa IA avançada. 
            Pratique conversação e receba feedback personalizado.
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
              <Target className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{mockStats.overallScore}%</div>
              <div className="text-sm text-gray-400">Pontuação</div>
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
        <Card className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 border-violet-800">
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
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-purple-700 hover:to-blue-700"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockExerciseCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-violet-600 transition-all duration-200 group cursor-pointer"
                      onClick={() => handleCategoryExplore(category.id)}>
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
                      
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-violet-600 hover:border-violet-600">
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
              onClick={() => router.push("/user/laboratory/speaking/progress")}
              className="text-gray-300 hover:text-white hover:bg-customgreys-darkGrey"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Progresso
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push("/user/laboratory/speaking/achievements")}
              className="text-gray-300 hover:text-white hover:bg-customgreys-darkGrey"
            >
              <Star className="w-4 h-4 mr-2" />
              Conquistas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}