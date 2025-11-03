"use client";

/**
 * Student Dashboard - Modern Hub Implementation
 * 
 * This is the main dashboard for students, providing a comprehensive overview
 * of their learning progress, achievements, and quick access to all features.
 * Follows the same design patterns as the teacher laboratory system.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Flame, 
  Heart, 
  Star,
  Clock,
  TrendingUp,
  Users,
  PlayCircle,
  Award,
  Calendar,
  ArrowRight,
  Zap,
  Crown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  useGetStudentProgressQuery, 
  useGetAvailableCoursesQuery 
} from '@/src/domains/student/practice-courses/api/studentPracticeApiSlice';
import Loading from '@/components/course/Loading';

interface UserStats {
  points: number;
  hearts: number;
  streak: number;
  completedLessons: number;
  totalLessons: number;
  weeklyGoal: number;
  weeklyProgress: number;
  rank: number;
  totalUsers: number;
  achievements: number;
  level: number;
}

interface RecentActivity {
  id: string;
  type: 'lesson' | 'challenge' | 'achievement';
  title: string;
  points: number;
  timestamp: string;
}

interface ActiveCourse {
  id: string;
  title: string;
  progress: number;
  nextLesson: string;
  category: string;
  level: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  
  // Use Redux hooks for data fetching
  const { data: studentProgress, isLoading: progressLoading } = useGetStudentProgressQuery();
  const { data: practiceCoursesData, isLoading: coursesLoading } = useGetAvailableCoursesQuery();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  
  const loading = progressLoading || coursesLoading;

  useEffect(() => {
    if (studentProgress) {
      // Mock data for demonstration - replace with real API calls
      const mockStats: UserStats = {
        points: studentProgress[0]?.total_points || 1250,
        hearts: studentProgress[0]?.hearts || 5,
        streak: 7, // days
        completedLessons: studentProgress[0]?.completed_lessons || 45,
        totalLessons: studentProgress[0]?.total_lessons || 120,
        weeklyGoal: 5, // lessons per week
        weeklyProgress: 3, // completed this week
        rank: 15,
        totalUsers: 342,
        achievements: 12,
        level: 8
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'lesson',
          title: 'Completed: Present Simple',
          points: 25,
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Achievement: Week Warrior',
          points: 50,
          timestamp: '1 day ago'
        },
        {
          id: '3',
          type: 'challenge',
          title: 'Perfect Score in Grammar',
          points: 30,
          timestamp: '2 days ago'
        }
      ];

      const mockCourses: ActiveCourse[] = [
        {
          id: '1',
          title: 'English Grammar Fundamentals',
          progress: 68,
          nextLesson: 'Past Perfect Tense',
          category: 'Grammar',
          level: 'Intermediate'
        },
        {
          id: '2', 
          title: 'Business English Vocabulary',
          progress: 34,
          nextLesson: 'Meeting Expressions',
          category: 'Business',
          level: 'Advanced'
        }
      ];

      setUserStats(mockStats);
      setRecentActivity(mockActivity);
      setActiveCourses(mockCourses);
    }
  }, [studentProgress]);

  if (loading) {
    return <Loading />;
  }

  const progressPercentage = userStats ? (userStats.completedLessons / userStats.totalLessons) * 100 : 0;
  const weeklyGoalPercentage = userStats ? (userStats.weeklyProgress / userStats.weeklyGoal) * 100 : 0;

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Bem-vindo de volta! 👋
            </h1>
            <p className="text-customgreys-dirtyGrey text-sm sm:text-base">
              Continua a sua jornada de aprendizagem • Nível {userStats?.level}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500 text-yellow-400 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">#{userStats?.rank} de {userStats?.totalUsers}</span>
              <span className="sm:hidden">#{userStats?.rank}</span>
            </Badge>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-customgreys-dirtyGrey text-xs sm:text-sm">Pontos</p>
                  <p className="text-lg sm:text-2xl font-bold text-white truncate">{userStats?.points.toLocaleString()}</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <Star className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Sequência</p>
                  <p className="text-2xl font-bold text-white">{userStats?.streak} dias</p>
                </div>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Corações</p>
                  <p className="text-2xl font-bold text-white">{userStats?.hearts}/5</p>
                </div>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Heart className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Conquistas</p>
                  <p className="text-2xl font-bold text-white">{userStats?.achievements}</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Progress and Goals */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Learning Progress */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="hidden sm:inline">Progresso de Aprendizagem</span>
                <span className="sm:hidden">Progresso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-white">
                    <span className="hidden sm:inline">Lições Completadas</span>
                    <span className="sm:hidden">Lições</span>
                  </span>
                  <span className="text-customgreys-dirtyGrey">
                    {userStats?.completedLessons}/{userStats?.totalLessons}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-1.5 sm:h-2 bg-customgreys-darkGrey" />
              </div>
              
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-white">
                    <span className="hidden sm:inline">Meta Semanal</span>
                    <span className="sm:hidden">Meta</span>
                  </span>
                  <span className="text-customgreys-dirtyGrey">
                    {userStats?.weeklyProgress}/{userStats?.weeklyGoal} lições
                  </span>
                </div>
                <Progress value={weeklyGoalPercentage} className="h-1.5 sm:h-2 bg-customgreys-darkGrey" />
                {weeklyGoalPercentage >= 100 && (
                  <p className="text-green-400 text-xs mt-1">🎉 Meta semanal concluída!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Courses */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Cursos Activos
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/user/laboratory/learn/courses')}
                  className="text-violet-400 hover:text-violet-300 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Ver todos</span>
                  <span className="sm:hidden">Todos</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              {activeCourses.map((course) => (
                <div 
                  key={course.id}
                  className="bg-customgreys-primarybg rounded-lg p-3 sm:p-4 border border-customgreys-darkerGrey hover:border-violet-500/50 transition-colors cursor-pointer"
                  onClick={() => router.push('/user/laboratory/learn')}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-white font-medium text-sm sm:text-base truncate">{course.title}</h3>
                      <p className="text-customgreys-dirtyGrey text-xs sm:text-sm">
                        Próxima: {course.nextLesson}
                      </p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs bg-customgreys-darkGrey text-customgreys-dirtyGrey">
                        {course.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-customgreys-darkGrey text-customgreys-dirtyGrey">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-3 sm:mr-4">
                      <Progress value={course.progress} className="h-1.5 sm:h-2 bg-customgreys-darkGrey" />
                    </div>
                    <span className="text-customgreys-dirtyGrey text-xs sm:text-sm flex-shrink-0">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                <span className="hidden sm:inline">Actividade Recente</span>
                <span className="sm:hidden">Actividade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-customgreys-primarybg rounded-lg border border-customgreys-darkerGrey">
                    <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                      activity.type === 'lesson' ? 'bg-blue-500/20' :
                      activity.type === 'achievement' ? 'bg-purple-500/20' :
                      'bg-green-500/20'
                    }`}>
                      {activity.type === 'lesson' ? <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" /> :
                       activity.type === 'achievement' ? <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" /> :
                       <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-customgreys-dirtyGrey text-xs">{activity.timestamp}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-yellow-400 font-medium text-xs sm:text-sm">+{activity.points}</p>
                      <p className="text-customgreys-dirtyGrey text-xs">pontos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions and Social */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Quick Actions */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">
                <span className="hidden sm:inline">Acções Rápidas</span>
                <span className="sm:hidden">Acções</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
              <Button
                onClick={() => router.push('/user/laboratory/learn')}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white justify-start h-10 sm:h-12 text-sm sm:text-base"
              >
                <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                <span className="hidden sm:inline">Continuar Aprendendo</span>
                <span className="sm:hidden">Continuar</span>
              </Button>
              
              
              <Button
                onClick={() => router.push('/user/laboratory/achievements')}
                variant="outline"
                className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey justify-start h-10 sm:h-12 text-sm sm:text-base"
              >
                <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Conquistas
              </Button>
              
              <Button
                onClick={() => router.push('/user/laboratory/leaderboard')}
                variant="outline"
                className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey justify-start h-10 sm:h-12 text-sm sm:text-base"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Rankings
              </Button>
            </CardContent>
          </Card>

          {/* Daily Streak Challenge */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="bg-orange-500/20 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg mb-2">
                  {userStats?.streak} dias seguidos!
                </h3>
                <p className="text-orange-200 text-xs sm:text-sm mb-3 sm:mb-4">
                  <span className="hidden sm:inline">Continua a sua sequência hoje para ganhar pontos extras</span>
                  <span className="sm:hidden">Continua a sequência hoje</span>
                </p>
                <Button
                  onClick={() => router.push('/user/laboratory/learn')}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base"
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Manter Sequência</span>
                  <span className="sm:hidden">Manter</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Goal Progress */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="hidden sm:inline">Meta da Semana</span>
                <span className="sm:hidden">Meta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      className="text-customgreys-darkGrey sm:hidden"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-customgreys-darkGrey hidden sm:block"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - weeklyGoalPercentage / 100)}`}
                      className="text-green-400 sm:hidden"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - weeklyGoalPercentage / 100)}`}
                      className="text-green-400 hidden sm:block"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {userStats?.weeklyProgress}/{userStats?.weeklyGoal}
                    </span>
                  </div>
                </div>
                <p className="text-customgreys-dirtyGrey text-xs sm:text-sm">
                  {userStats?.weeklyGoal && userStats?.weeklyProgress >= userStats?.weeklyGoal
                    ? '🎉 Meta concluída!'
                    : `${(userStats?.weeklyGoal || 0) - (userStats?.weeklyProgress || 0)} lições restantes`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Competition Preview */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="bg-purple-500/20 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg mb-2">
                  Liga Diamante
                </h3>
                <p className="text-purple-200 text-xs sm:text-sm mb-3 sm:mb-4">
                  <span className="hidden sm:inline">Estás em #{userStats?.rank} de {userStats?.totalUsers} estudantes</span>
                  <span className="sm:hidden">#{userStats?.rank} de {userStats?.totalUsers}</span>
                </p>
                <Button
                  onClick={() => router.push('/user/laboratory/leaderboard')}
                  variant="outline"
                  className="bg-purple-500/20 border-purple-500 text-purple-300 hover:bg-purple-500/30 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Ver Ranking</span>
                  <span className="sm:hidden">Ranking</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}