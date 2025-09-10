"use client";

/**
 * Lesson Constructor Page - Phase 2 Implementation
 * 
 * This page provides an interface for teachers to create lessons using
 * the LessonConstructor component. It includes course selection and 
 * integrates with the existing laboratory system.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import LessonConstructor from '@/components/laboratory/LessonConstructor';
import { getPracticeCourses } from '@/actions/practice-management';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  status: string;
}

export default function LessonConstructorPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await getPracticeCourses();
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackToLaboratory = () => {
    router.push('/teacher/laboratory');
  };

  const handleBackToCourseSelection = () => {
    setSelectedCourse(null);
  };

  // If a course is selected, show the lesson constructor
  if (selectedCourse) {
    return (
      <LessonConstructor 
        course={selectedCourse} 
        onBack={handleBackToCourseSelection}
      />
    );
  }

  // Course selection interface
  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={handleBackToLaboratory}
            className="bg-customgreys-secondarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Laboratório
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Construtor de Lições
            </h1>
            <p className="text-customgreys-dirtyGrey">
              Selecione um curso para começar a criar lições
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey w-4 h-4" />
          <Input
            placeholder="Buscar curso por título, categoria ou nível..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-customgreys-secondarybg border-customgreys-darkerGrey text-white"
          />
        </div>
      </div>

      {/* Course Selection */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-customgreys-secondarybg border-customgreys-darkerGrey animate-pulse">
              <CardHeader>
                <div className="h-4 bg-customgreys-darkerGrey rounded w-3/4"></div>
                <div className="h-3 bg-customgreys-darkerGrey rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-customgreys-darkerGrey rounded"></div>
                  <div className="h-3 bg-customgreys-darkerGrey rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-16 h-16 text-customgreys-dirtyGrey mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'Nenhum curso encontrado' : 'Nenhum curso disponível'}
            </h3>
            <p className="text-customgreys-dirtyGrey text-center mb-6 max-w-md">
              {searchTerm 
                ? `Não encontramos cursos que correspondam a "${searchTerm}". Tente ajustar sua busca.`
                : 'Você precisa criar um curso antes de poder adicionar lições. Comece criando seu primeiro curso no laboratório.'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => router.push('/teacher/laboratory/create-course')}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-xl hover:border-violet-500/50 transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedCourse(course)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      course.status === 'Published' 
                        ? 'border-green-500 text-green-400' 
                        : 'border-yellow-500 text-yellow-400'
                    }`}
                  >
                    {course.status === 'Published' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  <div className="p-2 bg-customgreys-darkGrey rounded-lg group-hover:bg-violet-600/20 transition-colors">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                  </div>
                </div>
                <CardTitle className="text-lg text-white group-hover:text-violet-300 transition-colors">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-customgreys-dirtyGrey text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs bg-customgreys-darkGrey text-customgreys-dirtyGrey">
                      {course.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-customgreys-darkGrey text-customgreys-dirtyGrey">
                      {course.level}
                    </Badge>
                  </div>
                  <div className="text-xs text-customgreys-dirtyGrey group-hover:text-violet-400 transition-colors">
                    Criar lições →
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="mt-12 bg-customgreys-secondarybg border-customgreys-darkerGrey">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Como funciona o Construtor de Lições?
              </h3>
              <div className="space-y-2 text-white text-sm">
                <p>
                  <strong className="text-violet-400">1. Selecione um curso:</strong> Escolha o curso para o qual deseja criar lições
                </p>
                <p>
                  <strong className="text-violet-400">2. Organize em unidades:</strong> Crie ou selecione uma unidade para estruturar o conteúdo
                </p>
                <p>
                  <strong className="text-violet-400">3. Configure a lição:</strong> Defina título, objetivos e duração estimada
                </p>
                <p>
                  <strong className="text-violet-400">4. Escolha um template:</strong> Use nossos templates pré-definidos baseados no Duolingo
                </p>
                <p>
                  <strong className="text-violet-400">5. Preview em tempo real:</strong> Veja como a lição aparecerá para os estudantes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}