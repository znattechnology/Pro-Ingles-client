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
import { useGetCoursesQuery } from '@modules/learning/video-courses';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Trophy, 
  Grid3X3,
  List as ListIcon,
  Filter
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

  // Fetch courses from Django API (only video courses for exploration)
  const { data: coursesData, isLoading, error } = useGetCoursesQuery({ 
    course_type: 'video' // Explicitly request video courses for exploration
  });
  
  // Transform API data to match component expectations
  const courses = React.useMemo(() => {
    if (!coursesData?.data) return [];
    
    // Debug: Log course types
    if (process.env.NODE_ENV === 'development') {
      console.log('🎥 Video Courses (Explore Page):', coursesData.data.map(c => ({
        title: c.title,
        course_type: c.course_type || 'undefined',
        id: c.courseId
      })));
    }
    
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
        
        <div className='relative max-w-7xl mx-auto px-6 py-8'>
          
          {/* Compact Search and Filters */}
          <div className='bg-customgreys-primarybg/40 backdrop-blur-sm rounded-lg border border-violet-900/30 p-4 mb-4'>
            {/* Search Bar */}
            <div className='relative mb-3'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                type="text"
                placeholder="Pesquisar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 h-10 bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md text-sm'
              />
            </div>
            
            {/* Dropdown Filters */}
            <div className='flex flex-wrap items-center gap-4 text-sm'>
              {/* Level Filter Dropdown */}
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4 text-gray-400' />
                <span className='text-gray-400'>Nível:</span>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[140px] h-8 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                    <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Todos os Níveis</SelectItem>
                    <SelectItem value="Beginner" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Beginner</SelectItem>
                    <SelectItem value="Intermediate" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Intermediate</SelectItem>
                    <SelectItem value="Advanced" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Area Filter Dropdown */}
              <div className='flex items-center gap-2'>
                <span className='text-gray-400'>Área:</span>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-[140px] h-8 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                    <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Todas as Áreas</SelectItem>
                    <SelectItem value="general" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Inglês Geral</SelectItem>
                    <SelectItem value="business" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Negócios</SelectItem>
                    <SelectItem value="technology" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Tecnologia</SelectItem>
                    <SelectItem value="medical" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Médico</SelectItem>
                    <SelectItem value="legal" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Jurídico</SelectItem>
                  </SelectContent>
                </Select>
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