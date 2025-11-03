"use client";

import * as React from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Activity,
  Award,
  Eye,
  UserCheck,
  Crown,
  Globe,
  BarChart3,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { useAdminDashboard, AdminStatsCard } from "@/src/domains/admin";
import { AdminChartCard } from "@/components/admin/AdminChartCard";

// Utility functions for formatting
const formatAOA = (amount: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Linguagem Angolana - Saudações e expressões comuns
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const angolanExpressions = [
  "Tudo jóia, mano!",
  "Está fixe, chefe!",
  "A coisa está a andar bem!",
  "Tá nice, bwé!",
  "A plataforma está top!"
];

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const {
    adminStats,
    recentStudents,
    enrollmentChartData,
    revenueChartData,
    isLoading,
    isError
  } = useAdminDashboard();

  const randomExpression = angolanExpressions[Math.floor(Math.random() * angolanExpressions.length)];

  if (authLoading || isLoading) {
    return (
      <Loading 
        title="Painel Administrativo"
        subtitle="Dashboard do Admin"
        description="Carregando dados do sistema e estatísticas..."
        icon={Crown}
        progress={80}
        theme={{
          primary: "yellow",
          secondary: "orange",
          accent: "amber"
        }}
        size="lg"
      />
    );
  }
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para aceder ao painel administrativo.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Apenas administradores podem aceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-400 mb-4">Tente recarregar a página</p>
          <Button onClick={() => window.location.reload()} className="bg-violet-600 hover:bg-violet-700">
            Recarregar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Modern Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-4 sm:py-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-full blur-2xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-emerald-500/5" />
        
        <div className='relative max-w-7xl mx-auto'>
          <div className="mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-yellow-300 font-medium text-sm">Painel Administrativo</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white"
            >
              {getGreeting()}, <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{user.name}</span>! 
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                👑
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mb-2"
            >
              Controla toda a plataforma ProEnglish desde aqui. {randomExpression}
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center gap-4 text-sm text-gray-400"
            >
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Sistema Online</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>{formatNumber(adminStats.activeUsers)} utilizadores activos</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <AdminStatsCard
            title="Total de Utilizadores"
            value={formatNumber(adminStats.totalUsers)}
            change={`+${adminStats.growthRate}% este mês`}
            changeType="positive"
            icon={Users}
            iconColor="text-blue-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-blue-900/30"
            index={0}
          />
          
          <AdminStatsCard
            title="Professores Activos"
            value={formatNumber(adminStats.totalTeachers)}
            change={`${adminStats.totalStudents > 0 ? 'Grande equipa!' : 'A crescer'}`}
            changeType="positive"
            icon={GraduationCap}
            iconColor="text-emerald-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-emerald-900/30"
            index={1}
          />
          
          <AdminStatsCard
            title="Cursos Disponíveis"
            value={formatNumber(adminStats.totalCourses)}
            change={`${adminStats.publishedCourses} publicados`}
            changeType="positive"
            icon={BookOpen}
            iconColor="text-purple-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-purple-900/30"
            index={2}
          />
          
          <AdminStatsCard
            title="Receita Mensal"
            value={formatAOA(adminStats.monthlyRevenue)}
            change={`+${adminStats.growthRate}% crescimento`}
            changeType="positive"
            icon={DollarSign}
            iconColor="text-yellow-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-yellow-900/30"
            index={3}
          />
        </motion.div>
        
        {/* Additional Stats Row */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <AdminStatsCard
            title="Estudantes Activos"
            value={formatNumber(adminStats.activeUsers)}
            change={`${adminStats.engagementRate.toFixed(1)}% engajamento`}
            changeType="positive"
            icon={UserCheck}
            iconColor="text-green-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-green-900/30"
            index={4}
          />
          
          <AdminStatsCard
            title="Contas Verificadas"
            value={formatNumber(adminStats.verifiedUsers)}
            change={`${((adminStats.verifiedUsers / Math.max(1, adminStats.totalUsers)) * 100).toFixed(1)}% verificados`}
            changeType="positive"
            icon={CheckCircle2}
            iconColor="text-teal-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-teal-900/30"
            index={5}
          />
          
          <AdminStatsCard
            title="Receita Total"
            value={formatAOA(adminStats.totalRevenue)}
            change="Desde o início"
            changeType="neutral"
            icon={Award}
            iconColor="text-orange-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-orange-900/30"
            index={6}
          />
          
          <AdminStatsCard
            title="Taxa de Crescimento"
            value={`${adminStats.growthRate}%`}
            change="Últimos 30 dias"
            changeType={adminStats.growthRate > 0 ? "positive" : "neutral"}
            icon={TrendingUp}
            iconColor="text-pink-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-pink-900/30"
            index={7}
          />
        </motion.div>

        {/* Enhanced Charts Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <AdminChartCard
            title="Novos Utilizadores"
            subtitle="Registo de estudantes - últimos 6 meses"
            data={enrollmentChartData}
            icon={Users}
            iconColor="text-blue-400"
            chartType="area"
            chartColor="text-blue-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-blue-900/30"
            index={0}
          />
          
          <AdminChartCard
            title="Receita em Kwanzas"
            subtitle="Facturação mensal - últimos 6 meses"
            data={revenueChartData}
            icon={DollarSign}
            iconColor="text-yellow-400"
            chartType="bar"
            chartColor="text-yellow-400"
            bgColor="bg-customgreys-secondarybg/60"
            borderColor="border-yellow-900/30"
            formatValue={(value) => formatAOA(value)}
            index={1}
          />
        </motion.div>

        {/* Enhanced Tables Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardHeader>
              <Tabs defaultValue="recent-students" className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList className="bg-violet-900/20">
                    <TabsTrigger value="recent-students" className="data-[state=active]:bg-violet-800">
                      Novos Estudantes
                    </TabsTrigger>
                    <TabsTrigger value="top-courses" className="data-[state=active]:bg-violet-800">
                      Cursos Top
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" className="h-8 text-xs text-white hover:bg-violet-900">
                    Ver Todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <TabsContent value="recent-students" className="border-none p-0 pt-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-violet-900/20 border-violet-900/30">
                        <TableHead className="text-white/70">Estudante</TableHead>
                        <TableHead className="text-white/70">Estado</TableHead>
                        <TableHead className="text-white/70">Data de Registo</TableHead>
                        <TableHead className="text-white/70">Último Acesso</TableHead>
                        <TableHead className="text-white/70">Acção</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentStudents.slice(0, 5).map((student) => (
                        <TableRow className="hover:bg-violet-900/20 border-violet-900/30" key={student.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-white">
                                {student.name}
                              </div>
                              <div className="text-sm text-white/70">
                                {student.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={student.isActive ? "default" : "secondary"}
                              className={student.isActive ? "bg-green-600/80 text-green-100" : "bg-gray-600/80 text-gray-100"}
                            >
                              {student.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {new Date(student.dateJoined).toLocaleDateString('pt-AO')}
                          </TableCell>
                          <TableCell className="text-white">
                            {student.lastLogin 
                              ? new Date(student.lastLogin).toLocaleDateString('pt-AO')
                              : 'Nunca'
                            }
                          </TableCell>
                          <TableCell>
                            <Button size="sm" className="bg-violet-800 hover:bg-violet-900">
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Perfil
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="top-courses" className="border-none p-0 pt-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-violet-900/20 border-violet-900/30">
                        <TableHead className="text-white/70">Curso</TableHead>
                        <TableHead className="text-white/70">Estudantes</TableHead>
                        <TableHead className="text-white/70">Receita (AOA)</TableHead>
                        <TableHead className="text-white/70">Tipo</TableHead>
                        <TableHead className="text-white/70">Acção</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminStats.topPerformingCourses.slice(0, 5).map((course) => (
                        <TableRow className="hover:bg-violet-900/20 border-violet-900/30" key={course.id}>
                          <TableCell className="font-medium text-white">{course.title}</TableCell>
                          <TableCell className="text-white">{formatNumber(course.students)}</TableCell>
                          <TableCell className="text-white">{formatAOA(course.revenue)}</TableCell>
                          <TableCell>
                            <Badge className={course.type === 'video' ? 'bg-blue-600/80 text-blue-100' : 'bg-purple-600/80 text-purple-100'}>
                              {course.type === 'video' ? 'Vídeo' : 'Prática'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" className="bg-violet-800 hover:bg-violet-900">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              Analytics
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}