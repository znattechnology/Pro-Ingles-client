"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Search, ArrowLeft, Target, Brain, Sparkles, Layers, Wand2, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import LessonConstructor from '@/components/laboratory/LessonConstructor';
import { useGetTeacherCoursesQuery } from '@/src/domains/teacher/practice-courses/api';

interface Course {
  id: string;
  title: string;
  description?: string;
  level?: string;
  category?: string;
  status?: string;
  // Estatísticas do curso (sem challenges para lesson-constructor)
  units_count?: number;
  lessons_count?: number;
}

export default function LessonConstructorPage() {
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

  // If a course is selected, show the lesson constructor
  if (selectedCourse) {
    // Transform course to match LessonConstructor's expected interface
    const lessonConstructorCourse = {
      id: selectedCourse.id,
      title: selectedCourse.title,
      description: selectedCourse.description || '',
      level: selectedCourse.level || 'Beginner',
      category: selectedCourse.category || 'General'
    };
    
    return (
      <LessonConstructor 
        course={lessonConstructorCourse} 
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
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-violet-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
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
                className="text-gray-400 hover:text-white hover:bg-violet-600/20 transition-all text-sm sm:text-base px-2 sm:px-4"
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
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm shadow-lg shadow-violet-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              </motion.div>
              <span className="text-violet-300 font-semibold text-sm sm:text-base lg:text-lg">Construtor Inteligente</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight px-2"
            >
              Construtor de{' '}
              <motion.span 
                className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Lições
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                ✨
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 font-light px-4"
            >
              Selecione um curso e crie <motion.span className="text-violet-400 font-medium" whileHover={{ scale: 1.05 }}>lições interativas</motion.span> que{' '}
              <motion.span className="text-purple-400 font-medium" whileHover={{ scale: 1.05 }}>engajam</motion.span> e{' '}
              <motion.span className="text-indigo-400 font-medium" whileHover={{ scale: 1.05 }}>educam</motion.span>
            </motion.p>
            
            {/* Stats Pills */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-4"
            >
              {[
                { icon: Target, label: 'Templates Inteligentes', count: '12+' },
                { icon: Users, label: 'Estudantes Ativos', count: '2.5k+' },
                { icon: TrendingUp, label: 'Taxa de Sucesso', count: '94%' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ y: -2, scale: 1.05 }}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
                >
                  <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
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
                  <Search className="text-violet-400 w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              </div>
              <Input
                placeholder="Buscar curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 sm:pl-14 pr-4 bg-customgreys-secondarybg/30 backdrop-blur-md border-2 border-violet-500/30 text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/20 transition-all duration-300 h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20"
              />
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <div className="bg-violet-500/20 text-violet-300 text-xs px-2 py-1 rounded-full">
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
                  <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-violet-500/20 shadow-2xl shadow-violet-500/5 overflow-hidden relative group">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <motion.div 
                          className="h-6 bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-violet-500/30 rounded-full w-20"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div 
                          className="p-3 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        >
                          <div className="w-6 h-6 bg-violet-400/50 rounded" />
                        </motion.div>
                      </div>
                      <motion.div 
                        className="h-7 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 rounded-lg w-full mb-2"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      />
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="space-y-3">
                        <motion.div 
                          className="h-4 bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-violet-500/15 rounded w-full"
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                        />
                        <motion.div 
                          className="h-4 bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-purple-500/15 rounded w-3/4"
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex gap-2">
                          <motion.div 
                            className="h-6 bg-violet-500/20 rounded-full w-16"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                          />
                          <motion.div 
                            className="h-6 bg-purple-500/20 rounded-full w-16"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
                          />
                        </div>
                        <motion.div 
                          className="flex items-center gap-1"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="h-4 bg-violet-400/30 rounded w-20" />
                          <div className="text-violet-400">→</div>
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
              <Card className="bg-customgreys-secondarybg/50 backdrop-blur-sm border-violet-500/20">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-4 bg-violet-500/10 rounded-full mb-6"
                  >
                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-violet-400" />
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
                      : 'Você precisa criar um curso antes de poder adicionar lições. Comece criando seu primeiro curso no laboratório.'
                    }
                  </motion.p>
                  {!searchTerm && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        onClick={() => router.push('/teacher/laboratory/create-course')}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Curso
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
                  key={course.id}
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
                  <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-violet-500/20 hover:border-violet-400/60 shadow-2xl shadow-violet-500/10 hover:shadow-violet-500/25 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                    {/* Enhanced gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                          className="relative p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/20 rounded-xl group-hover:from-violet-500/20 group-hover:to-purple-500/30 transition-all duration-300 shadow-lg shadow-violet-500/10"
                        >
                          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400 relative z-10" />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-xl"
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
                        <CardTitle className="text-lg sm:text-xl text-white group-hover:text-violet-300 transition-all duration-300 leading-tight font-bold">
                          {course.title}
                        </CardTitle>
                      </motion.div>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {course.description || 'Sem descrição disponível'}
                      </p>
                      
                      {/* Course Statistics Grid */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 py-2 sm:py-3 px-2 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-lg border border-violet-500/10">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2"
                        >
                          <div className="p-1.5 bg-gradient-to-br from-violet-500/20 to-violet-600/20 rounded-lg">
                            <Layers className="w-3 h-3 text-violet-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 hidden sm:block">Unidades</p><p className="text-xs text-gray-400 sm:hidden">Un.</p>
                            <p className="text-xs sm:text-sm font-semibold text-white">{course.units_count || 0}</p>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2"
                        >
                          <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
                            <BookOpen className="w-3 h-3 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Lições</p>
                            <p className="text-sm font-semibold text-white">{course.lessons_count || 0}</p>
                          </div>
                        </motion.div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-violet-500/10 to-violet-500/20 text-violet-300 border-violet-500/30 shadow-sm whitespace-nowrap">
                              {course.category || 'General'}
                            </Badge>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500/10 to-purple-500/20 text-purple-300 border-purple-500/30 shadow-sm whitespace-nowrap">
                              {course.level || 'Beginner'}
                            </Badge>
                          </motion.div>
                        </div>
                        
                        {/* Contextual Action Button */}
                        <motion.div 
                          className="text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 font-medium"
                          whileHover={{ x: 6 }}
                        >
                          {course.units_count === 0 ? (
                            <>
                              <div className="text-amber-400 group-hover:text-amber-300">
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </div>
                              <span className="text-amber-400 group-hover:text-amber-300 hidden sm:inline">Primeira unidade</span><span className="text-amber-400 group-hover:text-amber-300 sm:hidden">Add unidade</span>
                            </>
                          ) : course.lessons_count === 0 ? (
                            <>
                              <div className="text-blue-400 group-hover:text-blue-300">
                                <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </div>
                              <span className="text-blue-400 group-hover:text-blue-300 hidden sm:inline">Primeira lição</span><span className="text-blue-400 group-hover:text-blue-300 sm:hidden">Add lição</span>
                            </>
                          ) : (
                            <>
                              <div className="text-violet-400 group-hover:text-violet-300">
                                <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                              </div>
                              <span className="text-violet-400 group-hover:text-violet-300 hidden sm:inline">Criar lições</span><span className="text-violet-400 group-hover:text-violet-300 sm:hidden">Criar</span>
                            </>
                          )}
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
                            className={course.units_count === 0 ? "text-amber-400" : course.lessons_count === 0 ? "text-blue-400" : "text-violet-400"}
                          >
                            ✨
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

      {/* Help Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="px-4 sm:px-6 pb-8 sm:pb-12"
      >
        <div className="max-w-7xl mx-auto">
          <Card className="bg-customgreys-secondarybg/50 backdrop-blur-sm border-violet-500/20 shadow-lg shadow-violet-500/5">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  className="p-3 sm:p-4 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 mx-auto sm:mx-0"
                >
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
                <div className="flex-1">
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 text-center sm:text-left"
                  >
                    Como funciona o <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Construtor de Lições</span>?
                  </motion.h3>
                  <div className="grid gap-3 sm:gap-4">
                    {[
                      { step: "1", title: "Selecione um curso", desc: "Escolha o curso para o qual deseja criar lições" },
                      { step: "2", title: "Organize em unidades", desc: "Crie ou selecione uma unidade para estruturar o conteúdo" },
                      { step: "3", title: "Configure a lição", desc: "Defina título, objetivos e duração estimada" },
                      { step: "4", title: "Escolha um template", desc: "Use nossos templates pré-definidos baseados no Duolingo" },
                      { step: "5", title: "Preview em tempo real", desc: "Veja como a lição aparecerá para os estudantes" }
                    ].map((item, index) => (
                      <motion.div
                        key={item.step}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-violet-500/5 border border-violet-500/10 hover:bg-violet-500/10 transition-colors group"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm group-hover:scale-110 transition-transform flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="text-white font-medium mb-1 text-sm sm:text-base">{item.title}</p>
                          <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
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