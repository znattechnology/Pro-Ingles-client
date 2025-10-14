"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  Check, 
  Brain, 
  Star, 
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
  points?: number;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizData {
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings: {
    pointsPerQuestion: number;
    heartsPerError: number;
    timeLimit?: number;
    passingScore: number;
    maxAttempts: number;
  };
}

interface QuizBuilderProps {
  initialData?: QuizData;
  onChange: (quizData: QuizData) => void;
  className?: string;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  initialData,
  onChange,
  className = ""
}) => {
  const [quizData, setQuizData] = useState<QuizData>(initialData || {
    title: "Quiz do Capítulo",
    description: "",
    questions: [],
    settings: {
      pointsPerQuestion: 15,
      heartsPerError: 1,
      passingScore: 80,
      maxAttempts: 3
    }
  });

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const updateQuizData = (newData: QuizData) => {
    setQuizData(newData);
    onChange(newData);
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: "",
      options: [
        { id: `opt_${Date.now()}_1`, text: "", isCorrect: true },
        { id: `opt_${Date.now()}_2`, text: "", isCorrect: false },
        { id: `opt_${Date.now()}_3`, text: "", isCorrect: false },
        { id: `opt_${Date.now()}_4`, text: "", isCorrect: false }
      ],
      correctOptionId: `opt_${Date.now()}_1`,
      points: quizData.settings.pointsPerQuestion
    };

    const updatedQuiz = {
      ...quizData,
      questions: [...quizData.questions, newQuestion]
    };
    updateQuizData(updatedQuiz);
    setExpandedQuestion(newQuestion.id);
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuiz = {
      ...quizData,
      questions: quizData.questions.filter(q => q.id !== questionId)
    };
    updateQuizData(updatedQuiz);
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    const updatedQuiz = {
      ...quizData,
      questions: quizData.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    };
    updateQuizData(updatedQuiz);
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    const updatedQuiz = {
      ...quizData,
      questions: quizData.questions.map(q => 
        q.id === questionId 
          ? {
              ...q,
              options: q.options.map(opt => 
                opt.id === optionId ? { ...opt, text } : opt
              )
            }
          : q
      )
    };
    updateQuizData(updatedQuiz);
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    const updatedQuiz = {
      ...quizData,
      questions: quizData.questions.map(q => 
        q.id === questionId 
          ? {
              ...q,
              correctOptionId: optionId,
              options: q.options.map(opt => ({
                ...opt,
                isCorrect: opt.id === optionId
              }))
            }
          : q
      )
    };
    updateQuizData(updatedQuiz);
  };

  const updateSettings = (key: keyof QuizData['settings'], value: number) => {
    const updatedQuiz = {
      ...quizData,
      settings: {
        ...quizData.settings,
        [key]: value
      }
    };
    updateQuizData(updatedQuiz);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quiz Settings */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Configurações do Quiz</h4>
            <p className="text-purple-300 text-sm">Configure pontuação e regras</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Título do Quiz
            </label>
            <Input
              value={quizData.title}
              onChange={(e) => updateQuizData({ ...quizData, title: e.target.value })}
              placeholder="Ex: Quiz sobre Verbos Modais"
              className="bg-customgreys-darkGrey/50 border-purple-500/30 text-white"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-white text-xs font-medium mb-1 block flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                Pontos/Questão
              </label>
              <Input
                type="number"
                value={quizData.settings.pointsPerQuestion}
                onChange={(e) => updateSettings('pointsPerQuestion', parseInt(e.target.value) || 15)}
                className="bg-customgreys-darkGrey/50 border-purple-500/30 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-white text-xs font-medium mb-1 block flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                Vidas/Erro
              </label>
              <Input
                type="number"
                value={quizData.settings.heartsPerError}
                onChange={(e) => updateSettings('heartsPerError', parseInt(e.target.value) || 1)}
                className="bg-customgreys-darkGrey/50 border-purple-500/30 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-white text-xs font-medium mb-1 block">
                Nota Mínima (%)
              </label>
              <Input
                type="number"
                value={quizData.settings.passingScore}
                onChange={(e) => updateSettings('passingScore', parseInt(e.target.value) || 80)}
                className="bg-customgreys-darkGrey/50 border-purple-500/30 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-white text-xs font-medium mb-1 block">
                Max Tentativas
              </label>
              <Input
                type="number"
                value={quizData.settings.maxAttempts}
                onChange={(e) => updateSettings('maxAttempts', parseInt(e.target.value) || 3)}
                className="bg-customgreys-darkGrey/50 border-purple-500/30 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">
            Questões ({quizData.questions.length})
          </h4>
          <Button
            type="button"
            onClick={addQuestion}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Questão
          </Button>
        </div>

        <div className="space-y-4">
          {quizData.questions.map((question, index) => (
            <div 
              key={question.id}
              className="bg-customgreys-darkGrey/30 border border-purple-500/20 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold text-sm">
                    Questão {index + 1}
                  </span>
                  <Button
                    type="button"
                    onClick={() => setExpandedQuestion(
                      expandedQuestion === question.id ? null : question.id
                    )}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedQuestion === question.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Question Preview */}
              <div className="mb-3">
                <p className="text-white text-sm">
                  {question.question || "Digite a pergunta..."}
                </p>
              </div>

              {/* Expanded Question Editor */}
              {expandedQuestion === question.id && (
                <div className="space-y-4 pt-4 border-t border-purple-500/20">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Pergunta
                    </label>
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      placeholder="Digite sua pergunta aqui..."
                      className="bg-customgreys-darkGrey/50 border-purple-500/30 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-3 block">
                      Opções de Resposta
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <Button
                            type="button"
                            onClick={() => setCorrectOption(question.id, option.id)}
                            variant="ghost"
                            size="sm"
                            className={`w-8 h-8 p-0 ${
                              option.isCorrect 
                                ? 'text-green-400 bg-green-500/20' 
                                : 'text-gray-400 hover:text-green-400'
                            }`}
                          >
                            {option.isCorrect ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{String.fromCharCode(65 + optIndex)}</span>}
                          </Button>
                          <Input
                            value={option.text}
                            onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                            placeholder={`Opção ${String.fromCharCode(65 + optIndex)}`}
                            className="flex-1 bg-customgreys-darkGrey/50 border-purple-500/30 text-white"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Clique no círculo verde para marcar a resposta correta
                    </p>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Explicação (opcional)
                    </label>
                    <Input
                      value={question.explanation || ""}
                      onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                      placeholder="Explique por que esta é a resposta correta..."
                      className="bg-customgreys-darkGrey/50 border-purple-500/30 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {quizData.questions.length === 0 && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Nenhuma questão criada ainda</p>
              <p className="text-gray-500 text-sm">Clique em "Adicionar Questão" para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Summary */}
      {quizData.questions.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h5 className="text-white font-medium mb-2">Resumo do Quiz</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Questões:</span>
              <span className="text-white ml-2">{quizData.questions.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Pontos Totais:</span>
              <span className="text-yellow-400 ml-2">{quizData.questions.length * quizData.settings.pointsPerQuestion}</span>
            </div>
            <div>
              <span className="text-gray-400">Nota Mínima:</span>
              <span className="text-green-400 ml-2">{quizData.settings.passingScore}%</span>
            </div>
            <div>
              <span className="text-gray-400">Tentativas:</span>
              <span className="text-blue-400 ml-2">{quizData.settings.maxAttempts}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;