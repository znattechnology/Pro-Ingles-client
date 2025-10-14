"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useTeacherCourses, 
  useTeacherCourseFilters, 
  useTeacherDashboardStats,
  useTeacherMigrationDebug 
} from '@/redux/features/laboratory/hooks/useTeacherCourses';
import { 
  Plus,
  Search,
  Edit,
  Eye,
  Settings,
  ChevronLeft,
  Users,
  Target,
  BookOpen,
  TrendingUp,
  Globe,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  Layers,
  Fuel,
  Building2,
  Crown,
  Brain,
} from "lucide-react";
import { useGetTeacherCoursesQuery } from "@/src/domains/teacher/practice-courses/api";

const ManageCoursesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useDjangoAuth();
  
  // Feature flags
  const useReduxTeacher = useFeatureFlag('REDUX_TEACHER_MANAGEMENT');
  
  // Practice API Redux hooks - use teacher endpoint to include drafts
  const { data: practiceCoursesData, isLoading: practiceLoading, error: practiceError, refetch: refetchPractice } = useGetTeacherCoursesQuery({ includeDrafts: true });
  
  // Redux hooks
  const { courses: reduxCourses, isLoading: reduxLoading, error: reduxError, refetch } = useTeacherCourses();
  const { stats } = useTeacherDashboardStats();
  const { filterCourses } = useTeacherCourseFilters();
  
  // Migration debug
  useTeacherMigrationDebug();
  
  // Legacy state (for fallback)
  const [legacyCourses, setLegacyCourses] = useState<any[]>([]);
  const [legacyLoading, setLegacyLoading] = useState(true);
  const [legacyError, setLegacyError] = useState<string | null>(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, draft, published, archived

  // Determine which data source to use - prioritize practiceApiSlice
  const courses = (practiceCoursesData && Array.isArray(practiceCoursesData)) ? practiceCoursesData.map(course => ({
    ...course,
    status: course.status?.toLowerCase() || 'draft',
    units: course.units_count || course.units || 0,
    lessons: course.lessons_count || course.lessons || 0,
    challenges: course.challenges_count || course.challenges || 0,
    students: 0, // TODO: Add student count to API
    completionRate: course.total_progress || 0,
    lastUpdated: course.updated_at || new Date().toISOString(),
    createdAt: course.created_at || new Date().toISOString()
  })) : (useReduxTeacher ? reduxCourses : legacyCourses);
  
  const isLoading = practiceLoading || (useReduxTeacher ? reduxLoading : legacyLoading);
  
  // Handle error from practiceApiSlice properly
  const practiceErrorMessage = practiceError ? 
    ('data' in practiceError && practiceError.data && typeof practiceError.data === 'object' && 'message' in practiceError.data) 
      ? String((practiceError.data as any).message)
      : 'status' in practiceError 
        ? `API Error ${practiceError.status}`
        : 'Error loading practice courses'
    : null;
    
  const error = practiceErrorMessage || (useReduxTeacher ? reduxError : legacyError);


  // Legacy data loading (fallback when Redux is disabled)
  useEffect(() => {
    if (!useReduxTeacher) {
      loadCoursesLegacy();
    }
  }, [useReduxTeacher]);

  // Check for refresh parameter and force reload
  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh') === 'true';
    if (shouldRefresh) {
      refetchPractice(); // Always refetch practice data first
      if (useReduxTeacher) {
        refetch();
      } else {
        loadCoursesLegacy();
      }
      
      // Remove the refresh parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, useReduxTeacher, refetch, refetchPractice]);

  // Reload courses when component is focused (useful when returning from create course page)
  useEffect(() => {
    const handleFocus = () => {
      refetchPractice(); // Always refetch practice data first
      if (useReduxTeacher) {
        refetch();
      } else {
        loadCoursesLegacy();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchPractice(); // Always refetch practice data first
        if (useReduxTeacher) {
          refetch();
        } else {
          loadCoursesLegacy();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [useReduxTeacher, refetch, refetchPractice]);

  const loadCoursesLegacy = async () => {
    // Legacy function removed - now using practiceApiSlice
    console.log('🔄 Legacy course loading disabled - using practiceApiSlice');
  };



  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'general': return Globe;
      case 'business': return Briefcase;
      case 'technology': return Code;
      case 'medicine': return Stethoscope;
      case 'legal': return Scale;
      case 'oil & gas': return Fuel;
      case 'banking': return Building2;
      case 'executive': return Crown;
      case 'ai enhanced': return Brain;
      default: return BookOpen;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-violet-100 text-violet-700 border-violet-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const filteredCourses = useReduxTeacher 
    ? filterCourses(courses, searchTerm, filter)
    : courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             course.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || course.status.toLowerCase() === filter.toLowerCase();
        
        return matchesSearch && matchesFilter;
      });

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <Card className="bg-customgreys-secondarybg border-red-500/30 max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-red-500/20 rounded-full p-6 mb-6">
              <Target className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Erro ao Carregar</h3>
            <p className="text-gray-400 text-center mb-6">{error}</p>
            <Button
              onClick={() => {
                refetchPractice(); // Always refetch practice data first
                if (useReduxTeacher) {
                  refetch();
                } else {
                  loadCoursesLegacy();
                }
              }}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-40 w-60 h-60 bg-violet-600/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-60 h-60 bg-purple-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="ghost"
                onClick={() => router.push('/teacher/laboratory')}
                className="text-gray-400 hover:text-white hover:bg-violet-600/20 transition-all text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar ao Laboratório
              </Button>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                onClick={() => router.push('/teacher/laboratory/create-course')}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Curso
              </Button>
            </motion.div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4"
            >
              <Layers className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 font-medium text-sm">Centro de Controle</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl md:text-3xl font-bold mb-3"
            >
              Gerenciar <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Cursos</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base text-gray-300 max-w-xl mx-auto leading-relaxed"
            >
              Organize, edite e monitore o desempenho de todos os seus cursos
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-6 pb-12 pt-8">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Filters and Search */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-5"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 w-full sm:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar cursos..."
                    className="pl-8 bg-customgreys-secondarybg border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                {['all', 'published', 'draft', 'archived'].map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(status)}
                    className={filter === status 
                      ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                      : 'border-customgreys-darkerGrey bg-customgreys-darkGrey text-gray-300 hover:bg-violet-600/10 hover:border-violet-500 hover:text-white'
                    }
                  >
                    {status === 'all' ? 'Todos' : getStatusText(status)}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {useReduxTeacher ? stats.totalCourses : courses.length}
              </div>
              <div className="text-sm text-gray-400">Total de Cursos</div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {useReduxTeacher 
                  ? stats.totalStudents 
                  : courses.reduce((sum, course) => sum + (course.students || 0), 0)
                }
              </div>
              <div className="text-sm text-gray-400">Estudantes Ativos</div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {useReduxTeacher 
                  ? stats.totalChallenges 
                  : courses.reduce((sum, course) => sum + (course.challenges || 0), 0)
                }
              </div>
              <div className="text-sm text-gray-400">Total Desafios</div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {useReduxTeacher 
                  ? stats.averageCompletionRate 
                  : Math.round(courses.length > 0 ? courses.reduce((sum, course) => sum + (course.completionRate || 0), 0) / courses.length : 0)
                }%
              </div>
              <div className="text-sm text-gray-400">Taxa Média</div>
            </motion.div>
          </motion.div>

          {/* Courses Grid */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
          >
            {filteredCourses.map((course) => {
              const CategoryIcon = getCategoryIcon(course.category);
              
              // Template config baseado na categoria
              const templateConfig = {
                'General': { 
                  color: 'bg-blue-500', 
                  lightColor: 'bg-blue-500/10', 
                  borderColor: 'border-blue-500/30', 
                  hoverColor: 'hover:border-blue-500/60', 
                  textColor: 'text-blue-400',
                  name: 'Inglês Geral'
                },
                'Business': { 
                  color: 'bg-green-500', 
                  lightColor: 'bg-green-500/10', 
                  borderColor: 'border-green-500/30', 
                  hoverColor: 'hover:border-green-500/60', 
                  textColor: 'text-green-400',
                  name: 'Negócios'
                },
                'Technology': { 
                  color: 'bg-purple-500', 
                  lightColor: 'bg-purple-500/10', 
                  borderColor: 'border-purple-500/30', 
                  hoverColor: 'hover:border-purple-500/60', 
                  textColor: 'text-purple-400',
                  name: 'Tecnologia'
                },
                'Medicine': { 
                  color: 'bg-red-500', 
                  lightColor: 'bg-red-500/10', 
                  borderColor: 'border-red-500/30', 
                  hoverColor: 'hover:border-red-500/60', 
                  textColor: 'text-red-400',
                  name: 'Medicina'
                },
                'Legal': { 
                  color: 'bg-yellow-500', 
                  lightColor: 'bg-yellow-500/10', 
                  borderColor: 'border-yellow-500/30', 
                  hoverColor: 'hover:border-yellow-500/60', 
                  textColor: 'text-yellow-400',
                  name: 'Jurídico'
                },
                'Oil & Gas': { 
                  color: 'bg-orange-600', 
                  lightColor: 'bg-orange-600/10', 
                  borderColor: 'border-orange-600/30', 
                  hoverColor: 'hover:border-orange-600/60', 
                  textColor: 'text-orange-400',
                  name: 'Petróleo & Gás'
                },
                'Banking': { 
                  color: 'bg-indigo-600', 
                  lightColor: 'bg-indigo-600/10', 
                  borderColor: 'border-indigo-600/30', 
                  hoverColor: 'hover:border-indigo-600/60', 
                  textColor: 'text-indigo-400',
                  name: 'Setor Bancário'
                },
                'Executive': { 
                  color: 'bg-slate-700', 
                  lightColor: 'bg-slate-700/10', 
                  borderColor: 'border-slate-700/30', 
                  hoverColor: 'hover:border-slate-700/60', 
                  textColor: 'text-slate-400',
                  name: 'Executivo'
                },
                'AI Enhanced': { 
                  color: 'bg-pink-500', 
                  lightColor: 'bg-pink-500/10', 
                  borderColor: 'border-pink-500/30', 
                  hoverColor: 'hover:border-pink-500/60', 
                  textColor: 'text-pink-400',
                  name: 'IA Personalizada'
                }
              };
              
              const config = templateConfig[course.category as keyof typeof templateConfig] || templateConfig.General;
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group cursor-pointer"
                >
                  <div className={`relative bg-customgreys-secondarybg rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl min-h-[380px] flex flex-col ${config.borderColor} ${config.hoverColor}`}>
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 opacity-5 ${config.color}`} />
                    
                    {/* Header Section */}
                    <div className="relative">
                      {/* Course Image Area */}
                      <div className="relative mb-0 overflow-hidden bg-customgreys-darkGrey h-32">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                        <div className={`absolute inset-0 ${config.lightColor}`} />
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-20">
                          <Badge className={getStatusColor(course.status)}>
                            {getStatusText(course.status)}
                          </Badge>
                        </div>
                        
                        {/* Level Badge */}
                        <div className="absolute top-3 right-3 z-20">
                          <Badge variant="outline" className="text-xs font-medium bg-white/20 border-white/30 text-white backdrop-blur-sm">
                            {course.level}
                          </Badge>
                        </div>
                        
                        {/* Category Icon */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className={`w-16 h-16 ${config.color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                            <CategoryIcon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        {/* Progress Bar for Published Courses */}
                        {course.status === 'published' && (
                          <div className="absolute bottom-3 left-3 right-3 z-20">
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white text-xs">Taxa de Conclusão</span>
                                <span className="text-white text-xs font-medium">{course.completionRate}%</span>
                              </div>
                              <div className="w-full bg-white/30 rounded-full h-1.5">
                                <div 
                                  className="bg-white h-1.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${course.completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
                          <div className="flex gap-2">
                            <Button 
                              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                              size="sm"
                              onClick={() => router.push(`/teacher/laboratory/manage-courses/${course.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Gerenciar
                            </Button>
                            <Button 
                              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                              size="sm"
                              onClick={() => router.push(`/teacher/laboratory/edit-course/${course.id}`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 px-5 py-4 flex flex-col">
                      {/* Template Badge */}
                      <div className="mb-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${config.lightColor} ${config.textColor} ${config.borderColor}`}>
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {config.name}
                        </div>
                      </div>
                      
                      {/* Title and Description */}
                      <div className="mb-4 flex-1">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
                          {course.title}
                        </h3>
                        <p className="text-sm text-customgreys-dirtyGrey line-clamp-2 mb-2">
                          {course.description}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Atualizado: {new Date(course.lastUpdated).toLocaleDateString('pt-BR')}
                        </p>
                        
                        {/* Course Stats */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-customgreys-dirtyGrey mb-3">
                          <div className="flex items-center justify-between">
                            <span>Unidades:</span>
                            <span className={`font-medium ${config.textColor}`}>{course.units}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Lições:</span>
                            <span className={`font-medium ${config.textColor}`}>{course.lessons}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Desafios:</span>
                            <span className={`font-medium ${config.textColor}`}>{course.challenges}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Alunos:</span>
                            <span className={`font-medium ${config.textColor}`}>{course.students}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Section */}
                      <div className="space-y-3">
                      </div>
                    </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl border border-violet-500/20">
                <CardContent className="text-center py-16">
                  <div className="bg-violet-500/20 rounded-full p-6 mx-auto mb-6 w-fit">
                    <Search className="h-16 w-16 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Nenhum curso encontrado</h3>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    {searchTerm || filter !== 'all' 
                      ? 'Tente ajustar os filtros de busca' 
                      : 'Você ainda não criou nenhum curso'
                    }
                  </p>
                  {!searchTerm && filter === 'all' && (
                    <Button 
                      onClick={() => router.push('/teacher/laboratory/create-course')}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Criar Primeiro Curso
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>


    </div>
  );
};

export default ManageCoursesPage;