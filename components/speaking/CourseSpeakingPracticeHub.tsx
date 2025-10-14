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
  Star,
  BookOpen,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/course/Loading";
import { useGetCourseDetailQuery } from '@/src/domains/student/practice-courses/api';

interface CourseSpeakingPracticeHubProps {
  courseId: string;
}

// Mock data - será substituído por chamadas API
const mockCourseInfo = {
  id: "1",
  title: "Business English Fundamentals",
  description: "Master professional communication skills",
  level: "INTERMEDIATE",
  currentUnit: "Professional Introductions",
  progress: 65
};

const mockCoursePractices = [
  {
    id: "1",
    title: "Business Vocabulary Pronunciation",
    description: "Practice key business terms and phrases",
    type: "PRONUNCIATION",
    difficulty: "INTERMEDIATE",
    estimatedDuration: 8,
    pointsReward: 20,
    courseContext: "Unit 2: Professional Communication",
    completed: false
  },
  {
    id: "2", 
    title: "Meeting Introduction Roleplay",
    description: "Practice introducing yourself in business meetings",
    type: "CONVERSATION",
    difficulty: "INTERMEDIATE", 
    estimatedDuration: 12,
    pointsReward: 30,
    courseContext: "Unit 2: Professional Communication",
    completed: true
  },
  {
    id: "3",
    title: "Presentation Opening Practice",
    description: "Learn to open presentations confidently",
    type: "CONVERSATION",
    difficulty: "ADVANCED",
    estimatedDuration: 15,
    pointsReward: 35,
    courseContext: "Unit 3: Presentations",
    completed: false
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'BEGINNER': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'INTERMEDIATE': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'ADVANCED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'PRONUNCIATION': return Volume2;
    case 'CONVERSATION': return MessageCircle;
    default: return Mic;
  }
};

export default function CourseSpeakingPracticeHub({ courseId }: CourseSpeakingPracticeHubProps) {
  const router = useRouter();
  const [practices, setPractices] = useState(mockCoursePractices);

  // Use Redux to get course data
  const { 
    data: courseData, 
    isLoading, 
    error 
  } = useGetCourseDetailQuery(courseId);

  // Map course data to expected format
  const courseInfo = courseData ? {
    id: courseData.id,
    title: courseData.title || "Curso de Inglês",
    description: courseData.description || "Desenvolva suas habilidades em inglês",
    level: courseData.level || "INTERMEDIATE",
    currentUnit: courseData.currentUnit || "Unidade Atual",
    progress: courseData.progress || 0
  } : mockCourseInfo;

  useEffect(() => {
    // TODO: Implementar chamada para práticas específicas do curso via Redux
    // const practicesData = await fetchCourseSpeakingPractices(courseId);
    setPractices(mockCoursePractices);
  }, [courseId]);

  const handlePracticeClick = (practiceId: string) => {
    router.push(`/user/laboratory/speaking/practice?courseId=${courseId}&practiceId=${practiceId}`);
  };

  const handleBackToCourse = () => {
    router.push('/user/laboratory/learn/courses');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header com informações do curso */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-blue-950/20 to-indigo-950/30 border-b border-blue-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Botão de Voltar */}
          <Button
            onClick={handleBackToCourse}
            variant="ghost"
            className="mb-6 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Cursos
          </Button>

          <div className="flex items-start gap-6">
            {/* Ícone do Curso */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                  <Mic className="w-3 h-3 mr-1" />
                  Speaking Practice
                </Badge>
                <Badge variant="outline" className={getDifficultyColor(courseInfo.level)}>
                  {courseInfo.level}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                {courseInfo.title}
              </h1>
              
              <p className="text-gray-300 text-lg mb-4">{courseInfo.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Unidade Atual: {courseInfo.currentUnit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>Progresso: {courseInfo.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Lista de Práticas */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Práticas de Speaking</h2>
              <p className="text-gray-400">
                Exercícios contextualizados baseados no conteúdo do seu curso
              </p>
            </div>

            <div className="space-y-4">
              {practices.map((practice) => {
                const TypeIcon = getTypeIcon(practice.type);
                
                return (
                  <Card
                    key={practice.id}
                    className="bg-customgreys-secondarybg border-blue-900/30 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => handlePracticeClick(practice.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Ícone do Tipo */}
                        <div className="bg-blue-500/20 p-3 rounded-xl">
                          <TypeIcon className="w-5 h-5 text-blue-400" />
                        </div>

                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                                {practice.title}
                              </h3>
                              <p className="text-sm text-gray-400 mb-2">
                                {practice.description}
                              </p>
                              <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                                {practice.courseContext}
                              </Badge>
                            </div>
                            
                            {practice.completed && (
                              <div className="bg-green-500/20 rounded-full p-2">
                                <Star className="w-4 h-4 text-green-400 fill-current" />
                              </div>
                            )}
                          </div>

                          {/* Informações da Prática */}
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{practice.estimatedDuration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span>{practice.pointsReward} pontos</span>
                            </div>
                            <Badge variant="outline" className={getDifficultyColor(practice.difficulty)}>
                              {practice.difficulty}
                            </Badge>
                          </div>

                          {/* Botão de Ação */}
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            size="sm"
                          >
                            {practice.completed ? (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Repetir Prática
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Iniciar Prática
                              </>
                            )}
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Estatísticas e Progresso */}
          <div className="space-y-6">
            {/* Progresso do Curso */}
            <Card className="bg-customgreys-secondarybg border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Progresso no Curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Speaking Practice</span>
                      <span className="text-white">2/3 concluídas</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{courseInfo.progress}%</p>
                    <p className="text-sm text-gray-400">Progresso Geral</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximas Práticas */}
            <Card className="bg-customgreys-secondarybg border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Próxima Recomendação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-blue-500/20 rounded-xl p-4 mb-4">
                    <Volume2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Presentation Skills</h4>
                    <p className="text-sm text-gray-400">Próxima unidade desbloqueada</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  >
                    Ver Prévia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}