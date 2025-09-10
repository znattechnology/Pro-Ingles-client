"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Target, 
  Heart,
  Trophy,
  Calendar,
  Search,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  BookOpen
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
    <div className="w-full h-full space-y-6 bg-customgreys-primarybg p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics do Laboratório</h1>
        <p className="text-customgreys-dirtyGrey mb-6">
          Monitoramento detalhado do progresso dos estudantes
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="bg-customgreys-secondarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button 
            variant="outline"
            className="bg-customgreys-secondarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Estudantes</CardTitle>
            <Users className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalStudents}</div>
            <p className="text-xs text-customgreys-dirtyGrey">
              {activeStudents} ativos hoje
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgCompletionRate}%</div>
            <Progress value={avgCompletionRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pontos Totais</CardTitle>
            <Trophy className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-customgreys-dirtyGrey">
              Média: {totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0} por aluno
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Desafios</CardTitle>
            <Target className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalChallenges}</div>
            <p className="text-xs text-customgreys-dirtyGrey">
              Em {totalCourses} cursos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <TabsTrigger value="students" className="text-white data-[state=active]:bg-violet-600 data-[state=active]:text-white">Estudantes</TabsTrigger>
          <TabsTrigger value="courses" className="text-white data-[state=active]:bg-violet-600 data-[state=active]:text-white">Por Curso</TabsTrigger>
          <TabsTrigger value="performance" className="text-white data-[state=active]:bg-violet-600 data-[state=active]:text-white">Desempenho</TabsTrigger>
          <TabsTrigger value="engagement" className="text-white data-[state=active]:bg-violet-600 data-[state=active]:text-white">Engajamento</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-customgreys-dirtyGrey" />
              <Input 
                placeholder="Buscar estudantes..."
                className="pl-8 bg-customgreys-secondarybg border-customgreys-darkerGrey text-white placeholder:text-customgreys-dirtyGrey"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="p-2 border rounded-md bg-customgreys-secondarybg border-customgreys-darkerGrey text-white"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="quarter">Último trimestre</option>
            </select>
          </div>

          {/* Students Table */}
          <div className="space-y-4">
            {filteredStudents.map((student) => {
              const completionRate = student.total_lessons > 0 ? 
                Math.round((student.completed_lessons / student.total_lessons) * 100) : 0;
              const activityStatus = getActivityStatus(student.last_activity);
              
              return (
                <Card key={student.id} className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                            <span className="font-semibold text-white">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{student.name}</h4>
                            <p className="text-sm text-customgreys-dirtyGrey">{student.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-center">
                          <div className="font-semibold text-lg text-white">{student.total_points || 0}</div>
                          <p className="text-sm text-customgreys-dirtyGrey">Pontos</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Heart className={`h-4 w-4 ${student.hearts > 3 ? 'text-red-500' : 'text-gray-400'}`} />
                            <span className="font-semibold text-white">{student.hearts || 0}/5</span>
                          </div>
                          <p className="text-sm text-customgreys-dirtyGrey">Corações</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-center">
                          <Progress value={completionRate} className="mb-2" />
                          <p className="text-sm text-white">
                            {student.completed_lessons || 0}/{student.total_lessons || 0} lições
                          </p>
                          <p className="text-xs text-customgreys-dirtyGrey">{completionRate}% completo</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-center space-y-2">
                          <Badge 
                            className={
                              activityStatus === 'online' ? 'bg-green-600 text-white' :
                              activityStatus === 'recent' ? 'bg-yellow-600 text-white' :
                              'bg-gray-600 text-white'
                            }
                          >
                            Ativo recentemente
                          </Badge>
                          <div className="text-sm">
                            <div className="text-customgreys-dirtyGrey">{student.average_accuracy || 0}% precisão</div>
                            {student.active_course && (
                              <div className="text-xs text-customgreys-dirtyGrey">{student.active_course}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
  );
};

export default LaboratoryAnalytics;