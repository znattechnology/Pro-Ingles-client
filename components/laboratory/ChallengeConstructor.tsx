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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChallengeValidation } from '@/hooks/useFormValidation';
import { laboratoryNotifications } from '@/lib/toast';
import { 
  ArrowLeft, 
 
  Plus, 
  Trash2, 
  Play, 
  Eye, 
  Edit3, 
  Check, 
  X,
  Volume2,
  Mic,
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
import {
  useGetCourseUnitsQuery,
  useGetUnitLessonsQuery,
  useCreateTeacherChallengeMutation,
  useUpdateTeacherChallengeMutation,
  useGetPracticeLessonDetailsQuery,
  useUpdateChallengeOptionMutation,
  useDeleteTeacherChallengeMutation,
  useGenerateTranslationSuggestionsMutation
} from '@/src/domains/teacher/practice-courses/api';
import { uploadAudioToS3, uploadImageToS3, generateReferenceAudio, generatePronunciationExercise } from '@modules/teacher';

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
  imageFile?: File;
  audioFile?: File;
}

interface Challenge {
  type: ChallengeType;
  question: string;
  instruction?: string;
  options: ChallengeOption[];
  order: number;
  hints?: string[];
  explanation?: string;
}

type ChallengeType = 'multiple-choice' | 'fill-blank' | 'translation' | 'listening' | 'speaking' | 'match-pairs' | 'sentence-order' | 'true-false';

// Mapping frontend types to Django API types
const CHALLENGE_TYPE_MAPPING: Record<ChallengeType, string> = {
  'multiple-choice': 'SELECT',
  'fill-blank': 'FILL_BLANK', 
  'translation': 'TRANSLATION',
  'listening': 'LISTENING',
  'speaking': 'SPEAKING',
  'match-pairs': 'MATCH_PAIRS',
  'sentence-order': 'SENTENCE_ORDER',
  'true-false': 'TRUE_FALSE'
};

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
    name: 'Pronúncia com IA',
    description: 'Falar e ser avaliado pela IA com feedback inteligente',
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
    description: 'Digite uma frase e as palavras serão embaralhadas para ordenação',
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
      'I go to school every day',
      'She is reading a book',
      'How old are you?'
    ]
  },
  {
    id: 'true-false',
    name: 'Verdadeiro/Falso',
    description: 'Julgar se uma afirmação está correta ou incorreta',
    icon: <CheckCircle className="w-4 h-4" />,
    difficulty: 'easy',
    structure: {
      minOptions: 2,
      maxOptions: 2,
      requiresAudio: false,
      requiresImage: false,
      supportsHints: true
    },
    examples: [
      'True or False: "I are happy" is correct English',
      'The verb "to be" changes according to the subject. True/False?',
      'London is the capital of France. Verdadeiro ou Falso?'
    ]
  }
];

interface ChallengeConstructorProps {
  course: Course;
  onBack: () => void;
}

