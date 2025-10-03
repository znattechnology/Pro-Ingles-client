"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Search,
  Plus,
  Filter,
  Grid3X3,
  List as ListIcon
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';
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
        rating: 4.5 + Math.random() * 0.5,
        nextLesson: 'Next Chapter'
      };
    });
  }, [finalEnrolledCoursesData]);

  // Hook customizado para buscar progresso de cada curso
  const [coursesWithProgress, setCoursesWithProgress] = useState(enrolledCourses);

  useEffect(() => {
    const fetchProgressForCourses = async () => {
      if (!user?.id || enrolledCourses.length === 0) return;

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
    };

    fetchProgressForCourses();
  }, [enrolledCourses, user?.id]);

  // Filter and sort courses with advanced logic like explore page
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = coursesWithProgress.filter((course: any) => {
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
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Search and Filters */}
        <div className="bg-customgreys-primarybg/40 backdrop-blur-sm rounded-lg border border-violet-900/30 p-4 mb-4">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar meus cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md text-sm"
            />
          </div>
          
          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
          
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px] h-8 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                  <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Todos</SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Em Progresso</SelectItem>
                  <SelectItem value="completed" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Concluídos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Level Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Nível:</span>
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
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Área:</span>
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
            
            
            {/* Explore Button */}
            <Button
              onClick={() => router.push('/user/courses/explore')}
              className="h-7 px-3 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Plus className="w-3 h-3 mr-1" />
              Explorar
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