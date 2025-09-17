"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";
import { 
  ChevronLeft,
  Save,
  Eye,
  Settings,
  AlertCircle,
  BookOpen,
  Users,
  Target,
  TrendingUp
} from "lucide-react";
import { getPracticeCourse } from "@/actions/practice-management";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  units?: number;
  lessons?: number;
  challenges?: number;
  students?: number;
  completionRate?: number;
  lastUpdated: string;
  createdAt: string;
}

const EditCoursePage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { isAuthenticated } = useDjangoAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    status: ""
  });

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      // Aqui você implementaria a busca do curso específico
      // Por enquanto, vou simular dados
      const mockCourse: Course = {
        id: courseId,
        title: "Curso de Inglês para Medicina",
        description: "Curso especializado em terminologia médica e comunicação em saúde",
        category: "Medicine",
        level: "Intermediate",
        status: "published",
        units: 8,
        lessons: 24,
        challenges: 120,
        students: 45,
        completionRate: 78,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setCourse(mockCourse);
      setFormData({
        title: mockCourse.title,
        description: mockCourse.description,
        category: mockCourse.category,
        level: mockCourse.level,
        status: mockCourse.status
      });
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Aqui você implementaria a atualização do curso
      console.log('Saving course:', { courseId, ...formData });
      
      // Simulando delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Curso atualizado com sucesso!');
      router.push('/teacher/laboratory/manage-courses');
      
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Erro ao salvar curso. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Curso não encontrado</h2>
          <p className="text-gray-400 mb-4">O curso que você está tentando editar não existe ou foi removido.</p>
          <Button onClick={() => router.push('/teacher/laboratory/manage-courses')}>
            Voltar aos Cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-6"
      >
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost"
              onClick={() => router.push('/teacher/laboratory/manage-courses')}
              className="text-gray-400 hover:text-white hover:bg-violet-600/20 transition-all text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar aos Cursos
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push(`/teacher/laboratory/manage-courses/${courseId}`)}
                className="border-violet-500/30 text-gray-400 hover:text-white hover:bg-violet-800/20 text-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 text-sm"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Editar <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Curso</span>
            </h1>
            <p className="text-base text-gray-300">
              Faça as alterações necessárias no seu curso
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Section */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Basic Information */}
              <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-violet-400" />
                  Informações Básicas
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Título do Curso</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Descrição</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white placeholder:text-gray-400 focus:border-violet-500 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Categoria</Label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full p-2 bg-customgreys-darkGrey border border-customgreys-darkerGrey text-white rounded-md focus:border-violet-500"
                      >
                        <option value="General">Inglês Geral</option>
                        <option value="Business">Negócios</option>
                        <option value="Technology">Tecnologia</option>
                        <option value="Medicine">Medicina</option>
                        <option value="Legal">Jurídico</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Nível</Label>
                      <select
                        value={formData.level}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                        className="w-full p-2 bg-customgreys-darkGrey border border-customgreys-darkerGrey text-white rounded-md focus:border-violet-500"
                      >
                        <option value="Beginner">Iniciante</option>
                        <option value="Intermediate">Intermediário</option>
                        <option value="Advanced">Avançado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full p-2 bg-customgreys-darkGrey border border-customgreys-darkerGrey text-white rounded-md focus:border-violet-500"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Sidebar */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-6"
            >
              {/* Course Status */}
              <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Status Atual</h3>
                <Badge className={getStatusColor(course.status)}>
                  {getStatusText(course.status)}
                </Badge>
                <p className="text-sm text-gray-400 mt-2">
                  Atualizado: {new Date(course.lastUpdated).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Course Stats */}
              <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-violet-400 mr-2" />
                      <span className="text-gray-300 text-sm">Unidades</span>
                    </div>
                    <span className="text-white font-medium">{course.units}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-gray-300 text-sm">Lições</span>
                    </div>
                    <span className="text-white font-medium">{course.lessons}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-gray-300 text-sm">Alunos</span>
                    </div>
                    <span className="text-white font-medium">{course.students}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-orange-400 mr-2" />
                      <span className="text-gray-300 text-sm">Taxa Conclusão</span>
                    </div>
                    <span className="text-white font-medium">{course.completionRate}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCoursePage;