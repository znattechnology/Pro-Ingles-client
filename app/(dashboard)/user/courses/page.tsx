"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Search,
  Plus,
  Filter,
  Grid3X3,
  List as ListIcon,
  GraduationCap,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';
import CourseCardsSkeleton from '@/components/course/CourseListSkeleton';
import { EnrolledList } from './enrolled-list';
import { 
  useGetMyVideoEnrollmentsQuery
} from '@/src/domains/student/video-courses/api';

const MyCoursesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [sortBy, setSortBy] = useState('progress'); // progress, newest, rating, title, lastAccessed
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Fetch enrolled courses from Django API (using new domain API)
  const { data: enrolledCoursesData, isLoading: enrolledCoursesLoading, error: enrolledCoursesError } = useGetMyVideoEnrollmentsQuery(
    user?.id as string,
    { skip: !user?.id }
  );

  // Debug enrolled courses response
  console.log('🔍 Enrolled courses data:', enrolledCoursesData);
  console.log('🔍 Enrolled courses error:', enrolledCoursesError);

  // Only use enrolled courses data - no fallback to all available courses
  const finalEnrolledCoursesData = useMemo(() => {
    if (enrolledCoursesData) {
      return enrolledCoursesData;
    }
    
    // If there's an error or no data, return empty array
    return { data: [] };
  }, [enrolledCoursesData]);

  const coursesLoading = enrolledCoursesLoading;

  // Transform API data to match component expectations with real progress
  const enrolledCourses = useMemo(() => {
    if (!finalEnrolledCoursesData) return [];
    
    // Handle different API response structures
    const courses = Array.isArray(finalEnrolledCoursesData) 
      ? finalEnrolledCoursesData 
      : finalEnrolledCoursesData.data || [];
    
    return courses.map((courseOrEnrollment: any) => {
      // If it's an enrollment object, extract the course
      const course = courseOrEnrollment.course || courseOrEnrollment;
      
      return {
        id: course.courseId || course.id,
        title: course.title,
        description: course.description || '',
        thumbnail: course.image || '/laboratory/challenges/english-1.jpg',
        instructor: course.teacherName || course.instructor?.name,
        progress: courseOrEnrollment.completion_percentage || 0,
        totalLessons: course.total_chapters || 0,
        completedLessons: 0, // Will be updated with real progress
        duration: '8 semanas', // TODO: Calculate from course data
        level: course.level,
        category: course.category,
        template: course.template,
        enrolledAt: course.created_at,
        lastAccessed: new Date().toISOString(),
        status: 'active',
        rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
        nextLesson: 'Next Chapter'
      };
    });
  }, [finalEnrolledCoursesData]);

  // Hook customizado para buscar progresso de cada curso
  const [coursesWithProgress, setCoursesWithProgress] = useState(enrolledCourses);
  const [progressLoading, setProgressLoading] = useState(false);

  // Update coursesWithProgress when enrolledCourses changes
  useEffect(() => {
    setCoursesWithProgress(enrolledCourses);
    if (enrolledCourses.length > 0 && user?.id) {
      setProgressLoading(true);
    }
  }, [enrolledCourses, user?.id]);

  useEffect(() => {
    const fetchProgressForCourses = async () => {
      if (!user?.id || enrolledCourses.length === 0) {
        setProgressLoading(false);
        return;
      }

      setProgressLoading(true);
      const coursesWithRealProgress = await Promise.all(
        enrolledCourses.map(async (course) => {
          try {
            const apiUrl = `http://localhost:8000/api/v1/courses/users/${user.id}/progress/${course.id}/`;
            console.log(`Fetching progress from: ${apiUrl}`);
            
            // Buscar progresso real da API Django
            const response = await fetch(apiUrl, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const progressData = await response.json();
              const progress = progressData.data;
              
              // Calcular progresso baseado na estrutura real da API Django
              const totalChapters = course.totalLessons;
              
              // Contar capítulos completados da estrutura sections
              let completedChapters = 0;
              if (progress.sections && Array.isArray(progress.sections)) {
                completedChapters = progress.sections.reduce((total: number, section: any) => {
                  if (section.chapters && Array.isArray(section.chapters)) {
                    return total + section.chapters.filter((chapter: any) => chapter.completed === true).length;
                  }
                  return total;
                }, 0);
              }
              
              // Usar overallProgress da API se disponível, senão calcular
              let progressPercentage;
              if (typeof progress.overallProgress === 'number') {
                progressPercentage = Math.round(progress.overallProgress);
              } else {
                progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
              }
              
              // Debug logs
              console.log(`Course: ${course.title}`);
              console.log(`Total chapters: ${totalChapters}, Completed: ${completedChapters}, Progress: ${progressPercentage}%`);
              console.log('Progress data from API:', progress);
              
              return {
                ...course,
                progress: progressPercentage,
                completedLessons: completedChapters,
                status: progressPercentage >= 100 ? 'completed' : 'active'
              };
            } else {
              console.error(`Failed to fetch progress for course ${course.id}:`, response.status, response.statusText);
              const errorText = await response.text();
              console.error('Error response:', errorText);
              return course; // Retorna curso sem progresso atualizado
            }
          } catch (error) {
            console.error(`Error fetching progress for course ${course.id}:`, error);
            return course; // Retorna curso sem progresso atualizado
          }
        })
      );

      setCoursesWithProgress(coursesWithRealProgress);
      setProgressLoading(false);
    };

    fetchProgressForCourses();
  }, [enrolledCourses, user?.id]);

  // Filter and sort courses with advanced logic like explore page
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = coursesWithProgress.filter((course: any) => {
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
  }, [coursesWithProgress, searchTerm, filterStatus, selectedLevel, selectedTemplate, sortBy]);



  if (isLoading) return <Loading />;
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
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6"
            >
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
              <span className="text-violet-300 font-medium text-xs sm:text-sm">Meus Cursos</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
            >
              Minha <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Jornada</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-4"
            >
              Continua a sua aprendizagem e acompanha o seu progresso nos cursos que está a fazer
            </motion.p>

            {/* Dynamic Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-violet-400 mb-1">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">{filteredAndSortedCourses.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  <span className="hidden sm:inline">Cursos Inscritos</span>
                  <span className="sm:hidden">Inscritos</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-green-400 mb-1">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {filteredAndSortedCourses.filter(course => course.status === 'completed').length}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Concluídos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-blue-400 mb-1">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {Math.round(filteredAndSortedCourses.reduce((acc, course) => acc + (course.progress || 0), 0) / Math.max(filteredAndSortedCourses.length, 1))}%
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  <span className="hidden sm:inline">Progresso Médio</span>
                  <span className="sm:hidden">Média</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Modern Search and Filters */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-violet-500/20 p-4 sm:p-6"
          >
            {/* Enhanced Search Bar */}
            <div className='relative mb-3 sm:mb-4'>
              <Search className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
              <Input
                type="text"
                placeholder="Buscar nos seus cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 sm:pl-12 h-10 sm:h-12 bg-customgreys-secondarybg border-violet-500/30 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 rounded-lg sm:rounded-xl text-sm shadow-lg'
              />
            
            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
          
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-gray-400 hidden sm:inline">Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[90px] sm:w-[120px] h-7 sm:h-8 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                  <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Todos</SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Em Progresso</SelectItem>
                  <SelectItem value="completed" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Concluídos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Level Filter Dropdown */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-gray-400 hidden sm:inline">Nível:</span>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[100px] sm:w-[140px] h-7 sm:h-8 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                  <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Todos os Níveis</span>
                    <span className="sm:hidden">Todos</span>
                  </SelectItem>
                  <SelectItem value="Beginner" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Beginner</SelectItem>
                  <SelectItem value="Intermediate" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Intermediate</SelectItem>
                  <SelectItem value="Advanced" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Area Filter Dropdown */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-gray-400 hidden sm:inline">Área:</span>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-[100px] sm:w-[140px] h-7 sm:h-8 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                  <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Todas as Áreas</span>
                    <span className="sm:hidden">Todas</span>
                  </SelectItem>
                  <SelectItem value="general" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Inglês Geral</span>
                    <span className="sm:hidden">Geral</span>
                  </SelectItem>
                  <SelectItem value="business" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Negócios</SelectItem>
                  <SelectItem value="technology" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Tecnologia</SelectItem>
                  <SelectItem value="medical" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Médico</SelectItem>
                  <SelectItem value="legal" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20 text-xs sm:text-sm">Jurídico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            
            {/* Explore Button */}
            <Button
              onClick={() => router.push('/user/courses/explore')}
              className="h-6 sm:h-7 px-2 sm:px-3 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              <span className="hidden sm:inline">Explorar</span>
              <span className="sm:hidden">+</span>
            </Button>
            </div>
          </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Enhanced Courses Section */}
        {coursesLoading || progressLoading ? (
          <>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="w-32 h-5 bg-gray-600/20 rounded animate-pulse" />
              
              <div className="flex items-center gap-4">
                <div className="w-24 h-8 bg-customgreys-darkGrey/50 rounded animate-pulse" />
                <div className="w-16 h-8 bg-customgreys-darkGrey/50 rounded animate-pulse" />
              </div>
            </div>
            
            <CourseCardsSkeleton />
          </>
        ) : filteredAndSortedCourses.length === 0 ? (
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="bg-violet-500/20 rounded-full p-4 sm:p-6 mb-4 sm:mb-6">
                <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-violet-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 text-center">
                {searchTerm ? 'Nenhum curso encontrado' : 'Ainda não te inscreveste em nenhum curso'}
              </h3>
              <p className="text-gray-400 text-center mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                {searchTerm 
                  ? 'Tenta ajustar o seu termo de pesquisa ou filtros' 
                  : 'Explora o nosso catálogo e começa a sua jornada de aprendizagem hoje mesmo!'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {searchTerm || selectedLevel !== 'all' || selectedTemplate !== 'all' || filterStatus !== 'all' ? (
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedLevel('all');
                      setSelectedTemplate('all');
                      setFilterStatus('all');
                    }}
                    variant="outline"
                    className="border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white text-sm sm:text-base"
                  >
                    Limpar Filtros
                  </Button>
                ) : null}
                <Button
                  onClick={() => router.push('/user/courses/explore')}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Explorar Cursos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <p className="text-gray-300 text-sm sm:text-base">
                {filteredAndSortedCourses.length === 1 
                  ? '1 curso encontrado' 
                  : `${filteredAndSortedCourses.length} cursos encontrados`}
              </p>
              
              {/* Sort and View Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-customgreys-darkGrey border border-violet-900/30 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="progress">Progresso</option>
                    <option value="lastAccessed">Último Acesso</option>
                    <option value="newest">Mais Recentes</option>
                    <option value="rating">Melhor Avaliados</option>
                    <option value="title">A-Z</option>
                  </select>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg p-0.5 sm:p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 sm:p-2 ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 sm:p-2 ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <ListIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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