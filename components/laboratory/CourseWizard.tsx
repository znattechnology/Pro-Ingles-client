"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  courseCreationSchema, 
  isStepValid
} from "@/lib/validations";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  BookOpen,
  Target,
  Eye,
  Sparkles,
  Globe,
  Heart,
  Star,
  Zap,
  Building2,
  Cpu,
  Crown,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  Fuel,
  Brain
} from "lucide-react";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  estimatedLessons: number;
  estimatedTime: string;
  features: string[];
  color: string;
}

const CourseWizard = ({ onComplete }: { onComplete: (courseData: any) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '' as 'General' | 'Business' | 'Technology' | 'Medicine' | 'Legal' | 'Oil & Gas' | 'Banking' | 'Executive' | 'AI Enhanced' | '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    template: null as CourseTemplate | null,
    customColors: {
      primary: '',
      secondary: '',
      accent: ''
    },
    estimatedDuration: '',
    targetAudience: '',
    learningObjectives: [''],
    hearts: 5,
    pointsPerChallenge: 10,
    passingScore: 70
  });

  // ✨ VALIDAÇÃO EM TEMPO REAL COM ZOD - Estado de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});

  // Função para validar campo individual
  const validateSingleField = (fieldName: string, value: any) => {
    try {
      let schema;
      switch (fieldName) {
        case 'title':
          schema = courseCreationSchema.shape.title;
          break;
        case 'description':
          schema = courseCreationSchema.shape.description;
          break;
        case 'targetAudience':
          schema = courseCreationSchema.shape.targetAudience;
          break;
        case 'learningObjectives':
          schema = courseCreationSchema.shape.learningObjectives;
          break;
        default:
          return;
      }
      
      const result = schema.safeParse(value);
      if (result.success) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          [fieldName]: result.error.errors[0]?.message || 'Campo inválido' 
        }));
      }
    } catch (error) {
      console.warn(`Validation error for ${fieldName}:`, error);
    }
  };

  // Função para validar formulário completo
  const validateForm = (data: any): boolean => {
    const result = courseCreationSchema.safeParse(data);
    
    if (result.success) {
      setValidationErrors({});
      return true;
    } else {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const fieldName = error.path[0] as string;
        if (!errors[fieldName]) {
          errors[fieldName] = error.message;
        }
      });
      setValidationErrors(errors);
      return false;
    }
  };

  const steps: WizardStep[] = [
    {
      id: 'template',
      title: 'Escolher Template',
      description: 'Selecione um template baseado na categoria do seu curso',
      completed: !!courseData.template
    },
    {
      id: 'colors',
      title: 'Personalizar Cores',
      description: 'Customize as cores do template (opcional)',
      completed: true // Sempre válido pois é opcional
    },
    {
      id: 'basic-info',
      title: 'Informações Básicas',
      description: 'Defina título, descrição e configurações gerais',
      completed: isStepValid('basic-info', courseData)
    },
    {
      id: 'learning-config',
      title: 'Configurações de Aprendizado',
      description: 'Configure objetivos e parâmetros de gamificação',
      completed: isStepValid('learning-config', courseData)
    },
    {
      id: 'preview',
      title: 'Preview e Confirmação',
      description: 'Revise todas as configurações antes de criar',
      completed: Object.keys(validationErrors).length === 0 && !!courseData.title && !!courseData.description
    }
  ];

  const courseTemplates: CourseTemplate[] = [
    {
      id: 'general',
      name: 'Inglês Geral',
      description: 'Curso abrangente para aprendizado geral do inglês',
      category: 'General',
      icon: Globe,
      estimatedLessons: 30,
      estimatedTime: '6-8 semanas',
      features: ['Conversação básica', 'Gramática essencial', 'Vocabulário cotidiano'],
      color: 'bg-blue-500'
    },
    {
      id: 'business',
      name: 'Inglês de Negócios',
      description: 'Focado em comunicação empresarial e corporativa',
      category: 'Business',
      icon: Briefcase,
      estimatedLessons: 28,
      estimatedTime: '2-4 meses',
      features: ['Apresentações corporativas', 'Reuniões de negócios', 'Networking profissional'],
      color: 'bg-green-500'
    },
    {
      id: 'technology',
      name: 'Inglês para TI & Telecomunicações',
      description: 'Criado para Unitel, MS Telecom e startups tech',
      category: 'Technology',
      icon: Code,
      estimatedLessons: 25,
      estimatedTime: '2-5 meses',
      features: ['Vocabulário de programação', 'Metodologias ágeis', 'Cloud computing'],
      color: 'bg-purple-500'
    },
    {
      id: 'medicine',
      name: 'Inglês Médico',
      description: 'Especializado para profissionais da área de saúde',
      category: 'Medicine',
      icon: Stethoscope,
      estimatedLessons: 32,
      estimatedTime: '3-6 meses',
      features: ['Terminologia médica', 'Comunicação com pacientes', 'Documentação clínica'],
      color: 'bg-red-500'
    },
    {
      id: 'legal',
      name: 'Inglês Jurídico',
      description: 'Para advogados e profissionais do direito',
      category: 'Legal',
      icon: Scale,
      estimatedLessons: 30,
      estimatedTime: '3-5 meses',
      features: ['Terminologia jurídica', 'Contratos internacionais', 'Procedimentos legais'],
      color: 'bg-yellow-500'
    },
    {
      id: 'oil-gas',
      name: 'Inglês para Petróleo & Gás',
      description: 'Especializado para Sonangol, Total Angola e Chevron',
      category: 'Oil & Gas',
      icon: Fuel,
      estimatedLessons: 35,
      estimatedTime: '3-6 meses',
      features: ['Terminologia técnica', 'Protocolos de segurança', 'Comunicação internacional'],
      color: 'bg-orange-600'
    },
    {
      id: 'banking',
      name: 'Inglês Bancário',
      description: 'Desenvolvido para BAI, BFA e Standard Bank',
      category: 'Banking',
      icon: Building2,
      estimatedLessons: 28,
      estimatedTime: '2-4 meses',
      features: ['Transações internacionais', 'Análise de crédito', 'Compliance'],
      color: 'bg-indigo-600'
    },
    {
      id: 'executive',
      name: 'Inglês Executivo',
      description: 'Para C-Level e gestores sênior',
      category: 'Executive',
      icon: Crown,
      estimatedLessons: 32,
      estimatedTime: '4-8 meses',
      features: ['Liderança internacional', 'Negociações estratégicas', 'Networking global'],
      color: 'bg-slate-700'
    },
    {
      id: 'ai-enhanced',
      name: 'Inglês com IA Personal Tutor',
      description: 'Nossa tecnologia exclusiva com IA personalizada',
      category: 'AI Enhanced',
      icon: Brain,
      estimatedLessons: 40,
      estimatedTime: 'Contínuo',
      features: ['Correção em tempo real', 'Feedback personalizado', 'Aprendizado adaptativo'],
      color: 'bg-pink-500'
    }
  ];

  const getCurrentStepProgress = () => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  };

  const canProceedToNext = () => {
    return steps[currentStep].completed || currentStep === steps.length - 1;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Validação final antes de submeter
      const dataForValidation = {
        ...courseData,
        template: courseData.template?.id || '',
        learningObjectives: courseData.learningObjectives.filter(obj => obj.trim() !== '')
      };
      
      const isValid = validateForm(dataForValidation);
      
      if (isValid) {
        onComplete(courseData);
      } else {
        alert('Por favor, corrija os erros no formulário antes de continuar.');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Cores padrão dos templates
  const getTemplateDefaultColors = (templateId: string) => {
    const colorMap = {
      'general': { primary: '#3B82F6', secondary: '#06B6D4', accent: '#1D4ED8' },
      'business': { primary: '#10B981', secondary: '#059669', accent: '#047857' },
      'technology': { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#6D28D9' },
      'medicine': { primary: '#EF4444', secondary: '#F87171', accent: '#DC2626' },
      'legal': { primary: '#F59E0B', secondary: '#FBBF24', accent: '#D97706' },
      'oil-gas': { primary: '#EA580C', secondary: '#FB923C', accent: '#C2410C' },
      'banking': { primary: '#4F46E5', secondary: '#6366F1', accent: '#3730A3' },
      'executive': { primary: '#475569', secondary: '#64748B', accent: '#334155' },
      'ai-enhanced': { primary: '#EC4899', secondary: '#F472B6', accent: '#DB2777' }
    };
    return colorMap[templateId as keyof typeof colorMap] || colorMap.general;
  };

  const selectTemplate = (template: CourseTemplate) => {
    const defaultColors = getTemplateDefaultColors(template.id);
    setCourseData(prev => ({
      ...prev,
      template,
      category: template.category as 'General' | 'Business' | 'Technology' | 'Medicine' | 'Legal' | 'Oil & Gas' | 'Banking' | 'Executive' | 'AI Enhanced',
      estimatedDuration: template.estimatedTime,
      // Definir cores padrão do template
      customColors: {
        primary: defaultColors.primary,
        secondary: defaultColors.secondary,
        accent: defaultColors.accent
      }
    }));
  };

  const updateLearningObjective = (index: number, value: string) => {
    const newObjectives = [...courseData.learningObjectives];
    newObjectives[index] = value;
    setCourseData(prev => ({ ...prev, learningObjectives: newObjectives }));
  };

  const addLearningObjective = () => {
    setCourseData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const removeLearningObjective = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const updateCustomColor = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    setCourseData(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [colorType]: color
      }
    }));
  };

  const resetToDefaultColors = () => {
    if (courseData.template) {
      const defaultColors = getTemplateDefaultColors(courseData.template.id);
      setCourseData(prev => ({
        ...prev,
        customColors: defaultColors
      }));
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'template':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Escolha um Template para Seu Curso
              </h3>
              <p className="text-gray-300">
                Selecione o template que melhor se adequa ao conteúdo que você deseja ensinar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseTemplates.map((template, index) => {
                const Icon = template.icon;
                const isSelected = courseData.template?.id === template.id;
                
                return (
                  <motion.div
                    key={template.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectTemplate(template)}
                    className="group cursor-pointer"
                  >
                    <div className={`relative p-6 rounded-3xl border transition-all duration-300 h-full ${
                      isSelected
                        ? 'border-violet-400/50 bg-gradient-to-br from-violet-500/20 to-purple-500/20 shadow-2xl'
                        : 'border-gray-600/30 bg-gradient-to-br from-gray-500/5 to-gray-600/5 hover:border-violet-400/40 hover:from-violet-500/10 hover:to-purple-500/10'
                    }`}>
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${template.color} ${
                          isSelected ? 'scale-110' : 'group-hover:scale-105'
                        }`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-100 transition-colors">
                          {template.name}
                        </h3>
                        
                        <p className="text-gray-400 leading-relaxed mb-4">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center space-x-3 mb-4">
                          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                            {template.estimatedLessons} lições
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {template.estimatedTime}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-violet-400 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Inclui:
                        </p>
                        <div className="space-y-2">
                          {template.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-3">
                              <Zap className="w-3 h-3 text-violet-400 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-600/30">
                        <div className={`flex items-center text-sm font-medium transition-colors ${
                          isSelected ? 'text-violet-300' : 'text-gray-400 group-hover:text-violet-400'
                        }`}>
                          <span>Selecionar template</span>
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 'colors':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-12 w-12 text-violet-400 mx-auto mb-4 flex items-center justify-center">
                🎨
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Personalizar Cores do Template
              </h3>
              <p className="text-gray-300">
                Customize as cores do seu template ou mantenha as cores padrão
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Color Pickers */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300 text-sm font-medium">Cor Primária</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        value={courseData.customColors.primary}
                        onChange={(e) => updateCustomColor('primary', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
                      />
                      <Input
                        value={courseData.customColors.primary}
                        onChange={(e) => updateCustomColor('primary', e.target.value)}
                        placeholder="#3B82F6"
                        className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Cor principal do template (ícones, botões)</p>
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm font-medium">Cor Secundária</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        value={courseData.customColors.secondary}
                        onChange={(e) => updateCustomColor('secondary', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
                      />
                      <Input
                        value={courseData.customColors.secondary}
                        onChange={(e) => updateCustomColor('secondary', e.target.value)}
                        placeholder="#06B6D4"
                        className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Cor secundária (gradientes, destaques)</p>
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm font-medium">Cor de Destaque</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        value={courseData.customColors.accent}
                        onChange={(e) => updateCustomColor('accent', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
                      />
                      <Input
                        value={courseData.customColors.accent}
                        onChange={(e) => updateCustomColor('accent', e.target.value)}
                        placeholder="#1D4ED8"
                        className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Cor de destaque (acentos, bordas)</p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetToDefaultColors}
                    className="w-full border-customgreys-darkerGrey bg-customgreys-darkGrey text-gray-300 hover:bg-violet-600/10 hover:border-violet-500 hover:text-white"
                  >
                    🔄 Restaurar Cores Padrão
                  </Button>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                {courseData.template && (
                  <div className="bg-customgreys-darkGrey rounded-2xl p-6 border border-customgreys-darkerGrey">
                    <h4 className="text-white font-semibold mb-4">Preview do Template</h4>
                    
                    {/* Mock Course Card Preview */}
                    <div className="bg-customgreys-secondarybg rounded-xl border border-gray-600/30 overflow-hidden">
                      {/* Header with custom colors */}
                      <div 
                        className="h-24 relative"
                        style={{ 
                          background: `linear-gradient(135deg, ${courseData.customColors.primary}, ${courseData.customColors.secondary})` 
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: courseData.customColors.accent }}
                          >
                            <courseData.template.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="px-2 py-1 rounded-full text-xs font-medium border"
                            style={{ 
                              backgroundColor: `${courseData.customColors.primary}20`,
                              borderColor: `${courseData.customColors.primary}40`,
                              color: courseData.customColors.primary
                            }}
                          >
                            {courseData.template.name}
                          </div>
                        </div>
                        <h5 className="text-white font-medium mb-2">
                          {courseData.title || 'Título do Curso'}
                        </h5>
                        <div 
                          className="w-full h-2 bg-gray-700 rounded-full overflow-hidden"
                        >
                          <div 
                            className="h-full w-1/3 rounded-full"
                            style={{ 
                              background: `linear-gradient(90deg, ${courseData.customColors.primary}, ${courseData.customColors.secondary})` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Color Palette */}
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-3">Paleta de Cores</h5>
                      <div className="flex gap-2">
                        <div className="text-center">
                          <div 
                            className="w-8 h-8 rounded-lg border border-gray-600"
                            style={{ backgroundColor: courseData.customColors.primary }}
                          />
                          <p className="text-xs text-gray-400 mt-1">Primária</p>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-8 h-8 rounded-lg border border-gray-600"
                            style={{ backgroundColor: courseData.customColors.secondary }}
                          />
                          <p className="text-xs text-gray-400 mt-1">Secundária</p>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-8 h-8 rounded-lg border border-gray-600"
                            style={{ backgroundColor: courseData.customColors.accent }}
                          />
                          <p className="text-xs text-gray-400 mt-1">Destaque</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'basic-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <BookOpen className="h-12 w-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Informações Básicas do Curso
              </h3>
              <p className="text-gray-300">
                Configure os detalhes fundamentais do seu curso
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Título do Curso *</Label>
                  <Input
                    value={courseData.title}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setCourseData(prev => ({ ...prev, title: newValue }));
                      validateSingleField('title', newValue);
                    }}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, title: true }))}
                    placeholder="Ex: Inglês para Medicina Avançada"
                    className={`bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500 ${
                      validationErrors.title && fieldTouched.title 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                  />
                  {validationErrors.title && fieldTouched.title && (
                    <div className="text-sm text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.title}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">Descrição *</Label>
                  <Textarea
                    value={courseData.description}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setCourseData(prev => ({ ...prev, description: newValue }));
                      validateSingleField('description', newValue);
                    }}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, description: true }))}
                    placeholder="Descreva o foco, objetivos e benefícios do curso..."
                    className={`bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500 min-h-[100px] ${
                      validationErrors.description && fieldTouched.description 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                  />
                  {validationErrors.description && fieldTouched.description && (
                    <div className="text-sm text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.description}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">Nível</Label>
                  <select
                    value={courseData.level}
                    onChange={(e) => setCourseData(prev => ({ ...prev, level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' }))}
                    className="w-full p-2 bg-customgreys-darkGrey border border-customgreys-darkerGrey text-white rounded-md focus:border-violet-500"
                  >
                    <option value="Beginner">Iniciante</option>
                    <option value="Intermediate">Intermediário</option>
                    <option value="Advanced">Avançado</option>
                  </select>
                </div>

                <div>
                  <Label className="text-gray-300">Público-Alvo *</Label>
                  <Input
                    value={courseData.targetAudience}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setCourseData(prev => ({ ...prev, targetAudience: newValue }));
                      validateSingleField('targetAudience', newValue);
                    }}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, targetAudience: true }))}
                    placeholder="Ex: Profissionais da área de saúde"
                    className={`bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500 ${
                      validationErrors.targetAudience && fieldTouched.targetAudience 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                  />
                  {validationErrors.targetAudience && fieldTouched.targetAudience && (
                    <div className="text-sm text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.targetAudience}
                    </div>
                  )}
                </div>
              </div>

              {courseData.template && (
                <Card className="bg-customgreys-darkGrey border-customgreys-darkerGrey h-fit">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-violet-400" />
                      <span>Preview do Template</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${courseData.template.color}`}>
                          <courseData.template.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{courseData.template.name}</p>
                          <p className="text-sm text-gray-400">
                            {courseData.template.estimatedLessons} lições estimadas
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-customgreys-darkerGrey">
                        <p className="text-sm font-medium text-violet-400 mb-2">
                          Estrutura sugerida:
                        </p>
                        <div className="space-y-1">
                          {courseData.template.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-violet-400 rounded-full"></div>
                              <span className="text-sm text-gray-400">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 'learning-config':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Configurações de Aprendizado
              </h3>
              <p className="text-gray-300">
                Defina objetivos e parâmetros de gamificação
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-gray-300">Objetivos de Aprendizado</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addLearningObjective}
                      className="border-customgreys-darkerGrey bg-customgreys-darkGrey text-gray-300 hover:bg-violet-600/10 hover:border-violet-500 hover:text-white"
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {courseData.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={objective}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            updateLearningObjective(index, newValue);
                            // Validar o array de objetivos após atualização
                            const updatedObjectives = [...courseData.learningObjectives];
                            updatedObjectives[index] = newValue;
                            validateSingleField('learningObjectives', updatedObjectives);
                          }}
                          onBlur={() => setFieldTouched(prev => ({ ...prev, learningObjectives: true }))}
                          placeholder={`Objetivo ${index + 1} (mínimo 5 caracteres)`}
                          className={`bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500 ${
                            validationErrors.learningObjectives && fieldTouched.learningObjectives 
                              ? 'border-red-500 focus:border-red-500' 
                              : ''
                          }`}
                        />
                        {courseData.learningObjectives.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeLearningObjective(index)}
                            className="border-red-400 bg-customgreys-darkGrey text-red-400 hover:bg-red-600/10 hover:text-red-300"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {validationErrors.learningObjectives && fieldTouched.learningObjectives && (
                    <div className="text-sm text-red-500 mt-2 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.learningObjectives}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-customgreys-darkGrey border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-violet-400" />
                      <span>Configurações de Gamificação</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Configure o sistema de pontuação e vidas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Corações Iniciais</Label>
                      <Input
                        type="number"
                        value={courseData.hearts}
                        onChange={(e) => setCourseData(prev => ({ ...prev, hearts: parseInt(e.target.value) }))}
                        min="1"
                        max="10"
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Pontos por Desafio</Label>
                      <Input
                        type="number"
                        value={courseData.pointsPerChallenge}
                        onChange={(e) => setCourseData(prev => ({ ...prev, pointsPerChallenge: parseInt(e.target.value) }))}
                        min="1"
                        max="100"
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Pontuação Mínima para Aprovação (%)</Label>
                      <Input
                        type="number"
                        value={courseData.passingScore}
                        onChange={(e) => setCourseData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                        min="50"
                        max="100"
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white focus:border-violet-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Eye className="h-12 w-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Preview do Curso
              </h3>
              <p className="text-gray-300">
                Revise todas as configurações antes de criar o curso
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-customgreys-darkGrey border-customgreys-darkerGrey">
                <CardHeader>
                  <CardTitle className="text-white">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-violet-400">Título:</p>
                    <p className="text-lg text-white">{courseData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-violet-400">Descrição:</p>
                    <p className="text-gray-300">{courseData.description}</p>
                  </div>
                  <div className="flex space-x-4">
                    <div>
                      <p className="text-sm font-medium text-violet-400">Nível:</p>
                      <Badge variant="outline" className="border-violet-400 text-violet-400">{courseData.level}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-400">Categoria:</p>
                      <Badge variant="outline" className="border-violet-400 text-violet-400">{courseData.category}</Badge>
                    </div>
                  </div>
                  {courseData.targetAudience && (
                    <div>
                      <p className="text-sm font-medium text-violet-400">Público-Alvo:</p>
                      <p className="text-gray-300">{courseData.targetAudience}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-customgreys-darkGrey border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white">Template e Cores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {courseData.template && (
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${courseData.template.color}`}>
                          <courseData.template.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{courseData.template.name}</p>
                          <p className="text-sm text-gray-400">
                            {courseData.template.estimatedLessons} lições • {courseData.template.estimatedTime}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Custom Colors Preview */}
                    <div>
                      <p className="text-sm font-medium text-violet-400 mb-3">Cores Personalizadas:</p>
                      <div className="flex gap-3">
                        <div className="text-center">
                          <div 
                            className="w-8 h-8 rounded-lg border border-gray-600 mx-auto"
                            style={{ backgroundColor: courseData.customColors.primary }}
                          />
                          <p className="text-xs text-gray-400 mt-1">Primária</p>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-8 h-8 rounded-lg border border-gray-600 mx-auto"
                            style={{ backgroundColor: courseData.customColors.secondary }}
                          />
                          <p className="text-xs text-gray-400 mt-1">Secundária</p>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-8 h-8 rounded-lg border border-gray-600 mx-auto"
                            style={{ backgroundColor: courseData.customColors.accent }}
                          />
                          <p className="text-xs text-gray-400 mt-1">Destaque</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-customgreys-darkGrey border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white">Configurações de Gamificação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-violet-400">{courseData.hearts}</p>
                        <p className="text-sm text-gray-400">Corações</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-violet-400">{courseData.pointsPerChallenge}</p>
                        <p className="text-sm text-gray-400">Pontos/Desafio</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-violet-400">{courseData.passingScore}%</p>
                        <p className="text-sm text-gray-400">Mín. Aprovação</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-customgreys-darkGrey border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white">Objetivos de Aprendizado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {courseData.learningObjectives.filter(obj => obj.trim()).map((objective, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                          <span className="text-sm text-white">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Progress Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Passo {currentStep + 1} de {steps.length}
              </h2>
              <p className="text-gray-300 text-lg">{steps[currentStep].description}</p>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 relative">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-violet-900/30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - getCurrentStepProgress() / 100)}`}
                    className="text-violet-400 transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{getCurrentStepProgress()}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-violet-900/20 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${getCurrentStepProgress()}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Step Navigation */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            whileHover={{ y: -2 }}
            className={`relative p-6 rounded-2xl border transition-all duration-300 ${
              index === currentStep
                ? 'border-violet-400/50 bg-gradient-to-br from-violet-500/20 to-purple-500/20'
                : index < currentStep
                ? 'border-green-400/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                : 'border-gray-600/30 bg-gradient-to-br from-gray-500/10 to-gray-600/10'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                index === currentStep
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg'
                  : index < currentStep
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-600/50 text-gray-400'
              }`}>
                {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{step.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-8"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-between items-center"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-8 py-3 bg-gray-600/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30 hover:text-white hover:border-gray-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Anterior
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext()}
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Star className="h-5 w-5 mr-2" />
                Criar Curso
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CourseWizard;