"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  Headphones, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Search,
  Plus,
  Settings,
  Users,
  ArrowLeft,
  ChevronRight,
  Star,
  Play,
  Zap,
  Clock,
  Filter,
  Grid3X3,
  List as ListIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";

// Mock data - será substituído por chamadas API
const mockCourses = [
  {
    id: "1",
    title: "Business English Fundamentals",
    description: "Professional communication skills",
    level: "INTERMEDIATE",
    studentsCount: 45,
    speakingExercises: 8,
    listeningExercises: 12,
    avgSpeakingScore: 87.5,
    avgListeningScore: 82.3,
    image: "/service-1.jpg"
  },
  {
    id: "2", 
    title: "Advanced Conversation Skills",
    description: "Master fluent English conversations",
    level: "ADVANCED",
    studentsCount: 23,
    speakingExercises: 15,
    listeningExercises: 10,
    avgSpeakingScore: 91.2,
    avgListeningScore: 88.7,
    image: "/service-2.jpg"
  },
  {
    id: "3",
    title: "English for Beginners",
    description: "Start your English journey",
    level: "BEGINNER",
    studentsCount: 67,
    speakingExercises: 5,
    listeningExercises: 8,
    avgSpeakingScore: 76.4,
    avgListeningScore: 79.1,
    image: "/service-3.jpg"
  }
];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'BEGINNER': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'INTERMEDIATE': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'ADVANCED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

export default function CoursePracticesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Simular carregamento dos dados
    const loadData = async () => {
      try {
        setIsLoading(true);
        // TODO: Implementar chamadas reais para a API
        // const coursesData = await fetchTeacherCoursesWithPractices();
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCourses(mockCourses);
      } catch (error) {
        console.error('Error loading courses data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCourseClick = (courseId: string) => {
    router.push(`/teacher/laboratory/course-practices/${courseId}`);
  };

  const handleBackToLab = () => {
    router.push('/teacher/laboratory');
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    
    return matchesSearch && matchesLevel;
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-pink-950/20 to-rose-950/30 border-b border-pink-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Botão de Voltar */}
          <Button
            onClick={handleBackToLab}
            variant="ghost"
            className="mb-6 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Laboratório
          </Button>

          <div className="text-center space-y-6">
            {/* Icon and Title */}
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-4 rounded-2xl shadow-2xl">
                <div className="flex gap-2">
                  <Mic className="h-6 w-6 text-white" />
                  <Headphones className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-pink-200 to-rose-200 bg-clip-text text-transparent">
                  Práticas Contextualizadas
                </h1>
                <p className="text-pink-300 text-lg font-medium">Gerencie Speaking e Listening por Curso</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Configure e monitore práticas de speaking e listening específicas para cada curso. 
              Crie exercícios contextualizados que complementam o conteúdo principal.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-pink-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-pink-500/20 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{courses.length}</p>
                    <p className="text-xs text-gray-400">Cursos</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Mic className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {courses.reduce((total, course) => total + course.speakingExercises, 0)}
                    </p>
                    <p className="text-xs text-gray-400">Speaking</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-2 rounded-lg">
                    <Headphones className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {courses.reduce((total, course) => total + course.listeningExercises, 0)}
                    </p>
                    <p className="text-xs text-gray-400">Listening</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {courses.reduce((total, course) => total + course.studentsCount, 0)}
                    </p>
                    <p className="text-xs text-gray-400">Estudantes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-customgreys-secondarybg/40 backdrop-blur-sm rounded-xl border border-pink-900/30 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-customgreys-darkGrey/50 border-pink-900/30 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 transition-all duration-200 rounded-xl"
            />
          </div>
          
          {/* Filters and Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Level Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Nível:</span>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="bg-customgreys-darkGrey/50 border border-pink-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value="all">Todos</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-customgreys-darkGrey/50 border border-pink-900/30 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-gray-300">
            {filteredCourses.length === 1 
              ? '1 curso encontrado' 
              : `${filteredCourses.length} cursos encontrados`}
          </p>
          <Button
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white"
            onClick={() => router.push('/teacher/laboratory/course-practices/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Prática
          </Button>
        </div>

        {/* Courses Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        }>
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="bg-customgreys-secondarybg border-pink-900/30 hover:border-pink-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => handleCourseClick(course.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Course Icon */}
                    <div className="bg-pink-500/20 p-3 rounded-xl flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-pink-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-pink-300 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {course.description}
                          </p>
                          <Badge variant="outline" className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{course.studentsCount} estudantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">{course.speakingExercises} speaking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">{course.listeningExercises} listening</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">
                            {((course.avgSpeakingScore + course.avgListeningScore) / 2).toFixed(1)}% média
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white"
                        size="sm"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Gerenciar Práticas
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card className="bg-customgreys-secondarybg border-pink-900/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-pink-500/20 rounded-full p-6 mb-6">
                <Search className="h-12 w-12 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Nenhum curso encontrado</h3>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                Tente ajustar seus termos de pesquisa ou filtros para encontrar cursos.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterLevel('all');
                }}
                variant="outline"
                className="border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white"
              >
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}