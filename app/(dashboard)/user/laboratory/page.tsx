"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  FlaskConical, 
  ArrowLeft, 
  Beaker, 
  Target, 
  Zap, 
  TrendingUp,
  Clock,
  Trophy,
  BookOpen,
  Play,
  Sparkles,
  Brain,
  Lightbulb
} from 'lucide-react';

const LaboratoryPage = () => {
  const router = useRouter();

  const exercises = [
    {
      id: 1,
      title: "Exercícios de Gramática",
      description: "Pratique estruturas gramaticais com exercícios interativos",
      icon: Brain,
      difficulty: "Intermediário",
      estimatedTime: "15 min",
      color: "from-blue-500 to-blue-600",
      lightColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      coming: false
    },
    {
      id: 2,
      title: "Prática de Conversação",
      description: "Desenvolva suas habilidades de conversação com IA",
      icon: Lightbulb,
      difficulty: "Avançado",
      estimatedTime: "20 min",
      color: "from-green-500 to-emerald-600",
      lightColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      coming: true
    },
    {
      id: 3,
      title: "Vocabulary Builder",
      description: "Expanda seu vocabulário com exercícios gamificados",
      icon: Zap,
      difficulty: "Iniciante",
      estimatedTime: "10 min",
      color: "from-yellow-500 to-orange-600",
      lightColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      coming: true
    },
    {
      id: 4,
      title: "Pronúncia e Listening",
      description: "Melhore sua pronúncia e compreensão auditiva",
      icon: Target,
      difficulty: "Intermediário",
      estimatedTime: "25 min",
      color: "from-purple-500 to-pink-600",
      lightColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      coming: true
    }
  ];

  const stats = [
    {
      title: "Exercícios Concluídos",
      value: "0",
      icon: Trophy,
      color: "text-yellow-400"
    },
    {
      title: "Tempo Praticado",
      value: "0h",
      icon: Clock,
      color: "text-blue-400"
    },
    {
      title: "Sequência Atual",
      value: "0 dias",
      icon: TrendingUp,
      color: "text-green-400"
    }
  ];

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/user/dashboard')}
              className="text-gray-400 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-4 w-px bg-violet-900/30" />
            <span className="text-gray-400 text-sm">Laboratório</span>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-3 shadow-lg">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                Laboratório
              </h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Pratique suas habilidades em inglês com exercícios interativos e desafios personalizados. 
              Experimente, aprenda e evolua no seu próprio ritmo.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-violet-500/50 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="bg-customgreys-darkGrey/50 rounded-xl p-3 w-fit mx-auto mb-4">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Exercises Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Beaker className="w-6 h-6 text-violet-400" />
            <h2 className="text-2xl font-bold text-white">Exercícios Práticos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercises.map((exercise) => {
              const IconComponent = exercise.icon;
              return (
                <Card 
                  key={exercise.id} 
                  className={`relative bg-customgreys-secondarybg border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${exercise.borderColor} ${exercise.coming ? 'opacity-75' : 'hover:border-opacity-60 cursor-pointer'}`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${exercise.color} opacity-5`} />
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${exercise.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      {exercise.coming && (
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1">
                          <span className="text-yellow-400 text-xs font-medium">Em Breve</span>
                        </div>
                      )}
                    </div>
                    
                    <CardTitle className="text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
                      {exercise.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {exercise.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          <span>{exercise.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{exercise.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      disabled={exercise.coming}
                      className={`w-full ${exercise.coming 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : `bg-gradient-to-r ${exercise.color} hover:shadow-lg transition-all duration-200`
                      }`}
                    >
                      {exercise.coming ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Em Desenvolvimento
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar Exercício
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Section */}
        <Card className="bg-gradient-to-r from-customgreys-secondarybg to-customgreys-primarybg border-violet-900/30">
          <CardContent className="p-8 text-center">
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-full p-4 w-fit mx-auto mb-4">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Mais Exercícios em Breve!
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Estamos desenvolvendo mais exercícios práticos e desafios interativos para turbinar seu aprendizado. 
              Fique ligado nas novidades!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push('/user/learn/courses')}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Explorar Cursos em Vídeo
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/user/learn')}
                className="border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                Praticar Lições
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaboratoryPage;