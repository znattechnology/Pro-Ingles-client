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
    let filtered = courses.filter((course: any) => {
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
    return <Loading />;
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
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            {/* Icon and Title */}
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-4 rounded-2xl shadow-2xl">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                  Practice Laboratory
                </h1>
                <p className="text-violet-300 text-lg font-medium">Cursos Interativos de Inglês</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Pratique inglês de forma interativa com exercícios gamificados, desafios personalizados e progresso em tempo real. 
              Cada curso foi desenvolvido para maximizar seu aprendizado através da prática ativa.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-violet-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-violet-500/20 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{courses.length}</p>
                    <p className="text-xs text-gray-400">Cursos</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">500+</p>
                    <p className="text-xs text-gray-400">Lições</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">2000+</p>
                    <p className="text-xs text-gray-400">Desafios</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">10k+</p>
                    <p className="text-xs text-gray-400">Estudantes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-customgreys-secondarybg/40 backdrop-blur-sm rounded-xl border border-violet-900/30 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar cursos do laboratório..."
              value={searchTerm}
              onChange={(e) => setSearchTermValue(e.target.value)}
              className="pl-12 h-12 bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-xl"
            />
          </div>
          
          {/* Filters and Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Level Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Nível:</span>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-[140px] h-9 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20">
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
                <span className="text-gray-400 text-sm">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-customgreys-darkGrey/50 border border-violet-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="progress">Progresso</option>
                  <option value="title">A-Z</option>
                  <option value="level">Nível</option>
                </select>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <ListIcon className="w-4 h-4" />
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
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-300">
                  {filteredAndSortedCourses.length === 1 
                    ? '1 curso encontrado' 
                    : `${filteredAndSortedCourses.length} cursos encontrados`}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <TrendingUp className="w-4 h-4" />
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