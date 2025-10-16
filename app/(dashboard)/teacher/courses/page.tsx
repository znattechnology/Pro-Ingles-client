"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import {
  useGetAllTeacherCoursesQuery,
  useCreateTeacherVideoCourseMutation,
  teacherVideoCourseApiSlice,
} from "@/src/domains/teacher/video-courses/api";
import { TeacherVideoCourse } from "@/src/domains/teacher/video-courses/types";
import Loading from "@/components/course/Loading";
import TeacherCourseCard from "@/components/course/TeacherCourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { notifications } from "@/lib/toast";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Grid3X3,
  List as ListIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  Globe,
  Video,
  Play
} from "lucide-react";

const TeacherVideoCoursesPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const {
    data: coursesResponse,
    isLoading,
    isError,
  } = useGetAllTeacherCoursesQuery({ category: "all" });
  
  const courses = coursesResponse?.data || [];


  const [createCourse] = useCreateTeacherVideoCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState('newest'); // newest, enrollments, title, status
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(12);
  



  const { filteredCourses, paginatedCourses, totalPages, totalCourses } = useMemo(() => {
    if (!courses) return { filteredCourses: [], paginatedCourses: [], totalPages: 0, totalCourses: 0 };

    // Filter courses
    const filtered = courses.filter((course) => {
      // Only show courses created by the current teacher
      if (course.teacherId !== user?.id) return false;
      
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || course.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort courses
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'enrollments':
          return (b.students || 0) - (a.students || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return b.status.localeCompare(a.status);
        default: // newest
          return new Date(b.created_at || '2024-01-01').getTime() - new Date(a.created_at || '2024-01-01').getTime();
      }
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const paginatedCourses = filtered.slice(startIndex, endIndex);

    return {
      filteredCourses: filtered,
      paginatedCourses,
      totalPages,
      totalCourses: filtered.length
    };
  }, [courses, searchTerm, selectedCategory, selectedStatus, sortBy, user?.id, currentPage, coursesPerPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, sortBy]);

  const handleEdit = (course: TeacherVideoCourse) => {
    console.log('🔍 handleEdit called with course:', course);
    const courseId = course.courseId || course.id;
    console.log('🔍 Extracted courseId for edit:', courseId);
    if (!courseId) {
      console.error('❌ Course ID is missing for course:', course);
      return;
    }
    console.log('🔍 Redirecting to edit page:', `/teacher/courses/${courseId}`);
    router.push(`/teacher/courses/${courseId}`, {
      scroll: false,
    });
  };


  const handleViewCourse = (course: TeacherVideoCourse) => {
    // Navigate to course preview or public view
    const courseId = course.courseId || course.id;
    if (!courseId) {
      console.error('❌ Course ID is missing for course:', course);
      return;
    }
    // Navigate to the new video course management page
    router.push(`/teacher/laboratory/video-courses/${courseId}`);
  };

  const handleCreateCourse = async () => {
    if (!user) {
      notifications.error('Usuário não encontrado. Por favor, faça login novamente.');
      return;
    }

    if (isCreatingCourse) return; // Prevent multiple clicks

    setIsCreatingCourse(true);
    
    try {
      // Use minimal data like the working version
      const result = await createCourse({
        title: 'Novo Curso',
        course_type: 'video'
      }).unwrap();
      
      // Handle different response structures - ID está em result
      const courseId = result.courseId || result.id;
      
      if (courseId) {
        // Force invalidate the teacher courses list cache
        dispatch(teacherVideoCourseApiSlice.util.invalidateTags(['TeacherVideoCourse']));
        
        // Show success toast
        notifications.success("Novo curso criado com sucesso! 🎉 Redirecionando...");
        
        // Small delay to ensure the user sees the toast
        setTimeout(() => {
          router.push(`/teacher/courses/${courseId}`, {
            scroll: false,
          });
        }, 1500);
      } else {
        notifications.error("Erro ao obter ID do curso criado.");
      }
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      notifications.error(`Erro ao criar curso. ${errorMessage}. Tente novamente.`);
    } finally {
      setIsCreatingCourse(false);
    }
  };


  // Show loading while auth is being checked or courses are loading
  if (authLoading || isLoading) {
    return <Loading />;
  }
  
  // Show error if courses couldn't load
  if (isError || !courses) {
    return <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center text-white">Erro ao carregar cursos.</div>;
  }
  
  // Simple auth check - if not authenticated, show a simple message without redirects
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para acessar seus cursos.</p>
          <Button
            onClick={() => router.push('/signin')}
            className="mt-4 bg-violet-600 hover:bg-violet-700"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-40 w-60 h-60 bg-violet-600/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-60 h-60 bg-purple-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-start justify-start mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="ghost"
                onClick={() => router.push('/teacher/laboratory')}
                className="text-gray-400 hover:text-white hover:bg-violet-600/20 transition-all text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar ao Laboratório
              </Button>
            </motion.div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4"
            >
              <Video className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 font-medium text-sm">Cursos em Vídeo</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl md:text-3xl font-bold mb-3"
            >
              Meus <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Cursos</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base text-gray-300 max-w-xl mx-auto leading-relaxed"
            >
              Crie, gerencie e monitore o desempenho dos seus cursos em vídeo
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-6 pb-12 pt-8">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Filters and Search */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-5"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 w-full sm:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar cursos..."
                    className="pl-8 bg-customgreys-secondarybg border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            
              <div className="flex space-x-2">
                {[{value: 'all', label: 'Todos'}, {value: 'Published', label: 'Publicado'}, {value: 'Draft', label: 'Rascunho'}].map((status) => (
                  <Button
                    key={status.value}
                    variant={selectedStatus === status.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus(status.value)}
                    className={selectedStatus === status.value 
                      ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                      : 'border-customgreys-darkerGrey bg-customgreys-darkGrey text-gray-300 hover:bg-violet-600/10 hover:border-violet-500 hover:text-white'
                    }
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
          {/* Summary Cards */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalCourses}
              </div>
              <div className="text-sm text-gray-400">Total de Cursos</div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {courses.filter(course => course.teacherId === user?.id).reduce((sum, course) => sum + (course.total_enrollments || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Estudantes Ativos</div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Play className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {courses.filter(course => course.teacherId === user?.id).reduce((sum, course) => sum + (course.total_sections || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Seções</div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {courses.filter(course => course.teacherId === user?.id && course.status === 'Published').length}
              </div>
              <div className="text-sm text-gray-400">Publicados</div>
            </motion.div>
          </motion.div>

          {/* Courses Grid */}
          {totalCourses === 0 ? (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl border border-violet-500/20">
                <CardContent className="text-center py-16">
                  <div className="bg-violet-500/20 rounded-full p-6 mx-auto mb-6 w-fit">
                    <Video className="h-16 w-16 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {courses.filter(course => course.teacherId === user?.id).length === 0 
                      ? 'Nenhum curso criado ainda' 
                      : 'Nenhum curso encontrado'
                    }
                  </h3>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    {filteredCourses.length === 0 && courses.filter(course => course.teacherId === user?.id).length === 0
                      ? 'Comece criando seu primeiro curso em vídeo'
                      : 'Tente ajustar seus filtros ou termo de pesquisa'
                    }
                  </p>
                  {filteredCourses.length === 0 && courses.filter(course => course.teacherId === user?.id).length === 0 ? (
                    <Button 
                      type="button"
                      onClick={handleCreateCourse}
                      disabled={isCreatingCourse}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-xl transition-all duration-300"
                    >
                      {isCreatingCourse ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Criar Primeiro Curso
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedStatus('all');
                      }}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-xl transition-all duration-300"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-gray-300">
                  {totalCourses === 1 
                    ? '1 curso encontrado' 
                    : `${totalCourses} cursos encontrados`}
                </p>
                {totalPages > 1 && (
                  <p className="text-sm text-gray-400">
                    Página {currentPage} de {totalPages} • Mostrando {paginatedCourses.length} cursos
                  </p>
                )}
              </div>
              
              {/* Sort and View Controls */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Courses per page dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Por página:</span>
                  <select
                    value={coursesPerPage}
                    onChange={(e) => {
                      setCoursesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-customgreys-darkGrey border border-violet-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
                
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-customgreys-darkGrey border border-violet-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="newest">Mais Recentes</option>
                    <option value="enrollments">Mais Alunos</option>
                    <option value="title">A-Z</option>
                    <option value="status">Por Status</option>
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

                {/* Create Course Button */}
                <Button
                  type="button"
                  onClick={handleCreateCourse}
                  disabled={isCreatingCourse}
                  className="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingCourse ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Curso
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className={`grid gap-6 ${viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
              }`}
            >
              {paginatedCourses.map((course, index) => (
                <motion.div
                  key={course.courseId || course.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <TeacherCourseCard
                    course={course as any}
                    onEdit={handleEdit}
                    onView={handleViewCourse}
                    isOwner={course.teacherId === user?.id}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-customgreys-darkGrey border-violet-900/30 text-white hover:bg-violet-600 hover:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and adjacent pages
                    const isVisible = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                      
                    if (!isVisible) {
                      // Show ellipsis for gaps
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={page === currentPage 
                          ? "bg-violet-600 text-white border-violet-500 hover:bg-violet-700" 
                          : "bg-customgreys-darkGrey border-violet-900/30 text-white hover:bg-violet-600 hover:border-violet-500"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-customgreys-darkGrey border-violet-900/30 text-white hover:bg-violet-600 hover:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

    </div>
  );
};

export default TeacherVideoCoursesPage;
