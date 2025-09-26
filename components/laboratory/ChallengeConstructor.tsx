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
import { useChallengeValidation } from '@/hooks/useFormValidation';
import { validateChallenge } from '@/lib/validations';
import { laboratoryNotifications } from '@/lib/toast';
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
import { 
  useGetCourseUnitsQuery,
  useGetUnitLessonsQuery,
  useCreatePracticeChallengeMutation,
  useGetPracticeLessonDetailsQuery,
  useUpdateCourseOptionMutation,
  useGenerateTranslationSuggestionsMutation,
  uploadAudioToS3,
  uploadImageToS3,
  generateReferenceAudio
} from '@modules/teacher';

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
  const { data: lessonDetails } = useGetPracticeLessonDetailsQuery(selectedLessonId || '', {
    skip: !selectedLessonId
  });
  const [createPracticeChallenge] = useCreatePracticeChallengeMutation();
  const [updateCourseOption] = useUpdateCourseOptionMutation();
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

  // Get units and lessons from Redux data
  const units = unitsData?.units || [];
  const lessons = lessonsData || [];
  const isLoadingData = unitsLoading || lessonsLoading;

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
  const [referenceAudioUrl, setReferenceAudioUrl] = useState<string>('');
  const [generatingAudio, setGeneratingAudio] = useState(false);

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
      
      // TODO: Implement pronunciation exercise generation with Redux
      // const result = await generatePronunciationExercise({
      //   topic: selectedLesson?.title || 'daily conversation',
      //   difficultyLevel: 'intermediate',
      //   exerciseType: 'sentence'
      // });
      
      // Temporary placeholder until API is implemented
      const result = { success: false };
      
      if (result.success && result.exercise) {
        const exercise = result.exercise;
        setPronunciationSuggestion(exercise);
        
        // Auto-fill the question with AI suggestion
        setCurrentChallenge(prev => ({
          ...prev,
          question: exercise.text_to_speak
        }));
        
        console.log('✅ Pronunciation exercise generated:', exercise);
      } else {
        console.warn('⚠️ No exercise generated by AI');
      }
    } catch (error) {
      console.error('❌ Error generating pronunciation exercise:', error);
      alert('Erro ao gerar exercício de pronúncia com IA. Tente novamente.');
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
      
      const result = await generateReferenceAudio({
        text: currentChallenge.question,
        voice: 'alloy'
      });
      
      if (result.audioUrl) {
        setReferenceAudioUrl(result.audioUrl);
        console.log('✅ Reference audio generated successfully');
      } else {
        throw new Error('No audio URL received');
      }
    } catch (error) {
      console.error('❌ Error generating reference audio:', error);
      alert('Erro ao gerar áudio de referência. Tente novamente.');
    } finally {
      setGeneratingAudio(false);
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
      
      case 'multiple-choice':
      case 'listening':
      case 'true-false':
        // Estes tipos precisam de pelo menos uma resposta correta
        if (currentChallenge.options.length > 0) {
          const hasCorrectAnswer = currentChallenge.options.some(opt => opt.is_correct);
          if (!hasCorrectAnswer) {
            laboratoryNotifications.challengeValidationError('Pelo menos uma resposta deve estar marcada como correta');
            return;
          }
        }
        break;
      
      default:
        // Outros tipos são flexíveis
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

      const challengeData = {
        lesson: selectedLesson.id,
        type: mappedType,
        question: currentChallenge.question,
        order: nextOrder,
        options: currentChallenge.options
      };
      
      console.log('📤 Challenge data to send:', challengeData);
      
      // Create the challenge first with toast notification
      const createdChallenge = await laboratoryNotifications.asyncOperation(
        createPracticeChallenge(challengeData).unwrap(),
        'Criando exercício',
        selectedTemplate?.name || 'Exercício'
      );
      console.log('✅ Challenge created successfully:', createdChallenge);


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
          if (Object.keys(updateData).length > 0) {
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
      
      // Add to local state with the correct order
      const savedChallenge = { ...currentChallenge, order: nextOrder };
      setChallenges([...challenges, savedChallenge]);
      
      // Show success notification for specific challenge type
      laboratoryNotifications.challengeCreated(currentChallenge.type);
      
      // Reset for next challenge
      if (!selectedTemplate) {
        console.error('❌ selectedTemplate is null during reset');
        return;
      }
      
      console.log('🔄 Resetting challenge for next creation...');
      
      const newChallenge: Challenge = {
        type: selectedTemplate.id,
        question: '',
        options: Array.from({ length: selectedTemplate.structure.minOptions }, (_, i) => ({
          text: '',
          is_correct: i === 0,
          order: i
        })),
        order: nextOrder + 1, // Use the next order after the one just created
        hints: selectedTemplate.structure.supportsHints ? [''] : [],
        explanation: ''
      };
      
      setCurrentChallenge(newChallenge);
      setCurrentStep(5); // Go to success/continue step
      
    } catch (error) {
      console.error('❌ Error saving challenge:', error);
      // Show user-friendly error message with toast
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      laboratoryNotifications.creationError('exercício', errorMessage);
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

                {/* Listening Comprehension - Explanation */}
                {selectedTemplate.id === 'listening' && (
                  <div className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="bg-violet-500/20 rounded-lg p-3">
                        <svg className="w-6 h-6 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                          🎧 Como Criar Desafios de Compreensão Auditiva Avançados
                        </h3>
                        
                        <div className="space-y-4 text-gray-300">
                          <div className="bg-violet-900/20 rounded-lg p-4">
                            <h4 className="text-violet-400 font-semibold mb-2 flex items-center gap-2">
                              <span className="bg-violet-500 text-white text-xs px-2 py-1 rounded-full">1</span>
                              Pergunta Principal
                            </h4>
                            <p className="text-sm">
                              Digite sua pergunta no campo "Pergunta" acima. Ex: "Ouça e escolha o animal correto"
                            </p>
                          </div>
                          
                          <div className="bg-blue-900/20 rounded-lg p-4">
                            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">2</span>
                              Opções com Mídia Individual
                            </h4>
                            <p className="text-sm mb-2">
                              Cada opção de resposta pode ter seu próprio áudio e imagem:
                            </p>
                            <ul className="text-xs space-y-1 ml-4">
                              <li>• <strong>Texto:</strong> "Um cachorro" / "Um gato" / "Um pássaro"</li>
                              <li>• <strong>Áudio:</strong> Som de latido / miado / canto de pássaro</li>
                              <li>• <strong>Imagem:</strong> Foto de cachorro / gato / pássaro</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-900/20 rounded-lg p-4">
                            <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                              Experiência do Estudante
                            </h4>
                            <p className="text-sm">
                              O estudante verá a pergunta, poderá reproduzir o áudio de cada opção e ver as imagens para fazer sua escolha com apoio multimídia completo.
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                          <p className="text-yellow-300 text-sm">
                            <strong>💡 Dica:</strong> Use áudios de 10-30 segundos para cada opção e imagens claras que correspondam ao som para máxima eficácia pedagógica.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multiple Choice Options */}
                {(selectedTemplate.id === 'multiple-choice' || selectedTemplate.id === 'listening') && (
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

                          {/* Media uploads for listening challenges */}
                          {selectedTemplate.id === 'listening' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Audio upload for this option */}
                              <div>
                                <label className="text-gray-300 text-sm mb-2 block">Áudio da opção</label>
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      updateOption(index, 'audioFile', file);
                                    }
                                  }}
                                  className="w-full px-2 py-1 bg-customgreys-primarybg border border-customgreys-darkerGrey rounded text-white text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                />
                                {option.audioFile && (
                                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                                    <div className="flex items-center gap-1 text-blue-400">
                                      <Volume2 className="w-3 h-3" />
                                      <span>Áudio: {option.audioFile.name}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Image upload for this option */}
                              <div>
                                <label className="text-gray-300 text-sm mb-2 block">Imagem da opção</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      updateOption(index, 'imageFile', file);
                                    }
                                  }}
                                  className="w-full px-2 py-1 bg-customgreys-primarybg border border-customgreys-darkerGrey rounded text-white text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                                />
                                {option.imageFile && (
                                  <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs">
                                    <div className="flex items-center gap-1 text-purple-400">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                      </svg>
                                      <span>Imagem: {option.imageFile.name}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill in the Blank */}
                {selectedTemplate.id === 'fill-blank' && (
                  <div>
                    <label className="text-white font-medium mb-2 block">
                      Resposta Correta (palavra ou frase que falta)
                    </label>
                    <Input
                      placeholder="Ex: name, beautiful, quickly, etc."
                      value={currentChallenge.options[0]?.text || ''}
                      onChange={(e) => updateOption(0, 'text', e.target.value)}
                      className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                    />
                    
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 text-sm font-medium mb-2">
                        💡 <strong>Como criar um exercício de completar lacuna:</strong>
                      </p>
                      <div className="space-y-2 text-blue-200 text-xs">
                        <p><strong>1. Na pergunta acima:</strong> Digite a frase com "_" onde quer a lacuna</p>
                        <p><strong>Exemplo:</strong> "My ___ is John" ou "I ___ to school every day"</p>
                        <p><strong>2. Neste campo:</strong> Digite apenas a resposta correta</p>
                        <p><strong>Exemplo:</strong> "name" ou "go"</p>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    {currentChallenge.question && currentChallenge.options[0]?.text && (
                      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-300 text-sm font-medium mb-1">✅ Preview do exercício:</p>
                        <p className="text-green-200 text-sm">
                          <strong>Pergunta:</strong> {currentChallenge.question}
                        </p>
                        <p className="text-green-200 text-sm">
                          <strong>Resposta:</strong> {currentChallenge.options[0]?.text}
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
                      <Textarea
                        placeholder="Digite a tradução correta (a IA aceitará variações equivalentes)..."
                        value={currentChallenge.options[0]?.text || ''}
                        onChange={(e) => updateOption(0, 'text', e.target.value)}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                        rows={2}
                      />
                      
                      {/* AI Suggestions Display */}
                      {aiSuggestions.length > 0 && (
                        <div className="mt-3 p-3 bg-customgreys-secondarybg rounded-lg">
                          <h5 className="text-violet-400 text-sm font-medium mb-2">💡 Sugestões da IA:</h5>
                          <div className="space-y-1">
                            {aiSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => updateOption(0, 'text', suggestion)}
                                className="block w-full text-left p-2 text-sm text-customgreys-dirtyGrey hover:bg-violet-600/20 hover:text-white rounded transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Validation Preview */}
                    {currentChallenge.question.trim() && currentChallenge.options[0]?.text && (
                      <div className="bg-customgreys-secondarybg rounded-lg p-3">
                        <h5 className="text-violet-400 text-sm font-medium mb-2">🎯 Preview da Validação IA:</h5>
                        <div className="text-xs text-customgreys-dirtyGrey space-y-1">
                          <p>• <strong>Pergunta:</strong> "{currentChallenge.question}"</p>
                          <p>• <strong>Resposta esperada:</strong> "{currentChallenge.options[0]?.text}"</p>
                          <p>• <strong>Sistema IA:</strong> Aceitará traduções semanticamente equivalentes</p>
                          <p>• <strong>Pontuação:</strong> 0-10 pontos baseado na qualidade da tradução</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Match Pairs */}
                {selectedTemplate.id === 'match-pairs' && (
                  <div>
                    <label className="text-white font-medium mb-3 block">
                      Pares para Combinar
                    </label>
                    <div className="space-y-3">
                      {currentChallenge.options.map((option, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2">
                          <div>
                            <Input
                              placeholder={`Elemento ${index + 1}A`}
                              value={option.text}
                              onChange={(e) => updateOption(index, 'text', e.target.value)}
                              className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder={`Elemento ${index + 1}B (par)`}
                              value={option.text} // We'll need to adjust this data structure
                              onChange={(e) => updateOption(index, 'text', e.target.value)}
                              className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                            />
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
                      ))}
                      {currentChallenge.options.length < selectedTemplate.structure.maxOptions && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={addOption}
                          className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar Par
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sentence Order */}
                {selectedTemplate.id === 'sentence-order' && (
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
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      Salvar Desafio
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