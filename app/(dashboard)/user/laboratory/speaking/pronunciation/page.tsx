"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Mic,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Target
} from 'lucide-react';

const PronunciationPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);

  // Dados simulados para demonstração
  const exercises = [
    {
      id: 1,
      word: "pronunciation",
      phonetic: "/prəˌnʌnsiˈeɪʃən/",
      difficulty: "Intermediate",
      category: "Academic",
      audioUrl: "/audio/pronunciation.mp3",
      completed: true,
      score: 85
    },
    {
      id: 2,
      word: "communication",
      phonetic: "/kəˌmjuːnɪˈkeɪʃən/",
      difficulty: "Intermediate", 
      category: "Business",
      audioUrl: "/audio/communication.mp3",
      completed: false,
      score: null
    },
    {
      id: 3,
      word: "responsibility",
      phonetic: "/rɪˌspɑːnsəˈbɪləti/",
      difficulty: "Advanced",
      category: "General",
      audioUrl: "/audio/responsibility.mp3", 
      completed: false,
      score: null
    }
  ];

  const stats = {
    totalExercises: 45,
    completed: 12,
    averageScore: 82,
    streak: 3
  };

  const exercise = exercises[currentExercise];

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // Simular gravação
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
      }, 3000);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Exercícios de Pronúncia</h1>
          <p className="text-gray-300">Melhore sua pronúncia com exercícios interativos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Progresso</p>
                  <p className="text-white text-xl font-bold">
                    {stats.completed}/{stats.totalExercises}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Média</p>
                  <p className="text-white text-xl font-bold">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Sequência</p>
                  <p className="text-white text-xl font-bold">{stats.streak} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-6">
              <Progress value={(stats.completed / stats.totalExercises) * 100} className="mb-2" />
              <p className="text-gray-300 text-sm text-center">
                {Math.round((stats.completed / stats.totalExercises) * 100)}% Completo
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Exercise Area */}
          <div className="lg:col-span-2">
            <Card className="bg-customgreys-secondarybg border-violet-900/30 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">Exercício Atual</CardTitle>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Word Display */}
                <div className="text-center py-8">
                  <h2 className="text-4xl font-bold text-white mb-4">{exercise.word}</h2>
                  <p className="text-2xl text-violet-400 mb-2">{exercise.phonetic}</p>
                  <Badge variant="outline" className="text-gray-300">
                    {exercise.category}
                  </Badge>
                </div>

                {/* Audio Controls */}
                <div className="flex justify-center gap-4 mb-8">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-violet-600/20 border-violet-500 text-white hover:bg-violet-600/30"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Ouvir
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-violet-600/20 border-violet-500 text-white hover:bg-violet-600/30"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Repetir Devagar
                  </Button>
                </div>

                {/* Recording Area */}
                <div className="bg-customgreys-primarybg rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500/20 animate-pulse' 
                        : 'bg-gray-500/20 hover:bg-violet-600/20'
                    }`}>
                      <Mic className={`w-10 h-10 ${isRecording ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <p className="text-gray-300 mb-4">
                      {isRecording ? 'Gravando... Fale agora!' : 'Clique para gravar sua pronúncia'}
                    </p>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={handleRecord}
                      className={isRecording 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-violet-600 hover:bg-violet-700'
                      }
                    >
                      {isRecording ? 'Parar Gravação' : 'Começar Gravação'}
                    </Button>
                    
                    <Button variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-violet-900/20">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentExercise(Math.max(0, currentExercise - 1))}
                    disabled={currentExercise === 0}
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-gray-300">
                    {currentExercise + 1} de {exercises.length}
                  </span>
                  
                  <Button 
                    onClick={() => setCurrentExercise(Math.min(exercises.length - 1, currentExercise + 1))}
                    disabled={currentExercise === exercises.length - 1}
                  >
                    Próximo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="bg-customgreys-secondarybg border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white">Lista de Exercícios</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {exercises.map((ex, index) => (
                  <div
                    key={ex.id}
                    onClick={() => setCurrentExercise(index)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      index === currentExercise
                        ? 'bg-violet-600/20 border border-violet-500/50'
                        : 'bg-customgreys-primarybg hover:bg-violet-600/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{ex.word}</h4>
                        <p className="text-gray-400 text-sm">{ex.category}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {ex.completed ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">{ex.score}%</span>
                          </div>
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-customgreys-secondarybg border-violet-900/30 mt-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Dicas de Pronúncia</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Ouça atentamente antes de tentar repetir</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Foque na entonação e ritmo da palavra</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Pratique em um ambiente silencioso</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Repita várias vezes até se sentir confiante</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationPage;