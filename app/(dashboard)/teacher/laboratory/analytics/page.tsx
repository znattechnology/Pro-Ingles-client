"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Target, 
  Heart,
  Trophy,
  Search,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Loading from "@/components/course/Loading";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { 
  getPracticeAnalytics,
  getStudentProgress
} from "@/actions/practice-management";

const LaboratoryAnalytics = () => {
  const { isAuthenticated } = useDjangoAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(6);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Load analytics and student progress in parallel
      const [analyticsData, studentsData] = await Promise.all([
        getPracticeAnalytics(),
        getStudentProgress()
      ]);
      
      setAnalytics(analyticsData);
      setStudents(studentsData);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set default values for error state
      setAnalytics({
        total_courses: 0,
        total_students: 0,
        total_challenges: 0,
        avg_completion_rate: 0
      });
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.active_course && student.active_course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getActivityStatus = (lastActivity: string) => {
    if (lastActivity.includes('hour') || lastActivity.includes('hora') || lastActivity.includes('minute')) return 'online';
    if (lastActivity.includes('day') || lastActivity.includes('dia')) return 'recent';
    return 'inactive';
  };

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  // Use analytics data from Django
  const totalStudents = analytics?.total_students || 0;
  const totalCourses = analytics?.total_courses || 0;
  const totalChallenges = analytics?.total_challenges || 0;
  const avgCompletionRate = analytics?.avg_completion_rate || 0;
  
  const activeStudents = students.filter(s => getActivityStatus(s.last_activity) !== 'inactive').length;
  const totalPoints = students.reduce((acc, s) => acc + (s.total_points || 0), 0);

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-8"
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-indigo-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/30 rounded-full px-8 py-3 mb-8 backdrop-blur-sm shadow-lg shadow-blue-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </motion.div>
              <span className="text-blue-300 font-semibold text-lg">Analytics Inteligente</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            >
              Analytics do{' '}
              <motion.span 
                className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Laboratório
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                📊
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 font-light"
            >
              Monitoramento <motion.span className="text-blue-400 font-medium" whileHover={{ scale: 1.05 }}>detalhado</motion.span> do progresso dos{' '}
              <motion.span className="text-indigo-400 font-medium" whileHover={{ scale: 1.05 }}>estudantes</motion.span>
            </motion.p>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300 shadow-lg shadow-blue-500/10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avançados
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline"
                  className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all duration-300 shadow-lg shadow-indigo-500/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="px-6 mb-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Total de Estudantes", value: totalStudents, subtitle: `${activeStudents} ativos hoje`, icon: Users, color: "blue" },
              { title: "Taxa de Conclusão", value: `${avgCompletionRate}%`, subtitle: "", icon: TrendingUp, color: "indigo", showProgress: true },
              { title: "Pontos Totais", value: totalPoints.toLocaleString(), subtitle: `Média: ${totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0} por aluno`, icon: Trophy, color: "cyan" },
              { title: "Total de Desafios", value: totalChallenges, subtitle: `Em ${totalCourses} cursos`, icon: Target, color: "blue" }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card className={`bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-${stat.color}-500/20 hover:border-${stat.color}-400/60 shadow-2xl shadow-${stat.color}-500/10 hover:shadow-${stat.color}-500/25 transition-all duration-500 overflow-hidden relative group`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 via-transparent to-${stat.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                    <CardTitle className="text-sm font-medium text-white">{stat.title}</CardTitle>
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className={`p-2 bg-${stat.color}-500/20 rounded-lg`}
                    >
                      <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    {stat.showProgress && (
                      <Progress value={avgCompletionRate} className="mb-2" />
                    )}
                    {stat.subtitle && (
                      <p className="text-xs text-gray-400">{stat.subtitle}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="px-6 pb-12"
      >
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="students" className="w-full">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <TabsList className="bg-customgreys-secondarybg/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-1 shadow-lg">
                <TabsTrigger value="students" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-300">Estudantes</TabsTrigger>
                <TabsTrigger value="courses" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-300">Por Curso</TabsTrigger>
                <TabsTrigger value="performance" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-300">Desempenho</TabsTrigger>
                <TabsTrigger value="engagement" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-300">Engajamento</TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="students" className="space-y-6 mt-8">
              {/* Enhanced Search Bar */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <div className="relative flex-1 w-full">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <motion.div
                        animate={{ rotate: searchTerm ? 0 : 360 }}
                        transition={{ duration: 2, repeat: searchTerm ? 0 : Infinity, ease: "linear" }}
                      >
                        <Search className="text-blue-400 w-5 h-5" />
                      </motion.div>
                    </div>
                    <Input 
                      placeholder="Buscar estudantes por nome, email ou curso..."
                      className="pl-14 pr-4 bg-customgreys-secondarybg/30 backdrop-blur-md border-2 border-blue-500/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 h-12 rounded-xl text-lg shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                          {filteredStudents.length} resultado{filteredStudents.length !== 1 ? 's' : ''}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <select 
                    className="p-3 border-2 rounded-xl bg-customgreys-secondarybg/50 backdrop-blur-sm border-indigo-500/30 text-white focus:border-indigo-400 transition-all duration-300 shadow-lg"
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                  >
                    <option value="week">Última semana</option>
                    <option value="month">Último mês</option>
                    <option value="quarter">Último trimestre</option>
                  </select>
                </motion.div>
              </motion.div>

              {/* Students Grid with Pagination */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="space-y-6"
              >
                <div className="grid gap-6">
                  {currentStudents.map((student, index) => {
                    const completionRate = student.total_lessons > 0 ? 
                      Math.round((student.completed_lessons / student.total_lessons) * 100) : 0;
                    const activityStatus = getActivityStatus(student.last_activity);
                    
                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.5 + index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                      >
                        <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-blue-500/20 hover:border-blue-400/60 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-500 overflow-hidden relative group">
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
                            whileHover={{ translateX: '100%' }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          />
                          
                          <CardContent className="pt-6 relative">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                              <div className="md:col-span-2">
                                <div className="flex items-center gap-4">
                                  <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
                                  >
                                    <span className="font-bold text-white text-lg">
                                      {student.name.charAt(0)}
                                    </span>
                                  </motion.div>
                                  <div>
                                    <motion.h4 
                                      whileHover={{ x: 4 }}
                                      className="font-bold text-white text-lg"
                                    >
                                      {student.name}
                                    </motion.h4>
                                    <p className="text-sm text-gray-400">{student.email}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <motion.div 
                                  whileHover={{ scale: 1.05 }}
                                  className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                                >
                                  <div className="font-bold text-xl text-blue-400">{student.total_points || 0}</div>
                                  <p className="text-sm text-gray-400">Pontos</p>
                                </motion.div>
                              </div>
                              
                              <div>
                                <motion.div 
                                  whileHover={{ scale: 1.05 }}
                                  className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <Heart className={`h-5 w-5 ${student.hearts > 3 ? 'text-red-400' : 'text-gray-400'}`} />
                                    </motion.div>
                                    <span className="font-bold text-lg text-white">{student.hearts || 0}/5</span>
                                  </div>
                                  <p className="text-sm text-gray-400">Corações</p>
                                </motion.div>
                              </div>
                              
                              <div>
                                <motion.div 
                                  whileHover={{ scale: 1.05 }}
                                  className="text-center p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                                >
                                  <Progress value={completionRate} className="mb-3 h-2" />
                                  <p className="text-sm text-white font-medium">
                                    {student.completed_lessons || 0}/{student.total_lessons || 0} lições
                                  </p>
                                  <p className="text-xs text-indigo-400 font-semibold">{completionRate}% completo</p>
                                </motion.div>
                              </div>
                              
                              <div>
                                <motion.div 
                                  whileHover={{ scale: 1.05 }}
                                  className="text-center space-y-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <Badge 
                                      className={
                                        activityStatus === 'online' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' :
                                        activityStatus === 'recent' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' :
                                        'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg'
                                      }
                                    >
                                      {activityStatus === 'online' ? '🟢 Online' : activityStatus === 'recent' ? '🟡 Recente' : '⚫ Inativo'}
                                    </Badge>
                                  </motion.div>
                                  <div className="space-y-1">
                                    <div className="text-cyan-400 font-semibold">{student.average_accuracy || 0}% precisão</div>
                                    {student.active_course && (
                                      <div className="text-xs text-gray-400 truncate">{student.active_course}</div>
                                    )}
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                    className="flex justify-center items-center space-x-2 mt-8"
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <motion.div
                            key={pageNumber}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                              className={currentPage === pageNumber 
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                                : "bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                              }
                            >
                              {pageNumber}
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    
                    <div className="ml-4 text-sm text-gray-400">
                      Página {currentPage} de {totalPages} • {filteredStudents.length} estudante{filteredStudents.length !== 1 ? 's' : ''}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-customgreys-dirtyGrey" />
                <h3 className="text-lg font-semibold mb-2 text-white">Estatísticas por Curso</h3>
                <p className="text-customgreys-dirtyGrey">
                  Dados detalhados por curso serão implementados em breve
                </p>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white">Distribuição de Desempenho</CardTitle>
                    <CardDescription className="text-customgreys-dirtyGrey">Precisão dos estudantes por faixa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="h-16 w-16 mx-auto mb-4 text-customgreys-dirtyGrey" />
                        <p className="text-customgreys-dirtyGrey">Gráfico de distribuição será implementado</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white">Progresso ao Longo do Tempo</CardTitle>
                    <CardDescription className="text-customgreys-dirtyGrey">Evolução do desempenho</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-customgreys-dirtyGrey" />
                        <p className="text-customgreys-dirtyGrey">Gráfico de linha temporal será implementado</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white">Top Pontuadores</CardTitle>
                    <CardDescription className="text-customgreys-dirtyGrey">Ranking por pontos totais</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {students
                        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
                        .slice(0, 5)
                        .map((student, index) => (
                          <div key={student.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Trophy className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-300'}`} />
                              <span className="text-sm text-white">{student.name}</span>
                            </div>
                            <span className="font-semibold text-white">{student.total_points || 0}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white">Melhor Precisão</CardTitle>
                    <CardDescription className="text-customgreys-dirtyGrey">Estudantes com maior precisão</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {students
                        .sort((a, b) => (b.average_accuracy || 0) - (a.average_accuracy || 0))
                        .slice(0, 5)
                        .map((student, index) => (
                          <div key={student.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className={`h-4 w-4 ${index < 3 ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className="text-sm text-white">{student.name}</span>
                            </div>
                            <span className="font-semibold text-white">{student.average_accuracy || 0}%</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                  <CardHeader>
                    <CardTitle className="text-white">Progresso Geral</CardTitle>
                    <CardDescription className="text-customgreys-dirtyGrey">Lições completadas por estudante</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {students
                        .sort((a, b) => (b.completed_lessons || 0) - (a.completed_lessons || 0))
                        .slice(0, 5)
                        .map((student) => (
                          <div key={student.id} className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <div className="flex-1 text-sm">
                              <div className="text-white">{student.name}</div>
                              <div className="text-customgreys-dirtyGrey">
                                {student.completed_lessons || 0} de {student.total_lessons || 0} lições
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default LaboratoryAnalytics;