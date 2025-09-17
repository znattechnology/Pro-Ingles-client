"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Plus,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Layers,
  Play,
  Settings,
  BarChart3,
  GraduationCap,
  Zap,
  Brain,
  Rocket,
  Star,
  Sparkles
} from "lucide-react";

const LaboratoryDashboard = () => {
  const { user, isAuthenticated } = useDjangoAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalChallenges: 0,
    completionRate: 0
  });

  useEffect(() => {
    // Simular carregamento dos dados
    setTimeout(() => {
      setStats({
        totalCourses: 2,
        totalStudents: 77,
        totalChallenges: 270,
        completionRate: 73
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-12"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-6 py-2 mb-6"
            >
              <Brain className="w-5 h-5 text-violet-400" />
              <span className="text-violet-300 font-medium">Laboratório de Criação</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              Seu <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Studio</span> de Ensino
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              Crie experiências de aprendizado memoráveis com nossa plataforma de criação avançada
            </motion.p>
          </div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalCourses}</div>
              <div className="text-sm text-gray-400">Cursos Ativos</div>
            </motion.div>
        
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalStudents}</div>
              <div className="text-sm text-gray-400">Estudantes</div>
            </motion.div>
        
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalChallenges}</div>
              <div className="text-sm text-gray-400">Desafios</div>
            </motion.div>
        
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.completionRate}%</div>
              <div className="text-sm text-gray-400">Taxa Sucesso</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Tools Section */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Ferramentas de Criação</h2>
            <p className="text-gray-400 text-lg">Escolha sua ferramenta e comece a criar</p>
          </motion.div>

          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Create Course Card - Featured */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/teacher/laboratory/create-course')}
              className="group cursor-pointer relative"
            >
              <div className="relative bg-customgreys-secondarybg rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl min-h-[380px] flex flex-col border-violet-500/30 hover:border-violet-400/60">
                {/* Background Gradient */}
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-violet-500 to-purple-500" />
                
                {/* Header Section */}
                <div className="relative">
                  {/* Hero Image Area */}
                  <div className="relative mb-0 overflow-hidden bg-gradient-to-br from-violet-600/20 to-purple-600/20 h-32">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-purple-500/30 to-pink-500/30" />
                    
                    {/* Animated particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-4 right-4 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60" />
                      <div className="absolute top-12 right-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100 opacity-60" />
                      <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse delay-200 opacity-60" />
                    </div>
                    
                    {/* Featured Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <div className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-400/40 backdrop-blur-sm rounded-full px-3 py-1">
                        <Star className="w-3 h-3 text-violet-300" />
                        <span className="text-xs font-medium text-violet-200">Destaque</span>
                      </div>
                    </div>
                    
                    {/* Premium Badge */}
                    <div className="absolute top-3 right-3 z-20">
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 backdrop-blur-sm rounded-full px-3 py-1">
                        <Sparkles className="w-3 h-3 text-yellow-300" />
                        <span className="text-xs font-medium text-yellow-200">Premium</span>
                      </div>
                    </div>
                    
                    {/* Main Icon */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                        <Plus className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    
                    {/* Hover overlay with button */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
                      <div className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Rocket className="w-4 h-4" />
                        <span className="text-sm font-medium">Começar Criação</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 px-5 py-4 flex flex-col">
                  {/* Template Badge */}
                  <div className="mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-violet-500/10 text-violet-400 border-violet-500/30">
                      <Brain className="h-3.5 w-3.5" />
                      Wizard Inteligente
                    </div>
                  </div>
                  
                  {/* Title and Description */}
                  <div className="mb-4 flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-violet-300">
                      Criar Novo Curso
                    </h3>
                    <p className="text-sm text-customgreys-dirtyGrey line-clamp-2 mb-2">
                      Design completo de cursos com wizard inteligente e templates otimizados para cada área de especialização
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Powered by IA Assistant
                    </p>
                    
                    {/* Features */}
                    <div className="flex items-center gap-4 text-xs text-customgreys-dirtyGrey mb-3">
                      <div className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" />
                        <span>Templates</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        <span>IA Assistant</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        <span>Premium</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-violet-400 mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-semibold text-sm">Pronto para Começar!</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Crie seu primeiro curso em minutos
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom Section */}
                  <div className="space-y-3">
                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-customgreys-dirtyGrey border-customgreys-darkerGrey border rounded-full px-2 py-1">
                        Todas as Categorias
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white transition-all duration-200 rounded-md px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
                        <Plus className="w-4 h-4" />
                        Criar Agora
                      </div>
                      <div className="border-violet-500/30 text-gray-400 hover:text-white hover:bg-violet-800/20 border rounded-md p-2 transition-colors">
                        <Settings className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>

            {/* Manage Courses Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/teacher/laboratory/manage-courses')}
              className="group cursor-pointer"
            >
              <div className="relative p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 h-full overflow-hidden">
                {/* Subtle animated elements */}
                <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-60" />
                
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Layers className="w-8 h-8 text-white drop-shadow-sm" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors">
                    Gerenciar Cursos
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Organize e edite seus cursos existentes
                  </p>
                  
                  <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                    <span>Abrir editor</span>
                    <Settings className="w-4 h-4 ml-2 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Lesson Constructor Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/teacher/laboratory/lesson-constructor')}
              className="group cursor-pointer"
            >
              <div className="relative p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-3xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white drop-shadow-sm" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-100 transition-colors">
                    Construtor de Lições
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Crie lições interativas com preview em tempo real
                  </p>
                  
                  <div className="flex items-center text-green-400 font-medium group-hover:text-green-300 transition-colors">
                    <span>Criar lição</span>
                    <Zap className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analytics Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/teacher/laboratory/analytics')}
              className="group cursor-pointer"
            >
              <div className="relative p-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-3xl border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-red-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white drop-shadow-sm" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-100 transition-colors">
                    Analytics Avançado
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Acompanhe performance e métricas detalhadas
                  </p>
                  
                  <div className="flex items-center text-orange-400 font-medium group-hover:text-orange-300 transition-colors">
                    <span>Ver relatórios</span>
                    <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional Tools Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/teacher/laboratory/challenge-constructor')}
              className="group cursor-pointer md:col-span-2 lg:col-span-1"
            >
              <div className="relative p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/20 hover:border-indigo-400/40 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Target className="w-8 h-8 text-white drop-shadow-sm" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-100 transition-colors">
                    Desafios & Exercícios
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Crie desafios gamificados e exercícios interativos
                  </p>
                  
                  <div className="flex items-center text-indigo-400 font-medium group-hover:text-indigo-300 transition-colors">
                    <span>Criar desafio</span>
                    <Star className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );

};

export default LaboratoryDashboard;