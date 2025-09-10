"use client";

/**
 * ChallengeConstructor - Phase 3 Implementation
 * 
 * Advanced Duolingo-style challenge constructor with multiple challenge types,
 * real-time preview, and intelligent challenge sequencing.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Play, 
  Eye, 
  Edit3, 
  Check, 
  X,
  Volume2,
  Mic,
  Image as ImageIcon,
  Type,
  Languages,
  Target,
  Shuffle,
  Brain,
  CheckCircle,
  Circle,
  Heart,
  Star,
  Trophy
} from 'lucide-react';
import { getCourseUnits, getUnitLessons, createPracticeChallenge } from '@/actions/practice-management';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  order: number;
}

interface ChallengeOption {
  text: string;
  is_correct: boolean;
  image_url?: string;
  audio_url?: string;
  order: number;
}

interface Challenge {
  type: ChallengeType;
  question: string;
  options: ChallengeOption[];
  order: number;
  hints?: string[];
  explanation?: string;
}

type ChallengeType = 'multiple-choice' | 'fill-blank' | 'translation' | 'listening' | 'speaking' | 'match-pairs' | 'sentence-order';

interface ChallengeTemplate {
  id: ChallengeType;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'easy' | 'medium' | 'hard';
  structure: {
    minOptions: number;
    maxOptions: number;
    requiresAudio: boolean;
    requiresImage: boolean;
    supportsHints: boolean;
  };
  examples: string[];
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'multiple-choice',
    name: 'Múltipla Escolha',
    description: 'Selecionar a resposta correta entre as opções',
    icon: <Circle className="w-4 h-4" />,
    difficulty: 'easy',
    structure: {
      minOptions: 3,
      maxOptions: 4,
      requiresAudio: false,
      requiresImage: false,
      supportsHints: true
    },
    examples: [
      'What is the correct translation of "Hello"?',
      'Which verb form is correct: "I ___ happy"?',
      'Select the correct preposition: "I go ___ school"'
    ]
  },
  {
    id: 'fill-blank',
    name: 'Completar Lacuna',
    description: 'Preencher a palavra ou frase que falta',
    icon: <Type className="w-4 h-4" />,
    difficulty: 'medium',
    structure: {
      minOptions: 3,
      maxOptions: 5,
      requiresAudio: false,
      requiresImage: false,
      supportsHints: true
    },
    examples: [
      'I ___ to school every day.',
      'The cat is ___ the table.',
      'She ___ a teacher.'
    ]
  },
  {
    id: 'translation',
    name: 'Tradução',
    description: 'Traduzir de uma língua para outra',
    icon: <Languages className="w-4 h-4" />,
    difficulty: 'hard',
    structure: {
      minOptions: 4,
      maxOptions: 6,
      requiresAudio: false,
      requiresImage: false,
      supportsHints: true
    },
    examples: [
      'Translate to English: "Eu gosto de estudar"',
      'Translate to Portuguese: "The book is on the table"',
      'How do you say "Thank you" in English?'
    ]
  },
  {
    id: 'listening',
    name: 'Compreensão Auditiva',
    description: 'Ouvir e selecionar a resposta correta',
    icon: <Volume2 className="w-4 h-4" />,
    difficulty: 'medium',
    structure: {
      minOptions: 3,
      maxOptions: 4,
      requiresAudio: true,
      requiresImage: false,
      supportsHints: false
    },
    examples: [
      'Listen and select what you heard',
      'What did the speaker say?',
      'Choose the correct spelling of what you heard'
    ]
  },
  {
    id: 'speaking',
    name: 'Pronúncia',
    description: 'Falar e ser avaliado pela pronúncia',
    icon: <Mic className="w-4 h-4" />,
    difficulty: 'hard',
    structure: {
      minOptions: 0,
      maxOptions: 0,
      requiresAudio: true,
      requiresImage: false,
      supportsHints: false
    },
    examples: [
      'Say "Hello, how are you?"',
      'Pronounce the word "beautiful"',
      'Repeat after me: "I love learning English"'
    ]
  },
  {
    id: 'match-pairs',
    name: 'Combinar Pares',
    description: 'Conectar palavras ou frases relacionadas',
    icon: <Shuffle className="w-4 h-4" />,
    difficulty: 'medium',
    structure: {
      minOptions: 4,
      maxOptions: 8,
      requiresAudio: false,
      requiresImage: false,
      supportsHints: true
    },
    examples: [
      'Match the English word with its Portuguese translation',
      'Connect the question with the correct answer',
      'Match the verb with its past tense form'
    ]
  },
  {
    id: 'sentence-order',
    name: 'Ordenar Frase',
    description: 'Colocar palavras na ordem correta',
    icon: <Target className="w-4 h-4" />,
    difficulty: 'hard',
    structure: {
      minOptions: 4,
      maxOptions: 8,
      requiresAudio: false,
      requiresImage: false,
      supportsHints: true
    },
    examples: [
      'Put these words in the correct order to make a sentence',
      'Arrange the words: [I, to, go, school, every, day]',
      'Create a question from these words: [are, how, you, old]'
    ]
  }
];

interface ChallengeConstructorProps {
  course: Course;
  onBack: () => void;
}

export default function ChallengeConstructor({ course, onBack }: ChallengeConstructorProps) {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>({
    type: 'multiple-choice',
    question: '',
    options: [
      { text: '', is_correct: true, order: 0 },
      { text: '', is_correct: false, order: 1 },
      { text: '', is_correct: false, order: 2 },
      { text: '', is_correct: false, order: 3 }
    ],
    order: 0,
    hints: [''],
    explanation: ''
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load course units
  useEffect(() => {
    loadCourseUnits();
  }, []);

  const loadCourseUnits = async () => {
    try {
      setLoading(true);
      const unitsData = await getCourseUnits(course.id);
      setUnits(unitsData || []);
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load lessons for selected unit
  const loadUnitLessons = async (unitId: string) => {
    try {
      setLoading(true);
      const lessonsData = await getUnitLessons(unitId);
      const updatedUnits = units.map(unit =>
        unit.id === unitId ? { ...unit, lessons: lessonsData || [] } : unit
      );
      setUnits(updatedUnits);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle unit selection
  const handleUnitSelection = async (unit: Unit) => {
    setSelectedUnit(unit);
    if (!unit.lessons || unit.lessons.length === 0) {
      await loadUnitLessons(unit.id);
    }
    setCurrentStep(2);
  };

  // Handle lesson selection
  const handleLessonSelection = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep(3);
  };

  // Handle template selection
  const handleTemplateSelection = (template: ChallengeTemplate) => {
    setSelectedTemplate(template);
    
    // Update current challenge based on template
    const newChallenge: Challenge = {
      type: template.id,
      question: '',
      options: Array.from({ length: template.structure.minOptions }, (_, i) => ({
        text: '',
        is_correct: i === 0, // First option is correct by default
        order: i
      })),
      order: challenges.length,
      hints: template.structure.supportsHints ? [''] : [],
      explanation: ''
    };
    
    setCurrentChallenge(newChallenge);
    setCurrentStep(4);
  };

  // Add new option
  const addOption = () => {
    if (!selectedTemplate) return;
    
    if (currentChallenge.options.length < selectedTemplate.structure.maxOptions) {
      setCurrentChallenge(prev => ({
        ...prev,
        options: [
          ...prev.options,
          {
            text: '',
            is_correct: false,
            order: prev.options.length
          }
        ]
      }));
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    if (currentChallenge.options.length > (selectedTemplate?.structure.minOptions || 2)) {
      setCurrentChallenge(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index).map((option, i) => ({
          ...option,
          order: i
        }))
      }));
    }
  };

  // Update option
  const updateOption = (index: number, field: keyof ChallengeOption, value: any) => {
    setCurrentChallenge(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  // Set correct answer
  const setCorrectAnswer = (index: number) => {
    setCurrentChallenge(prev => ({
      ...prev,
      options: prev.options.map((option, i) => ({
        ...option,
        is_correct: i === index
      }))
    }));
  };

  // Add hint
  const addHint = () => {
    setCurrentChallenge(prev => ({
      ...prev,
      hints: [...(prev.hints || []), '']
    }));
  };

  // Update hint
  const updateHint = (index: number, value: string) => {
    setCurrentChallenge(prev => ({
      ...prev,
      hints: (prev.hints || []).map((hint, i) => i === index ? value : hint)
    }));
  };

  // Remove hint
  const removeHint = (index: number) => {
    if ((currentChallenge.hints?.length || 0) > 1) {
      setCurrentChallenge(prev => ({
        ...prev,
        hints: (prev.hints || []).filter((_, i) => i !== index)
      }));
    }
  };

  // Save challenge
  const saveChallenge = async () => {
    if (!selectedLesson || !currentChallenge.question.trim()) return;
    
    try {
      setLoading(true);
      const challengeData = {
        lesson: selectedLesson.id,
        type: currentChallenge.type,
        question: currentChallenge.question,
        order: challenges.length + 1,
        options: currentChallenge.options
      };
      
      await createPracticeChallenge(challengeData);
      
      // Add to local state
      setChallenges([...challenges, currentChallenge]);
      
      // Reset for next challenge
      const newChallenge: Challenge = {
        type: selectedTemplate!.id,
        question: '',
        options: Array.from({ length: selectedTemplate!.structure.minOptions }, (_, i) => ({
          text: '',
          is_correct: i === 0,
          order: i
        })),
        order: challenges.length + 1,
        hints: selectedTemplate!.structure.supportsHints ? [''] : [],
        explanation: ''
      };
      
      setCurrentChallenge(newChallenge);
      setCurrentStep(5); // Go to success/continue step
      
    } catch (error) {
      console.error('Error saving challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  // Challenge Preview Component
  const ChallengePreview = () => (
    <div className="bg-customgreys-primarybg rounded-lg p-6 border border-customgreys-darkerGrey">
      {/* Header with hearts and progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-customgreys-dirtyGrey">
            <X className="w-4 h-4" />
          </Button>
          <div className="flex-1 bg-customgreys-secondarybg rounded-full h-2">
            <div className="bg-violet-500 h-2 rounded-full w-1/4"></div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Heart key={i} className="w-4 h-4 text-red-500 fill-current" />
          ))}
        </div>
      </div>

      {/* Challenge Content */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">
          {currentChallenge.question || 'Digite sua pergunta aqui'}
        </h3>
        
        {selectedTemplate?.id === 'speaking' && (
          <div className="bg-customgreys-secondarybg rounded-lg p-6 mb-6">
            <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <p className="text-customgreys-dirtyGrey">Toque para falar</p>
          </div>
        )}
      </div>

      {/* Options */}
      {selectedTemplate?.id !== 'speaking' && (
        <div className="space-y-3 mb-6">
          {currentChallenge.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                option.is_correct 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-customgreys-darkerGrey bg-customgreys-secondarybg hover:border-violet-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {option.text || `Opção ${index + 1}`}
                </span>
                {option.is_correct && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className="px-12 bg-gray-400 hover:bg-gray-500 text-white"
          disabled
        >
          Pular
        </Button>
        <Button
          size="lg"
          className="px-12 bg-green-600 hover:bg-green-700 text-white"
          disabled={!currentChallenge.question || currentChallenge.options.some(opt => !opt.text)}
        >
          Verificar
        </Button>
      </div>

      {/* Hints */}
      {currentChallenge.hints && currentChallenge.hints.length > 0 && currentChallenge.hints[0] && (
        <div className="mt-6 pt-6 border-t border-customgreys-darkerGrey">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Star className="w-4 h-4" />
              <span className="font-semibold">Dica</span>
            </div>
            <p className="text-yellow-300 text-sm">
              {currentChallenge.hints[0]}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-customgreys-secondarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Construtor de Desafios
            </h1>
            <p className="text-customgreys-dirtyGrey">
              {course.title} - Criação de exercícios interativos
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-6">
          {[
            { step: 1, title: "Selecionar Unidade", icon: Target },
            { step: 2, title: "Selecionar Lição", icon: Edit3 },
            { step: 3, title: "Tipo de Desafio", icon: Brain },
            { step: 4, title: "Criar Exercício", icon: Plus },
            { step: 5, title: "Preview & Salvar", icon: Eye }
          ].map(({ step, title, icon: Icon }) => (
            <div 
              key={step} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === step 
                  ? 'bg-violet-600 text-white' 
                  : currentStep > step 
                    ? 'bg-green-600 text-white'
                    : 'bg-customgreys-secondarybg text-customgreys-dirtyGrey'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-xs lg:text-sm">{title}</span>
              {currentStep > step && <CheckCircle className="w-4 h-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Constructor Panel */}
        <div className="space-y-6">
          {/* Step 1: Select Unit */}
          {currentStep === 1 && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Selecionar Unidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {units.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-customgreys-dirtyGrey mx-auto mb-4" />
                    <p className="text-customgreys-dirtyGrey">
                      Este curso não possui unidades ainda. Crie unidades primeiro no construtor de lições.
                    </p>
                  </div>
                ) : (
                  units.map((unit) => (
                    <div
                      key={unit.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedUnit?.id === unit.id
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-customgreys-darkerGrey bg-customgreys-primarybg hover:border-violet-400'
                      }`}
                      onClick={() => handleUnitSelection(unit)}
                    >
                      <h4 className="text-white font-medium">{unit.title}</h4>
                      <p className="text-customgreys-dirtyGrey text-sm">{unit.description}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Lesson */}
          {currentStep === 2 && selectedUnit && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Selecionar Lição
                </CardTitle>
                <p className="text-customgreys-dirtyGrey">
                  Unidade: {selectedUnit.title}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedUnit.lessons?.length === 0 ? (
                  <div className="text-center py-8">
                    <Edit3 className="w-12 h-12 text-customgreys-dirtyGrey mx-auto mb-4" />
                    <p className="text-customgreys-dirtyGrey">
                      Esta unidade não possui lições ainda. Crie lições primeiro no construtor de lições.
                    </p>
                  </div>
                ) : (
                  selectedUnit.lessons?.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedLesson?.id === lesson.id
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-customgreys-darkerGrey bg-customgreys-primarybg hover:border-violet-400'
                      }`}
                      onClick={() => handleLessonSelection(lesson)}
                    >
                      <h4 className="text-white font-medium">{lesson.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Lição {lesson.order}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Challenge Type Selection */}
          {currentStep === 3 && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Tipo de Desafio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {CHALLENGE_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-customgreys-darkerGrey bg-customgreys-primarybg hover:border-violet-400'
                    }`}
                    onClick={() => handleTemplateSelection(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-violet-600/20 rounded-lg">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{template.name}</h3>
                        <p className="text-customgreys-dirtyGrey text-sm mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {template.difficulty}
                          </Badge>
                          {template.structure.requiresAudio && (
                            <Badge variant="outline" className="text-xs text-blue-400">
                              Áudio
                            </Badge>
                          )}
                          {template.structure.supportsHints && (
                            <Badge variant="outline" className="text-xs text-yellow-400">
                              Dicas
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-customgreys-secondarybg rounded text-xs text-customgreys-dirtyGrey">
                      Exemplo: {template.examples[0]}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Create Challenge */}
          {currentStep === 4 && selectedTemplate && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Criar {selectedTemplate.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Pergunta/Instrução
                  </label>
                  <Textarea
                    placeholder="Digite a pergunta ou instrução do desafio..."
                    value={currentChallenge.question}
                    onChange={(e) => setCurrentChallenge(prev => ({ ...prev, question: e.target.value }))}
                    className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                    rows={3}
                  />
                </div>

                {/* Options (for most challenge types) */}
                {selectedTemplate.id !== 'speaking' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white font-medium">
                        Opções de Resposta
                      </label>
                      {currentChallenge.options.length < selectedTemplate.structure.maxOptions && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={addOption}
                          className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {currentChallenge.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Opção ${index + 1}`}
                            value={option.text}
                            onChange={(e) => updateOption(index, 'text', e.target.value)}
                            className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                          />
                          <Button
                            size="sm"
                            variant={option.is_correct ? "default" : "outline"}
                            onClick={() => setCorrectAnswer(index)}
                            className={option.is_correct 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-green-600/20"
                            }
                          >
                            {option.is_correct ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                          </Button>
                          {currentChallenge.options.length > selectedTemplate.structure.minOptions && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeOption(index)}
                              className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {selectedTemplate.structure.supportsHints && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white font-medium">
                        Dicas (opcional)
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addHint}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Dica
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {currentChallenge.hints?.map((hint, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Dica ${index + 1}`}
                            value={hint}
                            onChange={(e) => updateHint(index, e.target.value)}
                            className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                          />
                          {(currentChallenge.hints?.length || 0) > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeHint(index)}
                              className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Explicação (opcional)
                  </label>
                  <Textarea
                    placeholder="Explicação que aparece após a resposta correta/incorreta..."
                    value={currentChallenge.explanation}
                    onChange={(e) => setCurrentChallenge(prev => ({ ...prev, explanation: e.target.value }))}
                    className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={saveChallenge}
                  disabled={!currentChallenge.question.trim() || loading}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  Salvar Desafio
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Desafio Criado!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Desafio criado com sucesso!</span>
                  </div>
                  <p className="text-green-300 text-sm">
                    Total de desafios nesta lição: {challenges.length + 1}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Outro Desafio
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Trocar Tipo de Desafio
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                  >
                    Finalizar e Voltar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview do Desafio
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                >
                  {previewMode ? <Edit3 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {previewMode ? 'Editar' : 'Preview'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentStep >= 4 ? (
                <ChallengePreview />
              ) : (
                <div className="bg-customgreys-primarybg rounded-lg p-8 border border-customgreys-darkerGrey text-center">
                  <Brain className="w-12 h-12 text-customgreys-dirtyGrey mx-auto mb-4" />
                  <p className="text-customgreys-dirtyGrey">
                    Configure seu desafio para ver o preview aqui
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Info */}
          {selectedLesson && (
            <Card className="bg-gradient-to-r from-violet-600/10 to-blue-600/10 border-violet-600/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-600/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      {selectedLesson.title}
                    </h3>
                    <p className="text-customgreys-dirtyGrey text-sm">
                      {challenges.length} desafio{challenges.length !== 1 ? 's' : ''} criado{challenges.length !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-2 text-xs text-violet-300">
                      💡 Recomendação: 8-12 desafios por lição para melhor experiência
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}