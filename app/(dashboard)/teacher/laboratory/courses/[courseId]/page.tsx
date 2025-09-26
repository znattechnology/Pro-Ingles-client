"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  BookOpen, 
  List,
  Target,
  Settings,
  Eye,
  Users
} from "lucide-react";
import Loading from "@/components/course/Loading";
import CourseBanner from "@/components/course/CourseBanner";
import { 
  useGetCourseUnitsQuery,
  useCreatePracticeUnitMutation,
  useUpdatePracticeUnitMutation,
  useDeletePracticeUnitMutation
} from "@modules/teacher";

const CourseManagement = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  // Redux hooks for data fetching and mutations
  const { data: units = [], isLoading } = useGetCourseUnitsQuery(courseId);
  const [createUnit] = useCreatePracticeUnitMutation();
  const [deleteUnit] = useDeletePracticeUnitMutation();
  
  const [course, setCourse] = useState<any>(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitFormData, setUnitFormData] = useState({
    title: '',
    description: '',
    order: 1
  });

  useEffect(() => {
    // For now, we'll use mock course data since we need to implement course details endpoint
    // TODO: Replace with actual API call to get course details
    setCourse({
      id: courseId,
      title: 'Curso de Prática',
      description: 'Curso especializado para laboratório de práticas',
      category: 'Technology',
      level: 'Intermediate',
      status: 'active'
    });
  }, [courseId]);

  const handleCreateUnit = async () => {
    try {
      if (!unitFormData.title) {
        alert('Por favor, preencha o título da unidade.');
        return;
      }

      await createUnit({
        course: courseId as string,
        title: unitFormData.title,
        description: unitFormData.description,
        order: unitFormData.order
      }).unwrap();

      // Redux automatically refetches data
      setUnitFormData({ title: '', description: '', order: units.length + 2 });
      setShowUnitForm(false);
    } catch (error) {
      console.error('Error creating unit:', error);
      alert('Erro ao criar unidade. Tente novamente.');
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        await deleteUnit(unitId).unwrap();
        // Redux automatically refetches data
      } catch (error) {
        console.error('Error deleting unit:', error);
        alert('Erro ao excluir unidade. Tente novamente.');
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full space-y-6">
      <CourseBanner 
        title={course?.title || 'Gestão de Curso'}
        subtitle="Gerencie unidades, lições e desafios"
        rightElement={
          <Button 
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="units">Unidades</TabsTrigger>
          <TabsTrigger value="lessons">Lições</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Unidades</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{units.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Lições</CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {units.reduce((total, unit) => total + unit.lessons.length, 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Desafios</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {units.reduce((total, unit) => 
                    total + unit.lessons.reduce((lessonTotal: number, lesson: any) => 
                      lessonTotal + lesson.challenges, 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Título</Label>
                  <Input defaultValue={course?.title} />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input defaultValue={course?.category} />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea defaultValue={course?.description} />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Unidades do Curso</h3>
            <Button onClick={() => setShowUnitForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </div>

          {showUnitForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nova Unidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Título</Label>
                    <Input 
                      value={unitFormData.title}
                      onChange={(e) => setUnitFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome da unidade"
                    />
                  </div>
                  <div>
                    <Label>Ordem</Label>
                    <Input 
                      type="number"
                      value={unitFormData.order}
                      onChange={(e) => setUnitFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    value={unitFormData.description}
                    onChange={(e) => setUnitFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da unidade"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateUnit}>Criar Unidade</Button>
                  <Button variant="outline" onClick={() => setShowUnitForm(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {units.map((unit) => (
              <Card key={unit.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{unit.title}</CardTitle>
                    <Badge>{unit.order}ª Unidade</Badge>
                  </div>
                  <CardDescription>{unit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex justify-between">
                      <span>Lições:</span>
                      <span className="font-medium">{unit.lessons.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desafios:</span>
                      <span className="font-medium">
                        {unit.lessons.reduce((total: number, lesson: any) => total + lesson.challenges, 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Lições
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteUnit(unit.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6">
          <div className="text-center py-12">
            <List className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Gestão de Lições</h3>
            <p className="text-muted-foreground mb-4">
              Funcionalidade para criar e gerenciar lições será implementada aqui
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Lição
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="text-center py-12">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Gestão de Desafios</h3>
            <p className="text-muted-foreground mb-4">
              Funcionalidade para criar perguntas e opções será implementada aqui
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Desafio
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status do Curso</Label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>
              <div>
                <Label>Nível de Dificuldade</Label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                </select>
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseManagement;