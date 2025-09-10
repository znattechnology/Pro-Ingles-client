"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import CourseBanner from "@/components/course/CourseBanner";
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Settings,
  ChevronLeft,
  MoreVertical,
  Users,
  Target,
  BookOpen,
  TrendingUp,
  Globe,
  Briefcase,
  Code,
  Stethoscope,
  Scale
} from "lucide-react";
import { getPracticeCourses, deletePracticeCourse } from "@/actions/practice-management";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ManageCoursesPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useDjangoAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, draft, published, archived

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const coursesData = await getPracticeCourses();
      
      // Transform data and add mock statistics
      const transformedCourses = coursesData.map((course: any) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        status: course.status.toLowerCase(),
        // Mock data - later we'll get from API
        units: Math.floor(Math.random() * 8) + 2,
        lessons: Math.floor(Math.random() * 30) + 10,
        challenges: Math.floor(Math.random() * 150) + 50,
        students: Math.floor(Math.random() * 100) + 5,
        completionRate: Math.floor(Math.random() * 40) + 60,
        lastUpdated: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 100000000000).toISOString()
      }));
      
      setCourses(transformedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir o curso "${courseTitle}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deletePracticeCourse(courseId);
        await loadCourses(); // Reload courses
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Erro ao excluir curso. Tente novamente.');
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'general': return Globe;
      case 'business': return Briefcase;
      case 'technology': return Code;
      case 'medicine': return Stethoscope;
      case 'legal': return Scale;
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || course.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full space-y-6">
      <CourseBanner 
        title="Gerenciar Cursos" 
        subtitle="Organize e edite todos os seus cursos de prática"
        rightElement={
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => router.push('/teacher/laboratory')}
              className="border-violet-200 text-violet-600 hover:bg-violet-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Laboratório
            </Button>
            <Button 
              onClick={() => router.push('/teacher/laboratory/create-course')}
              className="bg-violet-800 hover:bg-violet-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
          </div>
        }
      />

      {/* Filters and Search */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-violet-400" />
              <div>
                <p className="text-2xl font-bold text-white">{courses.length}</p>
                <p className="text-sm text-gray-400">Total de Cursos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {courses.reduce((sum, course) => sum + course.students, 0)}
                </p>
                <p className="text-sm text-gray-400">Estudantes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {courses.reduce((sum, course) => sum + course.challenges, 0)}
                </p>
                <p className="text-sm text-gray-400">Total Desafios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length || 0)}%
                </p>
                <p className="text-sm text-gray-400">Taxa Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const CategoryIcon = getCategoryIcon(course.category);
          
          return (
            <Card key={course.id} className="bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-lg hover:border-violet-500/50 transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <CategoryIcon className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-white truncate">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(course.status)}
                        >
                          {getStatusText(course.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => router.push(`/teacher/laboratory/manage-courses/${course.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push(`/teacher/laboratory/edit-course/${course.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push(`/teacher/laboratory/course-settings/${course.id}`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <CardDescription className="text-sm line-clamp-2 text-gray-300">
                  {course.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Unidades:</span>
                    <span className="font-medium text-violet-400">{course.units}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lições:</span>
                    <span className="font-medium text-violet-400">{course.lessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desafios:</span>
                    <span className="font-medium text-violet-400">{course.challenges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alunos:</span>
                    <span className="font-medium text-violet-400">{course.students}</span>
                  </div>
                </div>

                {course.status === 'published' && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Taxa de Conclusão</span>
                      <span className="text-sm font-medium text-violet-400">{course.completionRate}%</span>
                    </div>
                    <div className="w-full bg-violet-100 rounded-full h-2">
                      <div 
                        className="bg-violet-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${course.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-customgreys-darkerGrey bg-customgreys-darkGrey text-gray-300 hover:bg-violet-600/10 hover:border-violet-500 hover:text-white"
                    onClick={() => router.push(`/teacher/laboratory/manage-courses/${course.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Gerenciar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-customgreys-darkerGrey bg-customgreys-darkGrey text-gray-300 hover:bg-violet-600/10 hover:border-violet-500 hover:text-white"
                    onClick={() => router.push(`/teacher/laboratory/edit-course/${course.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>

                <div className="mt-3 pt-3 border-t border-customgreys-darkerGrey">
                  <p className="text-xs text-gray-400">
                    Atualizado: {new Date(course.lastUpdated).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
          <CardContent className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2 text-white">Nenhum curso encontrado</h3>
            <p className="text-gray-300 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Você ainda não criou nenhum curso'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Button 
                onClick={() => router.push('/teacher/laboratory/create-course')}
                className="bg-violet-800 hover:bg-violet-900"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageCoursesPage;