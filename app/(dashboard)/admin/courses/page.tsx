"use client";

import * as React from "react";
import { BookOpen, Plus, Search, Filter, MoreHorizontal, Users, DollarSign, BarChart3, AlertCircle, RefreshCw, PlayCircle, Gamepad2, Settings, TrendingUp, Crown } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { djangoAuth } from "@/lib/django-auth";
import Loading from "@/components/course/Loading";

// Types for course data
interface Course {
  id: string;
  title: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  enrollment_count: number;
  status: 'Published' | 'Draft' | 'Archived';
  template: string;
  course_type: 'video' | 'practice';
  created_at: string;
  updated_at: string;
  description?: string;
  image?: string;
}

interface CourseStats {
  total_courses: number;
  published_courses: number;
  total_students: number;
  total_revenue: string;
  monthly_growth: number;
}

export default function CoursesManagement() {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [stats, setStats] = React.useState<CourseStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch courses from Django API
  const fetchCourses = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const token = djangoAuth.getAccessToken();
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch('/api/v1/courses/admin/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setStats(data.stats || null);
      } else {
        setError('Erro ao carregar cursos');
        console.error('Failed to fetch courses:', response.status);
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Courses fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchCourses();
    }
  }, [isAuthenticated, user]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) {
    return <div>Faça login para acessar esta página.</div>;
  }

  if (user.role !== 'admin') {
    return <div>Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  // Filter courses by search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate courses by type
  const videoCourses = filteredCourses.filter(course => course.course_type === 'video');
  const practiceCourses = filteredCourses.filter(course => course.course_type === 'practice');

  // Calculate course type statistics
  const videoCoursesCount = courses.filter(course => course.course_type === 'video').length;
  const practiceCoursesCount = courses.filter(course => course.course_type === 'practice').length;
  const videoPublishedCount = courses.filter(course => course.course_type === 'video' && course.status.toLowerCase() === 'published').length;
  const practicePublishedCount = courses.filter(course => course.course_type === 'practice' && course.status.toLowerCase() === 'published').length;

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-600';
      case 'draft': return 'bg-yellow-600';
      case 'archived': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const getTemplateColor = (template: string) => {
    switch (template.toLowerCase()) {
      case 'business': return 'bg-blue-600';
      case 'oil-gas': return 'bg-orange-600';
      case 'technology': return 'bg-purple-600';
      case 'executive': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  // Function to render course table
  const renderCourseTable = (courseList: Course[], emptyMessage: string) => (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-violet-900/20 border-violet-900/30">
          <TableHead className="text-white/70">Curso</TableHead>
          <TableHead className="text-white/70">Professor</TableHead>
          <TableHead className="text-white/70">Template</TableHead>
          <TableHead className="text-white/70">Estudantes</TableHead>
          <TableHead className="text-white/70">Status</TableHead>
          <TableHead className="text-white/70">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courseList.map((course) => (
          <TableRow key={course.id} className="hover:bg-violet-900/20 border-violet-900/30">
            <TableCell>
              <div>
                <div className="font-medium text-white">{course.title}</div>
                <div className="text-sm text-white/70">
                  Criado em {new Date(course.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-white">
              <div>
                <div className="font-medium">{course.teacher.name}</div>
                <div className="text-xs text-white/70">{course.teacher.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={`${getTemplateColor(course.template)} text-white`}>
                {course.template}
              </Badge>
            </TableCell>
            <TableCell className="text-white">{course.enrollment_count}</TableCell>
            <TableCell>
              <Badge className={`${getStatusBadgeColor(course.status)} text-white`}>
                {getStatusText(course.status)}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black border-violet-900/30">
                  <DropdownMenuLabel className="text-white">Ações</DropdownMenuLabel>
                  <DropdownMenuItem className="text-white hover:bg-violet-900/20">
                    Ver curso
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-violet-900/20">
                    Editar curso
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-violet-900/20">
                    Ver estudantes
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-violet-900/20">
                    Alterar status
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 hover:bg-red-900/20">
                    Arquivar curso
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {courseList.length === 0 && (
        <tbody>
          <tr>
            <td colSpan={6} className="text-center py-8">
              <p className="text-white/70">{emptyMessage}</p>
            </td>
          </tr>
        </tbody>
      )}
    </Table>
  );

  if (loading) {
    return (
      <Loading 
        title="Carregando Cursos"
        subtitle="Gerenciamento de Cursos"
        description="Buscando dados dos cursos no sistema..."
        icon={BookOpen}
        progress={60}
        theme={{
          primary: "violet",
          secondary: "purple",
          accent: "indigo"
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Enhanced Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-6 sm:py-8"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-violet-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-indigo-500/10 border border-violet-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm shadow-lg shadow-violet-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              </motion.div>
              <span className="text-violet-300 font-semibold text-sm sm:text-base lg:text-lg">Gerenciamento de Cursos</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight"
            >
              Controle{' '}
              <motion.span 
                className="bg-gradient-to-r from-violet-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Total
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                ⚡
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 font-light"
            >
              Gerencie todos os <motion.span className="text-violet-400 font-medium" whileHover={{ scale: 1.05 }}>cursos da plataforma</motion.span> com{' '}
              <motion.span className="text-blue-400 font-medium" whileHover={{ scale: 1.05 }}>controle total</motion.span> e{' '}
              <motion.span className="text-indigo-400 font-medium" whileHover={{ scale: 1.05 }}>análises avançadas</motion.span>
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={fetchCourses}
                disabled={refreshing}
                variant="outline" 
                className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400/50 transition-all duration-300"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/admin/courses/analytics">
                <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400/50 transition-all duration-300">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40">
                <Plus className="mr-2 h-4 w-4" />
                Novo Curso
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="text-red-300">{error}</div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="grid gap-4 md:grid-cols-4 relative"
      >
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-blue-600/5 to-indigo-600/5 rounded-2xl blur-xl" />
        
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="relative border border-violet-500/30 bg-gradient-to-br from-violet-950/50 to-black backdrop-blur-sm shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent rounded-lg" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total Cursos
              </CardTitle>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="h-4 w-4 text-violet-400" />
              </motion.div>
            </CardHeader>
            <CardContent className="relative">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="text-2xl font-bold text-white"
              >
                {stats?.total_courses || courses.length || 0}
              </motion.div>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{stats?.monthly_growth || 0}% este mês
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="relative border border-green-500/30 bg-gradient-to-br from-green-950/50 to-black backdrop-blur-sm shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Cursos Publicados
              </CardTitle>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="h-4 w-4 text-green-400" />
              </motion.div>
            </CardHeader>
            <CardContent className="relative">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring" }}
                className="text-2xl font-bold text-white"
              >
                {stats?.published_courses || courses.filter(c => c.status.toLowerCase() === 'published').length || 0}
              </motion.div>
              <p className="text-xs text-white/70">
                {stats?.total_courses ? 
                  Math.round((stats.published_courses / stats.total_courses) * 100) : 
                  courses.length ? Math.round((courses.filter(c => c.status.toLowerCase() === 'published').length / courses.length) * 100) : 0
                }% do total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="relative border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-black backdrop-blur-sm shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total Estudantes
              </CardTitle>
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Users className="h-4 w-4 text-blue-400" />
              </motion.div>
            </CardHeader>
            <CardContent className="relative">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.0, type: "spring" }}
                className="text-2xl font-bold text-white"
              >
                {stats?.total_students || courses.reduce((total, course) => total + course.enrollment_count, 0) || 0}
              </motion.div>
              <p className="text-xs text-green-400">
                Inscrições ativas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="relative border border-yellow-500/30 bg-gradient-to-br from-yellow-950/50 to-black backdrop-blur-sm shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Receita Total
              </CardTitle>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </motion.div>
            </CardHeader>
            <CardContent className="relative">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: "spring" }}
                className="text-2xl font-bold text-white"
              >
                {stats?.total_revenue || 'Calculando...'}
              </motion.div>
              <p className="text-xs text-green-400">
                Baseado em inscrições
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Enhanced Search Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        <Card className="relative border border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-black backdrop-blur-sm shadow-lg shadow-violet-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-indigo-500/5 rounded-lg" />
          <CardHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative group">
                <motion.div
                  animate={{ x: [0, 2, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Search className="absolute left-3 top-3 h-4 w-4 text-violet-400/70 group-focus-within:text-violet-400 transition-colors" />
                </motion.div>
                <Input
                  placeholder="Buscar cursos por título ou professor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-violet-900/20 border-violet-500/30 text-white placeholder:text-white/50 focus:border-violet-400/50 focus:bg-violet-900/30 transition-all duration-300 hover:border-violet-400/40"
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400/50 transition-all duration-300 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
              </motion.div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Enhanced Course Tabs */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <Tabs defaultValue="all" className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-purple-600/10 rounded-xl blur-lg" />
            <TabsList className="relative bg-gradient-to-r from-violet-950/50 via-blue-950/50 to-purple-950/50 border border-violet-500/30 grid grid-cols-3 w-full max-w-md backdrop-blur-sm shadow-lg shadow-violet-500/10">
              <TabsTrigger 
                value="all" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/30 data-[state=active]:to-blue-600/30 data-[state=active]:text-white transition-all duration-300 hover:bg-violet-600/10"
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BookOpen className="w-4 h-4" />
                </motion.div>
                Todos ({filteredCourses.length})
              </TabsTrigger>
              <TabsTrigger 
                value="video" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/30 data-[state=active]:to-indigo-600/30 data-[state=active]:text-white transition-all duration-300 hover:bg-blue-600/10"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <PlayCircle className="w-4 h-4" />
                </motion.div>
                Vídeo ({videoCourses.length})
              </TabsTrigger>
              <TabsTrigger 
                value="practice" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/30 data-[state=active]:to-pink-600/30 data-[state=active]:text-white transition-all duration-300 hover:bg-purple-600/10"
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Gamepad2 className="w-4 h-4" />
                </motion.div>
                Prática ({practiceCourses.length})
              </TabsTrigger>
            </TabsList>
          </div>
        
        {/* All Courses Tab */}
        <TabsContent value="all">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative border border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-black backdrop-blur-sm shadow-lg shadow-violet-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent rounded-lg" />
              <CardHeader className="relative">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <CardTitle className="text-white flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <BookOpen className="w-5 h-5 text-violet-400" />
                    </motion.div>
                    Todos os Cursos
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    {filteredCourses.length} cursos encontrados
                  </p>
                </motion.div>
              </CardHeader>
              <CardContent className="relative">
                {renderCourseTable(filteredCourses, "Nenhum curso encontrado")}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Video Courses Tab */}
        <TabsContent value="video">
          <div className="grid gap-6">
            {/* Enhanced Video Course Stats */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid gap-4 md:grid-cols-3"
            >
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-black backdrop-blur-sm shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Vídeo</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {videoCoursesCount}
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <PlayCircle className="w-8 h-8 text-blue-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-green-500/30 bg-gradient-to-br from-green-950/50 to-black backdrop-blur-sm shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Publicados</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {videoPublishedCount}
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <BookOpen className="w-8 h-8 text-green-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-black backdrop-blur-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Taxa Publicação</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {videoCoursesCount ? Math.round((videoPublishedCount / videoCoursesCount) * 100) : 0}%
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <BarChart3 className="w-8 h-8 text-indigo-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Enhanced Video Courses Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="relative border border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-black backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg" />
                <CardHeader className="relative">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <CardTitle className="text-white flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <PlayCircle className="w-5 h-5 text-blue-400" />
                      </motion.div>
                      Cursos de Vídeo
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                      {videoCourses.length} cursos de vídeo encontrados
                    </p>
                  </motion.div>
                </CardHeader>
                <CardContent className="relative">
                  {renderCourseTable(videoCourses, "Nenhum curso de vídeo encontrado")}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Practice Courses Tab */}
        <TabsContent value="practice">
          <div className="grid gap-6">
            {/* Enhanced Practice Course Stats */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid gap-4 md:grid-cols-3"
            >
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-black backdrop-blur-sm shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Prática</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {practiceCoursesCount}
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Gamepad2 className="w-8 h-8 text-purple-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-green-500/30 bg-gradient-to-br from-green-950/50 to-black backdrop-blur-sm shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Publicados</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {practicePublishedCount}
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <BookOpen className="w-8 h-8 text-green-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative border border-pink-500/30 bg-gradient-to-br from-pink-950/50 to-black backdrop-blur-sm shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent rounded-lg" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Taxa Publicação</p>
                        <motion.p 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                          className="text-2xl font-bold text-white"
                        >
                          {practiceCoursesCount ? Math.round((practicePublishedCount / practiceCoursesCount) * 100) : 0}%
                        </motion.p>
                      </div>
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <BarChart3 className="w-8 h-8 text-pink-400" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Enhanced Practice Courses Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="relative border border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-black backdrop-blur-sm shadow-lg shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded-lg" />
                <CardHeader className="relative">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <CardTitle className="text-white flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Gamepad2 className="w-5 h-5 text-purple-400" />
                      </motion.div>
                      Cursos Práticos
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                      {practiceCourses.length} cursos práticos encontrados
                    </p>
                  </motion.div>
                </CardHeader>
                <CardContent className="relative">
                  {renderCourseTable(practiceCourses, "Nenhum curso prático encontrado")}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
      </motion.div>
      </div>
    </div>
  );
}