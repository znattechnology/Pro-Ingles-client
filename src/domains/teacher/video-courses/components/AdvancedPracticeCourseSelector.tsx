"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  BookOpen,
  ChevronRight,
  Check,
  Users,
  Clock,
  Trophy,
  Target,
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  X,
  Filter,
  Zap,
  Brain,
  Headphones,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useGetTeacherCoursesQuery, useGetCourseUnitsQuery, useGetLessonChallengesQuery } from '@/src/domains/teacher/practice-courses/api/teacherPracticeApiSlice';
import type { PracticeCourse, PracticeUnit, PracticeLesson, PracticeChallenge } from '@/src/domains/teacher/practice-courses/api/teacherPracticeApiSlice';

export interface SelectedChallenge {
  id: string;
  title: string;
  type: string;
  courseName: string;
  unitName: string;
  lessonName: string;
  order: number;
}

export interface AdvancedPracticeSelection {
  challenges: SelectedChallenge[];
  totalChallenges: number;
}

interface AdvancedPracticeCourseSelectorProps {
  initialSelection?: AdvancedPracticeSelection;
  onChange: (selection: AdvancedPracticeSelection | null) => void;
  className?: string;
}

type NavigationStep = 'courses' | 'units' | 'lessons' | 'challenges';

export const AdvancedPracticeCourseSelector: React.FC<AdvancedPracticeCourseSelectorProps> = ({
  initialSelection,
  onChange,
  className = ""
}) => {
  // Navigation state
  const [currentStep, setCurrentStep] = useState<NavigationStep>('courses');
  const [selectedCourse, setSelectedCourse] = useState<PracticeCourse | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<PracticeUnit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<PracticeLesson | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Selected challenges cart
  const [selectedChallenges, setSelectedChallenges] = useState<SelectedChallenge[]>(
    initialSelection?.challenges || []
  );

  // Fetch data
  const { 
    data: courses = [], 
    isLoading: isLoadingCourses 
  } = useGetTeacherCoursesQuery({ includeDrafts: false });

  const { 
    data: courseUnitsData,
    isLoading: isLoadingUnits 
  } = useGetCourseUnitsQuery(
    selectedCourse?.id || "",
    { skip: !selectedCourse?.id }
  );

  const { 
    data: challenges = [],
    isLoading: isLoadingChallenges 
  } = useGetLessonChallengesQuery(
    selectedLesson?.id || "",
    { skip: !selectedLesson?.id }
  );

  const units = courseUnitsData?.units || [];

  // Update parent component when selection changes
  useEffect(() => {
    onChange({
      challenges: selectedChallenges,
      totalChallenges: selectedChallenges.length
    });
  }, [selectedChallenges, onChange]);

  // Filter functions
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || challenge.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Navigation functions
  const goToCourses = () => {
    setCurrentStep('courses');
    setSelectedCourse(null);
    setSelectedUnit(null);
    setSelectedLesson(null);
  };

  const goToUnits = () => {
    setCurrentStep('units');
    setSelectedUnit(null);
    setSelectedLesson(null);
  };

  const goToLessons = () => {
    setCurrentStep('lessons');
    setSelectedLesson(null);
  };

  const selectCourse = (course: PracticeCourse) => {
    setSelectedCourse(course);
    setCurrentStep('units');
  };

  const selectUnit = (unit: PracticeUnit) => {
    setSelectedUnit(unit);
    setCurrentStep('lessons');
  };

  const selectLesson = (lesson: PracticeLesson) => {
    setSelectedLesson(lesson);
    setCurrentStep('challenges');
  };

  // Challenge management
  const toggleChallenge = (challenge: PracticeChallenge) => {
    if (!selectedCourse || !selectedUnit || !selectedLesson) return;

    const challengeId = challenge.id;
    const isSelected = selectedChallenges.some(c => c.id === challengeId);

    if (isSelected) {
      setSelectedChallenges(prev => prev.filter(c => c.id !== challengeId));
    } else {
      const newChallenge: SelectedChallenge = {
        id: challenge.id,
        title: challenge.question.substring(0, 50) + "...",
        type: challenge.type,
        courseName: selectedCourse.title,
        unitName: selectedUnit.title,
        lessonName: selectedLesson.title,
        order: challenge.order
      };
      setSelectedChallenges(prev => [...prev, newChallenge]);
    }
  };

  const removeChallenge = (challengeId: string) => {
    setSelectedChallenges(prev => prev.filter(c => c.id !== challengeId));
  };

  const clearAllChallenges = () => {
    setSelectedChallenges([]);
  };

  // Type icons
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'listening': return <Headphones className="w-4 h-4" />;
      case 'speaking': return <MessageSquare className="w-4 h-4" />;
      case 'reading': return <FileText className="w-4 h-4" />;
      case 'grammar': return <Brain className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const challengeTypes = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'listening', label: 'Listening' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'reading', label: 'Reading' },
    { value: 'grammar', label: 'Grammar' },
    { value: 'vocabulary', label: 'Vocabulary' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Breadcrumb */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Integração Avançada - Practice Lab</h4>
            <p className="text-emerald-300 text-sm">
              Selecione desafios específicos do laboratório prático
            </p>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={goToCourses}
            className={`hover:text-emerald-300 transition-colors ${
              currentStep === 'courses' ? 'text-emerald-400 font-medium' : 'text-gray-400'
            }`}
          >
            Cursos
          </button>
          
          {selectedCourse && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <button
                onClick={goToUnits}
                className={`hover:text-emerald-300 transition-colors ${
                  currentStep === 'units' ? 'text-emerald-400 font-medium' : 'text-gray-400'
                }`}
              >
                {selectedCourse.title.substring(0, 20)}...
              </button>
            </>
          )}
          
          {selectedUnit && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <button
                onClick={goToLessons}
                className={`hover:text-emerald-300 transition-colors ${
                  currentStep === 'lessons' ? 'text-emerald-400 font-medium' : 'text-gray-400'
                }`}
              >
                {selectedUnit.title.substring(0, 15)}...
              </button>
            </>
          )}
          
          {selectedLesson && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <span className={`${
                currentStep === 'challenges' ? 'text-emerald-400 font-medium' : 'text-gray-400'
              }`}>
                {selectedLesson.title.substring(0, 15)}...
              </span>
            </>
          )}
        </div>
      </div>

      {/* Selected Challenges Cart */}
      {selectedChallenges.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">
                Desafios Selecionados ({selectedChallenges.length})
              </span>
            </div>
            <Button
              type="button"
              onClick={clearAllChallenges}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Limpar tudo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {selectedChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getTypeIcon(challenge.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs truncate">{challenge.title}</p>
                    <p className="text-purple-300 text-xs">
                      {challenge.courseName} → {challenge.unitName}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => removeChallenge(challenge.id)}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 text-purple-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                currentStep === 'courses' ? "Pesquisar cursos..." :
                currentStep === 'challenges' ? "Pesquisar desafios..." :
                "Pesquisar..."
              }
              className="pl-10 bg-customgreys-darkGrey/50 border-emerald-500/30 text-white"
            />
          </div>
          
          {currentStep === 'challenges' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-customgreys-darkGrey/50 border border-emerald-500/30 rounded-md text-white text-sm"
            >
              {challengeTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Back Button */}
        {currentStep !== 'courses' && (
          <Button
            type="button"
            onClick={() => {
              if (currentStep === 'units') goToCourses();
              else if (currentStep === 'lessons') goToUnits();
              else if (currentStep === 'challenges') goToLessons();
            }}
            variant="outline"
            size="sm"
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-800/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}

        {/* Courses List */}
        {currentStep === 'courses' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoadingCourses && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Carregando cursos...</p>
              </div>
            )}

            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => selectCourse(course)}
                className="bg-customgreys-darkGrey/30 border border-emerald-500/20 rounded-lg p-4 cursor-pointer hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="text-white font-medium">{course.title}</h5>
                    <p className="text-gray-400 text-sm mt-1">{course.description}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {course.units_count || 0} unidades
                      </span>
                      <span className="text-blue-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {course.lessons_count || 0} lições
                      </span>
                      <span className="text-purple-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {course.challenges_count || 0} desafios
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-gray-500 mt-1" />
                </div>
              </div>
            ))}

            {filteredCourses.length === 0 && !isLoadingCourses && (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum curso encontrado</p>
              </div>
            )}
          </div>
        )}

        {/* Units List */}
        {currentStep === 'units' && selectedCourse && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoadingUnits && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Carregando unidades...</p>
              </div>
            )}

            {units.map((unit, index) => (
              <div
                key={unit.id}
                onClick={() => selectUnit(unit)}
                className="bg-customgreys-darkGrey/30 border border-emerald-500/20 rounded-lg p-4 cursor-pointer hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400">
                        Unidade {index + 1}
                      </Badge>
                    </div>
                    <h6 className="text-white font-medium mt-2">{unit.title}</h6>
                    {unit.description && (
                      <p className="text-gray-400 text-sm mt-1">{unit.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lessons List */}
        {currentStep === 'lessons' && selectedUnit && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {selectedUnit.lessons?.map((lesson, index) => (
              <div
                key={lesson.id}
                onClick={() => selectLesson(lesson)}
                className="bg-customgreys-darkGrey/30 border border-emerald-500/20 rounded-lg p-4 cursor-pointer hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                        Lição {index + 1}
                      </Badge>
                    </div>
                    <h6 className="text-white font-medium mt-2">{lesson.title}</h6>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}

            {(!selectedUnit.lessons || selectedUnit.lessons.length === 0) && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma lição encontrada</p>
              </div>
            )}
          </div>
        )}

        {/* Challenges List */}
        {currentStep === 'challenges' && selectedLesson && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoadingChallenges && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Carregando desafios...</p>
              </div>
            )}

            {filteredChallenges.map((challenge, index) => {
              const isSelected = selectedChallenges.some(c => c.id === challenge.id);
              
              return (
                <div
                  key={challenge.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-purple-500/20 border-purple-500/40' 
                      : 'bg-customgreys-darkGrey/30 border-emerald-500/20 hover:bg-emerald-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-600/20 text-purple-400 flex items-center gap-1"
                        >
                          {getTypeIcon(challenge.type)}
                          {challenge.type}
                        </Badge>
                        <span className="text-xs text-gray-400">Ordem {challenge.order}</span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        {challenge.question}
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={() => toggleChallenge(challenge)}
                      variant="ghost"
                      size="sm"
                      className={`ml-3 ${
                        isSelected 
                          ? 'text-purple-400 hover:text-purple-300 bg-purple-500/20' 
                          : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredChallenges.length === 0 && !isLoadingChallenges && (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum desafio encontrado</p>
                <p className="text-gray-500 text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPracticeCourseSelector;