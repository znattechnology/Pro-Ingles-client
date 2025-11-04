"use client";

import React, { useState } from 'react';
import { useLaboratoryCourses } from '@/redux/features/laboratory/hooks/useCoursesManagement';
import { useUserProgress } from '@/redux/features/laboratory/hooks/useUserProgress';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setViewMode as setReduxViewMode, 
  setSearchQuery, 
  setLevelFilter,
  selectViewMode,
  selectSearchQuery,
  selectFilters 
} from '@/redux/features/laboratory/laboratorySlice';
import { LaboratoryList } from './laboratory-list';
import Loading from '@/components/course/Loading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Search,
  Filter,
  Grid3X3,
  List as ListIcon,
  Zap,
  Users,
  TrendingUp,
  BookOpen
} from 'lucide-react';

const LearnCourse = () => {
  // Redux state and dispatch
  const dispatch = useDispatch();
  const viewMode = useSelector(selectViewMode);
  const searchTerm = useSelector(selectSearchQuery);
  const filters = useSelector(selectFilters);
  
  // Debug Redux state
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Redux Selectors Data:', {
      viewMode,
      searchTerm,
      filters,
      timestamp: new Date().toISOString()
    });
  }
  
  // Redux hooks
  const { 
    courses, 
    isLoading: coursesLoading, 
    error: coursesError,
    refetch: refetchCourses 
  } = useLaboratoryCourses();
  
  const { 
    userProgress, 
    isLoading: progressLoading, 
    error: progressError,
    refetch: refetchProgress 
  } = useUserProgress();

  // UI state
  const [sortBy, setSortBy] = useState('progress'); // progress, title, level

  // Determine loading and error state
  const isLoading = coursesLoading || progressLoading;
  const error = coursesError || progressError;
  
  // UI state management
  const filterLevel = filters.level || 'all';
  
  const setSearchTermValue = (value: string) => {
    dispatch(setSearchQuery(value));
  };
  
  const setFilterLevel = (value: string) => {
    dispatch(setLevelFilter(value));
  };
  
  const setViewMode = (mode: 'grid' | 'list') => {
    dispatch(setReduxViewMode(mode));
  };


  // Debug: Log laboratory courses
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && courses.length > 0) {
      console.log('🧪 Laboratory Courses (Practice Page):', courses.map((c: any) => ({
        title: c.title,
        course_type: c.course_type || 'undefined',
        id: c.id
      })));
    }
  }, [courses]);

  // Filter and sort courses
  const filteredAndSortedCourses = React.useMemo(() => {
    const filtered = courses.filter((course: any) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
      
      return matchesSearch && matchesLevel;
    });

    // Sort courses
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'level':
          const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          return (levelOrder[a.level as keyof typeof levelOrder] || 0) - (levelOrder[b.level as keyof typeof levelOrder] || 0);
        default: // progress
          return (b.progress || 0) - (a.progress || 0);
      }
    });

    return filtered;
  }, [courses, searchTerm, filterLevel, sortBy]);

  if (isLoading) {
    return (
      <Loading 
        title="Practice Laboratory"
        subtitle="Cursos Interativos"
        description="Carregando cursos disponíveis..."
        icon={Target}
        progress={75}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <Card className="bg-customgreys-secondarybg border-red-500/30 max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-red-500/20 rounded-full p-6 mb-6">
              <Target className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Erro ao Carregar</h3>
            <p className="text-gray-400 text-center mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-violet-950/20 to-purple-950/30 border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.06),transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Icon and Title */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-3 sm:p-4 rounded-2xl shadow-2xl">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                  Practice Laboratory
                </h1>
                <p className="text-violet-300 text-sm sm:text-base lg:text-lg font-medium">Cursos Interativos de Inglês</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Pratique inglês de forma interativa com exercícios gamificados, desafios personalizados e progresso em tempo real. 
              Cada curso foi desenvolvido para maximizar seu aprendizado através da prática ativa.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mt-6 sm:mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-violet-500/20">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <div className="bg-violet-500/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{courses.length}</p>
                    <p className="text-xs text-gray-400">Cursos</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-blue-500/20">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <div className="bg-blue-500/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">500+</p>
                    <p className="text-xs text-gray-400">Lições</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-yellow-500/20">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <div className="bg-yellow-500/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">2000+</p>
                    <p className="text-xs text-gray-400">Desafios</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-green-500/20">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">10k+</p>
                    <p className="text-xs text-gray-400">Estudantes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-customgreys-secondarybg/40 backdrop-blur-sm rounded-xl border border-violet-900/30 p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTermValue(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-xl text-sm sm:text-base"
            />
          </div>
          
          {/* Filters and Controls */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Level Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-xs sm:text-sm flex-shrink-0">Nível:</span>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-full sm:w-[140px] h-8 sm:h-9 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                    <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Todos os Níveis</SelectItem>
                    <SelectItem value="Beginner" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">🟢 Beginner</SelectItem>
                    <SelectItem value="Intermediate" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">🟡 Intermediate</SelectItem>
                    <SelectItem value="Advanced" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">🔴 Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs sm:text-sm flex-shrink-0">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none bg-customgreys-darkGrey/50 border border-violet-900/30 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 min-w-[120px]"
                >
                  <option value="progress">Progresso</option>
                  <option value="title">A-Z</option>
                  <option value="level">Nível</option>
                </select>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg p-1 w-full sm:w-auto justify-center sm:justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`p-2 sm:p-2 flex-1 sm:flex-none ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="ml-2 sm:hidden text-xs">Grade</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`p-2 sm:p-2 flex-1 sm:flex-none ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <ListIcon className="w-4 h-4" />
                <span className="ml-2 sm:hidden text-xs">Lista</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        {filteredAndSortedCourses.length === 0 ? (
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-violet-500/20 rounded-full p-6 mb-6">
                <Target className="h-12 w-12 text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm ? 'Nenhum curso encontrado' : 'Nenhum curso disponível'}
              </h3>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                {searchTerm 
                  ? 'Tente ajustar seu termo de pesquisa ou filtros' 
                  : 'Os cursos do laboratório estão sendo preparados para você!'
                }
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => {
                    setSearchTermValue('');
                    setFilterLevel('all');
                  }}
                  variant="outline"
                  className="border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white"
                >
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-gray-300 text-sm sm:text-base">
                  {filteredAndSortedCourses.length === 1 
                    ? '1 curso encontrado' 
                    : `${filteredAndSortedCourses.length} cursos encontrados`}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Aprenda praticando</span>
                </div>
              </div>
            </div>
            
            <LaboratoryList
              courses={filteredAndSortedCourses}
              activeCourseId={(userProgress as any)?.active_course?.id}
              viewMode={viewMode}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default LearnCourse;