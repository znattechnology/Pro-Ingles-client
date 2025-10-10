"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  BookOpen,
  ChevronRight,
  Check,
  Users,
  Clock,
  Trophy,
  Target
} from 'lucide-react';
import { useGetTeacherCoursesQuery, useGetCourseUnitsQuery } from '@/src/domains/teacher/practice-courses/api/teacherPracticeApiSlice';
import type { PracticeCourse, PracticeUnit, PracticeLesson } from '@/src/domains/teacher/practice-courses/api/teacherPracticeApiSlice';

export interface PracticeSelection {
  courseId: string;
  courseName: string;
  unitId?: string;
  unitName?: string;
  lessonId?: string;
  lessonName?: string;
}

interface PracticeCourseSelectorProps {
  initialSelection?: PracticeSelection;
  onChange: (selection: PracticeSelection | null) => void;
  className?: string;
}

export const PracticeCourseSelector: React.FC<PracticeCourseSelectorProps> = ({
  initialSelection,
  onChange,
  className = ""
}) => {
  const [selectedCourse, setSelectedCourse] = useState<PracticeCourse | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<PracticeUnit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<PracticeLesson | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [step, setStep] = useState<'course' | 'unit' | 'lesson'>('course');

  // Fetch practice courses
  const { 
    data: courses = [], 
    isLoading: isLoadingCourses,
    error: coursesError 
  } = useGetTeacherCoursesQuery({ includeDrafts: false });

  // Fetch units for selected course
  const { 
    data: courseUnitsData,
    isLoading: isLoadingUnits 
  } = useGetCourseUnitsQuery(
    selectedCourse?.id || "",
    { skip: !selectedCourse?.id }
  );

  const units = courseUnitsData?.units || [];

  // Initialize from initial selection
  useEffect(() => {
    if (initialSelection && courses.length > 0) {
      const course = courses.find(c => c.id === initialSelection.courseId);
      if (course) {
        setSelectedCourse(course);
        setStep('unit');
      }
    }
  }, [initialSelection, courses]);

  // Filter courses by search
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseSelect = (course: PracticeCourse) => {
    setSelectedCourse(course);
    setSelectedUnit(null);
    setSelectedLesson(null);
    setStep('unit');
    
    // Notify parent with course-only selection
    onChange({
      courseId: course.id,
      courseName: course.title
    });
  };

  const handleUnitSelect = (unit: PracticeUnit) => {
    setSelectedUnit(unit);
    setSelectedLesson(null);
    setStep('lesson');
    
    // Notify parent with course and unit selection
    onChange({
      courseId: selectedCourse!.id,
      courseName: selectedCourse!.title,
      unitId: unit.id,
      unitName: unit.title
    });
  };

  const handleLessonSelect = (lesson: PracticeLesson) => {
    setSelectedLesson(lesson);
    
    // Notify parent with complete selection
    onChange({
      courseId: selectedCourse!.id,
      courseName: selectedCourse!.title,
      unitId: selectedUnit!.id,
      unitName: selectedUnit!.title,
      lessonId: lesson.id,
      lessonName: lesson.title
    });
  };

  const goBack = () => {
    if (step === 'lesson') {
      setStep('unit');
      setSelectedLesson(null);
      // Update selection to unit level
      if (selectedCourse && selectedUnit) {
        onChange({
          courseId: selectedCourse.id,
          courseName: selectedCourse.title,
          unitId: selectedUnit.id,
          unitName: selectedUnit.title
        });
      }
    } else if (step === 'unit') {
      setStep('course');
      setSelectedUnit(null);
      setSelectedLesson(null);
      // Update selection to course level
      if (selectedCourse) {
        onChange({
          courseId: selectedCourse.id,
          courseName: selectedCourse.title
        });
      }
    }
  };

  const finishSelection = () => {
    // Use current selection as final
    if (selectedCourse) {
      onChange({
        courseId: selectedCourse.id,
        courseName: selectedCourse.title,
        unitId: selectedUnit?.id,
        unitName: selectedUnit?.title,
        lessonId: selectedLesson?.id,
        lessonName: selectedLesson?.title
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Integração com Practice Lab</h4>
            <p className="text-emerald-300 text-sm">
              Selecione um exercício do laboratório prático
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className={`${step === 'course' ? 'text-emerald-400' : 'text-gray-400'}`}>
            Curso
          </span>
          {selectedCourse && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <span className={`${step === 'unit' ? 'text-emerald-400' : 'text-gray-400'}`}>
                Unidade
              </span>
            </>
          )}
          {selectedUnit && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <span className={`${step === 'lesson' ? 'text-emerald-400' : 'text-gray-400'}`}>
                Lição
              </span>
            </>
          )}
        </div>
      </div>

      {/* Course Selection */}
      {step === 'course' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar cursos práticos..."
              className="pl-10 bg-customgreys-darkGrey/50 border-emerald-500/30 text-white"
            />
          </div>

          {/* Courses List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoadingCourses && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Carregando cursos...</p>
              </div>
            )}

            {coursesError && (
              <div className="text-center py-4">
                <p className="text-red-400 text-sm">Erro ao carregar cursos</p>
              </div>
            )}

            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseSelect(course)}
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
                        <Users className="w-3 h-3" />
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
                <p className="text-gray-500 text-sm">Crie um curso prático primeiro</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unit Selection */}
      {step === 'unit' && selectedCourse && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-white font-medium">
              Unidades - {selectedCourse.title}
            </h5>
            <Button
              type="button"
              onClick={goBack}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Voltar
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoadingUnits && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Carregando unidades...</p>
              </div>
            )}

            {units.map((unit, index) => (
              <div
                key={unit.id}
                onClick={() => handleUnitSelect(unit)}
                className="bg-customgreys-darkGrey/30 border border-emerald-500/20 rounded-lg p-4 cursor-pointer hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-sm">
                        Unidade {index + 1}
                      </span>
                    </div>
                    <h6 className="text-white font-medium mt-1">{unit.title}</h6>
                    {unit.description && (
                      <p className="text-gray-400 text-sm mt-1">{unit.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}

            {units.length === 0 && !isLoadingUnits && (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma unidade encontrada</p>
              </div>
            )}
          </div>

          {/* Option to select entire course */}
          <div className="pt-4 border-t border-emerald-500/20">
            <Button
              type="button"
              onClick={finishSelection}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Usar curso completo
            </Button>
          </div>
        </div>
      )}

      {/* Lesson Selection */}
      {step === 'lesson' && selectedUnit && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-white font-medium">
              Lições - {selectedUnit.title}
            </h5>
            <Button
              type="button"
              onClick={goBack}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Voltar
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedUnit.lessons?.map((lesson, index) => (
              <div
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson)}
                className="bg-customgreys-darkGrey/30 border border-emerald-500/20 rounded-lg p-4 cursor-pointer hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-sm">
                        Lição {index + 1}
                      </span>
                    </div>
                    <h6 className="text-white font-medium mt-1">{lesson.title}</h6>
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

          {/* Option to select entire unit */}
          <div className="pt-4 border-t border-emerald-500/20">
            <Button
              type="button"
              onClick={finishSelection}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Usar unidade completa
            </Button>
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      {(selectedCourse || selectedUnit || selectedLesson) && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <h6 className="text-emerald-400 font-medium mb-2">Seleção Atual:</h6>
          <div className="space-y-1 text-sm">
            <div className="text-white">
              <span className="text-gray-400">Curso:</span> {selectedCourse?.title}
            </div>
            {selectedUnit && (
              <div className="text-white">
                <span className="text-gray-400">Unidade:</span> {selectedUnit.title}
              </div>
            )}
            {selectedLesson && (
              <div className="text-white">
                <span className="text-gray-400">Lição:</span> {selectedLesson.title}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeCourseSelector;