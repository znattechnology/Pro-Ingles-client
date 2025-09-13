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
  useGetChapterResourcesQuery,
  useCreateChapterResourceMutation,
  useDeleteChapterResourceMutation,
  useGetChapterQuizQuery,
  useCreateChapterQuizMutation,
  useDeleteChapterQuizMutation,
} from "@/redux/features/api/coursesApiSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, BookOpen, FileText, Brain, Plus, Trash2, ExternalLink, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const ChapterModal = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  
  const {
    isChapterModalOpen,
    selectedSectionIndex,
    selectedChapterIndex,
    sections,
  } = useAppSelector((state) => state.global.courseEditor);

  const chapter: Chapter | undefined =
    selectedSectionIndex !== null && selectedChapterIndex !== null
      ? sections[selectedSectionIndex].chapters[selectedChapterIndex]
      : undefined;

  // API hooks - only call when chapter exists and modal is open
  const { 
    data: existingResources, 
    isLoading: resourcesLoading 
  } = useGetChapterResourcesQuery(
    chapter?.chapterId || '', 
    { skip: !chapter?.chapterId || !isChapterModalOpen }
  );

  const { 
    data: existingQuiz, 
    isLoading: quizLoading 
  } = useGetChapterQuizQuery(
    chapter?.chapterId || '', 
    { skip: !chapter?.chapterId || !isChapterModalOpen }
  );

  const [createResource] = useCreateChapterResourceMutation();
  const [createQuiz] = useCreateChapterQuizMutation();
  const [deleteQuiz] = useDeleteChapterQuizMutation();

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
    if (selectedSectionIndex === null) return;

    try {
      // Determine chapter type based on content
      let chapterType: "Text" | "Quiz" | "Video" = "Text";
      if (data.video) chapterType = "Video";
      if (data.quiz_enabled) chapterType = "Quiz";

      const newChapter: Chapter = {
        chapterId: chapter?.chapterId || uuidv4(),
        title: data.title,
        content: data.content,
        type: chapterType,
        video: data.video,
        
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

      // Success message
      const resourcesText = data.resources_data && data.resources_data.length > 0 
        ? `e ${data.resources_data.length} recurso(s) ` 
        : '';
      const quizText = data.quiz_enabled ? 'com quiz interativo ' : '';
      
      toast.success(
        `Capítulo ${quizText}${resourcesText}${chapter ? 'atualizado' : 'criado'} com sucesso!`
      );
      
      onClose();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error('Erro ao salvar capítulo');
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
      <div className="flex flex-col max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {chapter ? 'Editar Capítulo' : 'Criar Capítulo'}
            {(isLoadingExistingData || resourcesLoading || quizLoading) && (
              <span className="ml-2 text-sm text-gray-400 animate-pulse">
                Carregando dados...
              </span>
            )}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-customgreys-darkGrey">
                <TabsTrigger value="basic" className="flex items-center gap-2 text-white data-[state=active]:bg-violet-600">
                  <BookOpen className="w-4 h-4" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2 text-white data-[state=active]:bg-violet-600">
                  <FileText className="w-4 h-4" />
                  Recursos
                  {resourceFields.length > 0 && (
                    <span className="ml-1 bg-violet-500 text-xs px-2 py-0.5 rounded-full">
                      {resourceFields.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2 text-white data-[state=active]:bg-violet-600">
                  <Brain className="w-4 h-4" />
                  Quiz Interativo
                  {methods.watch("quiz_enabled") && (
                    <span className="ml-1 bg-green-500 text-xs px-2 py-0.5 rounded-full">
                      ✓
                    </span>
                  )}
                </TabsTrigger>
                
                {/* 🎮 PHASE 3: PRACTICE LAB TAB */}
                <TabsTrigger value="practice" className="flex items-center gap-2 text-white data-[state=active]:bg-emerald-600">
                  <Zap className="w-4 h-4" />
                  Prática Lab
                  {chapter?.practice_lesson && (
                    <span className="ml-1 bg-emerald-500 text-xs px-2 py-0.5 rounded-full">
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
                          Ative um quiz gamificado para este capítulo conectado ao Practice Lab
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
                          <FormLabel className="text-white text-sm">Lição do Practice Lab</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ID da lição no sistema Practice Lab"
                              className="bg-customgreys-darkGrey border-gray-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-400">
                            Esta lição deve estar criada no Practice Lab com os exercícios apropriados
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
                        Os quizzes conectam-se ao sistema de pontos, corações e conquistas do Practice Lab, 
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
                        Integração Practice Lab
                        {chapter?.practice_lesson ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-500 rounded-full" />
                        )}
                      </h3>
                      
                      {chapter?.practice_lesson ? (
                        /* CONNECTED STATE */
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-emerald-300">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-medium">Capítulo conectado ao Practice Lab!</span>
                          </div>
                          
                          <div className="bg-emerald-900/20 rounded-lg p-4 space-y-3">
                            <div className="text-sm text-white">
                              <strong>ID da Lição:</strong> <code className="bg-gray-800 px-2 py-1 rounded text-xs">{chapter.practice_lesson}</code>
                            </div>
                            
                            <div className="text-sm text-gray-300">
                              Os estudantes verão automaticamente um botão "Praticar Conceitos" 
                              após estudar este capítulo, direcionando-os para exercícios gamificados.
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              <div className="bg-emerald-800/30 rounded-lg p-2 text-center">
                                <div className="text-emerald-300 font-semibold text-sm">3-5</div>
                                <div className="text-xs text-gray-400">Exercícios</div>
                              </div>
                              <div className="bg-blue-800/30 rounded-lg p-2 text-center">
                                <div className="text-blue-300 font-semibold text-sm">+10-15</div>
                                <div className="text-xs text-gray-400">Pontos/acerto</div>
                              </div>
                              <div className="bg-violet-800/30 rounded-lg p-2 text-center">
                                <div className="text-violet-300 font-semibold text-sm">~5min</div>
                                <div className="text-xs text-gray-400">Duração</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => {
                                if (chapter?.practice_lesson) {
                                  window.open(`/user/learn/lesson/${chapter.practice_lesson}`, '_blank');
                                }
                              }}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Preview Prática
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-white border-gray-600 hover:bg-gray-700"
                              onClick={() => {
                                window.open('/teacher/laboratory/analytics', '_blank');
                              }}
                            >
                              Ver Analytics
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* NOT CONNECTED STATE */
                        <div className="space-y-4">
                          <p className="text-gray-300 text-sm">
                            Este capítulo ainda não está conectado ao Practice Lab. 
                            A integração é criada automaticamente quando o capítulo é salvo.
                          </p>
                          
                          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                            <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                              🎆 O que acontece quando você salvar?
                            </h4>
                            <ul className="text-sm text-blue-200 space-y-1">
                              <li>• Sistema criará automaticamente uma Practice Lesson</li>
                              <li>• Gerará 3-5 exercícios baseados no conteúdo do capítulo</li>
                              <li>• Estudantes poderão praticar conceitos de forma gamificada</li>
                              <li>• Progressão será rastreada no sistema de pontos/corações</li>
                            </ul>
                          </div>
                          
                          <div className="text-xs text-gray-400 bg-gray-800/30 rounded p-2">
                            📝 <strong>Dica:</strong> Quanto mais detalhado o conteúdo do capítulo, 
                            melhores serão os exercícios gerados automaticamente.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-600">
              <Button type="button" variant="outline" onClick={onClose} className="text-white border-gray-600">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {chapter ? 'Atualizar Capítulo' : 'Criar Capítulo'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </CustomModal>
  );
};

export default ChapterModal;
