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
  ChevronLeft, 
  ChevronRight, 
  Check,
  BookOpen,
  Target,
  Settings,
  Eye,
  Sparkles,
  Globe,
  Briefcase,
  Code,
  Heart,
  Stethoscope,
  Scale,
  Star,
  Zap
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
    category: '',
    level: 'beginner',
    template: null as CourseTemplate | null,
    estimatedDuration: '',
    targetAudience: '',
    learningObjectives: [''],
    hearts: 5,
    pointsPerChallenge: 10,
    passingScore: 70
  });

  const steps: WizardStep[] = [
    {
      id: 'template',
      title: 'Escolher Template',
      description: 'Selecione um template baseado na categoria do seu curso',
      completed: !!courseData.template
    },
    {
      id: 'basic-info',
      title: 'Informações Básicas',
      description: 'Defina título, descrição e configurações gerais',
      completed: !!(courseData.title && courseData.description && courseData.category)
    },
    {
      id: 'learning-config',
      title: 'Configurações de Aprendizado',
      description: 'Configure objetivos e parâmetros de gamificação',
      completed: courseData.learningObjectives.filter(obj => obj.trim()).length > 0
    },
    {
      id: 'preview',
      title: 'Preview e Confirmação',
      description: 'Revise todas as configurações antes de criar',
      completed: false
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
      name: 'Inglês para Negócios',
      description: 'Focado em comunicação empresarial e corporativa',
      category: 'Business',
      icon: Briefcase,
      estimatedLessons: 25,
      estimatedTime: '5-6 semanas',
      features: ['Apresentações', 'Emails profissionais', 'Reuniões'],
      color: 'bg-green-500'
    },
    {
      id: 'technology',
      name: 'Inglês para Tecnologia',
      description: 'Vocabulário técnico e comunicação na área de TI',
      category: 'Technology',
      icon: Code,
      estimatedLessons: 20,
      estimatedTime: '4-5 semanas',
      features: ['Termos técnicos', 'Documentação', 'Code review'],
      color: 'bg-purple-500'
    },
    {
      id: 'medical',
      name: 'Inglês Médico',
      description: 'Terminologia médica e comunicação em saúde',
      category: 'Medicine',
      icon: Stethoscope,
      estimatedLessons: 35,
      estimatedTime: '8-10 semanas',
      features: ['Anatomia', 'Procedimentos', 'Comunicação com pacientes'],
      color: 'bg-red-500'
    },
    {
      id: 'legal',
      name: 'Inglês Jurídico',
      description: 'Terminologia jurídica e documentos legais',
      category: 'Legal',
      icon: Scale,
      estimatedLessons: 28,
      estimatedTime: '6-7 semanas',
      features: ['Contratos', 'Processos', 'Terminologia legal'],
      color: 'bg-yellow-500'
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
      onComplete(courseData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectTemplate = (template: CourseTemplate) => {
    setCourseData(prev => ({
      ...prev,
      template,
      category: template.category,
      estimatedDuration: template.estimatedTime
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
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Inglês para Medicina Avançada"
                    className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Descrição *</Label>
                  <Textarea
                    value={courseData.description}
                    onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o foco, objetivos e benefícios do curso..."
                    className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Nível</Label>
                  <select
                    value={courseData.level}
                    onChange={(e) => setCourseData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full p-2 bg-customgreys-darkGrey border border-customgreys-darkerGrey text-white rounded-md focus:border-violet-500"
                  >
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                  </select>
                </div>

                <div>
                  <Label className="text-gray-300">Público-Alvo</Label>
                  <Input
                    value={courseData.targetAudience}
                    onChange={(e) => setCourseData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Ex: Profissionais da área de saúde"
                    className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500"
                  />
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
                          onChange={(e) => updateLearningObjective(index, e.target.value)}
                          placeholder={`Objetivo ${index + 1}`}
                          className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500"
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
                    <CardTitle className="text-white">Template Selecionado</CardTitle>
                  </CardHeader>
                  <CardContent>
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