export default function ChallengeConstructor({ course, onBack }: ChallengeConstructorProps) {
  // State management (for selected unit tracking)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  
  // Redux hooks
  const { data: unitsData, isLoading: unitsLoading, error: unitsError } = useGetCourseUnitsQuery(course.id);
  const { data: lessonsData, isLoading: lessonsLoading } = useGetUnitLessonsQuery(selectedUnitId || '', {
    skip: !selectedUnitId
  });
  const { data: lessonDetails, isLoading: isLoadingLessonDetails } = useGetPracticeLessonDetailsQuery(selectedLessonId || '', {
    skip: !selectedLessonId
  });
  const [createPracticeChallenge] = useCreateTeacherChallengeMutation();
  const [updatePracticeChallenge] = useUpdateTeacherChallengeMutation();
  const [updateCourseOption] = useUpdateChallengeOptionMutation();
  const [deleteChallenge] = useDeleteTeacherChallengeMutation();
  const [generateTranslationSuggestions] = useGenerateTranslationSuggestionsMutation();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>({
    type: 'multiple-choice',
    question: '',
    instruction: '',
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

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<{ id: string; question: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit mode state
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  // Get units and lessons from Redux data
  const units = unitsData?.units || [];
  // const lessons = lessonsData || [];
  // const isLoadingData = unitsLoading || lessonsLoading;

  // Real-time validation
  const challengeValidation = useChallengeValidation({
    type: currentChallenge.type,
    question: currentChallenge.question,
    options: currentChallenge.options,
    hints: currentChallenge.hints || [],
    explanation: currentChallenge.explanation || '',
  });
  
  // AI Translation states
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // AI Pronunciation states
  const [pronunciationSuggestion, setPronunciationSuggestion] = useState<any>(null);
  const [loadingPronunciationAI, setLoadingPronunciationAI] = useState(false);
  const [referenceAudioUrl, setReferenceAudioUrl] = useState<string>(''); // For preview (blob or S3)
  const [referenceAudioS3Url, setReferenceAudioS3Url] = useState<string>(''); // Permanent S3 URL for saving
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [generatingOptionAudio, setGeneratingOptionAudio] = useState<number | null>(null); // Track which option is generating audio

  // Units are loaded automatically by Redux hook
  useEffect(() => {
    if (unitsError) {
      console.error('Error loading units from Redux:', unitsError);
    }
  }, [unitsError]);


  // Handle unit selection
  const handleUnitSelection = (unit: Unit | any) => {
    setSelectedUnit(unit);
    setSelectedUnitId(unit.id); // This will trigger the useGetUnitLessonsQuery hook
    setSelectedLesson(null); // Reset selected lesson
    setCurrentStep(2);
  };

  // Handle lesson selection
  const handleLessonSelection = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedLessonId(lesson.id); // This will trigger the useGetPracticeLessonDetailsQuery hook
    setCurrentStep(3);
  };

  // Handle template selection
  const handleTemplateSelection = (template: ChallengeTemplate) => {
    setSelectedTemplate(template);
    
    // Create appropriate options based on template type
    let options: ChallengeOption[] = [];
    
    switch (template.id) {
      case 'multiple-choice':
      case 'listening':
        // Multiple choice and listening need multiple options
        options = Array.from({ length: template.structure.minOptions }, (_, i) => ({
          text: '',
          is_correct: i === 0, // First option is correct by default
          order: i
        }));
        break;
        
      case 'fill-blank':
      case 'translation':
        // Fill-blank and translation need only one correct answer
        options = [{
          text: '',
          is_correct: true,
          order: 0
        }];
        break;
        
      case 'match-pairs':
        // Match pairs need pairs of elements
        options = Array.from({ length: template.structure.minOptions }, (_, i) => ({
          text: '',
          is_correct: false, // All pairs are "correct" in their own way
          order: i
        }));
        break;
        
      case 'sentence-order':
        // Sentence order needs individual words
        options = Array.from({ length: template.structure.minOptions }, (_, i) => ({
          text: '',
          is_correct: false, // Order will be evaluated differently
          order: i
        }));
        break;
        
      case 'speaking':
        // Speaking doesn't need options
        options = [];
        break;
        
      case 'true-false':
        // True/False needs exactly 2 options: True and False
        options = [
          {
            text: 'Verdadeiro',
            is_correct: true, // Default to true being correct
            order: 0
          },
          {
            text: 'Falso',
            is_correct: false,
            order: 1
          }
        ];
        break;
        
      default:
        // Fallback to multiple choice structure
        options = Array.from({ length: template.structure.minOptions }, (_, i) => ({
          text: '',
          is_correct: i === 0,
          order: i
        }));
    }
    
    // Update current challenge based on template
    const newChallenge: Challenge = {
      type: template.id,
      question: '',
      instruction: '',
      options: options,
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

  // Generate AI translation suggestions
  const handleGenerateSuggestions = async () => {
    if (!currentChallenge.question.trim()) {
      alert('Por favor, digite a pergunta primeiro para gerar sugestões.');
      return;
    }

    try {
      setLoadingSuggestions(true);
      setAiSuggestions([]);

      console.log('🤖 Generating AI suggestions for:', currentChallenge.question);

      const result = await generateTranslationSuggestions({
        sourceText: currentChallenge.question,
        difficultyLevel: 'intermediate',
        count: 3
      }).unwrap();

      if (result && Array.isArray(result)) {
        setAiSuggestions(result);
        console.log('✅ AI suggestions received:', result);
      } else {
        console.warn('⚠️ No suggestions received from AI');
        setAiSuggestions(['Tradução sugerida pela IA não disponível']);
      }
    } catch (error) {
      console.error('❌ Error generating AI suggestions:', error);
      alert('Erro ao gerar sugestões com IA. Tente novamente.');
      setAiSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };
  
  // AI Pronunciation Functions
  const handleGeneratePronunciationExercise = async () => {
    try {
      setLoadingPronunciationAI(true);
      setPronunciationSuggestion(null);
      console.log('🎤 Generating pronunciation exercise with AI...');

      const result = await generatePronunciationExercise({
        topic: selectedLesson?.title || 'daily conversation',
        difficultyLevel: 'intermediate',
        exerciseType: 'sentence'
      });

      if (result.success && result.exercise) {
        const exercise = result.exercise;
        setPronunciationSuggestion(exercise);

        // Auto-fill the question with AI suggestion
        setCurrentChallenge(prev => ({
          ...prev,
          question: exercise.text_to_speak || exercise.text || ''
        }));

        console.log('✅ Pronunciation exercise generated:', exercise);
      } else {
        console.warn('⚠️ No exercise generated by AI');
        laboratoryNotifications.creationError('exercício de pronúncia', 'Tente novamente');
      }
    } catch (error) {
      console.error('❌ Error generating pronunciation exercise:', error);
      laboratoryNotifications.creationError('exercício de pronúncia', String(error));
    } finally {
      setLoadingPronunciationAI(false);
    }
  };

  const handleGenerateReferenceAudio = async () => {
    if (!currentChallenge.question.trim()) {
      alert('Por favor, digite o texto primeiro para gerar o áudio de referência.');
      return;
    }

    try {
      setGeneratingAudio(true);
      console.log('🔊 Generating reference audio for:', currentChallenge.question);

      // Generate and save to S3 directly
      const result = await generateReferenceAudio({
        text: currentChallenge.question,
        voice: 'alloy',
        saveToS3: true
      });

      if (result.audioUrl) {
        setReferenceAudioUrl(result.audioUrl); // For preview
        setReferenceAudioS3Url(result.s3Url || result.audioUrl); // For saving
        console.log('✅ Reference audio saved to S3:', result.audioUrl);
      } else {
        throw new Error('No audio URL received');
      }
    } catch (error) {
      console.error('❌ Error generating reference audio:', error);
      laboratoryNotifications.creationError('áudio de referência', String(error));
    } finally {
      setGeneratingAudio(false);
    }
  };

  // Generate AI audio for a specific option (Listening challenges)
  const handleGenerateOptionAudio = async (optionIndex: number) => {
    const option = currentChallenge.options[optionIndex];
    if (!option?.text?.trim()) {
      alert('Por favor, digite o texto da opção primeiro para gerar o áudio.');
      return;
    }

    try {
      setGeneratingOptionAudio(optionIndex);
      console.log(`🔊 Generating AI audio for option ${optionIndex}:`, option.text);

      const result = await generateReferenceAudio({
        text: option.text,
        voice: 'alloy',
        saveToS3: true
      });

      if (result.audioUrl) {
        // Update the option with the generated audio URL
        setCurrentChallenge(prev => ({
          ...prev,
          options: prev.options.map((opt, i) =>
            i === optionIndex
              ? { ...opt, audio_url: result.audioUrl, audioFile: undefined }
              : opt
          )
        }));
        console.log(`✅ AI audio generated for option ${optionIndex}:`, result.audioUrl);
      } else {
        throw new Error('No audio URL received');
      }
    } catch (error) {
      console.error(`❌ Error generating AI audio for option ${optionIndex}:`, error);
      laboratoryNotifications.creationError('áudio da opção', String(error));
    } finally {
      setGeneratingOptionAudio(null);
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
    console.log('🔄 ChallengeConstructor: Save function called');
    
    // Defensive validation - Pre-checks
    if (!selectedLesson) {
      console.error('❌ No lesson selected');
      laboratoryNotifications.creationError('exercício', 'Nenhuma lição selecionada');
      return;
    }
    
    if (!currentChallenge.question.trim()) {
      console.error('❌ No question provided');
      laboratoryNotifications.challengeValidationError('Por favor, digite uma pergunta');
      return;
    }

    // Real-time validation check - filtrar campos que não são parte do schema
    const challengeDataToValidate = {
      type: currentChallenge.type,
      question: currentChallenge.question,
      options: currentChallenge.options.map(option => {
        const cleanOption: any = {
          text: option.text,
          is_correct: option.is_correct,
          order: option.order,
        };
        
        // Só incluir URLs se tiverem valores válidos
        if (option.image_url && option.image_url.trim() !== '') {
          cleanOption.image_url = option.image_url;
        }
        if (option.audio_url && option.audio_url.trim() !== '') {
          cleanOption.audio_url = option.audio_url;
        }
        
        return cleanOption;
      }),
      order: currentChallenge.order,
      hints: currentChallenge.hints || [],
      explanation: currentChallenge.explanation || '',
    };

    // Dados preparados para validação e envio

    // Validação essencial básica (substituindo Zod excessivamente rígido)
    if (!challengeDataToValidate.question || challengeDataToValidate.question.trim().length < 3) {
      laboratoryNotifications.challengeValidationError('Pergunta deve ter pelo menos 3 caracteres');
      return;
    }

    if (!challengeDataToValidate.type) {
      laboratoryNotifications.challengeValidationError('Tipo de exercício é obrigatório');
      return;
    }

    console.log('✅ Basic validation passed');

    // Validações específicas simples baseadas no tipo
    switch (currentChallenge.type) {
      case 'speaking':
        // Speaking não precisa de opções
        break;

      case 'true-false':
        // TRUE_FALSE precisa de exatamente 2 opções e uma resposta correta
        if (currentChallenge.options.length !== 2) {
          laboratoryNotifications.challengeValidationError('Verdadeiro/Falso precisa de exatamente 2 opções');
          return;
        }

        const hasTrueFalseText = currentChallenge.options.every(opt => opt.text && opt.text.trim().length > 0);
        if (!hasTrueFalseText) {
          laboratoryNotifications.challengeValidationError('As opções Verdadeiro/Falso precisam ter texto');
          return;
        }

        const hasTrueFalseCorrect = currentChallenge.options.some(opt => opt.is_correct);
        if (!hasTrueFalseCorrect) {
          laboratoryNotifications.challengeValidationError('Selecione a resposta correta: Verdadeiro ou Falso');
          return;
        }
        break;

      case 'multiple-choice':
      case 'listening':
        // Estes tipos precisam de opções com texto e pelo menos uma resposta correta
        {
          const optionsWithText = currentChallenge.options.filter(opt => opt.text && opt.text.trim());
          if (optionsWithText.length < 2) {
            laboratoryNotifications.challengeValidationError('Preencha pelo menos 2 opções de resposta');
            return;
          }
          const hasCorrectAnswer = optionsWithText.some(opt => opt.is_correct);
          if (!hasCorrectAnswer) {
            laboratoryNotifications.challengeValidationError('Pelo menos uma resposta deve estar marcada como correta');
            return;
          }
        }
        break;

      case 'translation':
      case 'fill-blank':
        // Translation e Fill-blank precisam ter a resposta correta preenchida
        {
          const correctAnswer = currentChallenge.options[0]?.text?.trim();
          if (!correctAnswer) {
            laboratoryNotifications.challengeValidationError(
              currentChallenge.type === 'translation'
                ? 'Digite a tradução correta para o exercício'
                : 'Digite a resposta correta para preencher a lacuna'
            );
            return;
          }
        }
        break;

      case 'match-pairs':
        // Match pairs precisam ter pares completos (formato: "Inglês - Português")
        {
          const validPairs = currentChallenge.options.filter(opt => {
            const text = opt.text?.trim() || '';
            return text.includes(' - ') || text.includes(' – ') || text.includes(' = ');
          });
          if (validPairs.length < 2) {
            laboratoryNotifications.challengeValidationError('Adicione pelo menos 2 pares no formato "Palavra - Tradução"');
            return;
          }
        }
        break;

      case 'sentence-order':
        // Sentence order precisa de pelo menos 3 palavras
        {
          const wordsWithText = currentChallenge.options.filter(opt => opt.text && opt.text.trim());
          if (wordsWithText.length < 3) {
            laboratoryNotifications.challengeValidationError('Adicione pelo menos 3 palavras para ordenar');
            return;
          }
        }
        break;

      case 'speaking':
        // Speaking precisa ter o texto para pronunciar (pode estar em question ou options[0])
        {
          const speakingText = currentChallenge.question?.trim() || currentChallenge.options[0]?.text?.trim();
          if (!speakingText) {
            laboratoryNotifications.challengeValidationError('Digite o texto que o aluno deve pronunciar (na pergunta ou instrução)');
            return;
          }
        }
        break;

      default:
        // Para tipos não especificados, validar que há pelo menos uma opção com texto
        {
          const anyOptionWithText = currentChallenge.options.some(opt => opt.text && opt.text.trim());
          if (!anyOptionWithText && currentChallenge.options.length > 0) {
            laboratoryNotifications.challengeValidationError('Preencha pelo menos uma opção de resposta');
            return;
          }
        }
        break;
    }
    
    try {
      setLoading(true);
      console.log('🔄 ChallengeConstructor: Starting challenge save...');
      console.log('📝 Selected lesson:', selectedLesson);
      console.log('🎯 Current challenge:', currentChallenge);
      console.log('🔧 Selected template:', selectedTemplate);
      
      // Validate challenge type mapping
      const mappedType = CHALLENGE_TYPE_MAPPING[currentChallenge.type];
      if (!mappedType) {
        throw new Error(`Tipo de desafio não mapeado: ${currentChallenge.type}`);
      }
      
      // Clean options - remove File objects (audioFile, imageFile) before sending to Redux
      // Files will be uploaded separately after challenge creation
      const cleanOptions = currentChallenge.options.map(opt => ({
        text: opt.text,
        is_correct: opt.is_correct,
        order: opt.order,
        // Only include URLs if they exist (not File objects)
        ...(opt.audio_url && typeof opt.audio_url === 'string' ? { audio_url: opt.audio_url } : {}),
        ...(opt.image_url && typeof opt.image_url === 'string' ? { image_url: opt.image_url } : {}),
      }));

      let createdChallenge: any;
      const wasEditMode = !!editingChallengeId;

      if (editingChallengeId) {
        // UPDATE MODE
        console.log('🔄 Updating existing challenge:', editingChallengeId);

        const updateData: any = {
          type: mappedType,
          question: currentChallenge.question,
          instruction: currentChallenge.instruction || '',
          options: cleanOptions
        };

        // Add reference audio URL for challenges that support audio
        if (referenceAudioS3Url && ['speaking', 'translation', 'listening', 'fill-blank'].includes(currentChallenge.type)) {
          updateData.reference_audio_url = referenceAudioS3Url;
        }

        console.log('📤 Challenge update data:', updateData);

        createdChallenge = await laboratoryNotifications.asyncOperation(
          updatePracticeChallenge({ challengeId: editingChallengeId, data: updateData }).unwrap(),
          'Atualizando exercício',
          selectedTemplate?.name || 'Exercício'
        );
        console.log('✅ Challenge updated successfully:', createdChallenge);

        // Reset editing mode
        setEditingChallengeId(null);
      } else {
        // CREATE MODE
        // Get the next available order number from the Redux lesson details
        console.log('🔄 Getting current challenges from Redux...');
        const existingChallenges = lessonDetails?.challenges || [];
        const maxOrder = existingChallenges.length > 0
          ? Math.max(...existingChallenges.map((c: any) => c.order || 0))
          : 0;
        const nextOrder = maxOrder + 1;

        console.log('📊 Current challenges in backend:', existingChallenges.length);
        console.log('📊 Max order found:', maxOrder);
        console.log('📊 Next order to use:', nextOrder);

        const challengeData: any = {
          lesson: selectedLesson.id,
          type: mappedType,
          question: currentChallenge.question,
          instruction: currentChallenge.instruction || '',
          order: nextOrder,
          options: cleanOptions
        };

        // Add reference audio URL for challenges that support audio (speaking, translation, listening, fill-blank)
        if (referenceAudioS3Url && ['speaking', 'translation', 'listening', 'fill-blank'].includes(currentChallenge.type)) {
          challengeData.reference_audio_url = referenceAudioS3Url;
          console.log('🔊 Including reference audio URL:', referenceAudioS3Url);
        }

        console.log('📤 Challenge data to send:', challengeData);

        // Create the challenge with toast notification
        createdChallenge = await laboratoryNotifications.asyncOperation(
          createPracticeChallenge(challengeData).unwrap(),
          'Criando exercício',
          selectedTemplate?.name || 'Exercício'
        );
        console.log('✅ Challenge created successfully:', createdChallenge);
      }


      // Handle media uploads for each option in listening challenges
      if (currentChallenge.type === 'listening' && createdChallenge.options) {
        console.log('🎯 Processing media uploads for each option...');
        
        for (let i = 0; i < currentChallenge.options.length; i++) {
          const option = currentChallenge.options[i];
          const createdOption = createdChallenge.options[i];
          
          if (!createdOption) {
            console.warn(`⚠️ Skipping option ${i + 1} - creation failed`);
            continue;
          }
          
          const updateData: { audioSrc?: string; imageSrc?: string } = {};
          
          // Upload audio file for this option
          if (option.audioFile) {
            try {
              console.log(`🎵 Uploading audio for option ${i + 1}...`);
              
              const optionAudioUrl = await uploadAudioToS3(
                option.audioFile, 
                selectedLesson.id, 
                createdChallenge.id
              );
              console.log(`✅ Option ${i + 1} audio uploaded:`, optionAudioUrl);
              updateData.audioSrc = optionAudioUrl;
            } catch (error) {
              console.error(`❌ Option ${i + 1} audio upload failed:`, error);
            }
          }
          
          // Upload image file for this option
          if (option.imageFile) {
            try {
              console.log(`🖼️ Uploading image for option ${i + 1}...`);
              
              const optionImageUrl = await uploadImageToS3(
                option.imageFile, 
                selectedLesson.id, 
                createdChallenge.id
              );
              console.log(`✅ Option ${i + 1} image uploaded:`, optionImageUrl);
              updateData.imageSrc = optionImageUrl;
            } catch (error) {
              console.error(`❌ Option ${i + 1} image upload failed:`, error);
            }
          }
          
          // Update option in database with media URLs
          if (Object.keys(updateData).length > 0 && createdOption.id) {
            try {
              console.log(`🔄 Updating option ${i + 1} in database...`);
              await updateCourseOption({ optionId: createdOption.id, data: updateData }).unwrap();
              console.log(`✅ Option ${i + 1} updated successfully in database`);
            } catch (error) {
              console.error(`❌ Failed to update option ${i + 1} in database:`, error);
            }
          }
        }
      }
      
      // Reset for next challenge
      if (!selectedTemplate) {
        console.error('❌ selectedTemplate is null during reset');
        return;
      }

      // Get current max order for reset
      const currentChallenges = lessonDetails?.challenges || [];
      const currentMaxOrder = currentChallenges.length > 0
        ? Math.max(...currentChallenges.map((c: any) => c.order || 0))
        : 0;

      console.log('🔄 Resetting challenge for next creation...');

      const newChallenge: Challenge = {
        type: selectedTemplate.id,
        question: '',
        instruction: '',
        options: Array.from({ length: selectedTemplate.structure.minOptions }, (_, i) => ({
          text: '',
          is_correct: i === 0,
          order: i
        })),
        order: currentMaxOrder + 1,
        hints: selectedTemplate.structure.supportsHints ? [''] : [],
        explanation: ''
      };

      setCurrentChallenge(newChallenge);

      // Reset reference audio states for speaking challenges
      setReferenceAudioUrl('');
      setReferenceAudioS3Url('');
      setPronunciationSuggestion(null);

      // Different behavior for edit vs create
      if (wasEditMode) {
        // Edit mode - show success message briefly
        console.log('✅ Edit completed, showing success');
        setShowEditSuccess(true);
        setTimeout(() => setShowEditSuccess(false), 3000); // Hide after 3 seconds
      } else {
        // Create mode - go to success step
        setChallenges([...challenges, { ...currentChallenge, order: currentMaxOrder }]);
        laboratoryNotifications.challengeCreated(currentChallenge.type);
        setCurrentStep(5); // Go to success/continue step
      }
      
    } catch (error) {
      console.error('❌ Error saving challenge:', error);
      // Show user-friendly error message with toast
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      laboratoryNotifications.creationError('exercício', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (challenge: { id: string; question: string }) => {
    setChallengeToDelete(challenge);
    setDeleteModalOpen(true);
  };

  // Handle delete challenge confirmation
  const handleDeleteChallenge = async () => {
    if (!challengeToDelete) return;

    setIsDeleting(true);
    try {
      await laboratoryNotifications.asyncOperation(
        deleteChallenge(challengeToDelete.id).unwrap(),
        'Eliminando',
        'Desafio'
      );
      setDeleteModalOpen(false);
      setChallengeToDelete(null);
    } catch (error) {
      console.error('❌ Error deleting challenge:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      laboratoryNotifications.deleteError('desafio', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Load challenge for editing
  const loadChallengeForEdit = (challenge: any) => {
    // Map backend type to frontend type
    const typeMapping: Record<string, ChallengeType> = {
      'SELECT': 'multiple-choice',
      'FILL_BLANK': 'fill-blank',
      'TRANSLATION': 'translation',
      'LISTENING': 'listening',
      'SPEAKING': 'speaking',
      'MATCH_PAIRS': 'match-pairs',
      'SENTENCE_ORDER': 'sentence-order',
      'TRUE_FALSE': 'true-false'
    };

    const frontendType = typeMapping[challenge.type] || 'multiple-choice';

    // Find and set the template
    const template = CHALLENGE_TEMPLATES.find(t => t.id === frontendType);
    if (template) {
      setSelectedTemplate(template);
    }

    // Map options from backend format
    const mappedOptions = challenge.options?.map((opt: any, index: number) => ({
      text: opt.text || '',
      is_correct: opt.is_correct || false,
      order: opt.order || index,
      audio_url: opt.audio_url,
      image_url: opt.image_url,
    })) || [];

    // Set current challenge with loaded data
    setCurrentChallenge({
      type: frontendType,
      question: challenge.question || '',
      instruction: challenge.instruction || '',
      options: mappedOptions.length > 0 ? mappedOptions : [
        { text: '', is_correct: true, order: 0 },
        { text: '', is_correct: false, order: 1 }
      ],
      order: challenge.order || 0,
      hints: challenge.hints || [''],
      explanation: challenge.explanation || ''
    });

    // Load reference audio for challenges that support it
    if (challenge.reference_audio_url && ['SPEAKING', 'FILL_BLANK', 'TRANSLATION', 'LISTENING'].includes(challenge.type)) {
      setReferenceAudioUrl(challenge.reference_audio_url);
      setReferenceAudioS3Url(challenge.reference_audio_url);
    } else {
      setReferenceAudioUrl('');
      setReferenceAudioS3Url('');
    }

    // Set editing mode
    setEditingChallengeId(challenge.id);
    setCurrentStep(4);
  };

  // Cancel editing and reset form
  const cancelEditing = () => {
    setEditingChallengeId(null);
    setReferenceAudioUrl('');
    setReferenceAudioS3Url('');
    if (selectedTemplate) {
      setCurrentChallenge({
        type: selectedTemplate.id,
        question: '',
        instruction: '',
        options: Array.from({ length: selectedTemplate.structure.minOptions }, (_, i) => ({
          text: '',
          is_correct: i === 0,
          order: i
        })),
        order: 0,
        hints: selectedTemplate.structure.supportsHints ? [''] : [],
        explanation: ''
      });
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
          {currentChallenge.question || 'Introduza a sua pergunta aqui'}
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

      {/* Options based on challenge type */}
      {selectedTemplate?.id === 'sentence-order' ? (
        // Sentence Order - Show shuffled words
        <div className="mb-6">
          <p className="text-customgreys-dirtyGrey text-sm mb-4 text-center">
            Arraste as palavras para formar a frase correta:
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[...currentChallenge.options]
              .sort(() => Math.random() - 0.5) // Simulate shuffle for preview
              .map((option, index) => (
              <div
                key={index}
                className="px-4 py-3 bg-violet-600/20 border-2 border-violet-600/40 rounded-lg cursor-grab hover:bg-violet-600/30 transition-all"
              >
                <span className="text-white font-medium">
                  {option.text}
                </span>
              </div>
            ))}
          </div>
          <div className="border-2 border-dashed border-customgreys-darkerGrey rounded-lg p-6 text-center">
            <p className="text-customgreys-dirtyGrey text-sm">
              Arraste as palavras aqui para formar a frase
            </p>
          </div>
        </div>
      ) : selectedTemplate?.id !== 'speaking' && (
        // Other types - Show normal options
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

        {/* Progress Steps - Clickable */}
        <div className="flex items-center gap-4 mb-6">
          {[
            { step: 1, title: "Selecionar Unidade", icon: Target, canNavigate: true },
            { step: 2, title: "Selecionar Lição", icon: Edit3, canNavigate: !!selectedUnit },
            { step: 3, title: "Tipo de Desafio", icon: Brain, canNavigate: !!selectedLesson },
            { step: 4, title: "Criar Exercício", icon: Plus, canNavigate: !!selectedTemplate },
            { step: 5, title: "Preview & Salvar", icon: Eye, canNavigate: false }
          ].map(({ step, title, icon: Icon, canNavigate }) => {
            const isCompleted = currentStep > step;
            const isCurrent = currentStep === step;
            const isClickable = canNavigate && (isCompleted || step < currentStep);

            return (
              <div
                key={step}
                onClick={() => {
                  if (isClickable) {
                    // Cancel editing mode if navigating away
                    if (editingChallengeId) {
                      setEditingChallengeId(null);
                    }
                    setShowEditSuccess(false);
                    setCurrentStep(step);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-violet-600 text-white'
                    : isCompleted
                      ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
                      : 'bg-customgreys-secondarybg text-customgreys-dirtyGrey'
                } ${isClickable && !isCurrent ? 'cursor-pointer hover:opacity-80' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-xs lg:text-sm">{title}</span>
                {isCompleted && <CheckCircle className="w-4 h-4" />}
              </div>
            );
          })}
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
                {unitsLoading ? (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                      <p className="text-customgreys-dirtyGrey">
                        Carregando unidades...
                      </p>
                    </div>
                  </div>
                ) : units.length === 0 ? (
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
                {lessonsLoading ? (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                      <p className="text-customgreys-dirtyGrey">
                        Carregando lições...
                      </p>
                    </div>
                  </div>
                ) : selectedUnit.lessons?.length === 0 ? (
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

          {/* Step 4: Create/Edit Challenge */}
          {currentStep === 4 && selectedTemplate && (
            <Card className={`bg-customgreys-secondarybg border-customgreys-darkerGrey ${editingChallengeId ? 'border-blue-500/50' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {editingChallengeId ? (
                      <>
                        <Edit3 className="w-5 h-5 text-blue-400" />
                        <span>Editar {selectedTemplate.name}</span>
                        <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
                          Modo Edição
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Criar {selectedTemplate.name}
                      </>
                    )}
                  </CardTitle>
                  {editingChallengeId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Success message after edit */}
                {showEditSuccess && (
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-green-300 font-medium">Desafio atualizado com sucesso!</p>
                      <p className="text-green-400/70 text-sm">O formulário foi limpo para criar um novo desafio.</p>
                    </div>
                  </div>
                )}

                {/* Instruction (optional) */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Instrução <span className="text-gray-400 font-normal text-sm">(opcional)</span>
                  </label>
                  <Input
                    placeholder="Ex: Choose the best answer to complete each sentence."
                    value={currentChallenge.instruction || ''}
                    onChange={(e) => {
                      setCurrentChallenge(prev => ({ ...prev, instruction: e.target.value }));
                    }}
                    className="bg-customgreys-primarybg border-2 border-customgreys-darkerGrey focus:border-violet-500 text-white"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Orientação geral do exercício. Aparece acima da pergunta para o aluno.
                  </p>
                </div>

                {/* Question */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Pergunta
                  </label>
                  <Textarea
                    placeholder="Ex: ___ morning, Mr. Silva. How ___ you?"
                    value={currentChallenge.question}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setCurrentChallenge(prev => ({ ...prev, question: newValue }));
                      challengeValidation.validateField('question', newValue);
                    }}
                    onBlur={() => {
                      challengeValidation.setFieldTouched('question');
                      challengeValidation.validateField('question', currentChallenge.question);
                    }}
                    className={`bg-customgreys-primarybg border-2 text-white transition-colors ${
                      challengeValidation.isFieldValid('question')
                        ? 'border-customgreys-darkerGrey focus:border-violet-500'
                        : 'border-red-500 focus:border-red-400'
                    }`}
                    rows={3}
                  />
                  {/* Validation Feedback */}
                  {challengeValidation.getFieldError('question') && (
                    <div className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {challengeValidation.getFieldError('question')}
                    </div>
                  )}
                  {challengeValidation.fields.question?.isValidating && (
                    <div className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validando pergunta...
                    </div>
                  )}
                  {currentChallenge.question && challengeValidation.isFieldValid('question') && (
                    <div className="text-green-400 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Pergunta válida
                    </div>
                  )}
                </div>

                {/* Listening Comprehension - Dictation Style */}
                {selectedTemplate.id === 'listening' && (() => {
                  // Count blanks in question (same logic as fill-blank)
                  const listeningBlankMatches = currentChallenge.question.match(/_{1,}/g);
                  const listeningDetectedBlanks = listeningBlankMatches ? listeningBlankMatches.length : 0;

                  // Ensure we have enough options for all blanks
                  const ensureListeningOptionsForBlanks = (count: number) => {
                    if (count > currentChallenge.options.length) {
                      const newOptions = [...currentChallenge.options];
                      for (let i = currentChallenge.options.length; i < count; i++) {
                        newOptions.push({ text: '', is_correct: true, order: i });
                      }
                      setCurrentChallenge(prev => ({ ...prev, options: newOptions }));
                    }
                  };

                  // Auto-adjust options when blanks are detected
                  if (listeningDetectedBlanks > 0 && listeningDetectedBlanks !== currentChallenge.options.length) {
                    setTimeout(() => ensureListeningOptionsForBlanks(listeningDetectedBlanks), 0);
                  }

                  return (
                    <div className="space-y-4">
                      {/* Header explicativo */}
                      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Volume2 className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <h3 className="text-amber-300 font-bold">🎧 Exercício de Ditado / Compreensão Auditiva</h3>
                            <p className="text-amber-200/70 text-sm">O estudante ouve o áudio e preenche as lacunas</p>
                          </div>
                        </div>
                      </div>

                      {/* Instrução geral */}
                      <div>
                        <label className="text-white font-medium mb-2 block">
                          📋 Instrução (contexto do exercício)
                        </label>
                        <Input
                          placeholder="Ex: Listen and complete the conversation with the words from the list."
                          value={currentChallenge.instruction || ''}
                          onChange={(e) => setCurrentChallenge(prev => ({ ...prev, instruction: e.target.value }))}
                          className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                        />
                      </div>

                      {/* Blank detection info */}
                      {listeningDetectedBlanks > 0 && (
                        <div className={`p-3 rounded-lg border ${
                          listeningDetectedBlanks > 8 ? 'bg-yellow-500/10 border-yellow-500/30' :
                          listeningDetectedBlanks > 1 ? 'bg-violet-500/10 border-violet-500/30' :
                          'bg-blue-500/10 border-blue-500/30'
                        }`}>
                          <p className={`text-sm font-medium ${
                            listeningDetectedBlanks > 8 ? 'text-yellow-300' :
                            listeningDetectedBlanks > 1 ? 'text-violet-300' : 'text-blue-300'
                          }`}>
                            {listeningDetectedBlanks > 8 ? (
                              <>⚠️ <strong>{listeningDetectedBlanks} lacunas</strong> detectadas. Exercícios com muitas lacunas podem ser difíceis.</>
                            ) : listeningDetectedBlanks > 1 ? (
                              <>🔢 Detectadas <strong>{listeningDetectedBlanks} lacunas</strong> na frase. Preencha a resposta correta para cada.</>
                            ) : (
                              <>✅ Detectada <strong>1 lacuna</strong> na frase.</>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Warning for very long text */}
                      {currentChallenge.question.length > 300 && (
                        <div className="p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/30">
                          <p className="text-yellow-300 text-sm">
                            ⚠️ Texto longo ({currentChallenge.question.length} caracteres). O áudio gerado pode ser extenso.
                          </p>
                        </div>
                      )}

                      {/* Respostas corretas - uma para cada lacuna */}
                      <div className="space-y-3">
                        <label className="text-white font-medium block">
                          ✅ Resposta{listeningDetectedBlanks > 1 ? 's' : ''} Correta{listeningDetectedBlanks > 1 ? 's' : ''} (o que o estudante deve escrever)
                        </label>

                        {(listeningDetectedBlanks > 0 ? Array.from({ length: listeningDetectedBlanks }) : [0]).map((_, index) => (
                          <div key={index} className="flex items-center gap-3">
                            {listeningDetectedBlanks > 1 && (
                              <span className="text-amber-400 font-bold text-sm min-w-[80px]">
                                Lacuna {index + 1}:
                              </span>
                            )}
                            <Input
                              placeholder={`Ex: ${index === 0 ? 'Good' : index === 1 ? 'are' : 'resposta'}`}
                              value={currentChallenge.options[index]?.text || ''}
                              onChange={(e) => {
                                const newOptions = [...currentChallenge.options];
                                if (!newOptions[index]) {
                                  newOptions[index] = { text: '', is_correct: true, order: index };
                                }
                                newOptions[index] = { ...newOptions[index], text: e.target.value };
                                setCurrentChallenge(prev => ({ ...prev, options: newOptions }));
                              }}
                              className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white flex-1"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Gerar Áudio com IA */}
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-5 h-5 text-green-400" />
                          <label className="text-green-300 font-medium">
                            🎙️ Áudio da Frase Completa (obrigatório)
                          </label>
                        </div>
                        <p className="text-green-200/70 text-xs mb-3">
                          Gere o áudio da frase completa. O estudante ouvirá este áudio e preencherá as lacunas.
                        </p>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!currentChallenge.question.trim() || !currentChallenge.options[0]?.text || generatingAudio}
                            onClick={async () => {
                              if (!currentChallenge.question.trim()) return;
                              setGeneratingAudio(true);
                              try {
                                // Replace blanks with correct answers for audio generation
                                let fullSentence = currentChallenge.question;
                                const blanks = fullSentence.match(/_{1,}/g) || [];
                                blanks.forEach((blank, idx) => {
                                  if (currentChallenge.options[idx]?.text) {
                                    fullSentence = fullSentence.replace(blank, currentChallenge.options[idx].text);
                                  }
                                });

                                const result = await generateReferenceAudio({
                                  text: fullSentence,
                                  voice: 'alloy',
                                  saveToS3: true
                                });
                                if (result.audioUrl) {
                                  setReferenceAudioUrl(result.audioUrl);
                                  if (result.s3Url) {
                                    setReferenceAudioS3Url(result.s3Url);
                                  }
                                }
                              } catch (error) {
                                console.error('Error generating audio:', error);
                              } finally {
                                setGeneratingAudio(false);
                              }
                            }}
                            className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                          >
                            {generatingAudio ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2" />
                                Gerando...
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-4 h-4 mr-2" />
                                🤖 Gerar Áudio com IA
                              </>
                            )}
                          </Button>

                          {referenceAudioUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReferenceAudioUrl('');
                                setReferenceAudioS3Url('');
                              }}
                              className="text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Preview do áudio */}
                        {referenceAudioUrl && (
                          <div className="mt-3 bg-customgreys-secondarybg rounded-lg p-3">
                            <p className="text-green-400 text-sm mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Áudio gerado com sucesso:
                            </p>
                            <audio
                              controls
                              src={referenceAudioUrl}
                              className="w-full"
                              style={{ height: '32px' }}
                            >
                              Seu navegador não suporta áudio.
                            </audio>
                          </div>
                        )}

                        {!referenceAudioUrl && currentChallenge.question && currentChallenge.options[0]?.text && (
                          <p className="text-customgreys-dirtyGrey text-xs mt-2">
                            💡 Frase que será gerada: "{
                              (() => {
                                let preview = currentChallenge.question;
                                const blanks = preview.match(/_{1,}/g) || [];
                                blanks.forEach((blank, idx) => {
                                  if (currentChallenge.options[idx]?.text) {
                                    preview = preview.replace(blank, currentChallenge.options[idx].text);
                                  }
                                });
                                return preview;
                              })()
                            }"
                          </p>
                        )}
                      </div>

                      {/* Imagem opcional */}
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                          <label className="text-purple-300 font-medium">
                            🖼️ Imagem de Contexto (opcional)
                          </label>
                        </div>
                        <p className="text-purple-200/70 text-xs mb-3">
                          Adicione uma imagem que ajude o estudante a entender o contexto do diálogo.
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const newOptions = [...currentChallenge.options];
                              if (newOptions[0]) {
                                newOptions[0] = { ...newOptions[0], imageFile: file };
                                setCurrentChallenge(prev => ({ ...prev, options: newOptions }));
                              }
                            }
                          }}
                          className="w-full px-3 py-2 bg-customgreys-primarybg border border-customgreys-darkerGrey rounded-lg text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                        />
                        {currentChallenge.options[0]?.imageFile && (
                          <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs">
                            <div className="flex items-center gap-1 text-purple-400">
                              <CheckCircle className="w-3 h-3" />
                              <span>Imagem: {currentChallenge.options[0].imageFile.name}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Guia rápido */}
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-300 text-sm font-medium mb-2">
                          💡 <strong>Como criar este exercício:</strong>
                        </p>
                        <div className="space-y-1 text-blue-200 text-xs">
                          <p><strong>1.</strong> Escreva a frase com lacunas usando <code className="bg-blue-800/50 px-1 rounded">___</code></p>
                          <p><strong>2.</strong> Preencha as respostas corretas para cada lacuna</p>
                          <p><strong>3.</strong> Clique em "Gerar Áudio com IA" para criar o áudio</p>
                          <p><strong>4.</strong> O estudante ouvirá o áudio e preencherá as lacunas</p>
                        </div>
                      </div>

                      {/* Preview do exercício */}
                      {currentChallenge.question && currentChallenge.options[0]?.text && referenceAudioUrl && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-green-300 text-sm font-medium mb-3">✅ Preview do exercício:</p>
                          {currentChallenge.instruction && (
                            <p className="text-green-200 text-sm mb-2">
                              <strong>Instrução:</strong> {currentChallenge.instruction}
                            </p>
                          )}
                          <p className="text-green-200 text-sm mb-2">
                            <strong>Frase com lacunas:</strong> {currentChallenge.question}
                          </p>
                          <div className="text-green-200 text-sm mb-2">
                            <strong>Resposta{listeningDetectedBlanks > 1 ? 's' : ''}:</strong>{' '}
                            {currentChallenge.options.slice(0, listeningDetectedBlanks || 1).map((opt, i) => (
                              <span key={i} className="text-amber-300">
                                {listeningDetectedBlanks > 1 && <span>({i + 1}) </span>}
                                "{opt.text}"
                                {i < (listeningDetectedBlanks || 1) - 1 && ', '}
                              </span>
                            ))}
                          </div>
                          <p className="text-green-200 text-sm">
                            <strong>Áudio:</strong> <span className="text-green-400">✅ Pronto</span>
                          </p>
                        </div>
                      )}

                      {/* Aviso se falta áudio */}
                      {currentChallenge.question && currentChallenge.options[0]?.text && !referenceAudioUrl && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-300 text-sm">
                            ⚠️ <strong>Atenção:</strong> Não se esqueça de gerar o áudio antes de salvar!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Multiple Choice Options - only for multiple-choice type */}
                {selectedTemplate.id === 'multiple-choice' && (
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
                    <div className="space-y-4">
                      {currentChallenge.options.map((option, index) => (
                        <div key={index} className="p-4 bg-customgreys-darkGrey/50 border border-customgreys-darkerGrey rounded-lg space-y-3">
                          {/* Header with option number and controls */}
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium">Opção {index + 1}</h4>
                            <div className="flex gap-2">
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
                                <span className="ml-1 text-xs">{option.is_correct ? 'Correta' : 'Marcar'}</span>
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
                          </div>

                          {/* Text content */}
                          <div>
                            <label className="text-gray-300 text-sm mb-1 block">Texto da opção</label>
                            <Input
                              placeholder={`Digite o texto da opção ${index + 1}`}
                              value={option.text}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                updateOption(index, 'text', newValue);
                                // Validate the current challenge with updated options
                                const updatedOptions = [...currentChallenge.options];
                                updatedOptions[index] = { ...option, text: newValue };
                                challengeValidation.validateField('options', updatedOptions);
                              }}
                              onBlur={() => {
                                challengeValidation.setFieldTouched('options');
                              }}
                              className={`bg-customgreys-primarybg border-2 text-white transition-colors ${
                                option.text && option.text.length >= 1
                                  ? 'border-customgreys-darkerGrey focus:border-violet-500'
                                  : option.text !== '' 
                                    ? 'border-red-500 focus:border-red-400'
                                    : 'border-customgreys-darkerGrey focus:border-violet-500'
                              }`}
                            />
                            {/* Option validation feedback */}
                            {option.text === '' && challengeValidation.fields.options?.hasBeenTouched && (
                              <div className="text-red-400 text-xs mt-1">
                                Texto da opção é obrigatório
                              </div>
                            )}
                            {option.text && option.text.length >= 1 && (
                              <div className="text-green-400 text-xs mt-1">
                                ✓ Opção válida
                              </div>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill in the Blank */}
                {selectedTemplate.id === 'fill-blank' && (() => {
                  // Count blanks in question
                  const blankMatches = currentChallenge.question.match(/_{1,}/g);
                  const detectedBlanks = blankMatches ? blankMatches.length : 0;

                  // Ensure we have enough options for all blanks
                  const ensureOptionsForBlanks = (count: number) => {
                    if (count > currentChallenge.options.length) {
                      const newOptions = [...currentChallenge.options];
                      for (let i = currentChallenge.options.length; i < count; i++) {
                        newOptions.push({ text: '', is_correct: true, order: i });
                      }
                      setCurrentChallenge(prev => ({ ...prev, options: newOptions }));
                    }
                  };

                  // Auto-adjust options when blanks are detected
                  if (detectedBlanks > 0 && detectedBlanks !== currentChallenge.options.length) {
                    setTimeout(() => ensureOptionsForBlanks(detectedBlanks), 0);
                  }

                  return (
                  <div className="space-y-4">
                    {/* Instrução geral */}
                    <div>
                      <label className="text-white font-medium mb-2 block">
                        📋 Instrução Geral (contexto do exercício)
                      </label>
                      <Input
                        placeholder="Ex: Complete the sentences using I / You / am / are."
                        value={currentChallenge.instruction || ''}
                        onChange={(e) => setCurrentChallenge(prev => ({ ...prev, instruction: e.target.value }))}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                      />
                      <p className="text-customgreys-dirtyGrey text-xs mt-1">
                        Esta instrução aparece no topo e dá contexto para todas as frases do exercício
                      </p>
                    </div>

                    {/* Áudio de Referência (opcional) - para exercícios de ditado/listening */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Volume2 className="w-5 h-5 text-amber-400" />
                        <label className="text-amber-300 font-medium">
                          🎧 Áudio de Referência (opcional)
                        </label>
                      </div>
                      <p className="text-amber-200/70 text-xs mb-3">
                        Adicione um áudio da frase completa para exercícios de ditado. O estudante ouvirá o áudio e preencherá as lacunas.
                      </p>

                      <div className="space-y-3">
                        {/* Gerar com IA */}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!currentChallenge.question.trim() || generatingAudio}
                            onClick={async () => {
                              if (!currentChallenge.question.trim()) return;
                              setGeneratingAudio(true);
                              try {
                                // Replace blanks with correct answers for audio generation
                                let fullSentence = currentChallenge.question;
                                const blanks = fullSentence.match(/_{1,}/g) || [];
                                blanks.forEach((blank, idx) => {
                                  if (currentChallenge.options[idx]?.text) {
                                    fullSentence = fullSentence.replace(blank, currentChallenge.options[idx].text);
                                  }
                                });

                                const result = await generateReferenceAudio({
                                  text: fullSentence,
                                  voice: 'alloy',
                                  saveToS3: true
                                });
                                if (result.audioUrl) {
                                  setReferenceAudioUrl(result.audioUrl);
                                  if (result.s3Url) {
                                    setReferenceAudioS3Url(result.s3Url);
                                  }
                                }
                              } catch (error) {
                                console.error('Error generating audio:', error);
                              } finally {
                                setGeneratingAudio(false);
                              }
                            }}
                            className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
                          >
                            {generatingAudio ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400 mr-2" />
                                Gerando...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4 mr-2" />
                                🤖 Gerar Áudio com IA
                              </>
                            )}
                          </Button>

                          {referenceAudioUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReferenceAudioUrl('');
                                setReferenceAudioS3Url('');
                              }}
                              className="text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Preview do áudio */}
                        {referenceAudioUrl && (
                          <div className="bg-customgreys-secondarybg rounded-lg p-3">
                            <p className="text-green-400 text-sm mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Áudio gerado - o estudante ouvirá antes de responder:
                            </p>
                            <audio
                              controls
                              src={referenceAudioUrl}
                              className="w-full"
                              style={{ height: '32px' }}
                            >
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                          </div>
                        )}

                        {!referenceAudioUrl && currentChallenge.question && currentChallenge.options[0]?.text && (
                          <p className="text-customgreys-dirtyGrey text-xs">
                            💡 Clique em "Gerar Áudio" para criar um áudio da frase: "{
                              (() => {
                                let preview = currentChallenge.question;
                                const blanks = preview.match(/_{1,}/g) || [];
                                blanks.forEach((blank, idx) => {
                                  if (currentChallenge.options[idx]?.text) {
                                    preview = preview.replace(blank, currentChallenge.options[idx].text);
                                  }
                                });
                                return preview;
                              })()
                            }"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Blank detection info */}
                    {detectedBlanks > 0 && (
                      <div className={`p-3 rounded-lg border ${
                        detectedBlanks > 8 ? 'bg-yellow-500/10 border-yellow-500/30' :
                        detectedBlanks > 1 ? 'bg-violet-500/10 border-violet-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <p className={`text-sm font-medium ${
                          detectedBlanks > 8 ? 'text-yellow-300' :
                          detectedBlanks > 1 ? 'text-violet-300' : 'text-blue-300'
                        }`}>
                          {detectedBlanks > 8 ? (
                            <>⚠️ <strong>{detectedBlanks} lacunas</strong> detectadas. Exercícios com muitas lacunas podem ser difíceis para os estudantes.</>
                          ) : detectedBlanks > 1 ? (
                            <>🔢 Detectadas <strong>{detectedBlanks} lacunas</strong> na pergunta. Preencha uma resposta para cada.</>
                          ) : (
                            <>✅ Detectada <strong>1 lacuna</strong> na pergunta.</>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Warning for very long text */}
                    {currentChallenge.question.length > 300 && (
                      <div className="p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/30">
                        <p className="text-yellow-300 text-sm">
                          ⚠️ Texto longo ({currentChallenge.question.length} caracteres). Certifique-se de que está legível no mobile.
                        </p>
                      </div>
                    )}

                    {/* Respostas corretas - uma para cada lacuna */}
                    <div className="space-y-3">
                      <label className="text-white font-medium block">
                        ✅ Resposta{detectedBlanks > 1 ? 's' : ''} Correta{detectedBlanks > 1 ? 's' : ''} (uma para cada lacuna)
                      </label>

                      {(detectedBlanks > 0 ? Array.from({ length: detectedBlanks }) : [0]).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {detectedBlanks > 1 && (
                            <span className="text-violet-400 font-bold text-sm min-w-[80px]">
                              Lacuna {index + 1}:
                            </span>
                          )}
                          <Input
                            placeholder={`Ex: ${index === 0 ? 'Good' : index === 1 ? 'are' : 'resposta'}`}
                            value={currentChallenge.options[index]?.text || ''}
                            onChange={(e) => {
                              const newOptions = [...currentChallenge.options];
                              if (!newOptions[index]) {
                                newOptions[index] = { text: '', is_correct: true, order: index };
                              }
                              newOptions[index] = { ...newOptions[index], text: e.target.value };
                              setCurrentChallenge(prev => ({ ...prev, options: newOptions }));
                            }}
                            className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white flex-1"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 text-sm font-medium mb-2">
                        💡 <strong>Como criar um exercício de completar lacuna:</strong>
                      </p>
                      <div className="space-y-2 text-blue-200 text-xs">
                        <p><strong>1. Instrução:</strong> Contexto geral (ex: "Complete using I/You/am/are")</p>
                        <p><strong>2. Pergunta:</strong> Use <code className="bg-blue-800/50 px-1 rounded">___</code> para marcar as lacunas</p>
                        <p><strong>3. Exemplo com 1 lacuna:</strong> "Hello! ___ am Maria." → Resposta: "I"</p>
                        <p><strong>4. Exemplo com 2 lacunas:</strong> "___ morning. How ___ you?" → Respostas: "Good", "are"</p>
                      </div>
                    </div>

                    {/* Preview */}
                    {currentChallenge.question && currentChallenge.options[0]?.text && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-300 text-sm font-medium mb-2">✅ Preview do exercício:</p>
                        {currentChallenge.instruction && (
                          <p className="text-green-200 text-sm mb-1">
                            <strong>Instrução:</strong> {currentChallenge.instruction}
                          </p>
                        )}
                        <p className="text-green-200 text-sm mb-1">
                          <strong>Frase:</strong> {currentChallenge.question}
                        </p>
                        <div className="text-green-200 text-sm">
                          <strong>Resposta{detectedBlanks > 1 ? 's' : ''}:</strong>{' '}
                          {currentChallenge.options.slice(0, detectedBlanks || 1).map((opt, i) => (
                            <span key={i}>
                              {detectedBlanks > 1 && <span className="text-violet-300">({i + 1}) </span>}
                              "{opt.text}"
                              {i < (detectedBlanks || 1) - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })()}

                {/* Translation with AI Integration */}
                {selectedTemplate.id === 'translation' && (
                  <div className="space-y-4">
                    {/* AI-Enhanced Translation Challenge */}
                    <div className="bg-violet-600/10 border border-violet-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AI</span>
                        </div>
                        <h4 className="text-violet-400 font-medium">Sistema de Tradução Inteligente</h4>
                      </div>
                      <p className="text-customgreys-dirtyGrey text-sm">
                        Este desafio usa IA para validar traduções com feedback inteligente.
                        O sistema aceita múltiplas traduções corretas e fornece pontuação detalhada.
                      </p>
                    </div>

                    {/* Instruction Field */}
                    <div>
                      <label className="text-white font-medium mb-2 block">
                        Instrução (opcional)
                      </label>
                      <Input
                        placeholder="Ex: Traduza esta frase para português..."
                        value={currentChallenge.instruction || ''}
                        onChange={(e) => setCurrentChallenge(prev => ({ ...prev, instruction: e.target.value }))}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                      />
                      <p className="text-customgreys-dirtyGrey text-xs mt-1">
                        Instrução que aparecerá para o aluno antes da frase a traduzir
                      </p>
                    </div>

                    {/* Translation Input with AI Suggestions */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white font-medium">
                          Tradução Correta
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateSuggestions()}
                          disabled={!currentChallenge.question.trim() || loadingSuggestions}
                          className="bg-violet-600 border-violet-600 text-white hover:bg-violet-700 text-xs"
                        >
                          {loadingSuggestions ? (
                            <>
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                              IA Gerando...
                            </>
                          ) : (
                            <>🤖 Gerar com IA</>
                          )}
                        </Button>
                      </div>
                      {/* Multiple correct translations */}
                      <div className="space-y-2">
                        {currentChallenge.options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={index === 0 ? "Tradução principal..." : `Variação ${index + 1} (opcional)...`}
                              value={option.text || ''}
                              onChange={(e) => updateOption(index, 'text', e.target.value)}
                              className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white flex-1"
                            />
                            {index > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newOptions = currentChallenge.options.filter((_, i) => i !== index);
                                  setCurrentChallenge(prev => ({ ...prev, options: newOptions }));
                                }}
                                className="bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}

                        {/* Add more translations button */}
                        {currentChallenge.options.length < 5 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newOption = {
                                text: '',
                                is_correct: true, // All translation options are correct
                                order: currentChallenge.options.length
                              };
                              setCurrentChallenge(prev => ({
                                ...prev,
                                options: [...prev.options, newOption]
                              }));
                            }}
                            className="w-full bg-green-600/10 border-green-600/30 text-green-400 hover:bg-green-600/20"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar Variação de Tradução
                          </Button>
                        )}

                        <p className="text-customgreys-dirtyGrey text-xs">
                          💡 Adicione várias traduções aceitas para maior flexibilidade (ex: "Ouça" e "Ouve")
                        </p>
                      </div>

                      {/* AI Suggestions Display */}
                      {aiSuggestions.length > 0 && (
                        <div className="mt-3 p-3 bg-customgreys-secondarybg rounded-lg">
                          <h5 className="text-violet-400 text-sm font-medium mb-2">💡 Sugestões da IA (clique para adicionar):</h5>
                          <div className="space-y-1">
                            {aiSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  // Add as new option if not already exists
                                  const exists = currentChallenge.options.some(opt => opt.text === suggestion);
                                  if (!exists && currentChallenge.options.length < 5) {
                                    const newOption = {
                                      text: suggestion,
                                      is_correct: true,
                                      order: currentChallenge.options.length
                                    };
                                    setCurrentChallenge(prev => ({
                                      ...prev,
                                      options: [...prev.options, newOption]
                                    }));
                                  } else if (!exists) {
                                    // Replace first empty option or first option
                                    const emptyIndex = currentChallenge.options.findIndex(opt => !opt.text);
                                    const targetIndex = emptyIndex >= 0 ? emptyIndex : 0;
                                    updateOption(targetIndex, 'text', suggestion);
                                  }
                                }}
                                className="block w-full text-left p-2 text-sm text-customgreys-dirtyGrey hover:bg-violet-600/20 hover:text-white rounded transition-colors"
                              >
                                + {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reference Audio for Translation (Listen and Write) */}
                    {currentChallenge.question.trim() && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-blue-400 text-sm font-medium">🔊 Áudio de Referência (Opcional)</h5>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleGenerateReferenceAudio}
                            disabled={generatingAudio}
                            className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 text-xs"
                          >
                            {generatingAudio ? (
                              <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                Gerando...
                              </>
                            ) : (
                              <>🔊 Gerar Áudio IA</>
                            )}
                          </Button>
                        </div>
                        <p className="text-blue-300 text-sm mb-3">
                          Para exercícios de ditado ou "ouvir e escrever", gere um áudio que o aluno irá ouvir antes de traduzir/escrever.
                        </p>

                        {referenceAudioUrl && (
                          <div className="bg-customgreys-secondarybg rounded-lg p-3">
                            <p className="text-green-400 text-sm mb-2">✅ Áudio de referência gerado:</p>
                            <audio
                              controls
                              src={referenceAudioUrl}
                              className="w-full"
                              style={{ height: '32px' }}
                            >
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Validation Preview */}
                    {currentChallenge.question.trim() && currentChallenge.options[0]?.text && (
                      <div className="bg-customgreys-secondarybg rounded-lg p-3">
                        <h5 className="text-violet-400 text-sm font-medium mb-2">🎯 Preview da Validação:</h5>
                        <div className="text-xs text-customgreys-dirtyGrey space-y-1">
                          {currentChallenge.instruction && (
                            <p>• <strong>Instrução:</strong> "{currentChallenge.instruction}"</p>
                          )}
                          <p>• <strong>Texto a traduzir:</strong> "{currentChallenge.question}"</p>
                          <p>• <strong>Traduções aceitas:</strong></p>
                          <ul className="ml-4 space-y-0.5">
                            {currentChallenge.options.filter(opt => opt.text?.trim()).map((opt, i) => (
                              <li key={i} className="text-green-400">✓ "{opt.text}"</li>
                            ))}
                          </ul>
                          {referenceAudioUrl && <p>• <strong>Áudio:</strong> ✅ Incluído (aluno ouvirá antes de responder)</p>}
                          <p>• <strong>Validação:</strong> Remove acentos e pontuação, tolerância de 70%</p>
                          <p className="text-yellow-400">💡 "Ouça" = "ouca" = "Ouca" (variações aceitas)</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Match Pairs */}
                {selectedTemplate.id === 'match-pairs' && (() => {
                  // Helper to parse pair text (stored as "English - Portuguese")
                  const parsePair = (text: string) => {
                    if (!text) return { left: '', right: '' };
                    const parts = text.split(' - ');
                    return {
                      left: parts[0]?.trim() || '',
                      right: parts[1]?.trim() || ''
                    };
                  };

                  // Helper to combine pair text
                  const combinePair = (left: string, right: string) => {
                    return `${left.trim()} - ${right.trim()}`;
                  };

                  // Update left side of pair
                  const updatePairLeft = (index: number, value: string) => {
                    const current = parsePair(currentChallenge.options[index]?.text || '');
                    updateOption(index, 'text', combinePair(value, current.right));
                  };

                  // Update right side of pair
                  const updatePairRight = (index: number, value: string) => {
                    const current = parsePair(currentChallenge.options[index]?.text || '');
                    updateOption(index, 'text', combinePair(current.left, value));
                  };

                  return (
                    <div className="space-y-4">
                      {/* Header explicativo */}
                      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <Shuffle className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-orange-300 font-bold">🔗 Combinar Pares</h3>
                            <p className="text-orange-200/70 text-sm">O estudante deve ligar cada termo à sua correspondência</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-white font-medium">
                            Pares para Combinar
                          </label>
                          <span className="text-customgreys-dirtyGrey text-xs">
                            {currentChallenge.options.length} pares
                          </span>
                        </div>

                        {/* Column Headers */}
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div className="text-center">
                            <span className="text-sm font-medium text-blue-400">🇺🇸 Coluna A (Inglês)</span>
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-medium text-green-400">🇦🇴 Coluna B (Português)</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {currentChallenge.options.map((option, index) => {
                            const pair = parsePair(option.text);
                            return (
                              <div key={index} className="p-3 bg-customgreys-darkGrey/50 border border-customgreys-darkerGrey rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <span className="text-customgreys-dirtyGrey text-xs">Par {index + 1}</span>
                                  {currentChallenge.options.length > 4 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeOption(index)}
                                      className="ml-auto h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Input
                                      placeholder="Ex: Hello"
                                      value={pair.left}
                                      onChange={(e) => updatePairLeft(index, e.target.value)}
                                      className="bg-customgreys-primarybg border-blue-500/50 text-white placeholder-gray-500 focus:border-blue-400"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-orange-400">↔</span>
                                    <Input
                                      placeholder="Ex: Olá"
                                      value={pair.right}
                                      onChange={(e) => updatePairRight(index, e.target.value)}
                                      className="bg-customgreys-primarybg border-green-500/50 text-white placeholder-gray-500 focus:border-green-400 flex-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {currentChallenge.options.length < 8 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={addOption}
                            className="mt-3 bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar Par
                          </Button>
                        )}
                      </div>

                      {/* Guia rápido */}
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-300 text-sm font-medium mb-2">
                          💡 <strong>Dicas:</strong>
                        </p>
                        <div className="space-y-1 text-blue-200 text-xs">
                          <p>• Use pares claros e concisos (ex: "Apple - Maçã")</p>
                          <p>• Recomendado: 4-6 pares por exercício</p>
                          <p>• As colunas serão embaralhadas para o estudante</p>
                          <p>• Validação aceita pequenos erros de digitação (85% tolerância)</p>
                        </div>
                      </div>

                      {/* Preview */}
                      {currentChallenge.options.filter(o => {
                        const p = parsePair(o.text);
                        return p.left && p.right;
                      }).length >= 2 && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-green-300 text-sm font-medium mb-3">✅ Preview dos pares:</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-400 mb-2">Coluna A (embaralhada)</p>
                              <div className="space-y-1">
                                {currentChallenge.options.map((o, i) => {
                                  const p = parsePair(o.text);
                                  return p.left && (
                                    <div key={i} className="bg-blue-500/20 text-blue-300 text-sm px-2 py-1 rounded">
                                      {p.left}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-2">Coluna B (embaralhada)</p>
                              <div className="space-y-1">
                                {[...currentChallenge.options].reverse().map((o, i) => {
                                  const p = parsePair(o.text);
                                  return p.right && (
                                    <div key={i} className="bg-green-500/20 text-green-300 text-sm px-2 py-1 rounded">
                                      {p.right}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Sentence Order */}
                {selectedTemplate.id === 'sentence-order' && (
                  <div className="space-y-4">
                    {/* Instrução geral */}
                    <div>
                      <label className="text-white font-medium mb-2 block">
                        📋 Instrução do Exercício
                      </label>
                      <Input
                        placeholder="Ex: Reorder the words to make correct WH-questions."
                        value={currentChallenge.instruction || ''}
                        onChange={(e) => setCurrentChallenge(prev => ({ ...prev, instruction: e.target.value }))}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                      />
                      <p className="text-customgreys-dirtyGrey text-xs mt-1">
                        Esta instrução aparece no topo e explica ao aluno o que deve fazer
                      </p>
                    </div>

                    {/* Frase completa */}
                    <div>
                      <label className="text-white font-medium mb-2 block">
                        Frase Completa (na ordem correta)
                      </label>
                      <Input
                        placeholder="Digite a frase completa (ex: What is your name?)"
                        defaultValue=""
                        onChange={(e) => {
                          const sentence = e.target.value;
                          // Split by spaces, keeping empty array if no input
                          const words = sentence.trim() === '' ? [] : sentence.trim().split(/\s+/);
                          const newOptions = words.map((word, index) => ({
                            text: word,
                            is_correct: false,
                            order: index
                          }));
                          setCurrentChallenge(prev => ({
                            ...prev,
                            options: newOptions
                          }));
                        }}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                      />
                    </div>

                    {/* Preview das palavras */}
                    {currentChallenge.options.length > 0 && (
                      <div className="mt-3">
                        <p className="text-customgreys-dirtyGrey text-sm mb-2">
                          Preview - Palavras que o aluno verá (embaralhadas):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[...currentChallenge.options]
                            .sort(() => Math.random() - 0.5) // Shuffle for preview
                            .map((option, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-violet-600/20 border border-violet-600/30 rounded-lg text-violet-300 text-sm"
                            >
                              {option.text}
                            </span>
                          ))}
                        </div>
                        <p className="text-customgreys-dirtyGrey text-xs mt-2">
                          ↑ <strong>Palavras separadas:</strong> {currentChallenge.options.length} palavra{currentChallenge.options.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    <p className="text-customgreys-dirtyGrey text-xs mt-2">
                      💡 <strong>Como funciona:</strong> Digite a frase completa acima usando ESPAÇOS entre as palavras. O sistema separará automaticamente as palavras e as embaralhará para o aluno ordenar.
                    </p>

                    {/* Preview completo */}
                    {currentChallenge.instruction && currentChallenge.options.length > 0 && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-300 text-sm font-medium mb-2">✅ Preview do exercício:</p>
                        <p className="text-green-200 text-sm mb-1">
                          <strong>Instrução:</strong> {currentChallenge.instruction}
                        </p>
                        <p className="text-green-200 text-sm">
                          <strong>Pergunta:</strong> {currentChallenge.question || '(adicione na pergunta acima)'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* True/False */}
                {selectedTemplate.id === 'true-false' && (
                  <div>
                    <label className="text-white font-medium mb-3 block">
                      Resposta Correta
                    </label>
                    <div className="space-y-2">
                      {currentChallenge.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Button
                            variant={option.is_correct ? "default" : "outline"}
                            onClick={() => setCorrectAnswer(index)}
                            className={`flex-1 ${option.is_correct 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-green-600/20"
                            }`}
                          >
                            {option.is_correct ? <Check className="w-4 h-4 mr-2" /> : <Circle className="w-4 h-4 mr-2" />}
                            {option.text}
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-customgreys-dirtyGrey text-xs mt-2">
                      Selecione qual é a resposta correta para a afirmação
                    </p>
                  </div>
                )}

                {/* Speaking - AI-Enhanced Pronunciation */}
                {selectedTemplate.id === 'speaking' && (
                  <div className="space-y-4">
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">AI</span>
                          </div>
                          <p className="text-violet-300 text-sm font-medium">
                            💬 <strong>Exercício de Pronúncia com IA</strong>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGeneratePronunciationExercise}
                          disabled={loadingPronunciationAI}
                          className="bg-violet-600 border-violet-600 text-white hover:bg-violet-700 text-xs"
                        >
                          {loadingPronunciationAI ? (
                            <>
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                              Gerando...
                            </>
                          ) : (
                            <>🎤 Gerar com IA</>
                          )}
                        </Button>
                      </div>
                      <p className="text-violet-300 text-sm">
                        Este tipo de desafio usa reconhecimento de voz inteligente. A IA avaliará a pronúncia com feedback detalhado.
                      </p>
                      
                      {/* AI Exercise Suggestions */}
                      {pronunciationSuggestion && (
                        <div className="mt-4 p-3 bg-customgreys-secondarybg rounded-lg">
                          <h5 className="text-violet-400 text-sm font-medium mb-2">💡 Sugestão da IA:</h5>
                          <div className="space-y-2">
                            <p className="text-white text-sm font-medium">
                              Texto sugerido: "{pronunciationSuggestion.text_to_speak}"
                            </p>
                            {pronunciationSuggestion.pronunciation_tips && pronunciationSuggestion.pronunciation_tips.length > 0 && (
                              <div>
                                <p className="text-customgreys-dirtyGrey text-xs mb-1">Dicas de pronúncia:</p>
                                <ul className="text-customgreys-dirtyGrey text-xs space-y-1">
                                  {pronunciationSuggestion.pronunciation_tips.map((tip: string, index: number) => (
                                    <li key={index}>• {tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCurrentChallenge(prev => ({ ...prev, question: pronunciationSuggestion.text_to_speak }))}
                              className="bg-green-600/20 border-green-600/30 text-green-400 hover:bg-green-600/30 text-xs"
                            >
                              ✅ Usar Esta Sugestão
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Reference Audio Generation */}
                    {currentChallenge.question.trim() && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-blue-400 text-sm font-medium">🔊 Áudio de Referência</h5>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleGenerateReferenceAudio}
                            disabled={generatingAudio}
                            className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 text-xs"
                          >
                            {generatingAudio ? (
                              <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                Gerando...
                              </>
                            ) : (
                              <>🔊 Gerar Áudio IA</>
                            )}
                          </Button>
                        </div>
                        <p className="text-blue-300 text-sm mb-3">
                          Gere um áudio de referência com pronúncia perfeita para os estudantes ouvirem.
                        </p>
                        
                        {referenceAudioUrl && (
                          <div className="bg-customgreys-secondarybg rounded-lg p-3">
                            <p className="text-green-400 text-sm mb-2">✅ Áudio de referência gerado:</p>
                            <audio
                              controls
                              src={referenceAudioUrl}
                              className="w-full"
                              style={{ height: '32px' }}
                            >
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                          </div>
                        )}
                      </div>
                    )}
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
                  className={`w-full disabled:opacity-50 ${
                    editingChallengeId
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-violet-600 hover:bg-violet-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingChallengeId ? 'Atualizando...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      {editingChallengeId ? 'Salvar Alterações' : 'Salvar Desafio'}
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
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
                      {lessonDetails?.challenges?.length || 0} desafio{(lessonDetails?.challenges?.length || 0) !== 1 ? 's' : ''} criado{(lessonDetails?.challenges?.length || 0) !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-2 text-xs text-violet-300">
                      💡 Recomendação: 8-12 desafios por lição para melhor experiência
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Challenges List */}
          {selectedLesson && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Desafios Existentes {!isLoadingLessonDetails && lessonDetails?.challenges ? `(${lessonDetails.challenges.length})` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {isLoadingLessonDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-400"></div>
                    <span className="ml-2 text-customgreys-dirtyGrey">Carregando desafios...</span>
                  </div>
                ) : lessonDetails?.challenges && lessonDetails.challenges.length > 0 ? (
                  <div className="space-y-2">
                    {lessonDetails.challenges.map((challenge: any, index: number) => (
                      <div
                        key={challenge.id}
                        className="p-3 bg-customgreys-primarybg rounded-lg border border-customgreys-darkerGrey hover:border-violet-500/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-violet-600/20 rounded-full flex items-center justify-center">
                            <span className="text-violet-400 text-xs font-bold">{challenge.order || index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  challenge.type === 'SELECT' ? 'text-blue-400 border-blue-400/30' :
                                  challenge.type === 'FILL_BLANK' ? 'text-yellow-400 border-yellow-400/30' :
                                  challenge.type === 'TRANSLATION' ? 'text-green-400 border-green-400/30' :
                                  challenge.type === 'LISTENING' ? 'text-purple-400 border-purple-400/30' :
                                  challenge.type === 'SPEAKING' ? 'text-pink-400 border-pink-400/30' :
                                  challenge.type === 'MATCH_PAIRS' ? 'text-orange-400 border-orange-400/30' :
                                  challenge.type === 'SENTENCE_ORDER' ? 'text-cyan-400 border-cyan-400/30' :
                                  challenge.type === 'TRUE_FALSE' ? 'text-red-400 border-red-400/30' :
                                  'text-gray-400 border-gray-400/30'
                                }`}
                              >
                                {challenge.type === 'SELECT' ? 'Múltipla Escolha' :
                                 challenge.type === 'FILL_BLANK' ? 'Completar' :
                                 challenge.type === 'TRANSLATION' ? 'Tradução' :
                                 challenge.type === 'LISTENING' ? 'Auditivo' :
                                 challenge.type === 'SPEAKING' ? 'Pronúncia' :
                                 challenge.type === 'MATCH_PAIRS' ? 'Pares' :
                                 challenge.type === 'SENTENCE_ORDER' ? 'Ordenar' :
                                 challenge.type === 'TRUE_FALSE' ? 'V/F' :
                                 challenge.type}
                              </Badge>
                            </div>
                            <p className="text-white text-sm truncate" title={challenge.question}>
                              {challenge.question.length > 50
                                ? `${challenge.question.substring(0, 50)}...`
                                : challenge.question}
                            </p>
                            {challenge.instruction && (
                              <p className="text-customgreys-dirtyGrey text-xs mt-1 truncate" title={challenge.instruction}>
                                📋 {challenge.instruction.length > 40
                                  ? `${challenge.instruction.substring(0, 40)}...`
                                  : challenge.instruction}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => loadChallengeForEdit(challenge)}
                            className="flex-shrink-0 h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                            title="Editar desafio"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteModal({ id: challenge.id, question: challenge.question })}
                            className="flex-shrink-0 h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            title="Eliminar desafio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-10 h-10 text-customgreys-dirtyGrey mx-auto mb-2" />
                    <p className="text-customgreys-dirtyGrey text-sm">
                      Nenhum desafio criado ainda
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-customgreys-secondarybg border-customgreys-darkerGrey max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-white text-xl">
              Eliminar Desafio
            </DialogTitle>
            <DialogDescription className="text-center text-customgreys-dirtyGrey">
              Tem certeza que deseja eliminar este desafio? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {challengeToDelete && (
            <div className="p-3 bg-customgreys-primarybg rounded-lg border border-customgreys-darkerGrey my-2">
              <p className="text-white text-sm truncate">
                {challengeToDelete.question.length > 80
                  ? `${challengeToDelete.question.substring(0, 80)}...`
                  : challengeToDelete.question}
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChallenge}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}