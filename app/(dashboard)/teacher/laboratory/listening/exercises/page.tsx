"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Headphones, 
  Volume2, 
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
  Edit,
  Trash2,
  Eye,
  PenTool
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";

// Mock data - será substituído por chamadas API
const mockExercises = [
  {
    id: "1",
    title: "Business Meeting Comprehension",
    description: "Listen to authentic business meeting recordings and answer questions",
    type: "COMPREHENSION",
    difficulty: "INTERMEDIATE",
    estimatedDuration: 12,
    pointsReward: 30,
    studentsCompleted: 52,
    avgScore: 84.2,
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    title: "English Accents Practice",
    description: "Practice understanding different English accents from around the world",
    type: "ACCENTS",
    difficulty: "ADVANCED", 
    estimatedDuration: 15,
    pointsReward: 40,
    studentsCompleted: 31,
    avgScore: 79.8,
    status: "active",
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    title: "News Report Analysis",
    description: "Listen to news reports and identify key information",
    type: "NEWS",
    difficulty: "INTERMEDIATE",
    estimatedDuration: 10,
    pointsReward: 25,
    studentsCompleted: 67,
    avgScore: 88.5,
    status: "active",
    createdAt: "2024-01-12"
  },
  {
    id: "4",
    title: "Dictation Practice - Basic",
    description: "Transcribe spoken English sentences accurately",
    type: "DICTATION",
    difficulty: "BEGINNER",
    estimatedDuration: 8,
    pointsReward: 20,
    studentsCompleted: 89,
    avgScore: 91.2,
    status: "draft",
    createdAt: "2024-01-08"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'BEGINNER': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'INTERMEDIATE': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'ADVANCED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'COMPREHENSION': return Volume2;
    case 'DICTATION': return PenTool;
    case 'ACCENTS': return Target;
    case 'NEWS': return Play;
    default: return Headphones;
  }
};

export default function ListeningExercisesManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState(mockExercises);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simular carregamento dos dados
    const loadData = async () => {
      try {
        setIsLoading(true);
        // TODO: Implementar chamadas reais para a API
        // const exercisesData = await fetchListeningExercises();
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setExercises(mockExercises);
      } catch (error) {
        console.error('Error loading exercises data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBackToLab = () => {
    router.push('/teacher/laboratory');
  };

  const handleCreateExercise = () => {
    router.push('/teacher/laboratory/listening/exercises/create');
  };

  const handleEditExercise = (exerciseId: string) => {
    router.push(`/teacher/laboratory/listening/exercises/${exerciseId}/edit`);
  };

  // Filter exercises
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || exercise.type === filterType;
    const matchesStatus = filterStatus === 'all' || exercise.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-orange-950/20 to-red-950/30 border-b border-orange-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Botão de Voltar */}
          <Button
            onClick={handleBackToLab}
            variant="ghost"
            className="mb-6 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Laboratório
          </Button>

          <div className="text-center space-y-6">
            {/* Icon and Title */}
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-gradient-to-br from-orange-600 to-red-600 p-4 rounded-2xl shadow-2xl">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                  Gerenciar Exercícios de Listening
                </h1>
                <p className="text-orange-300 text-lg font-medium">Crie e gerencie exercícios de compreensão auditiva</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Configure exercícios de listening para seus alunos. Crie práticas de compreensão auditiva, 
              ditados, exercícios de sotaque e monitore o progresso dos estudantes.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-2 rounded-lg">
                    <Headphones className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{exercises.length}</p>
                    <p className="text-xs text-gray-400">Exercícios</p>
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
                      {exercises.reduce((total, ex) => total + ex.studentsCompleted, 0)}
                    </p>
                    <p className="text-xs text-gray-400">Completados</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {(exercises.reduce((total, ex) => total + ex.avgScore, 0) / exercises.length).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400">Média</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {exercises.filter(ex => ex.status === 'active').length}
                    </p>
                    <p className="text-xs text-gray-400">Ativos</p>
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
        <div className="bg-customgreys-secondarybg/40 backdrop-blur-sm rounded-xl border border-orange-900/30 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar exercícios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-customgreys-darkGrey/50 border-orange-900/30 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all duration-200 rounded-xl"
            />
          </div>
          
          {/* Filters and Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Tipo:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-customgreys-darkGrey/50 border border-orange-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="all">Todos</option>
                  <option value="COMPREHENSION">Compreensão</option>
                  <option value="DICTATION">Ditado</option>
                  <option value="ACCENTS">Sotaques</option>
                  <option value="NEWS">Notícias</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-customgreys-darkGrey/50 border border-orange-900/30 text-white text-sm rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="draft">Rascunho</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
            </div>
            
            <Button
              onClick={handleCreateExercise}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Exercício
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-gray-300">
            {filteredExercises.length === 1 
              ? '1 exercício encontrado' 
              : `${filteredExercises.length} exercícios encontrados`}
          </p>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          {filteredExercises.map((exercise) => {
            const TypeIcon = getTypeIcon(exercise.type);
            
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-customgreys-secondarybg border-orange-900/30 hover:border-orange-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className="bg-orange-500/20 p-3 rounded-xl flex-shrink-0">
                        <TypeIcon className="w-6 h-6 text-orange-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {exercise.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              {exercise.description}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                                {exercise.difficulty}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(exercise.status)}>
                                {exercise.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{exercise.estimatedDuration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{exercise.studentsCompleted} alunos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{exercise.avgScore}% média</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{exercise.pointsReward} pontos</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button
                            onClick={() => handleEditExercise(exercise.id)}
                            variant="outline"
                            size="sm"
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredExercises.length === 0 && (
          <Card className="bg-customgreys-secondarybg border-orange-900/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-orange-500/20 rounded-full p-6 mb-6">
                <Search className="h-12 w-12 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Nenhum exercício encontrado</h3>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                Tente ajustar seus termos de pesquisa ou filtros para encontrar exercícios.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                variant="outline"
                className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
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