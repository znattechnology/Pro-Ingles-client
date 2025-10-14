"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { 
  useGetTeacherCourseByIdQuery,
  useDeleteTeacherVideoCourseMutation,
  usePublishVideoCourseMutation,
  useGetCourseSectionsQuery,
  useGetVideoEnrollmentsQuery
} from "@/src/domains/teacher/video-courses/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";
import { 
  Eye, 
  Edit,
  Trash2,
  Globe,
  Lock,
  Calendar,
  User,
  Users,
  BookOpen,
  Play,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  List,
  AlertTriangle,
  Send,
  FileEdit,
  X
} from "lucide-react";
import { notifications } from "@/lib/toast";

const VideoCoursePage = () => {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  
  const { isAuthenticated, user } = useDjangoAuth();
  const { data: course, isLoading, error } = useGetTeacherCourseByIdQuery(courseId);
  const { data: enrollments, isLoading: enrollmentsLoading } = useGetVideoEnrollmentsQuery(courseId);
  const { data: sections, isLoading: sectionsLoading } = useGetCourseSectionsQuery(courseId);
  const [deleteCourse] = useDeleteTeacherVideoCourseMutation();
  const [publishCourse] = usePublishVideoCourseMutation();
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishModalType, setPublishModalType] = useState<'normal' | 'with_students'>('normal');
  const [deleteModalType, setDeleteModalType] = useState<'normal' | 'blocked'>('normal');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Toast functions
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Get number of enrolled students
  const enrolledStudentsCount = enrollments?.length || course?.total_enrollments || 0;

  // Handle publish button click with ethical verification
  const handlePublishButtonClick = () => {
    if (!course) return;
    
    const isCurrentlyPublished = course.status === 'Published';
    
    // If trying to unpublish (despublicar) and has students, show special modal
    if (isCurrentlyPublished && enrolledStudentsCount > 0) {
      setPublishModalType('with_students');
    } else {
      setPublishModalType('normal');
    }
    
    setShowPublishModal(true);
  };

  // Handle delete button click with ethical verification
  const handleDeleteButtonClick = () => {
    if (!course) return;
    
    // If course has enrolled students, block deletion
    if (enrolledStudentsCount > 0) {
      setDeleteModalType('blocked');
    } else {
      setDeleteModalType('normal');
    }
    
    setShowDeleteModal(true);
  };

  const handlePublishToggle = async () => {
    if (!course) return;
    
    setIsPublishing(true);
    setShowPublishModal(false);
    
    try {
      const isCurrentlyPublished = course.status === 'Published';
      
      if (isCurrentlyPublished && enrolledStudentsCount > 0 && publishModalType === 'with_students') {
        // Ethical approach: Close for new enrollments instead of unpublishing
        // For now, we'll use Draft status but in the future we could implement "Closed" status
        await publishCourse({ courseId, publish: false }).unwrap();
        showToast(
          `🔒 Curso fechado para novas inscrições! ${enrolledStudentsCount} estudante${enrolledStudentsCount > 1 ? 's' : ''} matriculado${enrolledStudentsCount > 1 ? 's' : ''} mantêm acesso.`,
          'success'
        );
      } else {
        // Normal publish/unpublish flow
        const newStatus = isCurrentlyPublished ? false : true;
        await publishCourse({ courseId, publish: newStatus }).unwrap();
        
        showToast(
          newStatus ? '🌟 Curso publicado com sucesso!' : '📝 Curso despublicado com sucesso!',
          'success'
        );
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      showToast('❌ Erro ao alterar status do curso. Tente novamente.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = () => {
    router.push(`/teacher/courses/${courseId}`);
  };

  const handleGoBack = () => {
    router.push('/teacher/courses');
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    
    setIsDeleting(true);
    setShowDeleteModal(false); // Fechar modal imediatamente
    
    try {
      await deleteCourse(courseId).unwrap();
      
      notifications.success('🗑️ Curso deletado com sucesso!');
      
      // Redirecionar para página de listagem
      router.push('/teacher/courses');
      
      // Resetar loading após redirecionamento
      setIsDeleting(false);
      
    } catch (error) {
      console.error('❌ Erro ao deletar curso:', error);
      notifications.error('❌ Erro ao deletar curso. Tente novamente.');
      setIsDeleting(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getChapterIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return Video;
      case 'text':
        return FileText;
      default:
        return FileText;
    }
  };

  // Se está deletando, mostrar loading animado
  if (isDeleting) {
    return <Loading />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <Card className="bg-customgreys-secondarybg border-red-500/30 max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Curso não encontrado</h2>
            <p className="text-gray-400 mb-4">
              O curso que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={handleGoBack} className="bg-violet-600 hover:bg-violet-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Cursos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <Card className="bg-customgreys-secondarybg border-violet-900/30 max-w-md">
          <CardContent className="p-6 text-center">
            <Lock className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Acesso Restrito</h2>
            <p className="text-gray-400 mb-4">
              Faça login para visualizar este curso.
            </p>
            <Button onClick={() => router.push('/signin')} className="bg-violet-600 hover:bg-violet-700">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPublished = course.status === 'Published';
  const statusColor = isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400';
  const statusIcon = isPublished ? Globe : Lock;

  return (
    <div className="min-h-screen bg-customgreys-primarybg relative">
      {/* Header */}
      <div className="bg-customgreys-secondarybg border-b border-violet-900/30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                <p className="text-gray-400 mt-1">Visualização do Curso</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={statusColor}>
                {React.createElement(statusIcon, { className: "w-4 h-4 mr-1" })}
                {isPublished ? 'Publicado' : 'Rascunho'}
              </Badge>
              
              <Button
                onClick={handleEdit}
                variant="outline"
                className="bg-customgreys-darkGrey border-violet-900/30 text-white hover:bg-violet-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              
              <Button
                onClick={handlePublishButtonClick}
                disabled={isPublishing || enrollmentsLoading}
                className={isPublished 
                  ? "bg-yellow-600 hover:bg-yellow-700" 
                  : "bg-green-600 hover:bg-green-700"
                }
              >
                {isPublishing ? (
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                ) : isPublished ? (
                  <Lock className="w-4 h-4 mr-2" />
                ) : (
                  <Globe className="w-4 h-4 mr-2" />
                )}
                {isPublishing 
                  ? 'Alterando...' 
                  : (isPublished ? 'Despublicar' : 'Publicar')
                }
              </Button>

              <Button
                onClick={handleDeleteButtonClick}
                disabled={isDeleting}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Course Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Details Card */}
            <Card className="bg-customgreys-secondarybg border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Informações do Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {course.description || 'Nenhuma descrição disponível.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-600">
                  <div>
                    <p className="text-sm text-gray-400">Categoria</p>
                    <p className="text-white">{course.category || 'Não especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Nível</p>
                    <p className="text-white">{course.level || 'Não especificado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Structure */}
            <Card className="bg-customgreys-secondarybg border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Estrutura do Curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-violet-600/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-violet-400">
                      {sections?.length || course.total_sections || 0}
                    </div>
                    <div className="text-sm text-gray-400">Seções</div>
                  </div>
                  <div className="bg-blue-600/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">
                      {sections?.reduce((total, section) => total + (section.chapters?.length || 0), 0) || course.total_chapters || 0}
                    </div>
                    <div className="text-sm text-gray-400">Capítulos</div>
                  </div>
                  <div className="bg-green-600/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">
                      {course.total_enrollments || 0}
                    </div>
                    <div className="text-sm text-gray-400">Alunos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            {sectionsLoading ? (
              <Card className="bg-customgreys-secondarybg border-violet-900/30">
                <CardContent className="p-6 text-center">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-400">Carregando conteúdo...</p>
                </CardContent>
              </Card>
            ) : sections && sections.length > 0 ? (
              <Card className="bg-customgreys-secondarybg border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Conteúdo do Curso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sections.map((section, sectionIndex) => {
                    const isExpanded = expandedSections.has(section.sectionId);
                    return (
                      <div key={section.sectionId} className="border border-gray-600 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSection(section.sectionId)}
                          className="w-full p-4 bg-customgreys-darkGrey/50 hover:bg-customgreys-darkGrey/70 transition-colors flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-violet-600/20 rounded-full flex items-center justify-center text-violet-400 font-semibold text-sm">
                              {sectionIndex + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{section.sectionTitle}</h4>
                              {section.sectionDescription && (
                                <p className="text-sm text-gray-400 mt-1">{section.sectionDescription}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {section.chapters?.length || 0} capítulo{(section.chapters?.length || 0) !== 1 ? 's' : ''}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        {isExpanded && section.chapters && section.chapters.length > 0 && (
                          <div className="border-t border-gray-600">
                            {section.chapters.map((chapter) => {
                              const ChapterIcon = getChapterIcon(chapter.type);
                              return (
                                <div
                                  key={chapter.chapterId}
                                  className="p-4 bg-customgreys-primarybg/30 border-b border-gray-700 last:border-b-0 flex items-center gap-3"
                                >
                                  <div className="w-6 h-6 bg-blue-600/20 rounded flex items-center justify-center">
                                    <ChapterIcon className="w-4 h-4 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-white font-medium">{chapter.chapterTitle}</h5>
                                    {chapter.content && (
                                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                        {chapter.content.length > 100 
                                          ? `${chapter.content.substring(0, 100)}...`
                                          : chapter.content
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {chapter.type === 'video' ? '📹' : '📄'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {isExpanded && (!section.chapters || section.chapters.length === 0) && (
                          <div className="p-4 bg-customgreys-primarybg/30 border-t border-gray-600 text-center text-gray-400">
                            Nenhum capítulo adicionado ainda
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-customgreys-secondarybg border-violet-900/30">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-white mb-2">Nenhum conteúdo ainda</h3>
                  <p className="text-gray-400 mb-4">
                    Este curso ainda não possui seções ou capítulos. Use o editor para adicionar conteúdo.
                  </p>
                  <Button
                    onClick={handleEdit}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Adicionar Conteúdo
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Meta */}
            <Card className="bg-customgreys-secondarybg border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white text-sm">Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Professor</p>
                    <p className="text-white text-sm">{course.teacherName || user?.name || 'Nome não disponível'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Criado em</p>
                    <p className="text-white text-sm">
                      {course.created_at 
                        ? new Date(course.created_at).toLocaleDateString('pt-BR')
                        : 'Data não disponível'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <Badge className={`${statusColor} text-xs`}>
                      {isPublished ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-customgreys-secondarybg border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white text-sm">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleEdit}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Curso
                </Button>
                
                <Button
                  onClick={handlePublishButtonClick}
                  disabled={isPublishing || enrollmentsLoading}
                  className={`w-full ${isPublished 
                    ? "bg-yellow-600 hover:bg-yellow-700" 
                    : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  {isPublishing ? (
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : isPublished ? (
                    <Lock className="w-4 h-4 mr-2" />
                  ) : (
                    <Globe className="w-4 h-4 mr-2" />
                  )}
                  {isPublishing 
                    ? 'Alterando...' 
                    : (isPublished ? 'Despublicar' : 'Publicar')
                  }
                </Button>

                <Button
                  onClick={handleDeleteButtonClick}
                  disabled={isDeleting}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar Curso
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-customgreys-secondarybg border-red-500/30 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${deleteModalType === 'blocked' ? 'text-orange-400' : 'text-red-500'}`} />
                {deleteModalType === 'blocked' ? 'Deleção Bloqueada - Proteger Estudantes' : 'Confirmar Exclusão'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deleteModalType === 'blocked' ? (
                <div className="text-gray-300">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-orange-400" />
                      <span className="font-semibold text-orange-300">
                        {enrolledStudentsCount} estudante{enrolledStudentsCount > 1 ? 's' : ''} matriculado{enrolledStudentsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Este curso possui estudantes que dependem do acesso ao conteúdo.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong className="text-orange-300">🛡️ Proteção Ética:</strong>
                    </div>
                    <p className="text-sm text-gray-300">
                      Por razões éticas, não é possível deletar cursos com estudantes matriculados. 
                      Isso protege o investimento e progresso dos alunos.
                    </p>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm text-blue-300">
                        <strong>Alternativas:</strong>
                      </p>
                      <ul className="text-sm text-gray-300 mt-2 ml-4 space-y-1">
                        <li>• Despublicar o curso (fechar para novos alunos)</li>
                        <li>• Aguardar que todos os alunos concluam</li>
                        <li>• Editar o conteúdo em vez de deletar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-300">
                  <p className="mb-2">
                    Tem certeza que deseja deletar o curso <strong>"{course?.title}"</strong>?
                  </p>
                  <p className="text-red-400 text-sm">
                    ⚠️ Esta ação é <strong>irreversível</strong> e irá deletar:
                  </p>
                  <ul className="text-red-400 text-sm mt-2 ml-4 space-y-1">
                    <li>• Todas as seções e capítulos</li>
                    <li>• Todo o conteúdo do curso</li>
                    <li>• Progresso dos alunos matriculados</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  variant="outline"
                  className="flex-1 bg-customgreys-darkGrey border-gray-600 text-white hover:bg-gray-700"
                >
                  {deleteModalType === 'blocked' ? 'Entendi' : 'Cancelar'}
                </Button>
                {deleteModalType === 'normal' && (
                  <Button
                    onClick={handleDeleteCourse}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        Deletando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar Curso
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Publish/Unpublish Confirmation Dialog */}
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="bg-customgreys-secondarybg border-violet-900/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-400">
              {publishModalType === 'with_students' ? (
                <>
                  <Lock className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400">Proteger Estudantes Inscritos</span>
                </>
              ) : isPublished ? (
                <>
                  <FileEdit className="w-5 h-5" />
                  Despublicar Curso
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publicar Curso
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {publishModalType === 'with_students' ? (
                <>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-orange-400" />
                      <span className="font-semibold text-orange-300">
                        {enrolledStudentsCount} estudante{enrolledStudentsCount > 1 ? 's' : ''} matriculado{enrolledStudentsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Este curso possui estudantes que dependem do acesso ao conteúdo.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong className="text-orange-300">🛡️ Abordagem Ética:</strong>
                    </div>
                    <ul className="text-sm space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Estudantes atuais <strong>mantêm acesso completo</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>Novas inscrições serão <strong>bloqueadas</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Edit className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>Você pode continuar <strong>editando o conteúdo</strong></span>
                      </li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-4">
                    Deseja fechar este curso para novas inscrições, mantendo o acesso dos estudantes atuais?
                  </p>
                </>
              ) : isPublished ? (
                <>
                  Tem certeza que deseja despublicar o curso <strong>"{course?.title}"</strong>?
                  <br />
                  <span className="text-yellow-400 text-sm">O curso será movido para rascunho.</span>
                </>
              ) : (
                <>
                  Tem certeza que deseja publicar o curso <strong>"{course?.title}"</strong>?
                  <br />
                  <span className="text-green-400 text-sm">O curso ficará visível para todos os alunos.</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPublishModal(false)}
              disabled={isPublishing}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePublishToggle}
              disabled={isPublishing}
              className={
                publishModalType === 'with_students' 
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : isPublished 
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {isPublishing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {publishModalType === 'with_students' 
                    ? 'Fechando...' 
                    : isPublished 
                      ? 'Despublicando...' 
                      : 'Publicando...'
                  }
                </div>
              ) : (
                <>
                  {publishModalType === 'with_students' ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Fechar para Novos
                    </>
                  ) : isPublished ? (
                    <>
                      <FileEdit className="w-4 h-4 mr-2" />
                      Despublicar
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publicar
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

export default VideoCoursePage;