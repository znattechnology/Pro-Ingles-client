"use client";

/**
 * Modern Course Selection Page - Enhanced UI/UX
 * 
 * This page provides an elegant course selection interface with modern cards,
 * filtering capabilities, and detailed course information display.
 */

import React, { useState } from 'react';
import { List } from './list';
import Loading from '@/components/course/Loading';
import { useGetCoursesQuery } from '@/redux/features/api/coursesApiSlice';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Trophy, 
  ArrowLeft,
  Globe,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  PlayCircle,
  Users,
  Star,
  TrendingUp,
  BookOpen,
  Clock,
  DollarSign,
  SortAsc,
  Grid3X3,
  List as ListIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const LearnCourse = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useDjangoAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // popular, newest, rating, title
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch courses from Django API
  const { data: coursesData, isLoading, error } = useGetCoursesQuery({});
  
  // Transform API data to match component expectations
  const courses = React.useMemo(() => {
    if (!coursesData?.data) return [];
    
    return coursesData.data.map(course => ({
      id: course.courseId, // Use courseId as the primary identifier
      title: course.title,
      description: course.description || '',
      image: course.image || '/laboratory/challenges/english-1.jpg',
      instructor: course.teacherName,
      price: course.price,
      level: course.level,
      category: course.category,
      template: course.template,
      status: course.status,
      totalEnrollments: course.total_enrollments || 0,
      rating: 4.5 + Math.random() * 0.5, // TODO: Add real ratings
      totalChapters: course.total_chapters || 0,
      duration: `${course.total_chapters || 8} aulas`,
      created_at: course.created_at
    }));
  }, [coursesData]);

  // Filter and sort courses
  const filteredAndSortedCourses = React.useMemo(() => {
    let filtered = courses.filter((course: any) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      const matchesTemplate = selectedTemplate === 'all' || course.template === selectedTemplate;
      
      return matchesSearch && matchesLevel && matchesTemplate;
    });

    // Sort courses
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || '2024-01-01').getTime() - new Date(a.createdAt || '2024-01-01').getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default: // popular
          return (b.studentsCount || 0) - (a.studentsCount || 0);
      }
    });

    return filtered;
  }, [courses, searchTerm, selectedLevel, selectedTemplate, sortBy]);

  const courseStats = {
    total: courses.length,
    completed: 0, // TODO: Get from user progress API
    available: courses.filter((course: any) => course.status === 'Published').length
  };


  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className='min-h-screen bg-customgreys-primarybg flex items-center justify-center'>
        <Card className='max-w-md w-full mx-4 bg-customgreys-secondarybg border-red-500/20'>
          <CardContent className='p-8 text-center'>
            <div className='text-red-500 mb-4'>
              <Trophy className='h-12 w-12 mx-auto mb-2 opacity-50' />
            </div>
            <h2 className='text-xl font-semibold text-white mb-2'>Erro ao Carregar</h2>
            <p className='text-customgreys-dirtyGrey mb-4'>Erro ao carregar cursos</p>
            <Button onClick={() => window.location.reload()} className='bg-red-500 hover:bg-red-600'>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-customgreys-primarybg'>
      {/* Enhanced Header Section */}
      <div className='relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30'>
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className='relative max-w-7xl mx-auto px-6 py-12'>
          <div className='flex items-center gap-4 mb-8'>
            <Button
              variant="ghost"
              onClick={() => router.push('/user/courses')}
              className="text-gray-400 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Meus Cursos
            </Button>
            <div className="h-4 w-px bg-violet-900/30" />
            <span className="text-gray-400 text-sm">Explorar Cursos</span>
          </div>
          
          <div className='text-center mb-8'>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-3 shadow-lg">
                <PlayCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent'>
                Explorar Cursos
              </h1>
            </div>
            <p className='text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed'>
              Descubra nosso catálogo completo de cursos em vídeo. Inscreva-se e comece sua 
              jornada de aprendizado com professores especializados.
            </p>
          </div>
          
          {/* Enhanced Course Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card className='bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-blue-500/50 transition-all duration-300 group'>
              <CardContent className='p-6 text-center'>
                <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg'>
                  <PlayCircle className='h-6 w-6 text-white' />
                </div>
                <p className='text-sm text-gray-400 mb-1'>Cursos Disponíveis</p>
                <p className='text-3xl font-bold text-white'>{courseStats.available}</p>
              </CardContent>
            </Card>
            
            <Card className='bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-green-500/50 transition-all duration-300 group'>
              <CardContent className='p-6 text-center'>
                <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <p className='text-sm text-gray-400 mb-1'>Estudantes Ativos</p>
                <p className='text-3xl font-bold text-white'>2.5k+</p>
              </CardContent>
            </Card>
            
            <Card className='bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-yellow-500/50 transition-all duration-300 group'>
              <CardContent className='p-6 text-center'>
                <div className='bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg'>
                  <Star className='h-6 w-6 text-white' />
                </div>
                <p className='text-sm text-gray-400 mb-1'>Avaliação Média</p>
                <p className='text-3xl font-bold text-white'>4.8</p>
              </CardContent>
            </Card>
            
            <Card className='bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-purple-500/50 transition-all duration-300 group'>
              <CardContent className='p-6 text-center'>
                <div className='bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg'>
                  <TrendingUp className='h-6 w-6 text-white' />
                </div>
                <p className='text-sm text-gray-400 mb-1'>Taxa de Conclusão</p>
                <p className='text-3xl font-bold text-white'>87%</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Enhanced Search and Filters */}
          <div className='bg-customgreys-primarybg/40 backdrop-blur-sm rounded-xl border border-violet-900/30 p-6 mb-6'>
            <div className='flex flex-col lg:flex-row gap-4'>
              {/* Enhanced Search */}
              <div className='flex-1 relative'>
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  type="text"
                  placeholder="Pesquisar cursos por nome, nível ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-12 h-12 bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 rounded-lg text-base'
                />
              </div>
            
              {/* Level Filter Pills */}
              <div className='flex flex-wrap gap-2'>
                <span className='text-sm text-gray-400 flex items-center mr-2'>Nível:</span>
                {['all', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(level)}
                    className={selectedLevel === level 
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none shadow-lg" 
                      : "bg-customgreys-darkGrey/50 border-violet-900/30 text-gray-300 hover:text-white hover:border-violet-500 hover:bg-violet-800/20 transition-all duration-200"
                    }
                  >
                    {level === 'all' ? 'Todos' : level}
                  </Button>
                ))}
              </div>
              
              {/* Template Filter Pills */}
              <div className='flex flex-wrap gap-2'>
                <span className='text-sm text-gray-400 flex items-center mr-2'>Área:</span>
                {[{id: 'all', name: 'Todas', icon: Filter}, {id: 'general', name: 'Geral', icon: Globe}, {id: 'business', name: 'Negócios', icon: Briefcase}, {id: 'technology', name: 'Tecnologia', icon: Code}, {id: 'medical', name: 'Médico', icon: Stethoscope}, {id: 'legal', name: 'Jurídico', icon: Scale}].map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Button
                      key={template.id}
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTemplate(template.id)}
                      className={selectedTemplate === template.id 
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none shadow-lg" 
                        : "bg-customgreys-darkGrey/50 border-violet-900/30 text-gray-300 hover:text-white hover:border-violet-500 hover:bg-violet-800/20 transition-all duration-200"
                      }
                    >
                      <IconComponent className='h-3 w-3 mr-1' />
                      {template.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Courses Grid */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {filteredAndSortedCourses.length === 0 ? (
          <Card className='bg-customgreys-secondarybg border-customgreys-darkerGrey'>
            <CardContent className='flex flex-col items-center justify-center py-16'>
              <Search className='h-16 w-16 text-customgreys-dirtyGrey mb-4 opacity-50' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Nenhum curso encontrado
              </h3>
              <p className='text-customgreys-dirtyGrey text-center mb-6'>
                Tente ajustar seus filtros ou termo de pesquisa
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('all');
                  setSelectedTemplate('all');
                }}
                className='bg-violet-600 hover:bg-violet-700'
              >
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className='mb-6 flex items-center justify-between flex-wrap gap-4'>
              <p className='text-gray-300'>
                {filteredAndSortedCourses.length === 1 
                  ? '1 curso encontrado' 
                  : `${filteredAndSortedCourses.length} cursos encontrados`}
              </p>
              
              {/* Sort and View Controls */}
              <div className='flex items-center gap-4'>
                {/* Sort Dropdown */}
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-400'>Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className='bg-customgreys-darkGrey border border-violet-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                  >
                    <option value="popular">Mais Populares</option>
                    <option value="newest">Mais Recentes</option>
                    <option value="rating">Melhor Avaliados</option>
                    <option value="title">A-Z</option>
                  </select>
                </div>
                
                {/* View Mode Toggle */}
                <div className='flex items-center bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg p-1'>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Grid3X3 className='w-4 h-4' />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <ListIcon className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </div>
            
            <List
              courses={filteredAndSortedCourses}
              activeCourseId={undefined}
              viewMode={viewMode}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default LearnCourse;