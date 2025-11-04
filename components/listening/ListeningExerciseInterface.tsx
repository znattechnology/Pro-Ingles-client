"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Heart, 
  Zap, 
  Volume2,
  Globe,
  RotateCcw,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text_input' | 'dictation';
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface ListeningExercise {
  id: string;
  title: string;
  description: string;
  exerciseType: 'AUDIO_COMPREHENSION' | 'DICTATION' | 'CONVERSATION_LISTENING';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  accentType: 'AMERICAN' | 'BRITISH' | 'CANADIAN' | 'AUSTRALIAN' | 'NEUTRAL';
  audioUrl: string;
  audioDuration: number;
  transcript: string;
  allowReplay: boolean;
  maxReplays: number;
  playbackSpeeds: number[];
  questions: Question[];
  keyVocabulary: string[];
  vocabularyDefinitions: Record<string, string>;
  pointsReward: number;
  heartsCost: number;
  minimumScore: number;
}

interface ListeningExerciseInterfaceProps {
  exercise: ListeningExercise;
  onComplete: (results: any) => void;
  onExit: () => void;
}

export default function ListeningExerciseInterface({ 
  exercise, 
  onComplete, 
  onExit 
}: ListeningExerciseInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  const currentQuestion = exercise.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exercise.questions.length) * 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    } else {
      handleCompleteExercise();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowHint(false);
    }
  };

  const handleCompleteExercise = () => {
    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    
    exercise.questions.forEach((question) => {
      const userAnswer = answers[question.id] || '';
      const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      
      if (isCorrect) {
        correctAnswers++;
        totalPoints += question.points;
      }
    });

    const finalScore = (correctAnswers / exercise.questions.length) * 100;
    setScore(finalScore);
    setIsCompleted(true);
    setShowResults(true);

    // Prepare results
    const results = {
      exerciseId: exercise.id,
      score: finalScore,
      correctAnswers,
      totalQuestions: exercise.questions.length,
      pointsEarned: totalPoints,
      timeSpent,
      replaysUsed,
      playbackSpeedUsed: playbackSpeed,
      isPassed: finalScore >= exercise.minimumScore,
      answers,
      detailedResults: exercise.questions.map(q => ({
        questionId: q.id,
        userAnswer: answers[q.id] || '',
        correctAnswer: q.correctAnswer,
        isCorrect: (answers[q.id] || '').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
      }))
    };

    onComplete(results);
  };

  const handleShowHint = () => {
    setShowHint(!showHint);
  };

  const getAccentFlag = (accent: string) => {
    const flags = {
      'AMERICAN': '🇺🇸',
      'BRITISH': '🇬🇧',
      'CANADIAN': '🇨🇦',
      'AUSTRALIAN': '🇦🇺',
      'NEUTRAL': '🌍'
    };
    return flags[accent as keyof typeof flags] || '🌍';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'BEGINNER': 'bg-green-500',
      'INTERMEDIATE': 'bg-yellow-500', 
      'ADVANCED': 'bg-red-500'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {score >= exercise.minimumScore ? (
                  <CheckCircle className="w-16 h-16 text-green-400" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-400" />
                )}
              </div>
              <CardTitle className="text-white text-2xl">
                {score >= exercise.minimumScore ? "Parabéns!" : "Continue Praticando!"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {Math.round(score)}%
                </div>
                <p className="text-gray-300">
                  {exercise.questions.filter(q => 
                    (answers[q.id] || '').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
                  ).length} de {exercise.questions.length} corretas
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-white font-bold">{formatTime(timeSpent)}</div>
                  <div className="text-gray-400 text-sm">Tempo</div>
                </div>
                <div className="text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-white font-bold">
                    +{exercise.questions
                      .filter(q => (answers[q.id] || '').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim())
                      .reduce((total, q) => total + q.points, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Pontos</div>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-white font-bold">{replaysUsed}</div>
                  <div className="text-gray-400 text-sm">Replays</div>
                </div>
                <div className="text-center">
                  <Volume2 className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-white font-bold">{playbackSpeed}x</div>
                  <div className="text-gray-400 text-sm">Velocidade</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={onExit} variant="outline" className="border-gray-600 text-gray-300">
                  Voltar ao Menu
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-customgreys-secondarybg border-violet-900/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getDifficultyColor(exercise.difficulty)}`} />
                <h1 className="text-xl font-bold text-white">{exercise.title}</h1>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {getAccentFlag(exercise.accentType)} {exercise.accentType}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-white font-bold">5</span>
                </div>
                <div className="text-gray-300">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatTime(timeSpent)}
                </div>
                <Button onClick={onExit} variant="ghost" className="text-gray-400">
                  ✕
                </Button>
              </div>
            </div>
            
            <Progress value={progress} className="mt-3" />
            <div className="text-sm text-gray-400 mt-1">
              Pergunta {currentQuestionIndex + 1} de {exercise.questions.length}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Audio Player Section */}
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Áudio do Exercício
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioPlayer
                audioUrl={exercise.audioUrl}
                title={exercise.description}
                allowReplay={exercise.allowReplay}
                maxReplays={exercise.maxReplays}
                availableSpeeds={exercise.playbackSpeeds}
                onSpeedChange={setPlaybackSpeed}
                onReplayLimitReached={() => setReplaysUsed(exercise.maxReplays)}
              />
              
              {/* Key Vocabulary */}
              {exercise.keyVocabulary.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-3">Vocabulário-chave:</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.keyVocabulary.map((word) => (
                      <Badge key={word} variant="outline" className="border-blue-600 text-blue-300">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Section */}
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardHeader>
              <CardTitle className="text-white">
                Pergunta {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <p className="text-gray-200 text-lg">{currentQuestion.text}</p>

              {/* Answer Input */}
              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => (
                    <label key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-200">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'text_input' && (
                <Input
                  placeholder="Introduza a sua resposta..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="bg-customgreys-darkGrey border-gray-600 text-white"
                />
              )}

              {currentQuestion.type === 'dictation' && (
                <Textarea
                  placeholder="Escreva exatamente o que você ouviu..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="bg-customgreys-darkGrey border-gray-600 text-white min-h-[100px]"
                />
              )}

              {/* Hint Section */}
              {showHint && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 font-semibold">Dica:</span>
                  </div>
                  <p className="text-yellow-200">
                    {currentQuestion.type === 'dictation' 
                      ? "Escute com atenção aos detalhes como pontuação e gramática."
                      : "Foque nas palavras-chave do áudio para encontrar a resposta."
                    }
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  onClick={handleShowHint}
                  variant="ghost"
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHint ? "Esconder" : "Dica"}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Anterior
                  </Button>
                  
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestion.id]}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {currentQuestionIndex === exercise.questions.length - 1 ? "Finalizar" : "Próxima"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}