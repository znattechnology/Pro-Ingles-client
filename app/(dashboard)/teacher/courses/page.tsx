"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import {
  useGetAllTeacherCoursesQuery,
  useCreateTeacherVideoCourseMutation,
  useDeleteTeacherVideoCourseMutation,
  teacherVideoCourseApiSlice,
} from "@/src/domains/teacher/video-courses/api";
import { TeacherVideoCourse } from "@/src/domains/teacher/video-courses/types";
import Loading from "@/components/course/Loading";
import TeacherCourseCard from "@/components/course/TeacherCourseCard";
import DeleteCourseModal from "@/components/modals/DeleteCourseModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notifications } from "@/lib/toast";
import { useDispatch } from "react-redux";
import {
  Search,
  Plus,
  Grid3X3,
  List as ListIcon,
  BookOpen,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight
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
  const [deleteCourse] = useDeleteTeacherVideoCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState('newest'); // newest, enrollments, title, status
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(12);
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<TeacherVideoCourse | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);



  const { filteredCourses, paginatedCourses, totalPages, totalCourses } = useMemo(() => {
    if (!courses) return { filteredCourses: [], paginatedCourses: [], totalPages: 0, totalCourses: 0 };

    // Filter courses
    let filtered = courses.filter((course) => {
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

  const handleDelete = (course: TeacherVideoCourse) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    setIsDeletingCourse(true);
    
    try {
      await deleteCourse(courseToDelete.id).unwrap();
      
      // Close modal and reset state
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
      
      // Show success message (you can replace with a toast if you have one)
      console.log('Curso deletado com sucesso');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Erro ao deletar curso. Tente novamente.');
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeletingCourse) {
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleViewCourse = (course: TeacherVideoCourse) => {
    // Navigate to course preview or public view
    const courseId = course.courseId || course.id;
    if (!courseId) {
      console.error('❌ Course ID is missing for course:', course);
      return;
    }
    router.push(`/course/${courseId}`);
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
      
      // Handle different response structures - ID está em result.data
      const courseId = result.data?.courseId || result.data?.id || result.courseId || result.id;
      
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
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Enhanced Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">

          
          {/* Compact Search and Filters */}
          <div className="bg-customgreys-primarybg/40 backdrop-blur-sm rounded-lg border border-violet-900/30 p-4 mb-6">
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
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[120px] h-8 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                    <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Todos</SelectItem>
                    <SelectItem value="Published" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Publicado</SelectItem>
                    <SelectItem value="Draft" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Categoria:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px] h-8 bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
                    <SelectItem value="all" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">Todas</SelectItem>
                    <SelectItem value="petroleo-gas" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">🛢️ Petróleo & Gás</SelectItem>
                    <SelectItem value="bancario" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">🏦 Bancário</SelectItem>
                    <SelectItem value="ti-telecomunicacoes" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">💻 TI & Telecom</SelectItem>
                    <SelectItem value="executivo" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">👔 Executivo</SelectItem>
                    <SelectItem value="ai-personal-tutor" className="text-white hover:bg-violet-800/20 focus:bg-violet-800/20">🤖 IA Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Courses Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {totalCourses === 0 ? (
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-customgreys-dirtyGrey mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {courses.filter(course => course.teacherId === user?.id).length === 0 
                  ? 'Nenhum curso criado ainda' 
                  : 'Nenhum curso encontrado'
                }
              </h3>
              <p className="text-customgreys-dirtyGrey text-center mb-6">
                {filteredCourses.length === 0 && courses.filter(course => course.teacherId === user?.id).length === 0
                  ? 'Comece criando seu primeiro curso'
                  : 'Tente ajustar seus filtros ou termo de pesquisa'
                }
              </p>
              <div className="flex gap-3">
                {filteredCourses.length === 0 && courses.filter(course => course.teacherId === user?.id).length === 0 ? (
                  <Button 
                    type="button"
                    onClick={handleCreateCourse}
                    disabled={isCreatingCourse}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingCourse ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
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
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
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
            
            <div className={`grid gap-6 ${viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
            }`}>
              {paginatedCourses.map((course) => (
                <TeacherCourseCard
                  key={course.courseId || course.id}
                  course={course as any}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleViewCourse}
                  isOwner={course.teacherId === user?.id}
                  viewMode={viewMode}
                />
              ))}
            </div>
            
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

      {/* Delete Course Modal */}
      <DeleteCourseModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        course={courseToDelete || {
          id: "test",
          title: "Curso de Teste",
          status: "Published",
          enrollments: [1, 2, 3]
        }}
        isDeleting={isDeletingCourse}
      />
    </div>
  );
};

export default TeacherVideoCoursesPage;
