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
  ShoppingBag,
  Award,
  Calendar,
  ArrowRight,
  Zap,
  Crown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetStudentProgressListQuery, useGetTeacherCoursesQuery } from '@/src/domains/teacher/practice-courses/api';
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
  const { data: practiceCoursesData, isLoading: coursesLoading } = useGetPracticeCoursesQuery();
  
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
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bem-vindo de volta! 👋
            </h1>
            <p className="text-customgreys-dirtyGrey">
              Continue a sua jornada de aprendizagem • Nível {userStats?.level}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500 text-yellow-400 px-4 py-2">
              <Crown className="w-4 h-4 mr-1" />
              #{userStats?.rank} de {userStats?.totalUsers}
            </Badge>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-customgreys-dirtyGrey text-sm">Pontos</p>
                  <p className="text-2xl font-bold text-white">{userStats?.points.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Star className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardContent className="p-4">
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
            <CardContent className="p-4">
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
            <CardContent className="p-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress and Goals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Learning Progress */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Progresso de Aprendizagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white">Lições Completadas</span>
                  <span className="text-customgreys-dirtyGrey">
                    {userStats?.completedLessons}/{userStats?.totalLessons}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-customgreys-darkGrey" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white">Meta Semanal</span>
                  <span className="text-customgreys-dirtyGrey">
                    {userStats?.weeklyProgress}/{userStats?.weeklyGoal} lições
                  </span>
                </div>
                <Progress value={weeklyGoalPercentage} className="h-2 bg-customgreys-darkGrey" />
                {weeklyGoalPercentage >= 100 && (
                  <p className="text-green-400 text-xs mt-1">🎉 Meta semanal concluída!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Courses */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Cursos Ativos
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/user/laboratory/learn/courses')}
                  className="text-violet-400 hover:text-violet-300"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeCourses.map((course) => (
                <div 
                  key={course.id}
                  className="bg-customgreys-primarybg rounded-lg p-4 border border-customgreys-darkerGrey hover:border-violet-500/50 transition-colors cursor-pointer"
                  onClick={() => router.push('/user/laboratory/learn')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-medium">{course.title}</h3>
                      <p className="text-customgreys-dirtyGrey text-sm">
                        Próxima: {course.nextLesson}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs bg-customgreys-darkGrey text-customgreys-dirtyGrey">
                        {course.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-customgreys-darkGrey text-customgreys-dirtyGrey">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <Progress value={course.progress} className="h-2 bg-customgreys-darkGrey" />
                    </div>
                    <span className="text-customgreys-dirtyGrey text-sm">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-customgreys-primarybg rounded-lg border border-customgreys-darkerGrey">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'lesson' ? 'bg-blue-500/20' :
                      activity.type === 'achievement' ? 'bg-purple-500/20' :
                      'bg-green-500/20'
                    }`}>
                      {activity.type === 'lesson' ? <BookOpen className="w-4 h-4 text-blue-400" /> :
                       activity.type === 'achievement' ? <Trophy className="w-4 h-4 text-purple-400" /> :
                       <Target className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{activity.title}</p>
                      <p className="text-customgreys-dirtyGrey text-xs">{activity.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-medium text-sm">+{activity.points}</p>
                      <p className="text-customgreys-dirtyGrey text-xs">pontos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions and Social */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push('/user/laboratory/learn')}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white justify-start h-12"
              >
                <PlayCircle className="w-5 h-5 mr-3" />
                Continuar Aprendendo
              </Button>
              
              <Button
                onClick={() => router.push('/user/laboratory/learn/shop')}
                variant="outline"
                className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey justify-start h-12"
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Loja de Corações
              </Button>
              
              <Button
                onClick={() => router.push('/user/laboratory/achievements')}
                variant="outline"
                className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey justify-start h-12"
              >
                <Award className="w-5 h-5 mr-3" />
                Conquistas
              </Button>
              
              <Button
                onClick={() => router.push('/user/laboratory/leaderboard')}
                variant="outline"
                className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey justify-start h-12"
              >
                <Users className="w-5 h-5 mr-3" />
                Rankings
              </Button>
            </CardContent>
          </Card>

          {/* Daily Streak Challenge */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-orange-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Flame className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {userStats?.streak} dias seguidos!
                </h3>
                <p className="text-orange-200 text-sm mb-4">
                  Continue a sua sequência hoje para ganhar pontos extras
                </p>
                <Button
                  onClick={() => router.push('/user/laboratory/learn')}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Manter Sequência
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Goal Progress */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Meta da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-customgreys-darkGrey"
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
                      className="text-green-400"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {userStats?.weeklyProgress}/{userStats?.weeklyGoal}
                    </span>
                  </div>
                </div>
                <p className="text-customgreys-dirtyGrey text-sm">
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
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Liga Diamante
                </h3>
                <p className="text-purple-200 text-sm mb-4">
                  Você está em #{userStats?.rank} de {userStats?.totalUsers} estudantes
                </p>
                <Button
                  onClick={() => router.push('/user/laboratory/leaderboard')}
                  variant="outline"
                  className="bg-purple-500/20 border-purple-500 text-purple-300 hover:bg-purple-500/30"
                >
                  Ver Ranking
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}