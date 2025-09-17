"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";
import { 
  ChevronLeft,
  Edit,
  Settings,
  AlertCircle,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
  Globe,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  Play,
  Download,
  Share2
} from "lucide-react";

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

const ManageCourseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { isAuthenticated } = useDjangoAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);

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
        description: "Curso especializado em terminologia médica e comunicação em saúde. Este curso abrange desde vocabulário básico até situações complexas de comunicação médica.",
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
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setIsLoading(false);
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

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Curso não encontrado</h2>
          <p className="text-gray-400 mb-4">O curso que você está tentando visualizar não existe ou foi removido.</p>
          <Button onClick={() => router.push('/teacher/laboratory/manage-courses')}>
            Voltar aos Cursos
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(course.category);

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
                onClick={() => router.push(`/teacher/laboratory/edit-course/${courseId}`)}
                className="border-violet-500/30 text-gray-400 hover:text-white hover:bg-violet-800/20 text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 text-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <CategoryIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
                <Badge className={getStatusColor(course.status)}>
                  {getStatusText(course.status)}
                </Badge>
              </div>
              <p className="text-base text-gray-300 mb-2">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Criado: {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Atualizado: {new Date(course.lastUpdated).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6 text-center">
              <BookOpen className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{course.units}</div>
              <div className="text-sm text-gray-400">Unidades</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{course.lessons}</div>
              <div className="text-sm text-gray-400">Lições</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{course.students}</div>
              <div className="text-sm text-gray-400">Estudantes</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-6 text-center">
              <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{course.completionRate}%</div>
              <div className="text-sm text-gray-400">Taxa de Conclusão</div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Progress */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-violet-400" />
                Performance dos Estudantes
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Taxa Média de Conclusão</span>
                    <span className="text-sm font-medium text-white">{course.completionRate}%</span>
                  </div>
                  <Progress value={course.completionRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">32</div>
                    <div className="text-xs text-gray-400">Concluíram</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">13</div>
                    <div className="text-xs text-gray-400">Em Progresso</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-violet-400" />
                Ações Rápidas
              </h2>
              
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 text-white hover:from-violet-600/30 hover:to-purple-600/30"
                  onClick={() => router.push(`/teacher/laboratory/edit-course/${courseId}`)}
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Editar Conteúdo do Curso
                </Button>
                
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-white hover:from-blue-600/30 hover:to-cyan-600/30"
                >
                  <Play className="h-4 w-4 mr-3" />
                  Visualizar como Estudante
                </Button>
                
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-white hover:from-green-600/30 hover:to-emerald-600/30"
                >
                  <Download className="h-4 w-4 mr-3" />
                  Exportar Relatório
                </Button>
                
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 text-white hover:from-orange-600/30 hover:to-red-600/30"
                >
                  <Share2 className="h-4 w-4 mr-3" />
                  Compartilhar Curso
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Course Details */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Detalhes do Curso</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-violet-400 mb-2">Categoria</h3>
                <p className="text-white">{course.category}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-violet-400 mb-2">Nível</h3>
                <p className="text-white">{course.level}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-violet-400 mb-2">Total de Desafios</h3>
                <p className="text-white">{course.challenges}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ManageCourseDetailPage;