"use client";

/**
 * Teacher Leaderboard Dashboard - Student Rankings Management
 * 
 * This page allows teachers to view student rankings, competition stats,
 * and manage class competitions for better engagement and motivation.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from "framer-motion";
import { 
  Trophy, 
  Crown, 
  Star, 
  Users, 
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Medal,
  Target,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Activity,
  Flame,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/course/Loading';
import { 
  useGetTeacherDashboardQuery,
  useGetStudentProgressListQuery
} from '@/src/domains/teacher/practice-courses/api';



export default function TeacherLeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('rankings');
  const [isCreateCompetitionOpen, setIsCreateCompetitionOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('week');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  
  // Competition form state
  const [competitionForm, setCompetitionForm] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'custom',
    duration: '7',
    prize: '',
    targetMetric: 'points' as 'points' | 'lessons' | 'streak' | 'words' | 'challenges',
    targetValue: '100'
  });

  // API queries
  const { data: studentsResponse, isLoading: studentsLoading } = useGetTeacherClassRankingsQuery({
    timeRange: selectedTimeRange
  });

  // Pagination logic
  const students = studentsResponse || [];
  const totalStudents = students.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  // Reset to first page when time range changes
  const handleTimeRangeChange = (value: 'week' | 'month' | 'all') => {
    setSelectedTimeRange(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const { data: stats, isLoading: statsLoading } = useGetTeacherLeaderboardStatsQuery({
    timeRange: selectedTimeRange
  });
  
  const { data: competitions = [], isLoading: competitionsLoading } = useGetTeacherCompetitionsQuery({
    status: 'all'
  });

  // Mutations
  const [createCompetition, { isLoading: isCreating }] = useCreateTeacherCompetitionMutation();

  // Loading state
  const isLoading = studentsLoading || statsLoading || competitionsLoading;

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getLeagueColor = (league: string) => {
    switch (league) {
      case 'gold': return 'text-yellow-400';
      case 'silver': return 'text-gray-400';
      case 'bronze': return 'text-orange-400';
      default: return 'text-blue-400';
    }
  };

  const getLeagueIcon = (league: string) => {
    switch (league) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '💎';
    }
  };

  const handleCreateCompetition = async () => {
    try {
      await createCompetition({
        title: competitionForm.title,
        description: competitionForm.description,
        type: competitionForm.type,
        duration: competitionForm.type === 'custom' ? parseInt(competitionForm.duration) : undefined,
        prize: competitionForm.prize,
        targetMetric: competitionForm.targetMetric,
        targetValue: parseInt(competitionForm.targetValue),
        autoEnroll: true // Automatically enroll all students
      }).unwrap();
      
      setIsCreateCompetitionOpen(false);
      setCompetitionForm({
        title: '',
        description: '',
        type: 'weekly',
        duration: '7',
        prize: '',
        targetMetric: 'points',
        targetValue: '100'
      });
    } catch (error) {
      console.error('Error creating competition:', error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white p-6">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/dashboard')}
            className="bg-customgreys-secondarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Rankings & Competições
            </h1>
            <p className="text-customgreys-dirtyGrey">
              Monitore o engajamento e competitividade dos seus alunos
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Alunos Ativos</p>
                <p className="text-white text-2xl font-bold">{stats?.activeStudents || 0}</p>
                <p className="text-xs text-gray-400">de {stats?.totalStudents || 0} total</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Competições Ativas</p>
                <p className="text-white text-2xl font-bold">{stats?.activeCompetitions || 0}</p>
                <p className="text-xs text-gray-400">{stats?.completedCompetitions || 0} finalizadas</p>
              </div>
              <Trophy className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Média de Pontos</p>
                <p className="text-white text-2xl font-bold">{stats?.averagePoints ? `${(stats.averagePoints / 1000).toFixed(1)}k` : '0'}</p>
                <p className="text-xs text-gray-400">por estudante</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Streak Médio</p>
                <p className="text-white text-2xl font-bold">{stats?.averageStreak?.toFixed(1) || '0'}</p>
                <p className="text-xs text-gray-400">dias consecutivos</p>
              </div>
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400 text-sm font-medium">Taxa de Engajamento</p>
                <p className="text-white text-2xl font-bold">{stats?.engagementRate ? `${stats.engagementRate.toFixed(1)}%` : '0%'}</p>
                <p className="text-xs text-gray-400">dos estudantes</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-customgreys-secondarybg">
          <TabsTrigger 
            value="rankings" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Rankings dos Alunos
          </TabsTrigger>
          <TabsTrigger 
            value="competitions" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Competições
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rankings">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    Ranking da Turma
                  </CardTitle>
                  <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="w-40 bg-customgreys-primarybg border-customgreys-darkerGrey text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-customgreys-primarybg border-customgreys-darkerGrey">
                      <SelectItem value="week">Esta Semana</SelectItem>
                      <SelectItem value="month">Este Mês</SelectItem>
                      <SelectItem value="all">Todo Período</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-customgreys-primarybg border border-customgreys-darkerGrey hover:border-customgreys-dirtyGrey transition-colors"
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 text-center">
                        {student.rank <= 3 ? (
                          <div className="text-2xl">
                            {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'}
                          </div>
                        ) : (
                          <div className="text-xl font-bold text-customgreys-dirtyGrey">
                            #{student.rank}
                          </div>
                        )}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white">{student.name}</h3>
                          <span className={`text-lg ${getLeagueColor(student.league)}`}>
                            {getLeagueIcon(student.league)}
                          </span>
                          <Badge variant="outline" className={`text-xs ${getLeagueColor(student.league)} border-current`}>
                            {student.league}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-customgreys-dirtyGrey">Pontos: </span>
                            <span className="text-white font-medium">{student.points.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" />
                            <span className="text-customgreys-dirtyGrey">{student.streak} dias</span>
                          </div>
                          <div>
                            <span className="text-customgreys-dirtyGrey">Semanal: </span>
                            <span className="text-white font-medium">+{student.weeklyPoints}</span>
                          </div>
                          <div>
                            <span className="text-customgreys-dirtyGrey">Lições: </span>
                            <span className="text-white font-medium">{student.completedLessons}</span>
                          </div>
                        </div>
                      </div>

                      {/* Change Indicator */}
                      <div className="flex items-center gap-2">
                        {getChangeIcon(student.change)}
                        {student.changeAmount && student.changeAmount > 0 && (
                          <span className={`text-xs ${
                            student.change === 'up' ? 'text-green-400' : 
                            student.change === 'down' ? 'text-red-400' : 'text-customgreys-dirtyGrey'
                          }`}>
                            {student.changeAmount}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-customgreys-dirtyGrey" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-customgreys-darkerGrey">
                    <div className="text-sm text-customgreys-dirtyGrey">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalStudents)} de {totalStudents} estudantes
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                              className={currentPage === pageNumber 
                                ? "bg-violet-600 text-white" 
                                : "bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                              }
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey disabled:opacity-50"
                      >
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="competitions">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Competições da Turma</h2>
              <Dialog open={isCreateCompetitionOpen} onOpenChange={setIsCreateCompetitionOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Competição
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-customgreys-secondarybg border-customgreys-darkerGrey text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Criar Nova Competição</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={competitionForm.title}
                          onChange={(e) => setCompetitionForm(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                          placeholder="Ex: Desafio de Vocabulário"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select 
                          value={competitionForm.type} 
                          onValueChange={(value: 'weekly' | 'monthly' | 'custom') => setCompetitionForm(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-customgreys-primarybg border-customgreys-darkerGrey">
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="custom">Personalizada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={competitionForm.description}
                        onChange={(e) => setCompetitionForm(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                        placeholder="Descreva o objetivo da competição..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="targetMetric">Métrica</Label>
                        <Select 
                          value={competitionForm.targetMetric} 
                          onValueChange={(value: 'points' | 'lessons' | 'streak' | 'words' | 'challenges') => setCompetitionForm(prev => ({ ...prev, targetMetric: value }))}
                        >
                          <SelectTrigger className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-customgreys-primarybg border-customgreys-darkerGrey">
                            <SelectItem value="points">Pontos</SelectItem>
                            <SelectItem value="lessons">Lições</SelectItem>
                            <SelectItem value="streak">Sequência</SelectItem>
                            <SelectItem value="words">Palavras</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetValue">Meta</Label>
                        <Input
                          id="targetValue"
                          type="number"
                          value={competitionForm.targetValue}
                          onChange={(e) => setCompetitionForm(prev => ({ ...prev, targetValue: e.target.value }))}
                          className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prize">Prêmio</Label>
                      <Input
                        id="prize"
                        value={competitionForm.prize}
                        onChange={(e) => setCompetitionForm(prev => ({ ...prev, prize: e.target.value }))}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                        placeholder="Ex: Badge especial + 100 pontos extras"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-customgreys-darkerGrey">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateCompetitionOpen(false)}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateCompetition}
                        disabled={isCreating}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {isCreating ? 'Criando...' : 'Criar Competição'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {competitions.map((competition) => (
                <Card key={competition.id} className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Medal className="w-5 h-5 text-yellow-400" />
                          {competition.title}
                        </CardTitle>
                        <p className="text-customgreys-dirtyGrey mt-1 text-sm">
                          {competition.description}
                        </p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`${
                          competition.status === 'active' ? 'border-green-500 text-green-400' :
                          'border-gray-500 text-gray-400'
                        }`}
                      >
                        {competition.status === 'active' ? 'Ativa' : 'Finalizada'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-customgreys-dirtyGrey">Participantes: </span>
                          <span className="text-white">{competition.participants}</span>
                        </div>
                        <div>
                          <span className="text-customgreys-dirtyGrey">Tipo: </span>
                          <span className="text-white capitalize">{competition.type}</span>
                        </div>
                        <div>
                          <span className="text-customgreys-dirtyGrey">Início: </span>
                          <span className="text-white">{new Date(competition.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div>
                          <span className="text-customgreys-dirtyGrey">Fim: </span>
                          <span className="text-white">{new Date(competition.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-customgreys-primarybg rounded-lg border border-yellow-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm font-medium">Prêmio</span>
                        </div>
                        <p className="text-yellow-200 text-sm">{competition.prize}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Resultados
                        </Button>
                        <Button variant="outline" size="sm" className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="bg-customgreys-primarybg border-customgreys-darkerGrey text-red-400 hover:bg-red-500/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Analytics de Engajamento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Liga Distribution */}
              <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Distribuição por Liga
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-white">Ouro</span>
                      </div>
                      <span className="text-customgreys-dirtyGrey">{stats?.leagueDistribution?.gold || 0} alunos</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-white">Prata</span>
                      </div>
                      <span className="text-customgreys-dirtyGrey">{stats?.leagueDistribution?.silver || 0} alunos</span>
                    </div>
                    <Progress value={50} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                        <span className="text-white">Bronze</span>
                      </div>
                      <span className="text-customgreys-dirtyGrey">{stats?.leagueDistribution?.bronze || 0} alunos</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Métricas de Engajamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-customgreys-dirtyGrey">Taxa de engajamento</span>
                      <span className="text-white font-bold">{stats?.engagementRate ? `${stats.engagementRate.toFixed(0)}%` : '0%'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-customgreys-dirtyGrey">Média de streak</span>
                      <span className="text-white font-bold">{stats?.averageStreak ? `${stats.averageStreak.toFixed(1)} dias` : '0 dias'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-customgreys-dirtyGrey">Total de alunos</span>
                      <span className="text-white font-bold">{stats?.totalStudents || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-customgreys-dirtyGrey">Competições ativas</span>
                      <span className="text-white font-bold">{stats?.activeCompetitions || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Chart */}
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Progresso Semanal da Turma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-center space-x-4 text-customgreys-dirtyGrey">
                  <div className="text-center">
                    <div className="w-8 bg-purple-400 rounded-t" style={{height: '120px'}}></div>
                    <span className="text-xs mt-2 block">Seg</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-purple-400 rounded-t" style={{height: '150px'}}></div>
                    <span className="text-xs mt-2 block">Ter</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-purple-400 rounded-t" style={{height: '180px'}}></div>
                    <span className="text-xs mt-2 block">Qua</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-purple-400 rounded-t" style={{height: '140px'}}></div>
                    <span className="text-xs mt-2 block">Qui</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-purple-400 rounded-t" style={{height: '200px'}}></div>
                    <span className="text-xs mt-2 block">Sex</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-purple-400 rounded-t" style={{height: '90px'}}></div>
                    <span className="text-xs mt-2 block">Sáb</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-purple-400 rounded-t" style={{height: '60px'}}></div>
                    <span className="text-xs mt-2 block">Dom</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

    </div>
  );
}