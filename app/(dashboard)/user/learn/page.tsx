"use client";

/**
 * Modern Learning Interface - Redesigned Student Experience
 * 
 * This is the modernized learning interface that follows the same design
 * principles as the teacher laboratory system. Provides a premium Duolingo-style
 * experience with dark theme consistency.
 */

import { FeedWrapper } from "@/components/learn/FeedWrapper";
import { StickWrapper } from "@/components/learn/StickyWrapper";
import { LearnHeader } from "./header";
import { UserProgress } from "@/components/learn/UserProgress";
import { Unit } from "./unit";
import { getUserProgress, getUnits, getCourseProgress, getLessonPercentage } from "@/db/django-queries";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Loading from "@/components/course/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock,
  Star,
  ArrowLeft,
  Lightbulb,
  Zap
} from "lucide-react";

const LearnPage = () => {
  const router = useRouter();
  const [userProgress, setUserProgress] = useState(null);
  const [units, setUnits] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [lessonPercentage, setLessonPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // First get user progress to check for active course
        const userProgressData = await getUserProgress();
        
        if (!userProgressData || !userProgressData.active_course) {
          router.push("/user/learn/courses");
          return;
        }

        setUserProgress(userProgressData);

        // Get course data
        const courseId = userProgressData.active_course.id;
        const [unitsData, courseProgressData] = await Promise.all([
          getUnits(courseId),
          getCourseProgress(courseId)
        ]);

        setUnits(unitsData);
        setCourseProgress(courseProgressData);

        // Get lesson percentage if there's an active lesson
        if (courseProgressData?.activeLessonId) {
          const percentage = await getLessonPercentage(courseProgressData.activeLessonId);
          setLessonPercentage(percentage);
        }

        if (!courseProgressData) {
          router.push("/user/learn/courses");
          return;
        }

      } catch (error) {
        console.error("Error loading learn page:", error);
        router.push("/user/learn/courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!userProgress || !userProgress.active_course) {
    return null; // Will redirect via useEffect
  }

  const activeCourse = (userProgress as any).active_course;
  const userStats = {
    hearts: (userProgress as any).hearts,
    points: (userProgress as any).points,
    streak: 7, // Mock data - replace with real API
    completedLessons: units.reduce((acc: number, unit: any) => 
      acc + unit.lessons.filter((lesson: any) => lesson.isCompleted).length, 0
    ),
    totalLessons: units.reduce((acc: number, unit: any) => acc + unit.lessons.length, 0)
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header Section */}
      <div className="bg-customgreys-secondarybg border-b border-customgreys-darkerGrey">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/user/dashboard')}
                className="text-customgreys-dirtyGrey hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeCourse.title}
                </h1>
                <p className="text-customgreys-dirtyGrey text-sm">
                  Continue sua jornada de aprendizagem
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-customgreys-primarybg px-3 py-2 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">{userStats.points.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-customgreys-primarybg px-3 py-2 rounded-lg">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">{userStats.completedLessons}/{userStats.totalLessons}</span>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="bg-customgreys-primarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-500/20 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-customgreys-dirtyGrey text-sm">Lições</p>
                  <p className="text-white font-bold">{userStats.completedLessons}/{userStats.totalLessons}</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-500/20 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-customgreys-dirtyGrey text-sm">Sequência</p>
                  <p className="text-white font-bold">{userStats.streak} dias</p>
                </div>
                <div className="text-center">
                  <div className="bg-red-500/20 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-customgreys-dirtyGrey text-sm">Corações</p>
                  <p className="text-white font-bold">{userStats.hearts}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Learning Content */}
      <div className="max-w-7xl mx-auto flex flex-row-reverse gap-8 px-6 py-8">
        
        {/* Right Sidebar - User Progress */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            <UserProgress
              activeCourse={activeCourse}
              hearts={userStats.hearts}
              points={userStats.points}
              hasActiveSubscription={false}
            />

            {/* Daily Tips Card */}
            <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-violet-500/20 rounded-lg p-2">
                    <Lightbulb className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm mb-1">
                      Dica do Dia
                    </h3>
                    <p className="text-violet-200 text-xs">
                      Pratique pelo menos 15 minutos por dia para melhores resultados!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-3">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/user/learn/shop')}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-customgreys-primarybg"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Comprar Corações
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/user/achievements')}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-customgreys-primarybg"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Ver Conquistas
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/user/leaderboard')}
                    className="w-full justify-start text-customgreys-dirtyGrey hover:text-white hover:bg-customgreys-primarybg"
                  >
                    <Star className="w-4 h-4 mr-2" />
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
              <LearnHeader title={activeCourse.title} />
              
              {/* Progress Summary */}
              {userStats.totalLessons > 0 && (
                <Card className="mt-4 bg-customgreys-secondarybg border-customgreys-darkerGrey">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm">Progresso Geral</span>
                      <span className="text-customgreys-dirtyGrey text-sm">
                        {Math.round((userStats.completedLessons / userStats.totalLessons) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-customgreys-darkGrey rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(userStats.completedLessons / userStats.totalLessons) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Units */}
            <div className="space-y-8">
              {units.map((unit: any) => (
                <div key={unit.id} className="mb-10">
                  <Unit
                    id={unit.id}
                    order={unit.order}
                    description={unit.description}
                    title={unit.title}
                    lessons={unit.lessons}
                    activeLesson={(courseProgress as any)?.activeLesson}
                    activeLessonPercentage={lessonPercentage}
                  />
                </div>
              ))}
            </div>

            {/* No Units Message */}
            {units.length === 0 && (
              <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-16 h-16 text-customgreys-dirtyGrey mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Curso em Construção
                  </h3>
                  <p className="text-customgreys-dirtyGrey text-center mb-6 max-w-md">
                    Este curso está sendo preparado pelos nossos professores. 
                    Em breve você terá acesso a lições incríveis!
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => router.push('/user/learn/courses')}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      Explorar Outros Cursos
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/user/dashboard')}
                      className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                    >
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
