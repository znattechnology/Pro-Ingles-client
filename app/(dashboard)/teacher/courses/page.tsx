"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetAllTeacherCoursesQuery,
  Course,
} from "@modules/learning/video-courses";
import Loading from "@/components/course/Loading";
import TeacherCourseCard from "@/components/course/TeacherCourseCard";
import DeleteCourseModal from "@/components/modals/DeleteCourseModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notifications } from "@/lib/toast";
import {
  Search,
  Plus,
  Grid3X3,
  List as ListIcon,
  BookOpen,
  Loader2,
  Filter
} from "lucide-react";

const TeacherCoursesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const {
    data: coursesResponse,
    isLoading,
    isError,
  } = useGetAllTeacherCoursesQuery({ category: "all" });
  
  const courses = coursesResponse?.data || [];

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState('newest'); // newest, enrollments, title, status
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);


  const filteredAndSortedCourses = useMemo(() => {
    if (!courses) return [];

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
          return (b.enrollments?.length || 0) - (a.enrollments?.length || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return b.status.localeCompare(a.status);
        default: // newest
          return new Date(b.created_at || '2024-01-01').getTime() - new Date(a.created_at || '2024-01-01').getTime();
      }
    });

    return filtered;
  }, [courses, searchTerm, selectedCategory, selectedStatus, sortBy, user?.id]);

  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.id}`, {
      scroll: false,
    });
  };

  const handleDelete = (course: Course) => {
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

  const handleViewCourse = (course: Course) => {
    // Navigate to course preview or public view
    router.push(`/course/${course.id}`);
  };

  const handleCreateCourse = async () => {
    if (!user) {
      alert('Usuário não encontrado. Por favor, faça login novamente.');
      return;
    }

    if (isCreatingCourse) return; // Prevent multiple clicks

    setIsCreatingCourse(true);
    
    try {
      const result = await createCourse({}).unwrap();
      const courseId = result.data.id || result.data.courseId;
      
      if (courseId) {
        // Show success toast
        notifications.success("Novo curso criado com sucesso! 🎉 Redirecionando para edição...");
        
        // Small delay to ensure the user sees the loading state and toast
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        router.push(`/teacher/courses/${courseId}`, {
          scroll: false,
        });
      } else {
        notifications.error("Erro ao obter ID do curso criado. Recarregando página...");
        window.location.reload();
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
        {filteredAndSortedCourses.length === 0 ? (
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
                {courses.filter(course => course.teacherId === user?.id).length === 0 
                  ? 'Comece criando seu primeiro curso'
                  : 'Tente ajustar seus filtros ou termo de pesquisa'
                }
              </p>
              <div className="flex gap-3">
                {courses.filter(course => course.teacherId === user?.id).length === 0 ? (
                  <Button 
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
              {filteredAndSortedCourses.map((course) => (
                <TeacherCourseCard
                  key={course.id}
                  course={course as any}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleViewCourse}
                  isOwner={course.teacherId === user?.id}
                  viewMode={viewMode}
                />
              ))}
            </div>
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

export default TeacherCoursesPage;
