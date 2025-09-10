"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Scale
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = courseData.template?.id === template.id;
                
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected
                        ? 'border-violet-500 bg-customgreys-darkGrey shadow-lg'
                        : 'border-customgreys-darkerGrey bg-customgreys-secondarybg hover:border-violet-400'
                    }`}
                    onClick={() => selectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${template.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {template.estimatedLessons} lições
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-violet-400" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3 text-gray-300">
                        {template.description}
                      </CardDescription>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-violet-400">Inclui:</p>
                        {template.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                            <span className="text-sm text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-white">Criação de Curso - Passo {currentStep + 1} de {steps.length}</CardTitle>
              <CardDescription className="text-gray-300">{steps[currentStep].description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-violet-400">{getCurrentStepProgress()}%</p>
              <p className="text-sm text-gray-400">Concluído</p>
            </div>
          </div>
          <Progress value={getCurrentStepProgress()} className="h-2" />
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="grid grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all duration-200 ${
              index === currentStep
                ? 'border-violet-500 bg-customgreys-darkGrey'
                : index < currentStep
                ? 'border-green-500 bg-customgreys-darkGrey'
                : 'border-customgreys-darkerGrey bg-customgreys-secondarybg'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === currentStep
                    ? 'bg-violet-500 text-white'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{step.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step Content */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="border-customgreys-darkerGrey bg-customgreys-darkGrey text-gray-300 hover:bg-customgreys-darkerGrey hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceedToNext()}
          className="bg-violet-800 hover:bg-violet-900"
        >
          {currentStep === steps.length - 1 ? 'Criar Curso' : 'Próximo'}
          {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};

export default CourseWizard;