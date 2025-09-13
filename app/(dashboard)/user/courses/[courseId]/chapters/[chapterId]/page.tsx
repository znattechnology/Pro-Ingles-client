"use client";

import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactPlayer from "react-player";
import Loading from "@/components/course/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";
import { 
  useGetChapterResourcesQuery,
  useGetChapterQuizQuery
} from "@/redux/features/api/coursesApiSlice";
import { 
  BookOpen, 
  Play, 
  Brain, 
  FileText, 
  ExternalLink, 
  Download,
  Clock,
  Heart,
  Star,
  CheckCircle2,
  Trophy,
  Target,
  TrendingUp
} from "lucide-react";

const Course = () => {
  const {
    user,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  } = useCourseProgressData();

  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("Notes");

  // Load chapter resources
  const { 
    data: resourcesResponse, 
    isLoading: resourcesLoading 
  } = useGetChapterResourcesQuery(
    currentChapter?.chapterId || '', 
    { skip: !currentChapter?.chapterId }
  );

  // Load chapter quiz
  const { 
    data: quizResponse, 
    isLoading: quizLoading 
  } = useGetChapterQuizQuery(
    currentChapter?.chapterId || '', 
    { skip: !currentChapter?.chapterId }
  );

  // const [createQuizAttempt] = useCreateQuizAttemptMutation(); // TODO: Use for quiz attempts
  // const [showReward, setShowReward] = useState(false); // TODO: Show rewards after completion

  const resources = resourcesResponse?.data || [];
  const quiz = quizResponse?.data;

  // Gamification helper functions (TODO: Implement reward system)
  // const calculateChapterReward = () => {
  //   let points = 10; // Base points for completing chapter
  //   if (currentChapter?.quiz_enabled && quiz) {
  //     points += quiz?.points_reward || 15;
  //   }
  //   if (resources.length > 0) {
  //     points += resources.length * 2; // Bonus for accessing resources
  //   }
  //   return points;
  // };

  const getChapterDifficulty = () => {
    if (currentChapter?.quiz_enabled && resources.length > 3) return 'Desafiador';
    if (currentChapter?.quiz_enabled || resources.length > 1) return 'Intermediário';
    return 'Fácil';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Desafiador': return 'text-red-400 border-red-400';
      case 'Intermediário': return 'text-yellow-400 border-yellow-400';
      default: return 'text-green-400 border-green-400';
    }
  };

  const playerRef = useRef<ReactPlayer>(null);

  // Determine active tabs based on chapter content
  const getAvailableTabs = () => {
    const tabs = ['Notes']; // Always show notes
    
    if (resources && resources.length > 0) {
      tabs.push('Resources');
    }
    
    if (currentChapter?.quiz_enabled && quiz) {
      tabs.push('Quiz');
    }
    
    return tabs;
  };

  // Auto-select appropriate default tab
  const getDefaultTab = () => {
    if (currentChapter?.type === 'Quiz' && currentChapter?.quiz_enabled) {
      return 'Quiz';
    }
    if (currentChapter?.type === 'Video' && currentChapter?.video) {
      return 'Notes'; // Show notes alongside video
    }
    return 'Notes';
  };

  const handleProgress = ({ played }: { played: number }) => {
    if (
      played >= 0.8 &&
      !hasMarkedComplete &&
      currentChapter &&
      currentSection &&
      userProgress?.sections &&
      !isChapterCompleted()
    ) {
      setHasMarkedComplete(true);
      updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
    }
  };

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course || !userProgress) return <div>Error loading course</div>;

  return (
    <div className="flex h-[100vh]">
      <div className="flex-grow mx-auto">
        <div className="mb-6">
          {/* Breadcrumb */}
          <div className="text-customgreys-dirtyGrey text-sm mb-2">
            {course.title} / {currentSection?.sectionTitle} /{" "}
            <span className="text-gray-400">
              {currentChapter?.title}
            </span>
          </div>
          
          {/* Chapter Title & Teacher Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h2 className="text-white font-semibold text-3xl mb-2">{currentChapter?.title}</h2>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage alt={course.teacherName} />
                      <AvatarFallback className="bg-customgreys-primarybg text-white">
                        {course.teacherName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-customgreys-dirtyGrey text-sm font-[500]">
                      {course.teacherName}
                    </span>
                  </div>
                </div>
                
                {/* 🎮 PRACTICE AVAILABLE INDICATOR */}
                {currentChapter?.practice_lesson && (
                  <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Prática Disponível</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 🎮 GAMIFICATION PANEL */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-violet-900/20 to-blue-900/20 rounded-lg p-3 border border-violet-500/20">
              {/* Progress Indicator */}
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 mb-1">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-xs text-blue-300">
                  {Math.round((userProgress?.overallProgress || 0) * 100)}%
                </div>
                <div className="text-xs text-gray-400">Progresso</div>
              </div>
              
              {/* Hearts (if quiz chapter) */}
              {currentChapter?.quiz_enabled && quiz && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 mb-1">
                    <Heart className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-xs text-red-300">5</div>
                  <div className="text-xs text-gray-400">Corações</div>
                </div>
              )}
              
              {/* Points Available */}
              {currentChapter?.quiz_enabled && quiz && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-1">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-xs text-yellow-300">{quiz.points_reward || 15}</div>
                  <div className="text-xs text-gray-400">Pontos</div>
                </div>
              )}
              
              {/* Completion Status */}
              <div className="text-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border mb-1 ${
                  isChapterCompleted() 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-gray-500/20 border-gray-500/30'
                }`}>
                  {isChapterCompleted() ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Target className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className={`text-xs ${
                  isChapterCompleted() ? 'text-green-300' : 'text-gray-300'
                }`}>
                  {isChapterCompleted() ? 'Feito' : 'Meta'}
                </div>
                <div className="text-xs text-gray-400">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* 🏆 ACHIEVEMENT NOTIFICATION */}
        {/* TODO: Show reward notification when chapter is completed */}
        {false && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-white p-4 rounded-lg shadow-lg border border-yellow-400/30 animate-slide-in">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <div>
                <div className="font-bold">Parabéns! 🎉</div>
                <div className="text-sm">Você ganhou pontos!</div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 DYNAMIC CONTENT AREA - Adapts based on chapter type */}
        <Card className="mb-6 !border-none">
          <CardContent className="h-[50vh] flex justify-center items-center p-0 m-0">
            {/* 🎥 VIDEO CHAPTER - Enhanced video player */}
            {currentChapter?.video && currentChapter.video.trim() !== "" ? (
              <div className="w-full h-full relative">
                <ReactPlayer
                  ref={playerRef}
                  url={currentChapter.video as string}
                  controls
                  width="100%"
                  height="100%"
                  onProgress={handleProgress}
                  config={{
                    file: {
                      attributes: {
                        controlsList: "nodownload",
                      },
                    },
                  }}
                />
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {currentChapter?.transcript && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/50 text-white border-white/30 hover:bg-black/70"
                      onClick={() => setSelectedTab('Notes')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Transcrição
                    </Button>
                  )}
                  
                  {/* Chapter difficulty indicator */}
                  <Badge className={`bg-black/50 ${getDifficultyColor(getChapterDifficulty())}`}>
                    {getChapterDifficulty()}
                  </Badge>
                </div>
              </div>
            ) : currentChapter?.quiz_enabled && quiz ? (
              /* 🧠 QUIZ CHAPTER - Enhanced quiz preview */
              <div className="text-center p-8 w-full">
                <div className="bg-gradient-to-r from-violet-900/40 to-blue-900/40 rounded-lg p-8 max-w-lg mx-auto border border-violet-500/20">
                  <Brain className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-xl mb-2">
                    {quiz?.title || 'Quiz Interativo'}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {quiz?.description || 'Complete este quiz para ganhar pontos e continuar seu progresso!'}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span>{quiz?.points_reward || 15} pontos</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                      <Heart className="w-4 h-4" />
                      <span>{quiz?.hearts_cost || 1} coração por erro</span>
                    </div>
                    {quiz?.time_limit && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Clock className="w-4 h-4" />
                        <span>{Math.round(quiz.time_limit / 60)} min</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    size="lg"
                    onClick={() => {
                      setQuizStarted(true);
                      setSelectedTab('Quiz');
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Começar Quiz
                  </Button>
                </div>
              </div>
            ) : (
              /* TEXT/OTHER CHAPTER - Show content preview */
              <div className="text-center p-8 w-full">
                <div className="bg-customgreys-secondarybg/60 rounded-lg p-8 max-w-lg mx-auto border border-gray-600/30">
                  <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-xl mb-2">
                    {currentChapter?.type === 'Text' ? 'Capítulo de Leitura' : 'Conteúdo Textual'}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Este capítulo contém conteúdo educacional importante. 
                    Explore as abas abaixo para acessar todo o material.
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <span>Disponível em:</span>
                    {getAvailableTabs().map((tab, index) => (
                      <Badge key={tab} variant="outline" className="text-xs">
                        {tab === 'Notes' ? '📝 Notas' : 
                         tab === 'Resources' ? '📁 Recursos' : 
                         '❓ Quiz'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-5 ">
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            defaultValue={getDefaultTab()} 
            className="w-full md:w-2/3"
          >
            <TabsList className="flex justify-start gap-4 bg-violet-900/40 text-white p-1">
              {/* Always show Notes tab */}
              <TabsTrigger className="text-md px-4 py-2 flex items-center gap-2" value="Notes">
                <BookOpen className="w-4 h-4" />
                Notas
                {currentChapter?.transcript && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-blue-500/20 text-blue-300">
                    +Transcrição
                  </Badge>
                )}
              </TabsTrigger>
              
              {/* Show Resources tab only if chapter has resources */}
              {resources && resources.length > 0 && (
                <TabsTrigger className="text-md px-4 py-2 flex items-center gap-2" value="Resources">
                  <FileText className="w-4 h-4" />
                  Recursos
                  <Badge variant="secondary" className="ml-1 text-xs bg-green-500/20 text-green-300">
                    {resources.length}
                  </Badge>
                </TabsTrigger>
              )}
              
              {/* Show Quiz tab only if quiz is enabled and exists */}
              {currentChapter?.quiz_enabled && quiz && (
                <TabsTrigger className="text-md px-4 py-2 flex items-center gap-2" value="Quiz">
                  <Brain className="w-4 h-4" />
                  Quiz
                  <Badge variant="secondary" className="ml-1 text-xs bg-violet-500/20 text-violet-300">
                    {quiz.points_reward || 15} pts
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>

            {/* 📝 NOTES TAB - Always available */}
            <TabsContent className="mt-5" value="Notes">
              <Card className="!border-none shadow-none bg-customgreys-secondarybg/40">
                <CardHeader className="p-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Conteúdo do Capítulo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-white/80">
                  <div className="prose prose-invert max-w-none">
                    <p className="leading-relaxed text-base mb-4">
                      {currentChapter?.content}
                    </p>
                    
                    {/* Show transcript if available */}
                    {currentChapter?.transcript && (
                      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
                        <h4 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Transcrição do Vídeo
                        </h4>
                        <div className="text-sm text-blue-100 leading-relaxed whitespace-pre-line">
                          {currentChapter.transcript}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 📁 RESOURCES TAB - Only show if resources exist */}
            {resources && resources.length > 0 && (
              <TabsContent className="mt-5" value="Resources">
                <Card className="!border-none shadow-none bg-customgreys-secondarybg/40">
                  <CardHeader className="p-4">
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recursos do Capítulo
                      <Badge variant="outline" className="ml-2 text-xs">
                        {resources.length} {resources.length === 1 ? 'recurso' : 'recursos'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {resourcesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Carregando recursos...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {resources.map((resource, index) => {
                          const getResourceIcon = (type: string) => {
                            switch (type) {
                              case 'PDF': return '📄';
                              case 'LINK': return '🔗';
                              case 'VIDEO': return '🎥';
                              case 'CODE': return '💻';
                              case 'WORKSHEET': return '📝';
                              case 'AUDIO': return '🔊';
                              case 'IMAGE': return '🖼️';
                              default: return '📎';
                            }
                          };
                          
                          const getResourceColor = (type: string) => {
                            switch (type) {
                              case 'PDF': return 'border-red-500/30 bg-red-900/10';
                              case 'LINK': return 'border-blue-500/30 bg-blue-900/10';
                              case 'VIDEO': return 'border-purple-500/30 bg-purple-900/10';
                              case 'CODE': return 'border-green-500/30 bg-green-900/10';
                              case 'WORKSHEET': return 'border-yellow-500/30 bg-yellow-900/10';
                              case 'AUDIO': return 'border-orange-500/30 bg-orange-900/10';
                              case 'IMAGE': return 'border-pink-500/30 bg-pink-900/10';
                              default: return 'border-gray-500/30 bg-gray-900/10';
                            }
                          };
                          
                          return (
                            <div 
                              key={resource.id || `resource-${index}`} 
                              className={`p-4 rounded-lg border ${getResourceColor(resource.resource_type)} hover:bg-opacity-20 transition-all`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{getResourceIcon(resource.resource_type)}</span>
                                    <h4 className="font-semibold text-white">
                                      {resource.title}
                                    </h4>
                                    {resource.is_featured && (
                                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                        ⭐ Destaque
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {resource.description && (
                                    <p className="text-gray-300 text-sm mb-3">
                                      {resource.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{resource.resource_type}</span>
                                    {resource.file_size && (
                                      <span>• {Math.round(resource.file_size / 1024)} KB</span>
                                    )}
                                    {resource.download_count && (
                                      <span>• {resource.download_count} downloads</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 ml-4">
                                  {resource.external_url ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-white border-white/30 hover:bg-white/10"
                                      onClick={() => window.open(resource.external_url, '_blank')}
                                    >
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      Abrir
                                    </Button>
                                  ) : resource.file_url && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-white border-white/30 hover:bg-white/10"
                                      onClick={() => window.open(resource.file_url, '_blank')}
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      Baixar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* 🧠 QUIZ TAB - Only show if quiz is enabled and exists */}
            {currentChapter?.quiz_enabled && quiz && (
              <TabsContent className="mt-5" value="Quiz">
                <Card className="!border-none shadow-none bg-customgreys-secondarybg/40">
                  <CardHeader className="p-4">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      {quiz.title || 'Quiz Interativo'}
                      {isChapterCompleted() && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Concluído
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {quizLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Carregando quiz...</p>
                      </div>
                    ) : quizStarted ? (
                      /* QUIZ INTERFACE - Practice Lab Integration */
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/30 rounded-lg p-6 border border-violet-500/20">
                          <h3 className="text-white font-bold text-lg mb-2">🚀 Conectando ao Practice Lab</h3>
                          <p className="text-gray-300 mb-4">
                            Este quiz será executado através do Practice Lab para uma experiência gamificada completa.
                          </p>
                          
                          <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4" />
                              <span>{quiz.points_reward || 15} pontos</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-400">
                              <Heart className="w-4 h-4" />
                              <span>{quiz.hearts_cost || 1} coração por erro</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-400">
                              <span>Nota mínima: {quiz.passing_score || 80}%</span>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <Button
                              className="bg-violet-600 hover:bg-violet-700 text-white mr-2"
                              onClick={() => {
                                // TODO: Integrate with Practice Lab
                                if (quiz?.practice_lesson) {
                                  window.open(`/practice/lesson/${quiz.practice_lesson}`, '_blank');
                                }
                              }}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Iniciar no Practice Lab
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="text-white border-white/30"
                              onClick={() => setQuizStarted(false)}
                            >
                              Voltar
                            </Button>
                          </div>
                        </div>
                        
                        {/* Quiz Statistics */}
                        <div className="bg-customgreys-primarybg/50 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-3">📊 Estatísticas do Quiz</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-400">{quiz.total_attempts || 0}</div>
                              <div className="text-xs text-gray-400">Tentativas</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-400">{quiz.total_completions || 0}</div>
                              <div className="text-xs text-gray-400">Conclusões</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-yellow-400">{quiz.average_score || 0}%</div>
                              <div className="text-xs text-gray-400">Média</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-violet-400">{quiz.completion_rate || 0}%</div>
                              <div className="text-xs text-gray-400">Taxa Sucesso</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* QUIZ PREVIEW - Not started yet */
                      <div className="space-y-6">
                        <div className="text-center">
                          <Brain className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                          <h3 className="text-white font-bold text-xl mb-2">
                            {quiz.title || 'Quiz Interativo'}
                          </h3>
                          <p className="text-gray-300 mb-6">
                            {quiz.description || 'Complete este quiz gamificado para testar seu conhecimento!'}
                          </p>
                        </div>
                        
                        <div className="bg-customgreys-primarybg/30 rounded-lg p-6">
                          <h4 className="text-white font-medium mb-4">ℹ️ Informações do Quiz</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Pontos por conclusão:</span>
                              <span className="text-yellow-400 font-medium">{quiz?.points_reward || 15} pontos</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Corações por erro:</span>
                              <span className="text-red-400 font-medium">{quiz?.hearts_cost || 1} coração</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Nota mínima:</span>
                              <span className="text-green-400 font-medium">{quiz?.passing_score || 80}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tentativas máximas:</span>
                              <span className="text-blue-400 font-medium">{quiz?.max_attempts || 3}</span>
                            </div>
                            {quiz?.time_limit && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Tempo limite:</span>
                                <span className="text-orange-400 font-medium">{Math.round((quiz?.time_limit || 0) / 60)} minutos</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <Button
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                            size="lg"
                            onClick={() => setQuizStarted(true)}
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Começar Quiz
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* 🎮 PHASE 3: PRACTICE LAB INTEGRATION */}
          {currentChapter?.practice_lesson && (
            <Card className="mt-8 !border-none shadow-none bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="bg-emerald-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Target className="w-8 h-8 text-emerald-400" />
                  </div>
                  
                  <h3 className="text-white font-bold text-xl mb-2">
                    🎯 Fixe seu Aprendizado
                  </h3>
                  
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Complete exercícios práticos baseados no conteúdo deste capítulo para 
                    consolidar seu conhecimento de forma gamificada!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-lg mx-auto">
                    <div className="bg-emerald-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                        <Trophy className="w-4 h-4" />
                        <span className="font-semibold">+10-15</span>
                      </div>
                      <div className="text-xs text-gray-400">Pontos por acerto</div>
                    </div>
                    
                    <div className="bg-blue-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                        <Brain className="w-4 h-4" />
                        <span className="font-semibold">3-5</span>
                      </div>
                      <div className="text-xs text-gray-400">Exercícios</div>
                    </div>
                    
                    <div className="bg-violet-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-2 text-violet-400 mb-1">
                        <Zap className="w-4 h-4" />
                        <span className="font-semibold">~5 min</span>
                      </div>
                      <div className="text-xs text-gray-400">Duração</div>
                    </div>
                  </div>
                  
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      // Navigate to Practice Lab lesson for this chapter
                      window.open(`/user/learn/lesson/${currentChapter.practice_lesson}`, '_blank');
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Praticar Conceitos Agora
                  </Button>
                  
                  <p className="text-xs text-gray-400 mt-3">
                    Abre o Practice Lab em nova aba • Sistema gamificado Duolingo-style
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* <Card className="w-1/3 h-min border-none bg-white-50/5 p-10 bg-customgreys-secondarybg mt-4">
            <CardContent className="flex flex-col items-start p-0 px-4">
              <div className="flex items-center gap-3 flex-shrink-0 mb-7">
                <Avatar className="w-10 h-10">
                  <AvatarImage alt={course.teacherName} />
                  <AvatarFallback className="bg-customgreys-primarybg text-white">
                    {course.teacherName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <h4 className="text-customgreys-dirtyGrey text-sm font-[500]">
                    {course.teacherName}
                  </h4>
                  <p className="text-sm">Senior UX Designer</p>
                </div>
              </div>
              <div className="text-sm">
                <p>
                  A seasoned Senior UX Designer with over 15 years of experience
                  in creating intuitive and engaging digital experiences.
                  Expertise in leading UX design projects.
                </p>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default Course;
