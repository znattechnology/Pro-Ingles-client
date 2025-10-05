"use client";

import React, { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactPlayer from "react-player";
import Loading from "@/components/course/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";
import { 
  useGetChapterResourcesQuery,
  useGetChapterQuizQuery
} from "@/src/domains/student/video-courses/api";
import InlineExercise from "@/components/laboratory/InlineExercise";
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
  CheckCircle,
  Trophy,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const Course = () => {
  const router = useRouter();
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
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [showNextVideoCountdown, setShowNextVideoCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [nextChapter, setNextChapter] = useState<any>(null);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  
  // Check if chapter is already completed and update local state
  const chapterCompleted = isChapterCompleted();
  
  // Sync hasMarkedComplete with actual completion status
  React.useEffect(() => {
    if (chapterCompleted && !hasMarkedComplete) {
      setHasMarkedComplete(true);
    }
  }, [chapterCompleted, hasMarkedComplete, setHasMarkedComplete]);

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
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Function to find the next chapter
  const findNextChapter = () => {
    if (!course?.sections || !currentChapter) return null;

    for (let sectionIndex = 0; sectionIndex < course.sections.length; sectionIndex++) {
      const section = course.sections[sectionIndex];
      const chapterIndex = section.chapters.findIndex(
        (chapter: any) => chapter.chapterId === currentChapter.chapterId
      );

      if (chapterIndex !== -1) {
        // Found current chapter, now find next
        if (chapterIndex < section.chapters.length - 1) {
          // Next chapter in same section
          return {
            chapter: section.chapters[chapterIndex + 1],
            section: section
          };
        } else if (sectionIndex < course.sections.length - 1) {
          // First chapter of next section
          const nextSection = course.sections[sectionIndex + 1];
          if (nextSection.chapters.length > 0) {
            return {
              chapter: nextSection.chapters[0],
              section: nextSection
            };
          }
        }
      }
    }
    return null;
  };

  // Function to start countdown and auto-navigate to next chapter
  const startNextChapterCountdown = () => {
    const next = findNextChapter();
    if (!next) return;

    setNextChapter(next);
    setShowNextVideoCountdown(true);
    setCountdownSeconds(5);

    let seconds = 5;
    countdownRef.current = setInterval(() => {
      seconds--;
      setCountdownSeconds(seconds);

      if (seconds <= 0) {
        // Navigate to next chapter with autoplay
        console.log('🚀 Navigating to next chapter with autoplay');
        const nextUrl = `/user/courses/${course?.courseId}/chapters/${next.chapter.chapterId}?autoplay=true`;
        console.log('📍 Next URL:', nextUrl);
        
        router.push(nextUrl);
        setShowNextVideoCountdown(false);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      }
    }, 1000);
  };

  // Function to cancel countdown
  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setShowNextVideoCountdown(false);
    setCountdownSeconds(5);
  };

  // Check for autoplay parameter in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoplay = urlParams.get('autoplay');
    console.log('🔍 Checking autoplay parameter:', autoplay);
    console.log('📍 Current URL:', window.location.href);
    
    if (autoplay === 'true') {
      console.log('✅ Autoplay detected! Setting shouldAutoplay to true');
      setShouldAutoplay(true);
      
      // Remove autoplay parameter from URL without triggering navigation
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      console.log('🔄 URL cleaned:', newUrl);
    } else {
      console.log('❌ No autoplay parameter found');
      setShouldAutoplay(false);
    }
  }, [currentChapter?.chapterId]);

  // Additional effect to ensure autoplay state is properly set
  React.useEffect(() => {
    console.log('🎮 shouldAutoplay state changed to:', shouldAutoplay);
    
    // Fallback: If autoplay is true but video hasn't started after a delay, try to start it
    if (shouldAutoplay && playerRef.current) {
      const timer = setTimeout(() => {
        console.log('⏰ Autoplay fallback triggered - attempting to play video');
        if (playerRef.current && shouldAutoplay) {
          try {
            // Try to get the internal player and call play
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.play === 'function') {
              console.log('🎯 Calling internal player.play()');
              internalPlayer.play().catch((error: any) => {
                console.log('❌ Autoplay blocked by browser:', error);
              });
            }
          } catch (error) {
            console.log('⚠️ Fallback autoplay failed:', error);
          }
        }
      }, 1000); // Wait 1 second before trying fallback
      
      return () => clearTimeout(timer);
    }
  }, [shouldAutoplay]);

  // Cleanup countdown on unmount and add fullscreen event listeners
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      // Force re-render when fullscreen state changes
      // This ensures the overlay positioning is correct
      console.log('🖥️ Fullscreen state changed:', isFullscreen());
    };

    // Add fullscreen event listeners for different browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      
      // Cleanup fullscreen event listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Function to mark chapter as completed using the hook's mutation
  const markChapterAsCompleted = async () => {
    if (!user || !currentChapter || !currentSection || hasMarkedComplete) return;
    
    setIsMarkingComplete(true);
    
    try {
      console.log('Marking chapter as completed:', {
        sectionId: currentSection.sectionId,
        chapterId: currentChapter.chapterId
      });
      
      // Use the hook's updateChapterProgress function which handles RTK Query mutation
      await updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
      
      // Update local state
      setHasMarkedComplete(true);
      
      console.log('Chapter marked as completed successfully!');
      
      // Optional: Show toast notification
      // toast.success('Capítulo concluído!');
      
    } catch (error) {
      console.error('Error marking chapter as completed:', error);
      // toast.error('Erro ao marcar capítulo como concluído');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Determine active tabs based on chapter content
  const getAvailableTabs = () => {
    const tabs = ['Notes']; // Always show notes
    
    if (resources && resources.length > 0) {
      tabs.push('Resources');
    }
    
    if (currentChapter?.quiz_enabled && quiz) {
      tabs.push('Quiz');
    }
    
    if (currentChapter?.type === 'Exercise' && currentChapter?.practice_lesson) {
      tabs.push('Exercise');
    }
    
    return tabs;
  };

  // Auto-select appropriate default tab
  const getDefaultTab = () => {
    if (currentChapter?.type === 'Exercise' && currentChapter?.practice_lesson) {
      return 'Exercise';
    }
    if (currentChapter?.type === 'Quiz' && currentChapter?.quiz_enabled) {
      return 'Quiz';
    }
    if (currentChapter?.type === 'Video' && currentChapter?.video) {
      return 'Notes'; // Show notes alongside video
    }
    return 'Notes';
  };

  const handleProgress = ({ played }: { played: number }) => {
    // Auto-complete chapter at 80%
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

  // Handle video end - start countdown to next chapter
  const handleVideoEnd = async () => {
    console.log('🎬 Video ended! Starting countdown to next chapter...');
    
    // Check if we're in fullscreen mode and exit if we are
    if (isFullscreen()) {
      console.log('📺 Exiting fullscreen to show countdown...');
      await exitFullscreen();
      // Small delay to ensure fullscreen exit is complete
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Mark current chapter as completed if not already
    if (!hasMarkedComplete && currentChapter && currentSection) {
      setHasMarkedComplete(true);
      updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
    }

    // Start countdown for next chapter
    const next = findNextChapter();
    if (next && next.chapter.type === 'Video' && next.chapter.video) {
      // Only auto-play if next chapter is also a video
      startNextChapterCountdown();
    }
  };

  // Check if document is in fullscreen mode
  const isFullscreen = () => {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  };

  // Exit fullscreen function
  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.log('Error exiting fullscreen:', error);
    }
  };

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course || !userProgress) return <div>Error loading course</div>;

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* CSS for countdown animation */}
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
      {/* Compact Header Section */}
      <div className="relative bg-gradient-to-r from-customgreys-secondarybg to-customgreys-primarybg border-b border-violet-900/30">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-4">
          {/* Compact Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-3">
            <span className="text-violet-300">{course.title}</span>
            <span className="text-violet-900/60">•</span>
            <span className="text-gray-300">{currentSection?.sectionTitle}</span>
            <span className="text-violet-900/60">•</span>
            <span className="text-white">{currentChapter?.title}</span>
          </div>
          
          {/* Compact Chapter Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-6 h-6 border border-violet-400/30 flex-shrink-0">
                <AvatarImage alt={course.teacherName} />
                <AvatarFallback className="bg-violet-600 text-white text-xs font-semibold">
                  {course.teacherName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">
                  {currentChapter?.title}
                </h1>
                <div className="text-violet-300 text-xs">{course.teacherName}</div>
              </div>
              
              {/* Practice Badge */}
              {currentChapter?.practice_lesson && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-2 py-1 flex items-center gap-1 flex-shrink-0">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-medium">Prática</span>
                </div>
              )}
            </div>
            
            {/* Compact Progress Panel */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-blue-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(() => {
                    const progress = userProgress?.overallProgress || 0;
                    // Se o progresso já está acima de 1, provavelmente já é porcentagem
                    const percentage = progress > 1 ? Math.round(progress) : Math.round(progress * 100);
                    // Garante que não passe de 100%
                    return Math.min(percentage, 100);
                  })()}%
                </span>
              </div>
              
              {currentChapter?.quiz_enabled && quiz && (
                <>
                  <div className="flex items-center gap-1 text-red-400">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium">5</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">{quiz.points_reward || 15}</span>
                  </div>
                </>
              )}
              
              <div className={`flex items-center gap-1 ${
                isChapterCompleted() ? 'text-green-400' : 'text-gray-400'
              }`}>
                {isChapterCompleted() ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Target className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isChapterCompleted() ? 'Feito' : 'Meta'}
                </span>
              </div>
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

      {/* Main Content Area - Full Width */}
      <div className="max-w-6xl mx-auto px-6 pt-4 pb-8">
        {/* Video Content */}
        <div className="w-full">
          <div className="bg-customgreys-primarybg/40 backdrop-blur-sm rounded-xl border border-violet-900/30 mb-6">
            <div className="aspect-video w-full relative overflow-hidden rounded-xl max-h-[500px]">
            {/* Enhanced Video Player */}
            {currentChapter?.video && currentChapter.video.trim() !== "" ? (
              <div className="w-full h-full relative">
                <ReactPlayer
                  ref={playerRef}
                  url={currentChapter.video as string}
                  controls
                  width="100%"
                  height="100%"
                  playing={shouldAutoplay}
                  onProgress={handleProgress}
                  onEnded={handleVideoEnd}
                  onReady={() => {
                    console.log('🎬 ReactPlayer ready, shouldAutoplay:', shouldAutoplay);
                    console.log('🎥 Video URL:', currentChapter.video);
                  }}
                  onStart={() => {
                    console.log('▶️ Video started playing!');
                    // Reset autoplay after video starts
                    if (shouldAutoplay) {
                      console.log('🔄 Resetting shouldAutoplay to false');
                      setShouldAutoplay(false);
                    }
                  }}
                  onPlay={() => {
                    console.log('📺 Video play event triggered');
                  }}
                  onPause={() => {
                    console.log('⏸️ Video paused');
                  }}
                  config={{
                    file: {
                      attributes: {
                        controlsList: "nodownload",
                        autoPlay: shouldAutoplay,
                      },
                    },
                    youtube: {
                      playerVars: {
                        autoplay: shouldAutoplay ? 1 : 0,
                      }
                    },
                    vimeo: {
                      playerOptions: {
                        autoplay: shouldAutoplay
                      }
                    }
                  }}
                />

                <div className="absolute bottom-4 right-4 flex gap-3">
                  {currentChapter?.transcript && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-customgreys-darkGrey/80 backdrop-blur-sm text-white border-violet-500/30 hover:bg-violet-600/80 transition-all duration-200"
                      onClick={() => setSelectedTab('Notes')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Transcrição
                    </Button>
                  )}
                  
                  <Badge className={`bg-customgreys-darkGrey/80 backdrop-blur-sm border ${getDifficultyColor(getChapterDifficulty())}`}>
                    {getChapterDifficulty()}
                  </Badge>
                </div>
              </div>
            ) : currentChapter?.type === 'Exercise' && currentChapter?.practice_lesson ? (
              /* Enhanced Exercise Preview - Practice Lab Integration */
              <div className="flex items-center justify-center p-8 w-full">
                <div className="bg-gradient-to-br from-emerald-900/40 via-green-900/30 to-blue-900/40 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto border border-emerald-500/30 shadow-2xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-3">
                      Exercício Prático
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      Complete este exercício do Practice Lab para fixar o conteúdo e ganhar pontos!
                    </p>
                  
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center">
                        <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        <div className="text-emerald-300 font-semibold">15</div>
                        <div className="text-xs text-gray-400">pontos</div>
                      </div>
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
                        <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                        <div className="text-red-300 font-semibold">1</div>
                        <div className="text-xs text-gray-400">por erro</div>
                      </div>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                        <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-blue-300 font-semibold">~2</div>
                        <div className="text-xs text-gray-400">minutos</div>
                      </div>
                    </div>
                  
                    <Button
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      size="lg"
                      onClick={() => {
                        // Show exercise interface inline
                        setSelectedTab('Exercise');
                      }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Começar Exercício
                    </Button>
                  </div>
                </div>
              </div>
            ) : currentChapter?.quiz_enabled && quiz ? (
              /* Enhanced Quiz Preview */
              <div className="flex items-center justify-center p-8 w-full">
                <div className="bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto border border-violet-500/30 shadow-2xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-3">
                      {quiz?.title || 'Quiz Interativo'}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {quiz?.description || 'Complete este quiz para ganhar pontos e continuar seu progresso!'}
                    </p>
                  
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-yellow-300 font-semibold">{quiz?.points_reward || 15}</div>
                        <div className="text-xs text-gray-400">pontos</div>
                      </div>
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
                        <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                        <div className="text-red-300 font-semibold">{quiz?.hearts_cost || 1}</div>
                        <div className="text-xs text-gray-400">por erro</div>
                      </div>
                      {quiz?.time_limit && (
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                          <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                          <div className="text-blue-300 font-semibold">{Math.round(quiz.time_limit / 60)}</div>
                          <div className="text-xs text-gray-400">minutos</div>
                        </div>
                      )}
                    </div>
                  
                    <Button
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
              </div>
            ) : (
              /* Enhanced Text Content Preview */
              <div className="flex items-center justify-center p-8 w-full">
                <div className="bg-gradient-to-br from-customgreys-secondarybg via-customgreys-darkGrey/50 to-customgreys-secondarybg backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto border border-violet-900/30 shadow-2xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-3">
                      {currentChapter?.type === 'Text' ? 'Capítulo de Leitura' : 'Conteúdo Textual'}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      Este capítulo contém conteúdo educacional importante. 
                      Explore as abas abaixo para acessar todo o material.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-gray-400 text-sm mb-2">Disponível em:</span>
                      <div className="flex gap-2">
                        {getAvailableTabs().map((tab) => (
                          <Badge key={tab} variant="outline" className="border-violet-500/30 text-violet-300">
                            {tab === 'Notes' ? '📝 Notas' : 
                             tab === 'Resources' ? '📁 Recursos' : 
                             tab === 'Quiz' ? '🧠 Quiz' :
                             tab === 'Exercise' ? '🎯 Exercício' : tab}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Tabs Section */}
          <div className="bg-customgreys-primarybg/40 backdrop-blur-sm rounded-xl border border-violet-900/30 p-6">
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            defaultValue={getDefaultTab()} 
            className="w-full"
          >
            <TabsList className="bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg p-1 mb-6">
              {/* Enhanced Notes Tab */}
              <TabsTrigger className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 px-6 py-3 rounded-lg flex items-center gap-2 font-medium" value="Notes">
                <BookOpen className="w-4 h-4" />
                Notas
                {currentChapter?.transcript && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-blue-500/20 text-blue-300 border-none">
                    +Transcrição
                  </Badge>
                )}
              </TabsTrigger>
              
              {/* Enhanced Resources Tab */}
              {resources && resources.length > 0 && (
                <TabsTrigger className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 px-6 py-3 rounded-lg flex items-center gap-2 font-medium" value="Resources">
                  <FileText className="w-4 h-4" />
                  Recursos
                  <Badge variant="secondary" className="ml-1 text-xs bg-green-500/20 text-green-300 border-none">
                    {resources.length}
                  </Badge>
                </TabsTrigger>
              )}
              
              {/* Enhanced Quiz Tab */}
              {currentChapter?.quiz_enabled && quiz && (
                <TabsTrigger className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 px-6 py-3 rounded-lg flex items-center gap-2 font-medium" value="Quiz">
                  <Brain className="w-4 h-4" />
                  Quiz
                  <Badge variant="secondary" className="ml-1 text-xs bg-violet-500/20 text-violet-300 border-none">
                    {quiz.points_reward || 15} pts
                  </Badge>
                </TabsTrigger>
              )}
              
              {/* Enhanced Exercise Tab */}
              {currentChapter?.type === 'Exercise' && currentChapter?.practice_lesson && (
                <TabsTrigger className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 px-6 py-3 rounded-lg flex items-center gap-2 font-medium" value="Exercise">
                  <Target className="w-4 h-4" />
                  Exercício
                  <Badge variant="secondary" className="ml-1 text-xs bg-emerald-500/20 text-emerald-300 border-none">
                    Lab
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Enhanced Notes Tab Content */}
            <TabsContent value="Notes">
              <div className="bg-customgreys-secondarybg border-customgreys-darkerGrey rounded-lg">
                <div className="p-6 border-b border-violet-900/20">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    Conteúdo do Capítulo
                  </h3>
                </div>
                <div className="p-6 text-white/90">
                  <div className="prose prose-invert max-w-none">
                    <p className="leading-relaxed text-lg mb-6">
                      {currentChapter?.content}
                    </p>
                    
                    {/* Enhanced Transcript Section */}
                    {currentChapter?.transcript && (
                      <div className="mt-8 p-6 bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-600/30">
                        <h4 className="text-blue-300 font-semibold mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Transcrição do Vídeo
                        </h4>
                        <div className="text-blue-100 leading-relaxed whitespace-pre-line">
                          {currentChapter.transcript}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Enhanced Resources Tab Content */}
            {resources && resources.length > 0 && (
              <TabsContent value="Resources">
                <div className="bg-customgreys-secondarybg border-customgreys-darkerGrey rounded-lg">
                  <div className="p-6 border-b border-violet-900/20">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      Recursos do Capítulo
                      <Badge variant="outline" className="ml-3 border-emerald-500/50 text-emerald-300">
                        {resources.length} {resources.length === 1 ? 'recurso' : 'recursos'}
                      </Badge>
                    </h3>
                  </div>
                  <div className="p-6">
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
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Enhanced Exercise Tab Content */}
            {currentChapter?.type === 'Exercise' && currentChapter?.practice_lesson && (
              <TabsContent value="Exercise">
                <div className="bg-customgreys-secondarybg border-customgreys-darkerGrey rounded-lg">
                  <div className="p-6 border-b border-emerald-900/20">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      Exercício Prático
                      {isChapterCompleted() && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Concluído
                        </Badge>
                      )}
                    </h3>
                    <p className="text-gray-300 text-sm mt-2">
                      Exercício do Practice Lab: <code className="bg-gray-800 px-2 py-1 rounded text-xs">{currentChapter.practice_lesson}</code>
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg p-6 border border-emerald-500/20">
                        <h3 className="text-emerald-400 font-bold text-lg mb-2">🎯 Exercício Integrado</h3>
                        <p className="text-gray-300 mb-4">
                          Este exercício será carregado diretamente do Practice Lab para uma experiência perfeita.
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Target className="w-4 h-4" />
                            <span>15 pontos</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-400">
                            <Heart className="w-4 h-4" />
                            <span>1 coração por erro</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-400">
                            <Clock className="w-4 h-4" />
                            <span>~2 minutos</span>
                          </div>
                        </div>
                        
                        {/* Inline Exercise Component */}
                        <InlineExercise 
                          exerciseId={currentChapter.practice_lesson}
                          courseId={course?.courseId}
                          chapterId={currentChapter.chapterId}
                          onComplete={(result) => {
                            console.log('✅ Exercise completed:', result);
                            // Mark chapter as completed when exercise is done
                            if (result.success) {
                              console.log('🎆 Auto-completing chapter after successful exercise');
                              markChapterAsCompleted();
                            }
                          }}
                          className="border-none shadow-none bg-transparent"
                        />
                        
                        {/* Alternative: Direct link to Practice Lab */}
                        <div className="text-center mt-4">
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white mr-2"
                            onClick={() => {
                              if (currentChapter?.practice_lesson) {
                                window.open(`/user/laboratory/learn/lesson/${currentChapter.practice_lesson}`, '_blank');
                              }
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Abrir no Practice Lab
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="text-white border-white/30"
                            onClick={() => markChapterAsCompleted()}
                          >
                            Marcar como Concluído
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Enhanced Quiz Tab Content */}
            {currentChapter?.quiz_enabled && quiz && (
              <TabsContent value="Quiz">
                <div className="bg-customgreys-secondarybg border-customgreys-darkerGrey rounded-lg">
                  <div className="p-6 border-b border-violet-900/20">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      {quiz.title || 'Quiz Interativo'}
                      {isChapterCompleted() && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Concluído
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="p-6">
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
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Mark as Completed Button */}
          {!hasMarkedComplete && !currentChapter?.quiz_enabled && (
            <div className="mt-6">
              <Card className="bg-gradient-to-r from-customgreys-secondarybg via-customgreys-darkGrey/50 to-customgreys-secondarybg border-violet-900/30 hover:border-violet-500/50 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2 w-10 h-10 mx-auto mb-3 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      Finalizar Capítulo
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 max-w-sm mx-auto">
                      Marque como concluído para atualizar seu progresso.
                    </p>
                    <Button
                      onClick={markChapterAsCompleted}
                      disabled={isMarkingComplete}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      size="default"
                    >
                      {isMarkingComplete ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Marcando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Concluído
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Completed State */}
          {hasMarkedComplete && (
            <div className="mt-8">
              <Card className="bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-green-500/10 border-green-500/30">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-green-400 font-bold text-xl mb-2">
                      ✅ Capítulo Concluído!
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Parabéns! Você completou este capítulo com sucesso.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span>Progresso atualizado</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-green-400" />
                        <span>XP ganho</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
          </div>
        </div>

      </div>

      {/* Netflix-style Bottom Right Countdown */}
      {showNextVideoCountdown && nextChapter && (
        <div 
          style={{ 
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999999999,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minWidth: '300px',
            maxWidth: '350px',
            border: '2px solid rgba(139, 92, 246, 0.5)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            pointerEvents: 'auto',
            isolation: 'isolate',
            animation: 'slideInFromRight 0.3s ease-out'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ 
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#8B5CF6',
              border: '3px solid rgba(139, 92, 246, 0.7)',
              animation: 'pulse 1s infinite',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
            }}>
              {countdownSeconds}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#9CA3AF',
                marginBottom: '2px'
              }}>
                Próximo episódio
              </div>
              <div style={{ 
                fontSize: '13px',
                color: '#FFFFFF',
                fontWeight: '500',
                lineHeight: '1.3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {nextChapter.chapter.title}
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              onClick={cancelCountdown}
              style={{
                padding: '6px 12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                console.log('👆 User clicked "Assistir agora" button');
                cancelCountdown();
                const nextUrl = `/user/courses/${course?.courseId}/chapters/${nextChapter.chapter.chapterId}?autoplay=true`;
                console.log('📍 Manual navigation URL:', nextUrl);
                router.push(nextUrl);
              }}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <span style={{ fontSize: '10px' }}>▶</span>
              Assistir agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;
