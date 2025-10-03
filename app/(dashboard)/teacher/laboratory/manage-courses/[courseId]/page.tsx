"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";
import { 
  ChevronLeft,
  Edit,
  Settings,
  AlertCircle,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
  Globe,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  Play,
  Download,
  Share2,
  Send,
  FileEdit,
  Trash2,
  CheckCircle,
  X,
  AlertTriangle
} from "lucide-react";
import { 
  useDeleteTeacherCourseMutation, 
  usePublishTeacherCourseMutation, 
  useGetPracticeCourseByIdQuery 
} from "@/src/domains/teacher/practice-courses/api";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  course_type?: string;
  template?: string;
  image?: string;
  teacherName?: string;
  units?: number;
  lessons?: number;
  challenges?: number;
  students?: number;
  completionRate?: number;
  lastUpdated: string;
  createdAt: string;
  teacher?: {
    id: string;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

const ManageCourseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { isAuthenticated } = useDjangoAuth();
  
  // Redux hooks for data fetching and mutations
  const { data: course, isLoading, error } = useGetPracticeCourseByIdQuery(courseId);
  const [deleteCourse] = useDeleteTeacherCourseMutation();
  const [publishCourse] = usePublishTeacherCourseMutation();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Redux handles data fetching automatically, so we can remove the loadCourse function
  useEffect(() => {
    if (error) {
      showToast('Erro ao carregar dados do curso. Verifique se o curso existe.', 'error');
    }
  }, [error]);

  // Toast functions
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    
    setIsProcessing(true);
    try {
      await deleteCourse(course.id).unwrap();
      setShowDeleteDialog(false);
      showToast('Curso excluído com sucesso!', 'success');
      // Redirect back to courses list after successful deletion
      setTimeout(() => {
        router.push('/teacher/laboratory/manage-courses');
      }, 1500);
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast('Erro ao excluir curso. Tente novamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishCourse = async () => {
    if (!course) return;
    
    const isPublishing = course.status.toLowerCase() === 'draft';
    
    // Validate action
    if (isPublishing && course.status.toLowerCase() !== 'draft') {
      showToast('Curso já está publicado!', 'error');
      return;
    }
    
    if (!isPublishing && course.status.toLowerCase() !== 'published') {
      showToast('Curso já está em rascunho!', 'error');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await publishCourse({ courseId: course.id, publish: isPublishing }).unwrap();
      // Redux automatically updates the course data
      setShowPublishDialog(false);
      showToast(
        `Curso ${isPublishing ? 'publicado' : 'despublicado'} com sucesso!`, 
        'success'
      );
    } catch (error) {
      console.error(`Error ${isPublishing ? 'publishing' : 'unpublishing'} course:`, error);
      
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('já está em rascunho')) {
        showToast('Curso já está em rascunho!', 'error');
        // Redux automatically syncs data
      } else if (errorMessage.includes('já está publicado')) {
        showToast('Curso já está publicado!', 'error');
        // Redux automatically syncs data
      } else {
        showToast(
          `Erro ao ${isPublishing ? 'publicar' : 'despublicar'} curso: ${errorMessage}`, 
          'error'
        );
      }
    } finally {
      setIsProcessing(false);
      setShowPublishDialog(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (!category) return BookOpen;
    switch (category.toLowerCase()) {
      case 'general': return Globe;
      case 'business': return Briefcase;
      case 'technology': return Code;
      case 'medicine': return Stethoscope;
      case 'legal': return Scale;
      default: return BookOpen;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-violet-100 text-violet-700 border-violet-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Curso não encontrado</h2>
          <p className="text-gray-400 mb-4">O curso que você está tentando visualizar não existe ou foi removido.</p>
          <Button onClick={() => router.push('/teacher/laboratory/manage-courses')}>
            Voltar aos Cursos
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(course.category);

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-6"
      >
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost"
              onClick={() => router.push('/teacher/laboratory/manage-courses')}
              className="text-gray-400 hover:text-white hover:bg-violet-600/20 transition-all text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar aos Cursos
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push(`/teacher/laboratory/edit-course/${courseId}`)}
                className="border-violet-500/30 text-gray-400 hover:text-white hover:bg-violet-800/20 text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 text-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <CategoryIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
                <Badge className={getStatusColor(course.status)}>
                  {getStatusText(course.status)}
                </Badge>
              </div>
              <p className="text-base text-gray-300 mb-2">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Criado: {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Atualizado: {new Date(course.lastUpdated).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6 text-center">
              <BookOpen className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{course.units}</div>
              <div className="text-sm text-gray-400">Unidades</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{course.lessons}</div>
              <div className="text-sm text-gray-400">Lições</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{course.students}</div>
              <div className="text-sm text-gray-400">Estudantes</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-6 text-center">
              <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{course.completionRate}%</div>
              <div className="text-sm text-gray-400">Taxa de Conclusão</div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Progress */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-violet-400" />
                Performance dos Estudantes
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Taxa Média de Conclusão</span>
                    <span className="text-sm font-medium text-white">{course.completionRate}%</span>
                  </div>
                  <Progress value={course.completionRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">32</div>
                    <div className="text-xs text-gray-400">Concluíram</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">13</div>
                    <div className="text-xs text-gray-400">Em Progresso</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-violet-400" />
                Ações Rápidas
              </h2>
              
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start bg-violet-600 hover:bg-violet-700 border border-violet-500 text-white transition-all duration-200 shadow-lg"
                  onClick={() => router.push(`/teacher/laboratory/edit-course/${courseId}`)}
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Editar Conteúdo do Curso
                </Button>
                
                {/* Publish/Unpublish Button */}
                <Button 
                  onClick={() => {
                    console.log('🔍 Button click debug:', {
                      courseStatus: course.status,
                      isDraft: course.status === 'draft',
                      courseId: course.id
                    });
                    setShowPublishDialog(true);
                  }}
                  className={`w-full justify-start border text-white transition-all duration-200 shadow-lg ${
                    course.status.toLowerCase() === 'draft' 
                      ? "bg-green-600 hover:bg-green-700 border-green-500"
                      : "bg-yellow-600 hover:bg-yellow-700 border-yellow-500"
                  }`}
                >
                  {(() => {
                    console.log('🔍 RENDER BUTTON:', {
                      status: course.status,
                      isDraft: course.status.toLowerCase() === 'draft',
                      comparison: `"${course.status.toLowerCase()}" === "draft"`,
                      result: course.status.toLowerCase() === 'draft'
                    });
                    return course.status.toLowerCase() === 'draft' ? (
                      <>
                        <Send className="h-4 w-4 mr-3" />
                        Publicar Curso
                      </>
                    ) : (
                      <>
                        <FileEdit className="h-4 w-4 mr-3" />
                        Despublicar Curso
                      </>
                    );
                  })()}
                </Button>
                
                <Button 
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white transition-all duration-200 shadow-lg"
                >
                  <Play className="h-4 w-4 mr-3" />
                  Visualizar como Estudante
                </Button>
                
                <Button 
                  className="w-full justify-start bg-purple-600 hover:bg-purple-700 border border-purple-500 text-white transition-all duration-200 shadow-lg"
                >
                  <Download className="h-4 w-4 mr-3" />
                  Exportar Relatório
                </Button>
                
                <Button 
                  className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 text-white transition-all duration-200 shadow-lg"
                >
                  <Share2 className="h-4 w-4 mr-3" />
                  Compartilhar Curso
                </Button>

                {/* Delete Button */}
                <div className="pt-2 border-t border-gray-600/50">
                  <Button 
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full justify-start bg-red-600 hover:bg-red-700 border border-red-500 text-white transition-all duration-200 shadow-lg"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Excluir Curso
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Course Details */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Informações Detalhadas do Curso</h2>
            
            {/* Basic Course Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-sm font-medium text-blue-400 mb-2">Categoria</h3>
                <p className="text-white font-semibold">{course.category}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                <h3 className="text-sm font-medium text-green-400 mb-2">Nível</h3>
                <p className="text-white font-semibold">{course.level}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-400 mb-2">Tipo</h3>
                <p className="text-white font-semibold">{course.course_type === 'practice' ? 'Laboratório' : 'Vídeo'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                <h3 className="text-sm font-medium text-orange-400 mb-2">Template</h3>
                <p className="text-white font-semibold capitalize">{course.template}</p>
              </div>
            </div>

            {/* Content Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-6 border border-violet-500/20 text-center">
                <BookOpen className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">{course.units || 0}</div>
                <div className="text-sm text-violet-300">Unidades Criadas</div>
                <div className="text-xs text-gray-400 mt-1">Módulos organizacionais</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20 text-center">
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">{course.lessons || 0}</div>
                <div className="text-sm text-blue-300">Lições Disponíveis</div>
                <div className="text-xs text-gray-400 mt-1">Conteúdo educacional</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">{course.challenges || 0}</div>
                <div className="text-sm text-green-300">Desafios Criados</div>
                <div className="text-xs text-gray-400 mt-1">Exercícios práticos</div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Teacher Information */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-xl p-6 border border-indigo-500/20">
                <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Informações do Professor
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-400">Nome:</span>
                    <p className="text-white font-medium">{course.teacherName || 'Não definido'}</p>
                  </div>
                  {course.teacher && (
                    <>
                      <div>
                        <span className="text-sm text-gray-400">Email:</span>
                        <p className="text-white font-medium">{course.teacher.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Username:</span>
                        <p className="text-white font-medium">@{course.teacher.username}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Course Statistics */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-6 border border-emerald-500/20">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Estatísticas do Curso
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Estudantes:</span>
                    <span className="text-white font-bold">{course.students || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Taxa de Conclusão:</span>
                    <span className="text-white font-bold">{course.completionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Status:</span>
                    <Badge className={getStatusColor(course.status)}>
                      {getStatusText(course.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Description */}
            {course.description && (
              <div className="mt-6 bg-gradient-to-br from-gray-500/10 to-slate-500/10 rounded-xl p-6 border border-gray-500/20">
                <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Descrição do Curso
                </h3>
                <p className="text-gray-300 leading-relaxed">{course.description}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-customgreys-secondarybg border-red-900/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Tem certeza que deseja excluir o curso <strong>"{course?.title}"</strong>?
              <br />
              <span className="text-red-400 text-sm">Esta ação não pode ser desfeita e você será redirecionado para a lista de cursos.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isProcessing}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteCourse}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Excluindo...
                </div>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish/Unpublish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="bg-customgreys-secondarybg border-violet-900/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-400">
              {course?.status.toLowerCase() === 'draft' ? (
                <>
                  <Send className="w-5 h-5" />
                  Publicar Curso
                </>
              ) : (
                <>
                  <FileEdit className="w-5 h-5" />
                  Despublicar Curso
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {course?.status.toLowerCase() === 'draft' ? (
                <>
                  Tem certeza que deseja publicar o curso <strong>"{course?.title}"</strong>?
                  <br />
                  <span className="text-green-400 text-sm">O curso ficará visível para todos os alunos.</span>
                </>
              ) : (
                <>
                  Tem certeza que deseja despublicar o curso <strong>"{course?.title}"</strong>?
                  <br />
                  <span className="text-yellow-400 text-sm">O curso será movido para rascunho e não ficará mais visível para os alunos.</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
              disabled={isProcessing}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePublishCourse}
              disabled={isProcessing}
              className={course?.status.toLowerCase() === 'draft' 
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {course?.status.toLowerCase() === 'draft' ? 'Publicando...' : 'Despublicando...'}
                </div>
              ) : (
                <>
                  {course?.status.toLowerCase() === 'draft' ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publicar
                    </>
                  ) : (
                    <>
                      <FileEdit className="w-4 h-4 mr-2" />
                      Despublicar
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm max-w-md ${
            toast.type === 'success' 
              ? 'bg-green-900/90 border-green-500/30 text-green-100'
              : 'bg-red-900/90 border-red-500/30 text-red-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {toast.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToast(null)}
                className="h-auto p-1 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageCourseDetailPage;