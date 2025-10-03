"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Settings
} from "lucide-react";
import Loading from "@/components/course/Loading";
import CourseBanner from "@/components/course/CourseBanner";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import {
  useGetTeacherCoursesQuery,
  useCreateTeacherCourseMutation,
  useDeleteTeacherCourseMutation
} from "@/src/domains/teacher/practice-courses/api";
import { courseToasts, enhancedToast } from "@/components/ui/enhanced-toast";

const PracticeCoursesManagement = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useDjangoAuth();
  
  // Use Redux hooks for data fetching
  const { data: courses = [], isLoading } = useGetTeacherCoursesQuery({ includeDrafts: true });
  const [createCourse] = useCreateTeacherCourseMutation();
  const [deleteCourse] = useDeleteTeacherCourseMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner'
  });

  // Redux handles loading automatically, no need for useEffect or loadCourses

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCourse = async () => {
    try {
      if (!newCourseData.title || !newCourseData.category) {
        enhancedToast.error({
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha título e categoria.',
        });
        return;
      }

      await createCourse({
        ...newCourseData,
        teacher_email: user?.email,
        teacher_name: user?.name,
        created_by: user?.id
      }).unwrap();
      
      // Show enhanced success toast
      courseToasts.created(newCourseData.title);
      
      setNewCourseData({ title: '', description: '', category: '', level: 'beginner' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      courseToasts.error('criar curso', errorMessage);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        await deleteCourse(courseId).unwrap();
        
        // Show enhanced success toast
        courseToasts.deleted('Curso');
      } catch (error) {
        console.error('Error deleting course:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        courseToasts.error('excluir curso', errorMessage);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full space-y-6">
      <CourseBanner 
        title="Cursos de Prática" 
        subtitle="Gerencie todos os cursos do laboratório Duolingo-style"
        rightElement={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar cursos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge className={getStatusColor(course.status)}>
                  {getStatusText(course.status)}
                </Badge>
              </div>
              <CardDescription>{course.description}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex justify-between">
                  <span>Unidades:</span>
                  <span className="font-medium">{course.units}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lições:</span>
                  <span className="font-medium">{course.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desafios:</span>
                  <span className="font-medium">{course.challenges}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estudantes:</span>
                  <span className="font-medium">{course.students}</span>
                </div>
                {course.status === 'active' && (
                  <div className="flex justify-between">
                    <span>Taxa de Conclusão:</span>
                    <span className="font-medium">{course.completionRate}%</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => router.push(`/teacher/laboratory/courses/${course.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Course Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Curso de Prática</DialogTitle>
            <DialogDescription>
              Configure um novo curso para o laboratório de práticas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Título do Curso</Label>
              <Input 
                value={newCourseData.title}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Inglês para Medicina"
              />
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea 
                value={newCourseData.description}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o foco e objetivos do curso"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newCourseData.category}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="General">Geral</option>
                  <option value="Technology">Tecnologia</option>
                  <option value="Business">Negócios</option>
                  <option value="Banking">Bancário</option>
                  <option value="Oil & Gas">Petróleo e Gás</option>
                  <option value="Medicine">Medicina</option>
                  <option value="Legal">Jurídico</option>
                </select>
              </div>
              
              <div>
                <Label>Nível</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newCourseData.level}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, level: e.target.value }))}
                >
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCourse}>
              Criar Curso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredCourses.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar sua busca ou criar um novo curso
          </p>
        </div>
      )}
    </div>
  );
};

export default PracticeCoursesManagement;