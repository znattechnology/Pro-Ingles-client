"use client";

/**
 * Modern Learning Interface - Clean Implementation
 * 
 * This component now uses the new hook system from src/domains
 * completely replacing the Redux dependency. Provides a premium 
 * Duolingo-style experience with dark theme consistency.
 */

import { FeedWrapper } from "@/components/learn/FeedWrapper";
import { LearnHeader } from "./header";
import { UserProgressRedux } from "@/components/learn/UserProgressRedux";
import { UnitRedux } from "./unit-redux";
import { useEffect } from "react";
import Loading from "@/components/course/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  useFullMainLearnPage
} from '@/src/domains/student/practice-courses/hooks';
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
  // Use the new clean hook - single source of truth
  const {
    data,
    isLoading,
    error,
    actions,
    shouldRedirectToSelection,
    userProgress,
    course: activeCourse,
    units,
    stats: userStats,
  } = useFullMainLearnPage();

  // Debug logs
  console.log('🔍 LEARN PAGE MODERN HOOK - isLoading:', isLoading);
  console.log('🔍 LEARN PAGE MODERN HOOK - error:', error);
  console.log('🔍 LEARN PAGE MODERN HOOK - data:', data);
  console.log('🔍 LEARN PAGE MODERN HOOK - userProgress:', userProgress);
  console.log('🔍 LEARN PAGE MODERN HOOK - units length:', units.length);

  // Handle navigation - redirect to courses selection if no active course
  useEffect(() => {
    if (shouldRedirectToSelection()) {
      console.log('🔍 LEARN PAGE - No active course, redirecting to courses selection');
      actions.navigateToCourseSelection();
    }
  }, [shouldRedirectToSelection, actions]);

  // Loading state
  if (isLoading) {
    return (
      <Loading 
        title="Aprendizado Ativo"
        subtitle="Curso em Progresso"
        description="Carregando lições e progresso do curso..."
        icon={BookOpen}
        progress={85}
      />
    );
  }

  // Error state
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
              {error && typeof error === 'object' && 'message' in error 
                ? (error as any).message 
                : 'Erro ao carregar dados do curso'}
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
                onClick={() => actions.navigateToDashboard()}
                className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no data yet, wait for loading
  if (!data) {
    return null;
  }

  // Use progress percentage from stats
  const courseProgressPercentage = userStats?.courseProgressPercentage || 0;
  
  // Safe units array
  const safeUnits = Array.isArray(units) ? units : [];

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Modern Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-secondarybg to-customgreys-primarybg border-b border-customgreys-darkerGrey">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={actions.navigateToDashboard}
              className="text-customgreys-dirtyGrey hover:text-white hover:bg-customgreys-primarybg/50 transition-all duration-200 px-2 sm:px-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
            <div className="h-4 w-px bg-customgreys-darkerGrey" />
            <span className="text-customgreys-dirtyGrey text-xs sm:text-sm">Aprendizado</span>
          </div>
          
          {/* Course Title and Description */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
              <div className="bg-violet-500/20 rounded-lg p-2 w-fit">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text leading-tight">
                  {activeCourse?.title || 'Carregando...'}
                </h1>
                <p className="text-customgreys-dirtyGrey text-sm sm:text-base">
                  Continue a sua jornada de aprendizagem • {courseProgressPercentage}% concluído
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-customgreys-darkGrey rounded-full h-2 sm:h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${courseProgressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Lessons Progress */}
            <Card className="bg-customgreys-primarybg/50 backdrop-blur-sm border-customgreys-darkerGrey hover:border-blue-500/30 transition-all duration-300 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-2">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2 sm:p-2.5 group-hover:scale-110 transition-transform duration-200">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-customgreys-dirtyGrey text-xs sm:text-sm font-medium">Lições</p>
                    <div className="flex items-baseline justify-center sm:justify-start gap-1">
                      <span className="text-white text-lg sm:text-xl font-bold">{userStats?.completedLessons || 0}</span>
                      <span className="text-customgreys-dirtyGrey text-xs sm:text-sm">/{userStats?.totalLessons || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Streak */}
            <Card className="bg-customgreys-primarybg/50 backdrop-blur-sm border-customgreys-darkerGrey hover:border-orange-500/30 transition-all duration-300 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-2">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-2 sm:p-2.5 group-hover:scale-110 transition-transform duration-200">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-customgreys-dirtyGrey text-xs sm:text-sm font-medium">Sequência</p>
                    <div className="flex items-baseline justify-center sm:justify-start gap-1">
                      <span className="text-white text-lg sm:text-xl font-bold">{userStats?.streak || 0}</span>
                      <span className="text-customgreys-dirtyGrey text-xs sm:text-sm">dias</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Hearts */}
            <Card className="bg-customgreys-primarybg/50 backdrop-blur-sm border-customgreys-darkerGrey hover:border-red-500/30 transition-all duration-300 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-2">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-2 sm:p-2.5 group-hover:scale-110 transition-transform duration-200">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-customgreys-dirtyGrey text-xs sm:text-sm font-medium">Corações</p>
                    <div className="flex items-baseline justify-center sm:justify-start gap-1">
                      <span className="text-white text-lg sm:text-xl font-bold">{userStats?.hearts || 5}</span>
                      <span className="text-customgreys-dirtyGrey text-xs sm:text-sm">/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Points */}
            <Card className="bg-customgreys-primarybg/50 backdrop-blur-sm border-customgreys-darkerGrey hover:border-yellow-500/30 transition-all duration-300 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-2">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-2 sm:p-2.5 group-hover:scale-110 transition-transform duration-200">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-customgreys-dirtyGrey text-xs sm:text-sm font-medium">Pontos</p>
                    <span className="text-white text-lg sm:text-xl font-bold">{(userStats?.points || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Learning Content */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse gap-6 lg:gap-8 px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Right Sidebar - User Progress */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
            <UserProgressRedux />

            {/* Enhanced Daily Tips Card */}
            <Card className="relative bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-violet-500/10 border-violet-500/30 hover:border-violet-400/50 transition-all duration-300 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="relative p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-2 sm:p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <h3 className="text-white font-semibold text-sm">
                        Dica do Dia
                      </h3>
                      <div className="bg-violet-500/20 rounded-full px-2 py-0.5 w-fit">
                        <span className="text-violet-400 text-xs font-medium">Novo</span>
                      </div>
                    </div>
                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                      Pratique pelo menos 15 minutos por dia para melhores resultados!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:border-customgreys-darkGrey/50 transition-all duration-300">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-violet-400" />
                  <span className="text-sm sm:text-base">Ações Rápidas</span>
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.navigateToShop}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200 group min-h-[36px]"
                  >
                    <div className="bg-red-500/20 rounded-lg p-1 mr-2 sm:mr-3 group-hover:bg-red-500/30 transition-colors duration-200">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                    </div>
                    <span className="text-xs sm:text-sm">Comprar Corações</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.navigateToAchievements}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-yellow-500/10 hover:border-yellow-500/20 border border-transparent transition-all duration-200 group min-h-[36px]"
                  >
                    <div className="bg-yellow-500/20 rounded-lg p-1 mr-2 sm:mr-3 group-hover:bg-yellow-500/30 transition-colors duration-200">
                      <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
                    </div>
                    <span className="text-xs sm:text-sm">Ver Conquistas</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.navigateToLeaderboard}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition-all duration-200 group min-h-[36px]"
                  >
                    <div className="bg-purple-500/20 rounded-lg p-1 mr-2 sm:mr-3 group-hover:bg-purple-500/30 transition-colors duration-200">
                      <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
                    </div>
                    <span className="text-xs sm:text-sm">Rankings</span>
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
            <div className="mb-6 sm:mb-8">
              <LearnHeader title={activeCourse?.title || 'Carregando...'} />
              
              {/* Enhanced Progress Summary */}
              {(userStats?.totalLessons || 0) > 0 && (
                <Card className="mt-3 sm:mt-4 bg-gradient-to-r from-customgreys-secondarybg to-customgreys-primarybg border-customgreys-darkerGrey hover:border-green-500/20 transition-all duration-300">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium text-sm sm:text-base">
                          Progresso do Curso
                        </span>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold text-white">
                          {courseProgressPercentage}%
                        </div>
                        <div className="text-xs text-customgreys-dirtyGrey">
                          {userStats?.completedLessons || 0} de {userStats?.totalLessons || 0} lições
                        </div>
                      </div>
                    </div>
                    <div className="relative w-full bg-customgreys-darkGrey rounded-full h-2 sm:h-3 overflow-hidden">
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
            <div className="space-y-6 sm:space-y-8">
              {safeUnits.length > 0 && safeUnits.map((unit: any) => (
                <div key={unit.id} className="mb-6 sm:mb-10">
                  <UnitRedux
                    id={unit.id}
                    order={unit.order}
                    description={unit.description}
                    title={unit.title}
                    lessons={unit.lessons || []}
                    activeLesson={undefined}
                    activeLessonPercentage={0}
                    courseId={activeCourse?.id}
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
                      onClick={actions.navigateToCourseSelection}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explorar Outros Cursos
                    </Button>
                    <Button
                      variant="outline"
                      onClick={actions.navigateToDashboard}
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