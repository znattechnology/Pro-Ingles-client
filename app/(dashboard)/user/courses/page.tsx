"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  ArrowLeft, 
  Search,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  Plus,
  Filter,
  Globe,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  Grid3X3,
  List as ListIcon
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';
import { EnrolledList } from './enrolled-list';
import { useGetUserEnrolledCoursesQuery, useGetCoursesQuery, useGetCoursesWithEnrollmentsQuery } from '@/redux/features/api/coursesApiSlice';

const MyCoursesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [sortBy, setSortBy] = useState('progress'); // progress, newest, rating, title, lastAccessed
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Fetch enrolled courses from Django API
  const { data: enrolledCoursesData, isLoading: enrolledCoursesLoading, error: enrolledCoursesError } = useGetUserEnrolledCoursesQuery(
    user?.id || '', 
    { skip: !user?.id }
  );

  // Fallback: Fetch all courses if enrolled courses API fails
  const { data: allCoursesData, isLoading: allCoursesLoading } = useGetCoursesQuery(
    {},
    { skip: !enrolledCoursesError || !!enrolledCoursesData }
  );

  // Final fallback: Get courses with detailed enrollment data
  const { data: detailedCoursesData, isLoading: detailedCoursesLoading } = useGetCoursesWithEnrollmentsQuery(
    undefined,
    { skip: !enrolledCoursesError || !!enrolledCoursesData || (!!allCoursesData && allCoursesData.data.some(c => c.enrollments !== undefined)) }
  );

  // Use enrolled courses API if available, otherwise filter from all courses
  const finalEnrolledCoursesData = React.useMemo(() => {
    if (enrolledCoursesData) {
      return enrolledCoursesData;
    }
    
    if (detailedCoursesData?.data && user?.id) {
      const enrolledCourses = detailedCoursesData.data.filter(course => 
        course.enrollments?.some(enrollment => enrollment.userId === user.id)
      );
      
      return {
        message: 'Cursos inscritos encontrados',
        data: enrolledCourses
      };
    }

    if (allCoursesData?.data && user?.id) {
      const enrolledCourses = allCoursesData.data.filter(course => {
        return course.enrollments?.some(enrollment => enrollment.userId === user.id);
      });
      
      return {
        message: 'Cursos inscritos encontrados',
        data: enrolledCourses
      };
    }
    
    return null;
  }, [enrolledCoursesData, allCoursesData, detailedCoursesData, user?.id, enrolledCoursesError]);

  const coursesLoading = enrolledCoursesLoading || allCoursesLoading || detailedCoursesLoading;

  // Transform API data to match component expectations
  const enrolledCourses = React.useMemo(() => {
    if (!finalEnrolledCoursesData?.data) return [];
    
    return finalEnrolledCoursesData.data.map(course => ({
      id: course.courseId,
      title: course.title,
      description: course.description || '',
      thumbnail: course.image || '/laboratory/challenges/english-1.jpg',
      instructor: course.teacherName,
      progress: Math.random() * 100, // TODO: Get from progress API
      totalLessons: course.total_chapters || 0,
      completedLessons: Math.floor((course.total_chapters || 0) * Math.random()),
      duration: '8 semanas', // TODO: Calculate from course data
      level: course.level,
      category: course.category,
      template: course.template,
      enrolledAt: course.created_at,
      lastAccessed: new Date().toISOString(),
      status: 'active',
      rating: 4.5 + Math.random() * 0.5,
      nextLesson: 'Next Chapter'
    }));
  }, [finalEnrolledCoursesData]);

  // Filter and sort courses with advanced logic like explore page
  const filteredAndSortedCourses = React.useMemo(() => {
    let filtered = enrolledCourses.filter((course: any) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      const matchesTemplate = selectedTemplate === 'all' || course.template === selectedTemplate;
      
      return matchesSearch && matchesStatus && matchesLevel && matchesTemplate;
    });

    // Sort courses
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.enrolledAt || '2024-01-01').getTime() - new Date(a.enrolledAt || '2024-01-01').getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'lastAccessed':
          return new Date(b.lastAccessed || '2024-01-01').getTime() - new Date(a.lastAccessed || '2024-01-01').getTime();
        default: // progress
          return (b.progress || 0) - (a.progress || 0);
      }
    });

    return filtered;
  }, [enrolledCourses, searchTerm, filterStatus, selectedLevel, selectedTemplate, sortBy]);

  const stats = {
    total: enrolledCourses.length,
    active: enrolledCourses.filter(c => c.status === 'active').length,
    completed: enrolledCourses.filter(c => c.status === 'completed').length,
    totalProgress: Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length)
  };


  if (isLoading || coursesLoading) return <Loading />;
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para acessar seus cursos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/user/dashboard')}
              className="text-gray-400 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-4 w-px bg-violet-900/30" />
            <span className="text-gray-400 text-sm">Meus Cursos</span>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-3 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                Meus Cursos
              </h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Acompanhe seu progresso e continue aprendendo com os cursos em que você se inscreveu.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 w-fit mx-auto mb-4 shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-400 mb-1">Total de Cursos</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 w-fit mx-auto mb-4 shadow-lg">
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-400 mb-1">Em Andamento</p>
                <p className="text-3xl font-bold text-white">{stats.active}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-yellow-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 w-fit mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-400 mb-1">Concluídos</p>
                <p className="text-3xl font-bold text-white">{stats.completed}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 w-fit mx-auto mb-4 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-400 mb-1">Progresso Médio</p>
                <p className="text-3xl font-bold text-white">{stats.totalProgress}%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Search and Filters */}
        <div className="bg-customgreys-primarybg/40 backdrop-blur-sm rounded-xl border border-violet-900/30 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Enhanced Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar cursos por nome, instrutor ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 rounded-lg text-base"
              />
            </div>
          
            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 flex items-center mr-2">Status:</span>
              {[
                { id: 'all', name: 'Todos' },
                { id: 'active', name: 'Em Andamento' },
                { id: 'completed', name: 'Concluídos' }
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={filterStatus === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(filter.id)}
                  className={filterStatus === filter.id 
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none shadow-lg" 
                    : "bg-customgreys-darkGrey/50 border-violet-900/30 text-gray-300 hover:text-white hover:border-violet-500 hover:bg-violet-800/20 transition-all duration-200"
                  }
                >
                  {filter.name}
                </Button>
              ))}
            </div>
            
            {/* Level Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 flex items-center mr-2">Nível:</span>
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
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 flex items-center mr-2">Área:</span>
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
                    <IconComponent className="h-3 w-3 mr-1" />
                    {template.name}
                  </Button>
                );
              })}
            </div>
            
            {/* Explore Button */}
            <Button
              onClick={() => router.push('/user/courses/explore')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Explorar Novos Cursos
            </Button>
          </div>
        </div>

        {/* Enhanced Courses Section */}
        {filteredAndSortedCourses.length === 0 ? (
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-violet-500/20 rounded-full p-6 mb-6">
                <BookOpen className="h-12 w-12 text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm ? 'Nenhum curso encontrado' : 'Você ainda não se inscreveu em nenhum curso'}
              </h3>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                {searchTerm 
                  ? 'Tente ajustar seu termo de pesquisa ou filtros' 
                  : 'Explore nosso catálogo e comece sua jornada de aprendizado hoje mesmo!'
                }
              </p>
              <div className="flex gap-3">
                {searchTerm || selectedLevel !== 'all' || selectedTemplate !== 'all' || filterStatus !== 'all' ? (
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedLevel('all');
                      setSelectedTemplate('all');
                      setFilterStatus('all');
                    }}
                    variant="outline"
                    className="border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white"
                  >
                    Limpar Filtros
                  </Button>
                ) : null}
                <Button
                  onClick={() => router.push('/user/courses/explore')}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Explorar Cursos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <p className="text-gray-300">
                {filteredAndSortedCourses.length === 1 
                  ? '1 curso encontrado' 
                  : `${filteredAndSortedCourses.length} cursos encontrados`}
              </p>
              
              {/* Sort and View Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-customgreys-darkGrey border border-violet-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="progress">Progresso</option>
                    <option value="lastAccessed">Último Acesso</option>
                    <option value="newest">Mais Recentes</option>
                    <option value="rating">Melhor Avaliados</option>
                    <option value="title">A-Z</option>
                  </select>
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
            
            <EnrolledList
              courses={filteredAndSortedCourses}
              activeCourseId={undefined}
              viewMode={viewMode}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;