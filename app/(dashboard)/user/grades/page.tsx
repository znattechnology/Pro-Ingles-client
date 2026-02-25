"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  Trophy,
  BookOpen,
  Brain,
  Target,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  TrendingUp,
  ChevronRight,
  BarChart3,
  Sparkles,
  Clock,
  Filter,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Types
interface CourseGradeItem {
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    level: string | null;
    category: string | null;
  };
  enrollment: {
    enrolled_at: string | null;
  };
  final_grade: {
    percentage: number;
    letter: string;
  };
  is_eligible_for_certificate: boolean;
  last_calculated_at: string;
  grading_mode: string;
  active_components: string[];
  grades?: {
    quizzes: {
      score: number;
      count: number;
      completed: number;
      passed: number;
    };
    practice: {
      score: number;
      count: number;
      completed: number;
    };
    conversation: {
      score: number;
      sessions: number;
      minutes: number;
      required: boolean;
    };
  };
  missing_requirements?: Array<{
    requirement: string;
    message: string;
    required: number;
    actual: number;
  }>;
}

interface GradesSummary {
  total_courses: number;
  courses_with_grades: number;
  average_grade: {
    percentage: number;
    letter: string;
  };
  certificates_earned: number;
  eligible_for_certificate: number;
}

interface AllGradesData {
  courses: CourseGradeItem[];
  summary: GradesSummary;
}

const AllGradesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();

  const [gradesData, setGradesData] = useState<AllGradesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth state
  useEffect(() => {
    // Wait a bit for auth to initialize from cookies/storage
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Redirect if not authenticated after auth check
  useEffect(() => {
    if (authChecked && !isAuthenticated && !authLoading) {
      router.push('/signin?redirect=/user/grades');
    }
  }, [authChecked, isAuthenticated, authLoading, router]);

  // Fetch all grades
  useEffect(() => {
    const fetchGrades = async () => {
      // Wait for auth to be checked first
      if (!authChecked) return;

      // If not authenticated, don't fetch
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await fetch(
          `http://localhost:8000/api/v1/student/video-courses/grades/all/?include_details=true&sort_by=${sortBy}`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Use cookies for auth
          }
        );

        if (response.ok) {
          const data = await response.json();
          setGradesData(data.data);
        } else if (response.status === 401) {
          router.push('/signin?redirect=/user/grades');
          return;
        } else {
          toast.error('Erro ao carregar notas');
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
        toast.error('Erro ao carregar notas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, [authChecked, isAuthenticated, sortBy, router]);

  // Helper functions
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    if (percentage > 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getGradeBg = (percentage: number) => {
    if (percentage >= 90) return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30';
    if (percentage >= 80) return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
    if (percentage >= 70) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    if (percentage >= 60) return 'from-orange-500/20 to-orange-600/10 border-orange-500/30';
    if (percentage > 0) return 'from-red-500/20 to-red-600/10 border-red-500/30';
    return 'from-gray-500/20 to-gray-600/10 border-gray-500/30';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLetterBadgeColor = (letter: string) => {
    if (letter.startsWith('A')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (letter.startsWith('B')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (letter.startsWith('C')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (letter.startsWith('D')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (letter === 'N/A') return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  // Filter courses
  const filteredCourses = gradesData?.courses.filter(course => {
    // Search filter
    if (searchQuery && !course.course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filterBy === 'eligible' && !course.is_eligible_for_certificate) {
      return false;
    }
    if (filterBy === 'not-eligible' && course.is_eligible_for_certificate) {
      return false;
    }
    if (filterBy === 'no-grade' && course.final_grade.letter !== 'N/A') {
      return false;
    }

    return true;
  }) || [];

  // Show loading while checking auth or fetching data
  if (!authChecked || isLoading) {
    return <Loading />;
  }

  // If not authenticated after check, show nothing (will redirect)
  if (!isAuthenticated) {
    return <Loading />;
  }

  if (!gradesData || gradesData.courses.length === 0) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
          <GraduationCap className="relative h-16 w-16 text-violet-400 mb-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Nenhum curso encontrado</h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          Inscreva-se em cursos para começar a acompanhar suas notas e progresso.
        </p>
        <Button
          onClick={() => router.push('/user/courses/explore')}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Explorar Cursos
        </Button>
      </div>
    );
  }

  const { summary } = gradesData;

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30">
                  <GraduationCap className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                    Minhas Notas
                  </h1>
                  <p className="text-gray-400 text-sm">Acompanhe seu desempenho em todos os cursos</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Average Grade */}
              <Card className={`bg-gradient-to-br ${getGradeBg(summary.average_grade.percentage)} backdrop-blur-sm border`}>
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl font-bold ${getGradeColor(summary.average_grade.percentage)}`}>
                    {summary.average_grade.letter}
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {summary.average_grade.percentage.toFixed(1)}%
                  </div>
                  <p className="text-gray-400 text-xs">Média Geral</p>
                </CardContent>
              </Card>

              {/* Total Courses */}
              <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-violet-400">
                    {summary.total_courses}
                  </div>
                  <p className="text-gray-400 text-xs">Cursos Inscritos</p>
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {summary.certificates_earned}
                  </div>
                  <p className="text-gray-400 text-xs">Certificados</p>
                </CardContent>
              </Card>

              {/* Eligible */}
              <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {summary.eligible_for_certificate}
                  </div>
                  <p className="text-gray-400 text-xs">Elegíveis</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-customgreys-secondarybg border-violet-900/30 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Filter */}
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full sm:w-48 bg-customgreys-secondarybg border-violet-900/30 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
              <SelectItem value="all" className="text-white hover:bg-violet-600/20">Todos os cursos</SelectItem>
              <SelectItem value="eligible" className="text-white hover:bg-violet-600/20">Elegíveis para certificado</SelectItem>
              <SelectItem value="not-eligible" className="text-white hover:bg-violet-600/20">Não elegíveis</SelectItem>
              <SelectItem value="no-grade" className="text-white hover:bg-violet-600/20">Sem notas</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 bg-customgreys-secondarybg border-violet-900/30 text-white">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-customgreys-secondarybg border-violet-900/30">
              <SelectItem value="recent" className="text-white hover:bg-violet-600/20">Mais recentes</SelectItem>
              <SelectItem value="grade" className="text-white hover:bg-violet-600/20">Maior nota</SelectItem>
              <SelectItem value="title" className="text-white hover:bg-violet-600/20">Alfabética</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        {filteredCourses.length === 0 ? (
          <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum curso encontrado</h3>
              <p className="text-gray-400">Tente ajustar os filtros de busca</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((item) => (
              <Card
                key={item.course.id}
                className="bg-customgreys-secondarybg/50 border-violet-900/30 hover:border-violet-500/50 transition-all duration-200 cursor-pointer group"
                onClick={() => router.push(`/user/courses/${item.course.id}/grades`)}
              >
                <CardContent className="p-0">
                  {/* Course Header with Thumbnail */}
                  <div className="relative h-32 bg-gradient-to-br from-violet-900/30 to-purple-900/30">
                    {item.course.thumbnail ? (
                      <img
                        src={item.course.thumbnail}
                        alt={item.course.title}
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-violet-400/50" />
                      </div>
                    )}

                    {/* Grade Badge Overlay */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1.5 rounded-lg border backdrop-blur-sm ${getLetterBadgeColor(item.final_grade.letter)}`}>
                        <span className="text-lg font-bold">{item.final_grade.letter}</span>
                        {item.final_grade.letter !== 'N/A' && (
                          <span className="text-xs ml-1">({item.final_grade.percentage.toFixed(0)}%)</span>
                        )}
                      </div>
                    </div>

                    {/* Eligibility Badge */}
                    {item.is_eligible_for_certificate && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Award className="h-3 w-3 mr-1" />
                          Elegível
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
                      {item.course.title}
                    </h3>

                    {/* Level and Category */}
                    <div className="flex items-center gap-2 mb-3">
                      {item.course.level && (
                        <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-300">
                          {item.course.level}
                        </Badge>
                      )}
                      {item.course.category && (
                        <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                          {item.course.category}
                        </Badge>
                      )}
                    </div>

                    {/* Grade Components */}
                    {item.grades && item.final_grade.letter !== 'N/A' && (
                      <div className="space-y-2 mb-3">
                        {/* Quizzes */}
                        {item.grades.quizzes.count > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Brain className="h-3 w-3 text-purple-400" />
                              <span>Quizzes</span>
                            </div>
                            <span className={getGradeColor(item.grades.quizzes.score)}>
                              {item.grades.quizzes.score.toFixed(0)}%
                            </span>
                          </div>
                        )}

                        {/* Practice */}
                        {item.grades.practice.count > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Target className="h-3 w-3 text-blue-400" />
                              <span>Exercícios</span>
                            </div>
                            <span className={getGradeColor(item.grades.practice.score)}>
                              {item.grades.practice.score.toFixed(0)}%
                            </span>
                          </div>
                        )}

                        {/* Conversation */}
                        {item.grades.conversation.sessions > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <MessageCircle className="h-3 w-3 text-emerald-400" />
                              <span>Conversação</span>
                            </div>
                            <span className={getGradeColor(item.grades.conversation.score)}>
                              {item.grades.conversation.score.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* N/A State */}
                    {item.final_grade.letter === 'N/A' && (
                      <div className="text-xs text-gray-400 mb-3">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        {item.grading_mode === 'no_content'
                          ? 'Curso sem avaliações configuradas'
                          : 'Complete atividades para ver suas notas'}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-violet-900/20">
                      <span className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(item.last_calculated_at).toLocaleDateString('pt-BR')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-violet-400 hover:text-violet-300 hover:bg-violet-600/20 p-0"
                      >
                        <span className="text-xs">Ver detalhes</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllGradesPage;
