"use client";

/**
 * LessonConstructor - Phase 2 Implementation
 * 
 * Duolingo-style lesson constructor with real-time preview
 * Allows teachers to build lessons step-by-step with immediate visual feedback
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  BookOpen, 
  CheckCircle, 
  Circle,
  Target,
  Heart,
  Zap
} from 'lucide-react';
import { 
  useGetCourseUnitsQuery, 
  useCreateTeacherLessonMutation,
  useCreateTeacherUnitMutation 
} from '../api';
import { 
  unitCreationSchema, 
  lessonCreationSchema, 
  validateSafely
} from '@/lib/validations';
import { laboratoryNotifications } from '@/lib/toast';

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
  order: number;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  challenges?: Challenge[];
}

interface Challenge {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'translation' | 'listening' | 'speaking';
  question: string;
  order: number;
  options: ChallengeOption[];
}

interface ChallengeOption {
  id: string;
  text: string;
  is_correct: boolean;
  order: number;
}

interface LessonConstructorProps {
  course: Course;
  onBack: () => void;
}

interface LessonTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  structure: {
    challengeTypes: string[];
    recommendedCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

const LESSON_TEMPLATES: LessonTemplate[] = [
  {
    id: 'vocabulary-intro',
    name: 'Introdução de Vocabulário',
    description: 'Apresenta novas palavras com contexto e prática',
    icon: '📚',
    structure: {
      challengeTypes: ['multiple-choice', 'fill-blank', 'translation'],
      recommendedCount: 8,
      difficulty: 'easy'
    }
  },
  {
    id: 'grammar-basics',
    name: 'Fundamentos Gramaticais',
    description: 'Ensina regras gramaticais com exercícios práticos',
    icon: '⚖️',
    structure: {
      challengeTypes: ['fill-blank', 'multiple-choice', 'translation'],
      recommendedCount: 10,
      difficulty: 'medium'
    }
  },
  {
    id: 'conversation-practice',
    name: 'Prática de Conversação',
    description: 'Desenvolve habilidades de diálogo e expressão',
    icon: '💬',
    structure: {
      challengeTypes: ['listening', 'speaking', 'multiple-choice'],
      recommendedCount: 6,
      difficulty: 'medium'
    }
  },
  {
    id: 'comprehensive-review',
    name: 'Revisão Abrangente',
    description: 'Consolida conhecimento com exercícios variados',
    icon: '🔄',
    structure: {
      challengeTypes: ['multiple-choice', 'fill-blank', 'translation', 'listening'],
      recommendedCount: 12,
      difficulty: 'hard'
    }
  }
];

export default function LessonConstructor({ course, onBack }: LessonConstructorProps) {
  // Redux hooks
  const [createPracticeUnit] = useCreateTeacherUnitMutation();
  const { data: unitsData, isLoading: unitsLoading, refetch: refetchUnits } = useGetCourseUnitsQuery(course.id);
  const [createLesson] = useCreateTeacherLessonMutation();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Get units from Redux - handle the CourseUnitsResponse structure
  const units = unitsData?.units || [];
  const loading = unitsLoading;

  // Unit creation state
  const [newUnitData, setNewUnitData] = useState({
    title: '',
    description: '',
    order: 1
  });

  // Lesson creation state
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    selectedTemplate: '',
    estimatedDuration: 15,
    objectives: ['']
  });

  // Validation state
  const [unitValidationErrors, setUnitValidationErrors] = useState<Record<string, string>>({});
  const [lessonValidationErrors, setLessonValidationErrors] = useState<Record<string, string>>({});
  const [unitFieldTouched, setUnitFieldTouched] = useState<Record<string, boolean>>({});
  const [lessonFieldTouched, setLessonFieldTouched] = useState<Record<string, boolean>>({});

  // Units are loaded automatically by Redux hook
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 LessonConstructor: Units loaded for course:', course.id, '- Count:', units.length);
    }
  }, [units.length, course.id]);

  // =============================================
  // VALIDATION FUNCTIONS
  // =============================================

  const validateUnitField = (fieldName: string, value: any) => {
    try {
      let schema;
      switch (fieldName) {
        case 'title':
          schema = unitCreationSchema.shape.title;
          break;
        case 'description':
          schema = unitCreationSchema.shape.description;
          break;
        default:
          return;
      }
      
      const result = schema.safeParse(value);
      if (result.success) {
        setUnitValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      } else {
        setUnitValidationErrors(prev => ({ 
          ...prev, 
          [fieldName]: result.error.errors[0]?.message || 'Campo inválido' 
        }));
      }
    } catch (error) {
      console.warn(`Validation error for unit.${fieldName}:`, error);
    }
  };

  const validateLessonField = (fieldName: string, value: any) => {
    try {
      let schema;
      switch (fieldName) {
        case 'title':
          schema = lessonCreationSchema.shape.title;
          break;
        case 'objectives':
          schema = lessonCreationSchema.shape.objectives;
          break;
        case 'estimatedDuration':
          schema = lessonCreationSchema.shape.estimatedDuration;
          break;
        default:
          return;
      }
      
      const result = schema.safeParse(value);
      if (result.success) {
        setLessonValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      } else {
        setLessonValidationErrors(prev => ({ 
          ...prev, 
          [fieldName]: result.error.errors[0]?.message || 'Campo inválido' 
        }));
      }
    } catch (error) {
      console.warn(`Validation error for lesson.${fieldName}:`, error);
    }
  };

  const validateFullUnit = (): boolean => {
    const result = validateSafely(unitCreationSchema, {
      title: newUnitData.title,
      description: newUnitData.description,
      order: newUnitData.order,
      course: course.id
    });

    if (!result.success) {
      // Convert string[] to string for UI display
      const flatErrors: Record<string, string> = {};
      Object.entries(result.errors).forEach(([key, messages]) => {
        flatErrors[key] = messages[0] || 'Campo inválido';
      });
      setUnitValidationErrors(flatErrors);
      return false;
    }
    
    setUnitValidationErrors({});
    return true;
  };

  const validateFullLesson = (): boolean => {
    const validObjectives = newLessonData.objectives.filter(obj => obj.trim() !== '');
    
    const result = validateSafely(lessonCreationSchema, {
      title: newLessonData.title,
      objectives: validObjectives,
      estimatedDuration: newLessonData.estimatedDuration,
      selectedTemplate: newLessonData.selectedTemplate,
      unit: selectedUnit?.id,
      order: (selectedUnit?.lessons?.length || 0) + 1
    });

    if (!result.success) {
      // Convert string[] to string for UI display
      const flatErrors: Record<string, string> = {};
      Object.entries(result.errors).forEach(([key, messages]) => {
        flatErrors[key] = messages[0] || 'Campo inválido';
      });
      setLessonValidationErrors(flatErrors);
      return false;
    }
    
    setLessonValidationErrors({});
    return true;
  };

  // Create new unit
  const handleCreateUnit = async () => {
    // Validate before creating
    if (!validateFullUnit()) {
      laboratoryNotifications.validationError('Preencha todos os campos obrigatórios da unidade');
      return;
    }

    // Use toast.promise for better UX
    const unitCreationPromise = (async () => {
      // Calculate the next order number based on existing units
      // Ensure we handle empty arrays and missing order values safely
      const existingOrders = units.map(u => u.order || 0).filter(order => order > 0);
      const nextOrder = existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 1;
      
      const unitData = {
        course: course.id,
        title: newUnitData.title,
        description: newUnitData.description,
        order: nextOrder
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Creating unit:', unitData.title, 'Order:', nextOrder);
      }
      
      let newUnit;
      try {
        newUnit = await createPracticeUnit(unitData).unwrap();
      } catch (error) {
        console.error('❌ Unit creation failed:', error);
        
        // Log detailed error information for debugging
        if (error && typeof error === 'object') {
          console.error('❌ Error type:', typeof error);
          console.error('❌ Error keys:', Object.keys(error));
          
          if ('data' in error) {
            console.error('❌ Backend error data:', (error as any).data);
            
            // Check for specific Django validation errors
            const data = (error as any).data;
            if (data && typeof data === 'object') {
              if ('non_field_errors' in data) {
                console.error('❌ Non-field errors:', data.non_field_errors);
              }
              if ('order' in data) {
                console.error('❌ Order validation errors:', data.order);
              }
              if ('title' in data) {
                console.error('❌ Title validation errors:', data.title);
              }
            }
          }
          
          if ('status' in error) {
            console.error('❌ HTTP Status:', (error as any).status);
          }
        }
        
        throw error;
      }
      console.log('✅ Unit created successfully:', newUnit);
      
      // Verify unit creation
      if (!newUnit || !newUnit.id) {
        throw new Error('Resposta inválida da API - unidade não foi criada corretamente');
      }
      
      // Small delay to ensure invalidation has processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refetch units from Redux after creating new unit
      await refetchUnits();
      
      setNewUnitData({ title: '', description: '', order: 1 });
      setUnitValidationErrors({});
      setUnitFieldTouched({});
      setCurrentStep(2);
      
      return newUnit;
    })();

    await laboratoryNotifications.asyncOperation(
      unitCreationPromise,
      'Criando unidade',
      newUnitData.title
    );
  };

  // Create new lesson
  const handleCreateLesson = async () => {
    if (!selectedUnit) {
      laboratoryNotifications.validationError('Selecione uma unidade primeiro');
      return;
    }

    // Validate before creating
    if (!validateFullLesson()) {
      laboratoryNotifications.validationError('Preencha todos os campos obrigatórios da lição');
      return;
    }

    // Use toast.promise for better UX
    const lessonCreationPromise = (async () => {
      console.log('🔄 Creating new lesson...');
      console.log('📝 Selected unit:', selectedUnit);
      console.log('📋 Current lessons in unit:', selectedUnit.lessons?.length || 0);
      
      const lessonData = {
        unit: selectedUnit.id,
        title: newLessonData.title,
        order: (selectedUnit.lessons?.length || 0) + 1
      };
      
      console.log('📝 Lesson data to create:', lessonData);
      
      const newLesson = await createLesson(lessonData).unwrap();
      console.log('✅ Lesson created successfully:', newLesson);
      
      // Verify the lesson has required properties
      if (!newLesson || !newLesson.id) {
        throw new Error('Resposta inválida da API - lição não foi criada corretamente');
      }
      
      // Refetch the units data from Redux to get updated lesson data
      // Add small delay to ensure backend has processed the new lesson
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUnitsData = await refetchUnits();
      console.log('🔄 Refetch result:', updatedUnitsData);
      
      // Update the selectedUnit with fresh data from the refetch
      if (updatedUnitsData.data?.units) {
        const updatedUnit = updatedUnitsData.data.units.find(u => u.id === selectedUnit.id);
        if (updatedUnit) {
          setSelectedUnit(updatedUnit as any);
          console.log('✅ Selected unit updated with new lesson data:', updatedUnit);
          console.log('📚 Updated lessons count:', updatedUnit.lessons?.length || 0);
        } else {
          console.warn('⚠️ Could not find updated unit in refetch data');
        }
      } else {
        console.warn('⚠️ No units data in refetch response');
      }
      
      // Reset lesson form for next creation
      setNewLessonData({
        title: '',
        selectedTemplate: '',
        estimatedDuration: 15,
        objectives: ['']
      });
      setLessonValidationErrors({});
      setLessonFieldTouched({});
      
      setCurrentStep(4); // Move to preview step
      console.log('✅ Local state updated, selectedUnit updated, moved to step 4');
      
      return newLesson;
    })();

    await laboratoryNotifications.asyncOperation(
      lessonCreationPromise,
      'Criando lição',
      newLessonData.title
    );
  };

  const addObjective = () => {
    setNewLessonData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setNewLessonData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    if (newLessonData.objectives.length > 1) {
      setNewLessonData(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }));
    }
  };

  // Step navigation
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const selectedTemplate = LESSON_TEMPLATES.find(t => t.id === newLessonData.selectedTemplate);

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
              Construtor de Lições
            </h1>
            <p className="text-customgreys-dirtyGrey">
              {course.title} - {course.level}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-6">
          {[
            { step: 1, title: "Selecionar Unidade", icon: BookOpen },
            { step: 2, title: "Configurar Lição", icon: Edit3 },
            { step: 3, title: "Definir Estrutura", icon: Target },
            { step: 4, title: "Preview & Publicar", icon: Eye }
          ].map(({ step, title, icon: Icon }) => (
            <div 
              key={step} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                currentStep === step 
                  ? 'bg-violet-600 text-white' 
                  : currentStep > step 
                    ? 'bg-green-600 text-white'
                    : 'bg-customgreys-secondarybg text-customgreys-dirtyGrey'
              }`}
              onClick={() => goToStep(step)}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{title}</span>
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
                  <BookOpen className="w-5 h-5" />
                  Selecionar ou Criar Unidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Units */}
                {units.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Unidades Existentes:</h3>
                    {units.map((unit) => (
                      <div
                        key={unit.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedUnit?.id === unit.id
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-customgreys-darkerGrey bg-customgreys-primarybg hover:border-violet-400'
                        }`}
                        onClick={() => {
                          setSelectedUnit(unit as any); // TODO: Fix type compatibility between Redux and local types
                          setCurrentStep(2);
                        }}
                      >
                        <h4 className="text-white font-medium">{unit.title}</h4>
                        <p className="text-customgreys-dirtyGrey text-sm">{unit.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {unit.lessons?.length || 0} lições
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Create New Unit */}
                <div className="border-t border-customgreys-darkerGrey pt-4">
                  <h3 className="text-white font-semibold mb-3">Criar Nova Unidade:</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Título da unidade (ex: Gramática Básica)"
                      value={newUnitData.title}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setNewUnitData(prev => ({ ...prev, title: newValue }));
                        validateUnitField('title', newValue);
                      }}
                      onBlur={() => setUnitFieldTouched(prev => ({ ...prev, title: true }))}
                      className={`bg-customgreys-primarybg border-customgreys-darkerGrey text-white ${
                        unitValidationErrors.title && unitFieldTouched.title 
                          ? 'border-red-500 focus:border-red-500' 
                          : ''
                      }`}
                    />
                    {unitValidationErrors.title && unitFieldTouched.title && (
                      <div className="text-sm text-red-500 mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {unitValidationErrors.title}
                      </div>
                    )}
                    <Textarea
                      placeholder="Descrição da unidade (ex: Aprenda os fundamentos da gramática inglesa)"
                      value={newUnitData.description}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setNewUnitData(prev => ({ ...prev, description: newValue }));
                        validateUnitField('description', newValue);
                      }}
                      onBlur={() => setUnitFieldTouched(prev => ({ ...prev, description: true }))}
                      className={`bg-customgreys-primarybg border-customgreys-darkerGrey text-white ${
                        unitValidationErrors.description && unitFieldTouched.description 
                          ? 'border-red-500 focus:border-red-500' 
                          : ''
                      }`}
                    />
                    {unitValidationErrors.description && unitFieldTouched.description && (
                      <div className="text-sm text-red-500 mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {unitValidationErrors.description}
                      </div>
                    )}
                    <Button
                      onClick={handleCreateUnit}
                      disabled={!newUnitData.title.trim() || loading}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Unidade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Configure Lesson */}
          {currentStep === 2 && selectedUnit && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Configurar Lição
                </CardTitle>
                <p className="text-customgreys-dirtyGrey">
                  Unidade: {selectedUnit.title}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lesson Title */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Título da Lição
                  </label>
                  <Input
                    placeholder="ex: Presente Simples - Verbos Regulares"
                    value={newLessonData.title}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setNewLessonData(prev => ({ ...prev, title: newValue }));
                      validateLessonField('title', newValue);
                    }}
                    onBlur={() => setLessonFieldTouched(prev => ({ ...prev, title: true }))}
                    className={`bg-customgreys-primarybg border-customgreys-darkerGrey text-white ${
                      lessonValidationErrors.title && lessonFieldTouched.title 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                  />
                  {lessonValidationErrors.title && lessonFieldTouched.title && (
                    <div className="text-sm text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {lessonValidationErrors.title}
                    </div>
                  )}
                </div>

                {/* Learning Objectives */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-medium">
                      Objetivos de Aprendizagem
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addObjective}
                      className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newLessonData.objectives.map((objective, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Objetivo ${index + 1} (ex: Formar frases no presente simples)`}
                          value={objective}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            updateObjective(index, newValue);
                            // Validate the entire objectives array
                            const updatedObjectives = [...newLessonData.objectives];
                            updatedObjectives[index] = newValue;
                            validateLessonField('objectives', updatedObjectives);
                          }}
                          onBlur={() => setLessonFieldTouched(prev => ({ ...prev, objectives: true }))}
                          className={`bg-customgreys-primarybg border-customgreys-darkerGrey text-white ${
                            lessonValidationErrors.objectives && lessonFieldTouched.objectives 
                              ? 'border-red-500 focus:border-red-500' 
                              : ''
                          }`}
                        />
                        {newLessonData.objectives.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeObjective(index)}
                            className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {lessonValidationErrors.objectives && lessonFieldTouched.objectives && (
                    <div className="text-sm text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {lessonValidationErrors.objectives}
                    </div>
                  )}
                </div>

                {/* Estimated Duration */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Duração Estimada (minutos)
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="60"
                    value={newLessonData.estimatedDuration}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 15;
                      setNewLessonData(prev => ({ ...prev, estimatedDuration: newValue }));
                      validateLessonField('estimatedDuration', newValue);
                    }}
                    onBlur={() => setLessonFieldTouched(prev => ({ ...prev, estimatedDuration: true }))}
                    className={`bg-customgreys-primarybg border-customgreys-darkerGrey text-white ${
                      lessonValidationErrors.estimatedDuration && lessonFieldTouched.estimatedDuration 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                  />
                  {lessonValidationErrors.estimatedDuration && lessonFieldTouched.estimatedDuration && (
                    <div className="text-sm text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {lessonValidationErrors.estimatedDuration}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!newLessonData.title.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  Próximo: Definir Estrutura
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Define Structure */}
          {currentStep === 3 && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Definir Estrutura da Lição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {LESSON_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        newLessonData.selectedTemplate === template.id
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-customgreys-darkerGrey bg-customgreys-primarybg hover:border-violet-400'
                      }`}
                      onClick={() => setNewLessonData(prev => ({ ...prev, selectedTemplate: template.id }))}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{template.name}</h3>
                          <p className="text-customgreys-dirtyGrey text-sm mb-2">{template.description}</p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {template.structure.recommendedCount} exercícios
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.structure.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleCreateLesson}
                  disabled={!newLessonData.selectedTemplate || loading}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando Lição...
                    </>
                  ) : (
                    <>
                      Criar Lição e Ver Preview
                      <Eye className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Course Overview */}
          {currentStep === 4 && selectedUnit && (
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Visão Geral do Curso
                </CardTitle>
                <p className="text-customgreys-dirtyGrey">
                  {course.title} - {selectedUnit.title}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Success Message */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Lição criada com sucesso!</span>
                  </div>
                  <p className="text-green-300 text-sm">
                    Sua lição foi criada e está pronta para adicionar exercícios.
                  </p>
                </div>

                {/* Unit Progress */}
                <div className="bg-customgreys-primarybg rounded-lg p-4 border border-customgreys-darkerGrey">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Progresso da Unidade: {selectedUnit.title}
                  </h4>
                  
                  {/* Lessons List */}
                  <div className="space-y-2">
                    {selectedUnit.lessons && selectedUnit.lessons.length > 0 ? (
                      selectedUnit.lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-customgreys-secondarybg rounded-lg border border-customgreys-darkerGrey"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="text-white font-medium">{lesson.title}</h5>
                              <p className="text-customgreys-dirtyGrey text-xs">
                                {lesson.challenges?.length || 0} exercícios
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                            Criada
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-customgreys-dirtyGrey text-sm text-center py-4">
                        Nenhuma lição encontrada nesta unidade
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => {
                      // Reset state for new lesson
                      setNewLessonData({
                        title: '',
                        selectedTemplate: '',
                        estimatedDuration: 15,
                        objectives: ['']
                      });
                      setCurrentStep(2);
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Nova Lição nesta Unidade
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Escolher Outra Unidade
                  </Button>

                  <Button
                    onClick={() => {
                      // Navigate to challenge constructor
                      window.open('/teacher/laboratory/challenge-constructor', '_blank');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Adicionar Exercícios às Lições
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar à Lista de Cursos
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
                  Preview da Lição
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                >
                  {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPreviewMode ? 'Modo Edição' : 'Modo Preview'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Lesson Preview */}
              <div className="space-y-4">
                {newLessonData.title ? (
                  <div className="bg-customgreys-primarybg rounded-lg p-6 border border-customgreys-darkerGrey">
                    {/* Lesson Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{newLessonData.title}</h3>
                          <p className="text-customgreys-dirtyGrey text-sm">
                            {newLessonData.estimatedDuration} min • {selectedTemplate?.name || 'Template não selecionado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Heart key={i} className="w-4 h-4 text-red-500 fill-current" />
                        ))}
                      </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-2">Objetivos desta lição:</h4>
                      <div className="space-y-2">
                        {newLessonData.objectives.filter(obj => obj.trim()).map((objective, index) => (
                          <div key={index} className="flex items-center gap-2 text-customgreys-dirtyGrey">
                            <Circle className="w-3 h-3" />
                            <span className="text-sm">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Template Preview */}
                    {selectedTemplate && (
                      <div className="bg-customgreys-secondarybg rounded-lg p-4 border border-customgreys-darkerGrey">
                        <h4 className="text-white font-semibold mb-2">Estrutura da Lição:</h4>
                        <div className="space-y-2 text-sm text-customgreys-dirtyGrey">
                          <p><strong>Template:</strong> {selectedTemplate.name}</p>
                          <p><strong>Exercícios:</strong> {selectedTemplate.structure.recommendedCount}</p>
                          <p><strong>Tipos:</strong> {selectedTemplate.structure.challengeTypes.join(', ')}</p>
                          <p><strong>Dificuldade:</strong> {selectedTemplate.structure.difficulty}</p>
                        </div>
                      </div>
                    )}

                    {/* Next Steps Preview */}
                    <div className="mt-4 p-3 bg-violet-600/10 border border-violet-600/20 rounded-lg">
                      <p className="text-violet-300 text-sm">
                        📋 <strong>Próximo passo:</strong> Após criar a lição, você poderá adicionar exercícios específicos usando o Construtor de Desafios.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-customgreys-primarybg rounded-lg p-8 border border-customgreys-darkerGrey text-center">
                    <BookOpen className="w-12 h-12 text-customgreys-dirtyGrey mx-auto mb-4" />
                    <p className="text-customgreys-dirtyGrey">
                      Configure sua lição para ver o preview aqui
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}