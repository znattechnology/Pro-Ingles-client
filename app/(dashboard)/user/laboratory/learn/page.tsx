"use client";

/**
 * Modern Learning Interface - Redesigned Student Experience
 * 
 * This is the modernized learning interface that follows the same design
 * principles as the teacher laboratory system. Provides a premium Duolingo-style
 * experience with dark theme consistency.
 * 
 * 🔄 REDUX MIGRATION: This component now supports Redux with feature flags
 */

import { FeedWrapper } from "@/components/learn/FeedWrapper";
import { LearnHeader } from "./header";
import { UserProgressRedux } from "@/components/learn/UserProgressRedux";
import { UnitRedux } from "./unit-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/course/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  useFullMainLearnPage,
  useLearnPageNavigation 
} from '@/redux/features/laboratory/hooks/useMainLearnPage';
import { 
  BookOpen, 
  Star,
  ArrowLeft,
  Zap,
  Flame,
  Award,
  TrendingUp,
  CheckCircle,
  CircleDot,
  Sparkles
} from "lucide-react";

const LearnPage = () => {
  const router = useRouter();
  
  // Redux hooks
  const {
    data,
    isLoading,
    error,
    stats,
    actions,
  } = useFullMainLearnPage();
  
  // Extract data from Redux
  const userProgress = data?.userProgress;
  const units = data?.units || [];
  const courseProgress = data?.courseProgress;
  const lessonPercentage = data?.lessonPercentage || 0;

  
  // Handle Redux navigation and redirects
  const pageNavigation = useLearnPageNavigation();
  
  useEffect(() => {
    if (data?.userProgress && !isLoading) {
      const shouldContinue = pageNavigation.navigateToActiveCourse(router, data.userProgress);
      if (!shouldContinue) {
        return;
      }
    }
  }, [data, isLoading, router, pageNavigation]);

  if (isLoading) {
    return <Loading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-customgreys-secondarybg border-red-500/30">
          <CardContent className="p-8 text-center">
            <div className="mb-4 rounded-full bg-red-500/20 p-4 inline-flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Oops! Algo deu errado</h2>
            <p className="text-customgreys-dirtyGrey mb-6 leading-relaxed">
              {error}
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              >
                Tentar Novamente
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
              >
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProgress || !userProgress.active_course) {
    return null; // Will redirect via useEffect
  }

  const activeCourse = data?.activeCourse || (userProgress as any)?.active_course;
  
  // Get stats from Redux or calculate fallback stats
  const userStats = stats || {
    hearts: (userProgress as any)?.hearts || 5,
    points: (userProgress as any)?.points || 0,
    streak: 7, // Mock data - replace with real API
    completedLessons: (() => {
      const safeUnits = Array.isArray(units) ? units : [];
      return safeUnits.reduce((acc: number, unit: any) => {
        if (!unit?.lessons || !Array.isArray(unit.lessons)) return acc;
        return acc + unit.lessons.filter((lesson: any) => lesson?.completed === true).length;
      }, 0);
    })(),
    totalLessons: (() => {
      const safeUnits = Array.isArray(units) ? units : [];
      return safeUnits.reduce((acc: number, unit: any) => {
        if (!unit?.lessons || !Array.isArray(unit.lessons)) return acc;
        return acc + unit.lessons.length;
      }, 0);
    })(),
    courseProgressPercentage: 0,
  };
  
  // Calculate progress percentage
  const courseProgressPercentage = userStats.courseProgressPercentage || 
    (userStats.totalLessons > 0 ? Math.round((userStats.completedLessons / userStats.totalLessons) * 100) : 0);
  
  // Safe units array
  const safeUnits = Array.isArray(units) ? units : [];

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Modern Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-secondarybg to-customgreys-primarybg border-b border-customgreys-darkerGrey">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Navigation */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/user/dashboard')}
              className="text-customgreys-dirtyGrey hover:text-white hover:bg-customgreys-primarybg/50 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-4 w-px bg-customgreys-darkerGrey" />
            <span className="text-customgreys-dirtyGrey text-sm">Aprendizado</span>
          </div>
          
          {/* Course Title and Description */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-violet-500/20 rounded-lg p-2">
                <BookOpen className="w-6 h-6 text-violet-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                  {activeCourse?.title || 'Carregando...'}
                </h1>
                <p className="text-customgreys-dirtyGrey">
                  Continue a sua jornada de aprendizagem • {courseProgressPercentage}% concluído
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-customgreys-darkGrey rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${courseProgressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Lessons Progress */}
            <Card className="bg-customgreys-primarybg/50 backdrop-blur-sm border-customgreys-darkerGrey hover:border-blue-500/30 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-200">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-customgreys-dirtyGrey text-sm font-medium">Lições</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-xl font-bold">{userStats.completedLessons}</span>
                      <span className="text-customgreys-dirtyGrey text-sm">/{userStats.totalLessons}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Streak */}
            <Card className="bg-customgreys-primarybg/50 backdrop-blur-sm border-customgreys-darkerGrey hover:border-orange-500/30 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-200">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-customgreys-dirtyGrey text-sm font-medium">Sequência</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-xl font-bold">{userStats.streak}</span>
                      <span className="text-customgreys-dirtyGrey text-sm">dias</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Hearts */}
            <Card className="bg-customgreys-primarybg/50 backdrop-blur-sm border-customgreys-darkerGrey hover:border-red-500/30 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-200">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-customgreys-dirtyGrey text-sm font-medium">Corações</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-xl font-bold">{userStats.hearts}</span>
                      <span className="text-customgreys-dirtyGrey text-sm">/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Points */}
            <Card className="bg-customgreys-primarybg/50 backdrop-blur-sm border-customgreys-darkerGrey hover:border-yellow-500/30 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-200">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-customgreys-dirtyGrey text-sm font-medium">Pontos</p>
                    <span className="text-white text-xl font-bold">{userStats.points.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Learning Content */}
      <div className="max-w-7xl mx-auto flex flex-row-reverse gap-8 px-6 py-8">
        
        {/* Right Sidebar - User Progress */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            <UserProgressRedux
              useRedux={true}
              hasActiveSubscription={false}
            />

            {/* Enhanced Daily Tips Card */}
            <Card className="relative bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-violet-500/10 border-violet-500/30 hover:border-violet-400/50 transition-all duration-300 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="relative p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold text-sm">
                        Dica do Dia
                      </h3>
                      <div className="bg-violet-500/20 rounded-full px-2 py-0.5">
                        <span className="text-violet-400 text-xs font-medium">Novo</span>
                      </div>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      Pratique pelo menos 15 minutos por dia para melhores resultados!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:border-customgreys-darkGrey/50 transition-all duration-300">
              <CardContent className="p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-violet-400" />
                  Ações Rápidas
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (actions) {
                        actions.buyHearts();
                      }
                      router.push('/user/laboratory/learn/shop');
                    }}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200 group"
                  >
                    <div className="bg-red-500/20 rounded-lg p-1 mr-3 group-hover:bg-red-500/30 transition-colors duration-200">
                      <Zap className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    Comprar Corações
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (actions) {
                        actions.viewAchievements();
                      }
                      router.push('/user/laboratory/achievements');
                    }}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-yellow-500/10 hover:border-yellow-500/20 border border-transparent transition-all duration-200 group"
                  >
                    <div className="bg-yellow-500/20 rounded-lg p-1 mr-3 group-hover:bg-yellow-500/30 transition-colors duration-200">
                      <Award className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    Ver Conquistas
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (actions) {
                        actions.viewLeaderboard();
                      }
                      router.push('/user/laboratory/leaderboard');
                    }}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition-all duration-200 group"
                  >
                    <div className="bg-purple-500/20 rounded-lg p-1 mr-3 group-hover:bg-purple-500/30 transition-colors duration-200">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    Rankings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Left Main Content - Course Units */}
        <div className="flex-1">
          <FeedWrapper>
            {/* Course Header */}
            <div className="mb-8">
              <LearnHeader title={activeCourse?.title || 'Carregando...'} />
              
              {/* Enhanced Progress Summary */}
              {userStats.totalLessons > 0 && (
                <Card className="mt-4 bg-gradient-to-r from-customgreys-secondarybg to-customgreys-primarybg border-customgreys-darkerGrey hover:border-green-500/20 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">
                          Progresso do Curso
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {courseProgressPercentage}%
                        </div>
                        <div className="text-xs text-customgreys-dirtyGrey">
                          {userStats.completedLessons} de {userStats.totalLessons} lições
                        </div>
                      </div>
                    </div>
                    <div className="relative w-full bg-customgreys-darkGrey rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out relative"
                        style={{ width: `${courseProgressPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Units */}
            <div className="space-y-8">
              {safeUnits.length > 0 && safeUnits.map((unit: any) => (
                <div key={unit.id} className="mb-10">
                  <UnitRedux
                    id={unit.id}
                    order={unit.order}
                    description={unit.description}
                    title={unit.title}
                    lessons={unit.lessons || []}
                    activeLesson={(courseProgress as any)?.activeLesson}
                    activeLessonPercentage={lessonPercentage || 0}
                    courseId={activeCourse?.id}
                    useRedux={true}
                  />
                </div>
              ))}
            </div>

            {/* Enhanced No Units Message */}
            {safeUnits.length === 0 && (
              <Card className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-secondarybg/80 to-customgreys-primarybg border-customgreys-darkerGrey overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
                <CardContent className="relative flex flex-col items-center justify-center py-16">
                  <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full p-6 mb-6">
                    <BookOpen className="w-12 h-12 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Curso em Construção
                  </h3>
                  <p className="text-customgreys-dirtyGrey text-center mb-8 max-w-md leading-relaxed">
                    Este curso está sendo cuidadosamente preparado pelos nossos professores. 
                    Em breve você terá acesso a lições incríveis e desafiadoras!
                  </p>
                  
                  {/* Course Construction Progress Indicator */}
                  <div className="w-full max-w-xs mb-8">
                    <div className="flex justify-between text-xs text-customgreys-dirtyGrey mb-2">
                      <span>Progresso da Criação</span>
                      <span>75%</span>
                    </div>
                    <div className="bg-customgreys-darkGrey rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full" style={{width: '75%'}} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => router.push('/user/laboratory/learn/courses')}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explorar Outros Cursos
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/user/dashboard')}
                      className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey hover:border-customgreys-dirtyGrey transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </FeedWrapper>
        </div>
      </div>

    </div>
  );
};

export default LearnPage;
