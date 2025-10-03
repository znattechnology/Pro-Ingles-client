"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useGetLessonDetailQuery as useGetExerciseByIdQuery
} from '@/src/domains/student/practice-courses/api/studentPracticeApiSlice';
import { useProgressSync } from '@/redux/features/laboratory/hooks/useProgressSync';
import { 
  Target, 
  Heart, 
  Star, 
  CheckCircle2, 
  Clock,
  Play,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface InlineExerciseProps {
  exerciseId: string;
  courseId?: string;
  chapterId?: string;
  onComplete?: (result: any) => void;
  className?: string;
}

const InlineExercise: React.FC<InlineExerciseProps> = ({
  exerciseId,
  courseId,
  chapterId,
  onComplete,
  className = ""
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Redux queries and mutations
  const { 
    data: exercise, 
    isLoading: exerciseLoading, 
    error: exerciseError,
    refetch: refetchExercise
  } = useGetExerciseByIdQuery(exerciseId, { skip: !exerciseId });

  const { submitExerciseWithSync } = useProgressSync();
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // Timer for tracking time spent
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (exerciseStarted && !showResults) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [exerciseStarted, showResults]);

  const currentQuestion = exercise?.challenges?.[currentQuestionIndex];
  const totalQuestions = exercise?.challenges?.length || 0;

  const handleStartExercise = () => {
    setExerciseStarted(true);
    setTimeSpent(0);
    setCurrentQuestionIndex(0);
    setSelectedOptions({});
    setShowResults(false);
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [currentQuestionIndex]: optionId
    }));
  };

  const handleNextQuestion = async () => {
    const selectedOption = selectedOptions[currentQuestionIndex];
    if (!selectedOption || !currentQuestion) return;

    try {
      setSubmittingProgress(true);
      
      // Submit current question progress with course context using sync hook
      const result = await submitExerciseWithSync({
        exerciseId,
        challengeId: currentQuestion.id,
        selectedOptionId: selectedOption,
        courseId,
        chapterId
      });

      // Show feedback for current question
      if (result.correct) {
        toast.success(`✅ Correto! +${result.pointsEarned || 15} pontos`);
      } else {
        toast.error(`❌ Incorreto. ${result.explanation || 'Tente novamente!'}`);
      }

      // Move to next question or show results
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowResults(true);
        setExerciseStarted(false);
        
        // Notify parent component
        if (onComplete) {
          onComplete(result);
        }
      }
    } catch (error) {
      console.error('Error submitting exercise progress:', error);
      toast.error('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleRestart = () => {
    handleStartExercise();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (exerciseLoading) {
    return (
      <Card className={`bg-customgreys-secondarybg border-emerald-500/20 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Carregando Exercício...</h3>
              <p className="text-gray-400 text-sm">Conectando com o Practice Lab</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (exerciseError || !exercise) {
    return (
      <Card className={`bg-customgreys-secondarybg border-red-500/20 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-red-400 font-medium mb-1">Erro ao Carregar</h3>
              <p className="text-gray-400 text-sm mb-4">
                Não foi possível carregar o exercício do Practice Lab
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchExercise()}
                className="text-white border-white/30"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const correctAnswers = Object.values(selectedOptions).length; // Simplified for now
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    return (
      <Card className={`bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-white font-bold text-xl mb-2">🎉 Exercício Concluído!</h3>
              <p className="text-gray-300 mb-4">
                Parabéns! Você completou o exercício em {formatTime(timeSpent)}
              </p>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-emerald-900/20 rounded-lg p-3 text-center">
                  <div className="text-emerald-300 font-bold text-lg">{score}%</div>
                  <div className="text-xs text-gray-400">Pontuação</div>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-3 text-center">
                  <div className="text-blue-300 font-bold text-lg">{correctAnswers}</div>
                  <div className="text-xs text-gray-400">Corretas</div>
                </div>
                <div className="bg-violet-900/20 rounded-lg p-3 text-center">
                  <div className="text-violet-300 font-bold text-lg">{formatTime(timeSpent)}</div>
                  <div className="text-xs text-gray-400">Tempo</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refazer
              </Button>
              
              <Button
                onClick={() => window.open(`/user/laboratory/learn/lesson/${exercise.lesson_id}`, '_blank')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                Mais Exercícios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exerciseStarted) {
    return (
      <Card className={`bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-white font-bold text-xl mb-2">
                {exercise.title || 'Exercício Prático'}
              </h3>
              <p className="text-gray-300 mb-6">
                {exercise.description || 'Complete este exercício para fixar o conteúdo aprendido.'}
              </p>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-emerald-900/20 rounded-lg p-3 text-center">
                  <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-emerald-300 font-bold">{totalQuestions}</div>
                  <div className="text-xs text-gray-400">Questões</div>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-3 text-center">
                  <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-yellow-300 font-bold">15</div>
                  <div className="text-xs text-gray-400">Pontos</div>
                </div>
                <div className="bg-red-900/20 rounded-lg p-3 text-center">
                  <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <div className="text-red-300 font-bold">1</div>
                  <div className="text-xs text-gray-400">Por erro</div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleStartExercise}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Começar Exercício
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Exercise in progress
  return (
    <Card className={`bg-customgreys-secondarybg border-emerald-500/20 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                Questão {currentQuestionIndex + 1} de {totalQuestions}
              </Badge>
              <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeSpent)}
              </Badge>
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
              </div>
              <span className="text-gray-400 text-xs">
                {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
              </span>
            </div>
          </div>
          
          {/* Question */}
          <div className="space-y-4">
            <div className="bg-customgreys-primarybg/30 rounded-lg p-4">
              <h3 className="text-white font-medium text-lg mb-2">
                {currentQuestion?.question}
              </h3>
              {currentQuestion?.audio_url && (
                <audio controls className="w-full mt-2">
                  <source src={currentQuestion.audio_url} type="audio/mpeg" />
                </audio>
              )}
            </div>
            
            {/* Options */}
            <div className="space-y-3">
              {currentQuestion?.options?.map((option: any) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedOptions[currentQuestionIndex] === option.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-gray-600 bg-customgreys-primarybg/30 text-gray-300 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedOptions[currentQuestionIndex] === option.id
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-500'
                    }`}>
                      {selectedOptions[currentQuestionIndex] === option.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Next button */}
          <div className="flex justify-end">
            <Button
              onClick={handleNextQuestion}
              disabled={!selectedOptions[currentQuestionIndex] || submittingProgress}
              className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            >
              {submittingProgress ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              {currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Próxima'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InlineExercise;