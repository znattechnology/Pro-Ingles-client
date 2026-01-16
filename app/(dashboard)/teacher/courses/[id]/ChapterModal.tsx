import { CustomFormField } from "@/components/course/CustomFormField";
import CustomModal from "@/components/course/CustomModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ChapterFormData, chapterSchema } from "@/lib/schemas";
import { addChapter, closeChapterModal, editChapter } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { 
  useGetVideoUploadUrlMutation,
  useGetAllTeacherCoursesQuery,
  CourseChapter as TeacherChapter,
  // TODO: Re-enable when implementing CRUD operations
  // useCreateChapterMutation,
  // useUpdateChapterMutation,
  // useDeleteChapterMutation,
} from "@/src/domains/teacher/video-courses/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, BookOpen, FileText, Brain, Plus, Trash2, ExternalLink, Upload, Zap, Target, CheckCircle, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const ChapterModal = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const courseId = params.id as string;
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const {
    isChapterModalOpen,
    selectedSectionIndex,
    selectedChapterIndex,
    sections,
  } = useAppSelector((state) => state.global.courseEditor);

  const chapter: TeacherChapter | undefined =
    selectedSectionIndex !== null && selectedChapterIndex !== null
      ? sections[selectedSectionIndex].chapters[selectedChapterIndex]
      : undefined;

  // API hooks from teacher video course API
  const [getVideoUploadUrl] = useGetVideoUploadUrlMutation();
  // TODO: Implement chapter CRUD operations
  // const [createChapter] = useCreateChapterMutation();
  // const [updateChapter] = useUpdateChapterMutation();
  // const [deleteChapter] = useDeleteChapterMutation();
  
  // Video courses API from teacher (direct import)
  const { 
    data: coursesResponse, 
    isLoading: exercisesLoading,
    error: exercisesError 
  } = useGetAllTeacherCoursesQuery({ category: "all" });
  
  const teacherCourses = coursesResponse?.data || [];

  // Temporary mock variables for removed functionality
  const existingResources: any[] = [];
  const resourcesLoading = false;
  const existingQuiz: any = undefined;
  const quizLoading = false;
  const createResource = () => {};
  const createQuiz = () => {};
  const deleteQuiz = () => {};

  const methods = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      content: "",
      video: "",
      transcript: "",
      quiz_enabled: false,
      resources_data: [],
      practice_lesson: "",
      quiz_data: {
        title: "",
        description: "",
        practice_lesson: "",
        points_reward: 15,
        hearts_cost: 1,
        passing_score: 80,
        max_attempts: 3,
        is_active: true,
      },
    },
  });

  // Field arrays for dynamic resources
  const { fields: resourceFields, append: addResource, remove: removeResource } = useFieldArray({
    control: methods.control,
    name: "resources_data"
  });

  useEffect(() => {
    const loadChapterData = async () => {
      if (!isChapterModalOpen) return;
      
      setIsLoadingExistingData(true);
      
      try {
        if (chapter) {
          // Load existing chapter data
          const formData = {
            title: chapter.title,
            content: chapter.content,
            video: chapter.video || "",
            transcript: chapter.transcript || "",
            quiz_enabled: false, // Will be updated below if quiz exists
            resources_data: [],   // Will be loaded from API
            practice_lesson: chapter.practice_lesson || "",
            quiz_data: undefined,
          };

          // Load resources from API if chapter exists
          if (existingResources?.data && !resourcesLoading) {
            formData.resources_data = existingResources.data.map(resource => ({
              id: resource.id,
              title: resource.title,
              description: resource.description || "",
              resource_type: resource.resource_type,
              external_url: resource.external_url || "",
              order: resource.order || 0,
              is_featured: resource.is_featured || false,
            }));
          }

          // Load quiz from API if chapter exists and has quiz
          if (existingQuiz?.data && !quizLoading) {
            formData.quiz_enabled = true;
            formData.practice_lesson = existingQuiz.data.practice_lesson;
            formData.quiz_data = {
              id: existingQuiz.data.id,
              title: existingQuiz.data.title,
              description: existingQuiz.data.description || "",
              practice_lesson: existingQuiz.data.practice_lesson,
              points_reward: existingQuiz.data.points_reward || 15,
              hearts_cost: existingQuiz.data.hearts_cost || 1,
              passing_score: existingQuiz.data.passing_score || 80,
              time_limit: existingQuiz.data.time_limit,
              max_attempts: existingQuiz.data.max_attempts || 3,
              is_active: existingQuiz.data.is_active !== false,
            };
          }

          methods.reset(formData);
        } else {
          // New chapter
          methods.reset({
            title: "",
            content: "",
            video: "",
            transcript: "",
            quiz_enabled: false,
            resources_data: [],
            practice_lesson: "",
          });
        }
      } catch (error) {
        console.error('Error loading chapter data:', error);
        toast.error('Erro ao carregar dados do capítulo');
      } finally {
        setIsLoadingExistingData(false);
      }
    };

    loadChapterData();
  }, [chapter, existingResources, existingQuiz, resourcesLoading, quizLoading, isChapterModalOpen, methods]);

  const onClose = () => {
    dispatch(closeChapterModal());
  };

  const onSubmit = async (data: ChapterFormData) => {
    console.log('🔥 Form submitted with data:', data);
    if (selectedSectionIndex === null) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Filter out empty resources before processing
      const filteredResources = data.resources_data?.filter(resource => 
        resource.title && resource.title.trim() !== ""
      ) || [];
      
      data.resources_data = filteredResources;

      // Clear quiz data if quiz is not enabled
      if (!data.quiz_enabled) {
        data.quiz_data = undefined;
        data.practice_lesson = "";
      }

      // Handle video upload if there's a new video file
      let finalVideoUrl = data.video;
      if (data.video instanceof File && selectedSectionIndex !== null) {
        const currentSection = sections[selectedSectionIndex];
        const sectionId = currentSection?.sectionId;
        const chapterId = chapter?.chapterId || uuidv4();
        
        if (courseId && sectionId) {
          try {
            finalVideoUrl = await uploadVideoToS3(data.video, courseId, sectionId, chapterId);
          } catch (error) {
            // If video upload fails, we still create the chapter but without video
            console.error('Video upload failed, creating chapter without video:', error);
            finalVideoUrl = undefined;
          }
        }
      }

      // Determine chapter type based on content
      let chapterType: "Text" | "Quiz" | "Video" | "Exercise" = "Text";
      if (finalVideoUrl) chapterType = "Video";
      if (data.quiz_enabled) chapterType = "Quiz";
      if (data.practice_lesson && data.practice_lesson.trim() !== "") chapterType = "Exercise";

      const newChapter: Chapter = {
        chapterId: chapter?.chapterId || uuidv4(),
        title: data.title,
        content: data.content,
        type: chapterType,
        video: finalVideoUrl,
        
        // 🆕 PHASE 1 BRIDGE - Include new fields
        transcript: data.transcript,
        quiz_enabled: data.quiz_enabled,
        resources_data: data.resources_data,
        practice_lesson: data.practice_lesson,
      };

      // Update the chapter in Redux state first
      if (selectedChapterIndex === null) {
        dispatch(
          addChapter({
            sectionIndex: selectedSectionIndex,
            chapter: newChapter,
          })
        );
      } else {
        dispatch(
          editChapter({
            sectionIndex: selectedSectionIndex,
            chapterIndex: selectedChapterIndex,
            chapter: newChapter,
          })
        );
      }

      // If editing existing chapter, handle API calls for resources and quiz
      if (chapter?.chapterId) {
        // Handle resources
        if (data.resources_data && data.resources_data.length > 0) {
          for (const resource of data.resources_data) {
            if (!resource.id) {
              // New resource - create it
              try {
                await createResource({
                  chapterId: chapter.chapterId,
                  resource: {
                    title: resource.title,
                    description: resource.description || "",
                    resource_type: resource.resource_type,
                    external_url: resource.external_url || "",
                    order: resource.order || 0,
                    is_featured: resource.is_featured || false,
                  }
                }).unwrap();
              } catch (error) {
                console.error('Error creating resource:', error);
                toast.error(`Erro ao criar recurso: ${resource.title}`);
              }
            }
          }
        }

        // Handle quiz
        if (data.quiz_enabled && data.quiz_data && data.practice_lesson) {
          try {
            if (existingQuiz?.data) {
              // Quiz already exists - would need update endpoint
              console.log('Quiz update not implemented yet');
            } else {
              // Create new quiz
              await createQuiz({
                chapterId: chapter.chapterId,
                quiz: {
                  title: data.quiz_data.title,
                  description: data.quiz_data.description || "",
                  practice_lesson: data.practice_lesson,
                  points_reward: data.quiz_data.points_reward || 15,
                  hearts_cost: data.quiz_data.hearts_cost || 1,
                  passing_score: data.quiz_data.passing_score || 80,
                  time_limit: data.quiz_data.time_limit,
                  max_attempts: data.quiz_data.max_attempts || 3,
                  is_active: data.quiz_data.is_active !== false,
                }
              }).unwrap();
            }
          } catch (error) {
            console.error('Error creating quiz:', error);
            toast.error('Erro ao criar quiz interativo');
          }
        } else if (!data.quiz_enabled && existingQuiz?.data) {
          // Delete existing quiz if disabled
          try {
            await deleteQuiz({
              chapterId: chapter.chapterId,
              quizId: existingQuiz.data.id!
            }).unwrap();
          } catch (error) {
            console.error('Error deleting quiz:', error);
            toast.error('Erro ao remover quiz');
          }
        }
      }

      // Success message with better feedback
      const resourcesText = data.resources_data && data.resources_data.length > 0 
        ? `e ${data.resources_data.length} recurso(s) ` 
        : '';
      const quizText = data.quiz_enabled ? 'com quiz interativo ' : '';
      
      toast.success(
        `Capítulo ${quizText}${resourcesText}${chapter ? 'atualizado' : 'criado'} com sucesso! Não esqueça de guardar o curso.`
      );
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      onClose();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error('Erro ao salvar capítulo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const onError = (errors: any) => {
    console.log('🚨 Form validation errors:', errors);
    toast.error('Por favor, corrija os erros no formulário');
  };

  // Helper function to upload video to S3
  const uploadVideoToS3 = async (videoFile: File, courseId: string, sectionId: string, chapterId: string): Promise<string> => {
    try {
      console.log('🎬 Starting video upload...', { videoFile: videoFile.name });
      setUploadProgress(10);
      
      const uploadPayload = {
        courseId,
        sectionId, 
        chapterId,
        fileName: videoFile.name,
        fileType: videoFile.type
      };
      
      console.log('📤 Sending payload:', uploadPayload);
      
      // Get presigned URL from Django backend
      const uploadResponse = await getVideoUploadUrl(uploadPayload).unwrap();

      console.log('✅ Got presigned URL:', uploadResponse);
      console.log('📍 Request details:', {
        courseId, sectionId, chapterId, 
        fileName: videoFile.name, 
        fileType: videoFile.type
      });

      const { uploadUrl, videoUrl } = uploadResponse.data;
      setUploadProgress(30);

      // Upload file to S3 using presigned URL
      setUploadProgress(50);
      const uploadToS3Response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': videoFile.type,
        },
        body: videoFile,
      });
      setUploadProgress(80);

      if (!uploadToS3Response.ok) {
        throw new Error(`Upload failed with status: ${uploadToS3Response.status}`);
      }

      console.log('✅ Video uploaded to S3 successfully');
      setUploadProgress(100);
      toast.success(`Vídeo "${videoFile.name}" enviado com sucesso!`);

      return videoUrl;
    } catch (error: any) {
      console.error('❌ Video upload failed:', error);
      console.error('🔍 Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.data?.message
      });
      toast.error(`Erro ao fazer upload do vídeo: ${error?.data?.message || error?.message || 'Erro desconhecido'}`);
      throw error;
    }
  };

  // Helper functions for resources
  const handleAddResource = () => {
    addResource({
      title: "",
      resource_type: "PDF",
      description: "",
      order: resourceFields.length,
      is_featured: false,
    });
  };

  return (
    <CustomModal isOpen={isChapterModalOpen} onClose={onClose}>
      <div className="flex flex-col max-w-4xl mx-auto relative bg-customgreys-secondarybg border-customgreys-darkerGrey rounded-lg overflow-hidden">
        {/* Modern Header */}
        <div className="relative bg-customgreys-primarybg/40 backdrop-blur-sm border-b border-violet-900/30 p-6">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                {chapter ? (
                  <BookOpen className="w-5 h-5 text-white" />
                ) : (
                  <Plus className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  {chapter ? '✏️ Editar Capítulo' : '🎆 Criar Capítulo'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="hidden sm:block">Configure conteúdo, recursos e quizzes</span>
                  <span className="sm:hidden">Configure capítulo</span>
                  {(isLoadingExistingData || resourcesLoading || quizLoading) && (
                    <>
                      <span className="w-1 h-1 bg-violet-400 rounded-full animate-pulse"></span>
                      <span className="animate-pulse">Carregando...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              disabled={isSubmitting}
              className="group w-10 h-10 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-400/50 rounded-lg flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-white/70 group-hover:text-red-400 transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Loading State Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="bg-customgreys-secondarybg border border-violet-900/30 rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">
                    {uploadProgress > 0 ? 'Fazendo upload do vídeo...' : 'Salvando capítulo...'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {uploadProgress > 0 ? 'Aguarde enquanto processamos o vídeo' : 'Configurando recursos e quizzes'}
                  </p>
                </div>
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="w-full bg-violet-900/30 rounded-full h-2">
                      <div 
                        className="bg-violet-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${uploadProgress}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-violet-400">{uploadProgress}% concluído</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-4 lg:p-6 bg-customgreys-primarybg/40 backdrop-blur-sm">
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="space-y-4 lg:space-y-6">
            
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg p-1">
                  <TabsTrigger 
                    value="basic" 
                    className="flex items-center gap-1 lg:gap-2 text-gray-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white transition-all duration-200 rounded-lg text-xs lg:text-sm"
                  >
                    <BookOpen className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Básico</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="resources" 
                    className="flex items-center gap-1 lg:gap-2 text-gray-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white transition-all duration-200 rounded-lg text-xs lg:text-sm"
                  >
                    <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Recursos</span>
                    {resourceFields.length > 0 && (
                      <span className="ml-1 bg-blue-400 text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center text-white font-bold">
                        {resourceFields.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="quiz" 
                    className="flex items-center gap-1 lg:gap-2 text-gray-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white transition-all duration-200 rounded-lg text-xs lg:text-sm"
                  >
                    <Brain className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Quiz</span>
                    {methods.watch("quiz_enabled") && (
                      <span className="ml-1 bg-emerald-400 text-xs px-1.5 py-0.5 rounded-full w-4 h-4 flex items-center justify-center text-white font-bold">
                        ✓
                      </span>
                    )}
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="practice" 
                    className="flex items-center gap-1 lg:gap-2 text-gray-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white transition-all duration-200 rounded-lg text-xs lg:text-sm"
                  >
                    <Zap className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Lab</span>
                    {chapter?.practice_lesson && (
                      <span className="ml-1 bg-amber-400 text-xs px-1.5 py-0.5 rounded-full w-4 h-4 flex items-center justify-center text-white font-bold">
                        ✓
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

              {/* Tab Content - Básico */}
              <TabsContent value="basic" className="space-y-4">
                <CustomFormField
                  name="title"
                  label="Título do capítulo"
                  placeholder="Ex: Introdução aos Tempos Verbais"
                />

                <CustomFormField
                  name="content"
                  label="Conteúdo do capítulo"
                  type="textarea"
                  placeholder="Descreva o conteúdo principal do capítulo..."
                />

                <FormField
                  control={methods.control}
                  name="video"
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel className="text-white text-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Vídeo do capítulo (opcional)
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                            className="border-none bg-customgreys-darkGrey py-2 cursor-pointer text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-violet-600 file:text-white hover:file:bg-violet-700"
                          />
                          {typeof value === "string" && value && (
                            <div className="text-sm text-gray-400 bg-customgreys-darkGrey p-2 rounded">
                              📹 Vídeo atual: {value.split("/").pop()}
                            </div>
                          )}
                          {value instanceof File && (
                            <div className="text-sm text-green-400 bg-green-900/20 p-2 rounded">
                              📹 Novo arquivo: {value.name}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="transcript"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-sm">
                        Transcrição do vídeo (opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cole aqui a transcrição do vídeo para melhor acessibilidade..."
                          className="bg-customgreys-darkGrey border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Tab Content - Recursos */}
              <TabsContent value="resources" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Recursos do Capítulo</h3>
                  <Button
                    type="button"
                    onClick={handleAddResource}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Recurso
                  </Button>
                </div>

                {resourceFields.length === 0 ? (
                  <div className="text-center py-12 bg-customgreys-darkGrey/50 rounded-lg border-2 border-dashed border-gray-600">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Nenhum recurso adicionado</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Adicione PDFs, links, exercícios ou outros recursos para enriquecer o aprendizado
                    </p>
                    <Button
                      type="button"
                      onClick={handleAddResource}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Recurso
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resourceFields.map((field, index) => (
                      <div key={field.id} className="bg-customgreys-darkGrey p-4 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-white font-medium">Recurso #{index + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeResource(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={methods.control}
                            name={`resources_data.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white text-sm">Título</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Lista de Vocabulário"
                                    className="bg-customgreys-primarybg border-gray-600 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={methods.control}
                            name={`resources_data.${index}.resource_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white text-sm">Tipo</FormLabel>
                                <FormControl>
                                  <select
                                    className="w-full bg-customgreys-primarybg border border-gray-600 text-white rounded px-3 py-2"
                                    {...field}
                                  >
                                    <option value="PDF">📄 PDF</option>
                                    <option value="LINK">🔗 Link Externo</option>
                                    <option value="VIDEO">🎥 Vídeo</option>
                                    <option value="CODE">💻 Código</option>
                                    <option value="WORKSHEET">📝 Exercício</option>
                                    <option value="AUDIO">🔊 Áudio</option>
                                    <option value="IMAGE">🖼️ Imagem</option>
                                  </select>
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={methods.control}
                            name={`resources_data.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-white text-sm">Descrição</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Descreva este recurso..."
                                    className="bg-customgreys-primarybg border-gray-600 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={methods.control}
                            name={`resources_data.${index}.external_url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white text-sm">URL Externa</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <Input
                                      placeholder="https://exemplo.com"
                                      className="bg-customgreys-primarybg border-gray-600 text-white rounded-r-none"
                                      {...field}
                                    />
                                    {field.value && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-l-none border-l-0"
                                        onClick={() => window.open(field.value, '_blank')}
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={methods.control}
                            name={`resources_data.${index}.is_featured`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-3 bg-customgreys-primarybg">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-white text-sm">Recurso em Destaque</FormLabel>
                                  <p className="text-xs text-gray-400">
                                    Mostrar com prioridade na aba de recursos
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab Content - Quiz */}
              <TabsContent value="quiz" className="space-y-4">
                <FormField
                  control={methods.control}
                  name="quiz_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4 bg-customgreys-darkGrey">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white text-base font-medium">Quiz Interativo</FormLabel>
                        <p className="text-sm text-gray-400">
                          Ative um quiz gamificado para este capítulo conectado ao English Practice Lab
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {methods.watch("quiz_enabled") && (
                  <div className="space-y-4 bg-violet-900/20 p-6 rounded-lg border border-violet-600/30">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Configurações do Quiz
                    </h3>

                    <FormField
                      control={methods.control}
                      name="practice_lesson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-sm">Lição do English Practice Lab</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ID da lição no sistema English Practice Lab"
                              className="bg-customgreys-darkGrey border-gray-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-400">
                            Esta lição deve estar criada no English Practice Lab com os exercícios apropriados
                          </p>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={methods.control}
                        name="quiz_data.points_reward"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-sm">Pontos por Conclusão</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="15"
                                className="bg-customgreys-darkGrey border-gray-600 text-white"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={methods.control}
                        name="quiz_data.hearts_cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-sm">Corações por Erro</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="1"
                                className="bg-customgreys-darkGrey border-gray-600 text-white"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={methods.control}
                        name="quiz_data.passing_score"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-sm">Nota Mínima (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="80"
                                className="bg-customgreys-darkGrey border-gray-600 text-white"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={methods.control}
                        name="quiz_data.max_attempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-sm">Máximo de Tentativas</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="3"
                                className="bg-customgreys-darkGrey border-gray-600 text-white"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                        💡 Dica sobre Gamificação
                      </h4>
                      <p className="text-sm text-blue-200">
                        Os quizzes conectam-se ao sistema de pontos, corações e conquistas do English Practice Lab, 
                        motivando os estudantes através da gamificação e acompanhamento de progresso.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* 🎮 TAB CONTENT - PRACTICE LAB */}
              <TabsContent value="practice" className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-500/20 rounded-lg p-3">
                      <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                        Exercício do English Practice Lab
                        {methods.watch("practice_lesson") ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-500 rounded-full" />
                        )}
                      </h3>
                      
                      <p className="text-gray-300 text-sm mb-4">
                        Selecione um exercício específico do English Practice Lab para este capítulo. 
                        Os estudantes responderão diretamente na interface do curso.
                      </p>
                      
                      {/* Seletor de Exercício */}
                      <div className="space-y-4">
                        <FormField
                          control={methods.control}
                          name="practice_lesson"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white text-sm">Exercício do Laboratory</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full bg-customgreys-darkGrey border border-gray-600 text-white rounded px-3 py-2"
                                  {...field}
                                  value={field.value || ""}
                                  disabled={exercisesLoading}
                                >
                                  <option value="">
                                    {exercisesLoading ? 'Carregando exercícios...' : 'Selecione um exercício...'}
                                  </option>
                                  
                                  {exercisesError && (
                                    <option disabled>Erro ao carregar exercícios</option>
                                  )}
                                  
                                  {teacherCourses?.map((course: any) => (
                                    <optgroup key={course.id} label={`${course.category_icon || '📚'} ${course.title}`}>
                                      {course.units?.map((unit: any) => 
                                        unit.lessons?.map((lesson: any) => 
                                          lesson.challenges?.map((challenge: any) => (
                                            <option 
                                              key={challenge.id} 
                                              value={challenge.id}
                                            >
                                              {lesson.title} → {challenge.title}
                                            </option>
                                          ))
                                        )
                                      )}
                                    </optgroup>
                                  ))}
                                  
                                  {/* Fallback options if no data */}
                                  {!exercisesLoading && !teacherCourses?.length && (
                                    <>
                                      <optgroup label="🛢️ Inglês para Petróleo & Gás">
                                        <option value="oil-gas-unit-1-lesson-1-challenge-1">Lesson 1 → Challenge 1: Oil Drilling Vocabulary</option>
                                        <option value="oil-gas-unit-1-lesson-1-challenge-2">Lesson 1 → Challenge 2: Safety Procedures</option>
                                      </optgroup>
                                      <optgroup label="🏦 Inglês Bancário">
                                        <option value="banking-unit-1-lesson-1-challenge-1">Lesson 1 → Challenge 1: Financial Terms</option>
                                        <option value="banking-unit-1-lesson-2-challenge-1">Lesson 2 → Challenge 1: Investment Vocabulary</option>
                                      </optgroup>
                                      <optgroup label="💻 Inglês para TI & Telecomunicações">
                                        <option value="tech-unit-1-lesson-1-challenge-1">Lesson 1 → Challenge 1: Programming Terms</option>
                                        <option value="tech-unit-1-lesson-2-challenge-1">Lesson 2 → Challenge 1: Software Development</option>
                                      </optgroup>
                                      <optgroup label="👔 Inglês Executivo">
                                        <option value="executive-unit-1-lesson-1-challenge-1">Lesson 1 → Challenge 1: Business Meetings</option>
                                        <option value="executive-unit-1-lesson-2-challenge-1">Lesson 2 → Challenge 1: Negotiations</option>
                                      </optgroup>
                                    </>
                                  )}
                                </select>
                              </FormControl>
                              <FormMessage className="text-red-400" />
                              
                              {exercisesLoading && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                  <div className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Carregando exercícios do English Practice Lab...</span>
                                </div>
                              )}
                              
                              {exercisesError && (
                                <div className="text-xs text-red-400 mt-1">
                                  Erro ao carregar exercícios. Usando opções padrão.
                                </div>
                              )}
                            </FormItem>
                          )}
                        />
                        
                        {/* Preview do Exercício Selecionado */}
                        {methods.watch("practice_lesson") && (
                          <div className="bg-emerald-900/20 rounded-lg p-4 space-y-3">
                            <div className="text-sm text-white">
                              <strong>Exercício Selecionado:</strong> 
                              <code className="bg-gray-800 px-2 py-1 rounded text-xs ml-2">
                                {methods.watch("practice_lesson")}
                              </code>
                            </div>
                            
                            <div className="text-sm text-gray-300">
                              Os estudantes responderão a este exercício diretamente na interface do curso, 
                              sem sair da experiência de aprendizado.
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              <div className="bg-emerald-800/30 rounded-lg p-2 text-center">
                                <div className="text-emerald-300 font-semibold text-sm">1</div>
                                <div className="text-xs text-gray-400">Exercício</div>
                              </div>
                              <div className="bg-blue-800/30 rounded-lg p-2 text-center">
                                <div className="text-blue-300 font-semibold text-sm">+15</div>
                                <div className="text-xs text-gray-400">Pontos</div>
                              </div>
                              <div className="bg-violet-800/30 rounded-lg p-2 text-center">
                                <div className="text-violet-300 font-semibold text-sm">~2min</div>
                                <div className="text-xs text-gray-400">Duração</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                onClick={() => {
                                  const lessonId = methods.watch("practice_lesson");
                                  if (lessonId) {
                                    window.open(`/user/laboratory/learn/lesson/${lessonId}`, '_blank');
                                  }
                                }}
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Preview Exercício
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Informações sobre tipos de capítulo */}
                        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                          <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                            💡 Tipos de Capítulo
                          </h4>
                          <ul className="text-sm text-blue-200 space-y-1">
                            <li>• <strong>Vídeo:</strong> Player de vídeo + notas</li>
                            <li>• <strong>Texto:</strong> Conteúdo de leitura</li>
                            <li>• <strong>Exercício:</strong> Challenge do Laboratory (inline)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

              {/* Modern Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 lg:pt-6 border-t border-violet-900/30 mt-6 lg:mt-8 gap-4">
                <div className="px-3 py-2 bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg">
                  <p className="text-white/60 text-xs lg:text-sm font-medium">
                    {chapter ? '✏️ Alterações no capítulo existente' : '🎆 Novo capítulo na seção'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="w-12 h-12 bg-customgreys-darkGrey/50 hover:bg-customgreys-darkGrey border border-violet-900/30 hover:border-violet-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Cancelar"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-12 h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title={chapter ? 'Atualizar Capítulo' : 'Criar Capítulo'}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : chapter ? (
                      <Save className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </CustomModal>
  );
};

export default ChapterModal;
