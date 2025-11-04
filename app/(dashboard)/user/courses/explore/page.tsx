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
import { useGetAvailableVideoCoursesQuery } from '@/src/domains/student/video-courses/api';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Search, 
  Trophy, 
  Grid3X3,
  List as ListIcon,
  Filter,
  BookOpen,
  GraduationCap,
  Users
} from 'lucide-react';

const LearnCourse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // popular, newest, rating, title
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch courses from Django API (only video courses for exploration)
  const { data: coursesData, isLoading, error } = useGetAvailableVideoCoursesQuery({});
  
  // Get video courses directly from API
  // Handle both paginated format and direct array format
  const courses = Array.isArray(coursesData?.data) 
    ? coursesData.data 
    : [];

  // Filter and sort courses
  const filteredAndSortedCourses = React.useMemo(() => {
    const filtered = courses.filter((course: any) => {
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
    return (
      <Loading 
        title="Explorar Cursos"
        subtitle="Biblioteca de Conteúdos"
        description="Carregando cursos disponíveis..."
        icon={BookOpen}
        progress={80}
      />
    );
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
      {/* Modern Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-4 sm:py-6"
      >
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-violet-500/5 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.15)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className='relative max-w-7xl mx-auto'>
          {/* Modern Hero Content */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6"
            >
              <BookOpen className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 font-medium text-sm">Cursos Disponíveis</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            >
              Explore <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Cursos</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
            >
              Descubra novos conhecimentos e desenvolva suas habilidades com nossos cursos especializados
            </motion.p>

            {/* Modern Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-violet-400 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-bold">{filteredAndSortedCourses.length}</span>
                </div>
                <div className="text-sm text-gray-400">Cursos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-2xl font-bold">100+</span>
                </div>
                <div className="text-sm text-gray-400">Alunos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                  <Trophy className="w-5 h-5" />
                  <span className="text-2xl font-bold">4.8</span>
                </div>
                <div className="text-sm text-gray-400">Avaliação</div>
              </div>
            </motion.div>
          </div>
          
          {/* Modern Search and Filters */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-4 sm:p-6"
          >
            {/* Enhanced Search Bar */}
            <div className='relative mb-4'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <Input
                type="text"
                placeholder="Buscar por título, descrição, categoria ou instrutor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-12 h-12 bg-customgreys-secondarybg border-violet-500/30 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 rounded-xl text-sm shadow-lg'
              />
            </div>
            
            {/* Mobile-Optimized Filters */}
            <div className='space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4 text-sm'>
              {/* Level Filter Dropdown */}
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4 text-gray-400 flex-shrink-0' />
                <span className='text-gray-400 flex-shrink-0'>Nível:</span>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-full sm:w-[140px] min-w-[120px] h-9 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20">
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
                <span className='text-gray-400 flex-shrink-0'>Área:</span>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-full sm:w-[140px] min-w-[120px] h-9 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20">
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
          </motion.div>
        </div>
      </motion.div>
      
      {/* Enhanced Courses Grid */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8'>
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
            {/* Mobile-Optimized Controls */}
            <div className='mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between'>
              <p className='text-gray-300 text-sm sm:text-base'>
                {filteredAndSortedCourses.length === 1 
                  ? '1 curso encontrado' 
                  : `${filteredAndSortedCourses.length} cursos encontrados`}
              </p>
              
              {/* Sort and View Controls */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'>
                {/* Sort Dropdown */}
                <div className='flex items-center gap-2 w-full sm:w-auto'>
                  <span className='text-sm text-gray-400 flex-shrink-0'>Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className='flex-1 sm:flex-none bg-customgreys-darkGrey border border-violet-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 min-w-[140px]'
                  >
                    <option value="popular">Mais Populares</option>
                    <option value="newest">Mais Recentes</option>
                    <option value="rating">Melhor Avaliados</option>
                    <option value="title">A-Z</option>
                  </select>
                </div>
                
                {/* View Mode Toggle */}
                <div className='flex items-center bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg p-1 w-full sm:w-auto justify-center sm:justify-start'>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`p-3 sm:p-2 flex-1 sm:flex-none ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Grid3X3 className='w-4 h-4' />
                    <span className="ml-2 sm:hidden text-xs">Grade</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`p-3 sm:p-2 flex-1 sm:flex-none ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <ListIcon className='w-4 h-4' />
                    <span className="ml-2 sm:hidden text-xs">Lista</span>
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