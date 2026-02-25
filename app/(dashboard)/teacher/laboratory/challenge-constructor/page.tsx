"use client";

/**
 * Challenge Constructor Page - Phase 3 Implementation
 * 
 * This page provides an interface for teachers to create challenges/exercises 
 * using the ChallengeConstructor component. It includes course selection and 
 * integrates with the complete laboratory system.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Plus, Search, Zap, Users, TrendingUp, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import ChallengeConstructor from '@/components/laboratory/ChallengeConstructor';
import { useGetTeacherCoursesQuery } from '@/src/domains/teacher/practice-courses/api';

interface Course {
  id?: string;
  courseId?: string;  // Backend pode retornar courseId em vez de id
  title: string;
  description?: string;
  level?: string;
  category?: string;
  status?: string;
  // Estatísticas do curso
  units_count?: number;
  lessons_count?: number;
  challenges_count?: number;
  total_progress?: number;
}

// Helper para obter o ID do curso independente do nome do campo
const getCourseId = (course: Course): string | undefined => {
  return course.id || course.courseId;
};

export default function ChallengeConstructorPage() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use Redux hook to get teacher courses (including drafts)
  const { data: coursesData, isLoading: loading } = useGetTeacherCoursesQuery({ includeDrafts: true });
  
  // Transform courses data to match expected interface
  const courses = coursesData || [];

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (course.level && course.level.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBackToLaboratory = () => {
    router.push('/teacher/laboratory');
  };

  const handleBackToCourseSelection = () => {
    setSelectedCourse(null);
  };

  // If a course is selected, show the challenge constructor
  if (selectedCourse) {
    // 🔒 VALIDAÇÃO: Obter ID do curso (pode ser 'id' ou 'courseId')
    const courseId = getCourseId(selectedCourse);

    if (!courseId) {
      console.error('❌ CRITICAL: No course ID found:', {
        selectedCourse,
        keys: Object.keys(selectedCourse),
        id: selectedCourse.id,
        courseId: selectedCourse.courseId
      });

      return (
        <div className="min-h-screen bg-customgreys-primarybg text-white flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 max-w-md"
          >
            <div className="text-red-400 text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Erro de Dados</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              O curso selecionado não possui um ID válido.
              Isso pode ocorrer se o curso foi criado mas não foi salvo corretamente.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setSelectedCourse(null);
                  window.location.reload();
                }}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                Recarregar e Tentar Novamente
              </Button>
              <Button
                onClick={handleBackToCourseSelection}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Voltar à Seleção de Cursos
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    // ✅ SAFE: Course tem id validado
    const challengeConstructorCourse = {
      id: courseId,  // Usar courseId validado (pode vir de course.id ou course.courseId)
      title: selectedCourse.title,
      description: selectedCourse.description || '',
      level: selectedCourse.level || 'Beginner',
      category: selectedCourse.category || 'General'
    };

    return (
      <ChallengeConstructor
        course={challengeConstructorCourse}
        onBack={handleBackToCourseSelection}
      />
    );
  }

  // Course selection interface
  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-6 sm:py-8"
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-orange-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-yellow-500/5 rounded-full blur-3xl" />
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-orange-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-red-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-orange-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="ghost"
                onClick={handleBackToLaboratory}
                className="text-gray-400 hover:text-white hover:bg-orange-600/20 transition-all text-sm sm:text-base px-2 sm:px-4"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Voltar ao Laboratório</span><span className="xs:hidden">Voltar</span>
              </Button>
            </motion.div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 border border-orange-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm shadow-lg shadow-orange-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </motion.div>
              <span className="text-orange-300 font-semibold text-sm sm:text-base lg:text-lg">Construtor de Desafios</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight px-2"
            >
              Crie{' '}
              <motion.span 
                className="bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Desafios
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                🎯
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 font-light px-4"
            >
              Selecione um curso e desenvolva <motion.span className="text-orange-400 font-medium" whileHover={{ scale: 1.05 }}>exercícios interativos</motion.span> que{' '}
              <motion.span className="text-red-400 font-medium" whileHover={{ scale: 1.05 }}>desafiam</motion.span> e{' '}
              <motion.span className="text-yellow-400 font-medium" whileHover={{ scale: 1.05 }}>motivam</motion.span>
            </motion.p>
            
            {/* Stats Pills */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-4"
            >
              {[
                { icon: Trophy, label: 'Tipos de Exercícios', count: '8+' },
                { icon: Users, label: 'Desafios Criados', count: '1.2k+' },
                { icon: TrendingUp, label: 'Engajamento', count: '96%' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ y: -2, scale: 1.05 }}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
                >
                  <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                  <span className="text-xs sm:text-sm font-medium text-white">{stat.count}</span>
                  <span className="text-xs text-gray-400 hidden sm:inline">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="px-4 sm:px-6 mb-6 sm:mb-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02 }}
              className="relative"
            >
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: searchTerm ? 0 : 360 }}
                  transition={{ duration: 2, repeat: searchTerm ? 0 : Infinity, ease: "linear" }}
                >
                  <Search className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              </div>
              <Input
                placeholder="Buscar curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 sm:pl-14 pr-4 bg-customgreys-secondarybg/30 backdrop-blur-md border-2 border-orange-500/30 text-white placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20"
              />
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <div className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full">
                    {filteredCourses.length} resultado{filteredCourses.length !== 1 ? 's' : ''}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Course Selection */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="px-4 sm:px-6 pb-8 sm:pb-12"
      >
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: i * 0.1, 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-orange-500/20 shadow-2xl shadow-orange-500/5 overflow-hidden relative group">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <motion.div 
                          className="h-6 bg-gradient-to-r from-orange-500/30 via-red-500/30 to-orange-500/30 rounded-full w-20"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div 
                          className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        >
                          <div className="w-6 h-6 bg-orange-400/50 rounded" />
                        </motion.div>
                      </div>
                      <motion.div 
                        className="h-7 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-lg w-full mb-2"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      />
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="space-y-3">
                        <motion.div 
                          className="h-4 bg-gradient-to-r from-orange-500/15 via-red-500/15 to-orange-500/15 rounded w-full"
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                        />
                        <motion.div 
                          className="h-4 bg-gradient-to-r from-red-500/15 via-yellow-500/15 to-red-500/15 rounded w-3/4"
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex gap-2">
                          <motion.div 
                            className="h-6 bg-orange-500/20 rounded-full w-16"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                          />
                          <motion.div 
                            className="h-6 bg-red-500/20 rounded-full w-16"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
                          />
                        </div>
                        <motion.div 
                          className="flex items-center gap-1"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="h-4 bg-orange-400/30 rounded w-20" />
                          <div className="text-orange-400">→</div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-customgreys-secondarybg/50 backdrop-blur-sm border-orange-500/20">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-4 bg-orange-500/10 rounded-full mb-6"
                  >
                    <Target className="w-12 h-12 sm:w-16 sm:h-16 text-orange-400" />
                  </motion.div>
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 text-center"
                  >
                    {searchTerm ? 'Nenhum curso encontrado' : 'Nenhum curso disponível'}
                  </motion.h3>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm sm:text-base text-gray-400 text-center mb-6 sm:mb-8 max-w-md leading-relaxed"
                  >
                    {searchTerm 
                      ? `Não encontramos cursos que correspondam a "${searchTerm}". Tente ajustar sua busca.`
                      : 'Você precisa criar um curso e lições antes de poder adicionar exercícios. Comece criando seu primeiro curso no laboratório.'
                    }
                  </motion.p>
                  {!searchTerm && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex gap-4"
                    >
                      <Button
                        onClick={() => router.push('/teacher/laboratory/create-course')}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-orange-500/40 hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Curso
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/teacher/laboratory/lesson-constructor')}
                        className="bg-customgreys-primarybg/50 border-orange-500/30 text-white hover:bg-orange-500/10 hover:border-orange-500/50 transition-all duration-200"
                      >
                        Criar Lições
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={getCourseId(course) || index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    rotateY: 5,
                    rotateX: 5,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer perspective-1000"
                  onClick={() => setSelectedCourse(course)}
                  style={{
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-orange-500/20 hover:border-orange-400/60 shadow-2xl shadow-orange-500/10 hover:shadow-orange-500/25 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                    {/* Enhanced gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Shimmer effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                      whileHover={{ translateX: '100%' }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${
                            (course.status || '').toLowerCase() === 'published' 
                              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                              : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {(course.status || '').toLowerCase() === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                        <motion.div
                          whileHover={{ rotate: 15, scale: 1.2 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative p-3 bg-gradient-to-br from-orange-500/10 to-red-500/20 rounded-xl group-hover:from-orange-500/20 group-hover:to-red-500/30 transition-all duration-300 shadow-lg shadow-orange-500/10"
                        >
                          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 relative z-10" />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-xl"
                            initial={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        </motion.div>
                      </div>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardTitle className="text-lg sm:text-xl text-white group-hover:text-orange-300 transition-all duration-300 leading-tight font-bold">
                          {course.title}
                        </CardTitle>
                      </motion.div>
                    </CardHeader>
                    <CardContent className="relative">
                      <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                        {course.description || 'Sem descrição disponível'}
                      </p>
                      
                      {/* Course Statistics */}
                      <div className="mb-4">
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3 p-2 sm:p-3 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-yellow-500/5 rounded-lg border border-orange-500/10">
                          <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="text-orange-400 font-bold text-base sm:text-lg">
                              {course.units_count || 0}
                            </div>
                            <div className="text-gray-400 text-xs hidden sm:block">Unidades</div><div className="text-gray-400 text-xs sm:hidden">Un.</div>
                          </motion.div>
                          
                          <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="text-red-400 font-bold text-base sm:text-lg">
                              {course.lessons_count || 0}
                            </div>
                            <div className="text-gray-400 text-xs hidden sm:block">Lições</div><div className="text-gray-400 text-xs sm:hidden">Liç.</div>
                          </motion.div>
                          
                          <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="text-yellow-400 font-bold text-base sm:text-lg">
                              {course.challenges_count || 0}
                            </div>
                            <div className="text-gray-400 text-xs hidden sm:block">Exercícios</div><div className="text-gray-400 text-xs sm:hidden">Ex.</div>
                          </motion.div>
                        </div>
                        
                        {/* Progress Indicator */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Progresso do Curso</span>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (course.lessons_count || 0) > 0 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {(course.lessons_count || 0) > 0 ? '✓ Pronto' : '⚠ Incompleto'}
                          </motion.div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                          <motion.div 
                            className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min(
                                ((course.units_count || 0) * 30 + (course.lessons_count || 0) * 40 + (course.challenges_count || 0) * 30) / 100 * 100, 
                                100
                              )}%` 
                            }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-500/10 to-orange-500/20 text-orange-300 border-orange-500/30 shadow-sm whitespace-nowrap">
                              {course.category || 'General'}
                            </Badge>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-red-500/10 to-red-500/20 text-red-300 border-red-500/30 shadow-sm whitespace-nowrap">
                              {course.level || 'Beginner'}
                            </Badge>
                          </motion.div>
                        </div>
                        <motion.div 
                          className="text-xs sm:text-sm text-gray-400 group-hover:text-orange-400 transition-colors flex items-center gap-1.5 sm:gap-2 font-medium"
                          whileHover={{ x: 6 }}
                        >
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {(course.lessons_count || 0) > 0 
                              ? `${(course.challenges_count || 0) > 0 ? 'Mais exercícios' : 'Criar exercícios'}`
                              : 'Criar lições primeiro'
                            }
                          </span>
                          <motion.span
                            animate={{ 
                              x: [0, 6, 0],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className={
                              (course.lessons_count || 0) > 0 
                                ? "text-orange-400" 
                                : "text-amber-400"
                            }
                          >
                            {(course.lessons_count || 0) > 0 ? '🎯' : '⚠️'}
                          </motion.span>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Challenge Types Preview */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="px-4 sm:px-6 pb-6 sm:pb-8"
      >
        <div className="max-w-7xl mx-auto">
          <Card className="bg-customgreys-secondarybg/50 backdrop-blur-sm border-orange-500/20 shadow-lg shadow-orange-500/5">
            <CardHeader>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Tipos de <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Desafios</span> Disponíveis
                </CardTitle>
                <p className="text-sm sm:text-base text-gray-400">Escolha entre diversos formatos para criar exercícios envolventes</p>
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[
                  { name: 'Múltipla Escolha', icon: '⚪', desc: 'Selecionar resposta correta', color: 'orange' },
                  { name: 'Completar Lacuna', icon: '📝', desc: 'Preencher palavras que faltam', color: 'red' },
                  { name: 'Tradução', icon: '🌐', desc: 'Traduzir entre idiomas', color: 'yellow' },
                  { name: 'Compreensão Auditiva', icon: '🔊', desc: 'Ouvir e responder', color: 'orange' },
                  { name: 'Pronúncia', icon: '🎤', desc: 'Falar e ser avaliado', color: 'red' },
                  { name: 'Combinar Pares', icon: '🔗', desc: 'Conectar elementos relacionados', color: 'yellow' },
                  { name: 'Ordenar Frase', icon: '📐', desc: 'Organizar palavras corretamente', color: 'orange' },
                  { name: 'E mais...', icon: '✨', desc: 'Novos tipos em desenvolvimento', color: 'red' }
                ].map((type, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ 
                      y: -4, 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    className={`bg-gradient-to-br from-customgreys-primarybg/60 to-customgreys-primarybg/80 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-${type.color}-500/20 hover:border-${type.color}-400/50 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-${type.color}-500/20`}
                  >
                    <motion.div 
                      className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {type.icon}
                    </motion.div>
                    <h4 className={`text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-2 group-hover:text-${type.color}-300 transition-colors`}>
                      {type.name}
                    </h4>
                    <p className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-300 transition-colors hidden sm:block">
                      {type.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="px-4 sm:px-6 pb-8 sm:pb-12"
      >
        <div className="max-w-7xl mx-auto">
          <Card className="bg-customgreys-secondarybg/50 backdrop-blur-sm border-orange-500/20 shadow-lg shadow-orange-500/5">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  className="p-3 sm:p-4 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg shadow-orange-500/25 mx-auto sm:mx-0"
                >
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
                <div className="flex-1">
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 text-center sm:text-left"
                  >
                    Como criar <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">exercícios eficazes</span>?
                  </motion.h3>
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { icon: "📋", title: "Planejamento", desc: "Escolha o tipo de desafio baseado no objetivo de aprendizagem" },
                        { icon: "🎯", title: "Progressão", desc: "Comece com exercícios fáceis e aumente a dificuldade" },
                        { icon: "🔄", title: "Variedade", desc: "Misture diferentes tipos para manter o engajamento" }
                      ].map((tip, index) => (
                        <motion.div
                          key={tip.title}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                          className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors group"
                        >
                          <div className="text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">{tip.icon}</div>
                          <div>
                            <p className="text-white font-medium mb-1 text-sm sm:text-base">{tip.title}</p>
                            <p className="text-gray-400 text-xs sm:text-sm">{tip.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { icon: "💡", title: "Dicas", desc: "Sempre forneça dicas úteis para apoiar o aprendizado" },
                        { icon: "✅", title: "Feedback", desc: "Inclua explicações para respostas corretas e incorretas" },
                        { icon: "📊", title: "Equilíbrio", desc: "8-12 exercícios por lição para experiência ideal" }
                      ].map((tip, index) => (
                        <motion.div
                          key={tip.title}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 1.5 + index * 0.1 }}
                          className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors group"
                        >
                          <div className="text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">{tip.icon}</div>
                          <div>
                            <p className="text-white font-medium mb-1 text-sm sm:text-base">{tip.title}</p>
                            <p className="text-gray-400 text-xs sm:text-sm">{tip.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}