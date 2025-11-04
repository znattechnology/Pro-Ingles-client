"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  Phone,
  Calendar,
  Clock,
  Activity,
  CheckCircle, 
  AlertCircle,
  Edit,
  Settings,
  Shield,
  User,
  Globe,
  MapPin,
  Award,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Users,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useGetAdminUserByIdQuery } from "@/src/domains/admin";
import Loading from "@/components/course/Loading";
import { toast } from "@/components/ui/toast";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6,
      type: "spring",
      stiffness: 100
    }
  }
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  }
};

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useDjangoAuth();

  // Fetch user data
  const { data: userData, isLoading, error } = useGetAdminUserByIdQuery(userId, {
    skip: !userId || !isAuthenticated || !currentUser
  });

  // Show loading message when appropriate
  React.useEffect(() => {
    if (isLoading) {
      toast.loading("A carregar dados do utilizador...", {
        id: "user-loading"
      });
    } else {
      toast.dismiss("user-loading");
    }
  }, [isLoading]);

  // Show error message when appropriate
  React.useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar dados do utilizador", {
        description: "Verifique a ligação e tente novamente"
      });
    }
  }, [error]);

  if (authLoading || isLoading) return <Loading />;
  
  if (!isAuthenticated || !currentUser) {
    return (
      <motion.div 
        className="flex-1 space-y-4 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="border border-red-900/30 bg-red-950/20">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Acesso Restrito</h2>
            <p className="text-red-300">Faça login para acessar esta página</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <motion.div 
        className="flex-1 space-y-4 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="border border-amber-900/30 bg-amber-950/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Acesso Negado</h2>
            <p className="text-amber-300">Apenas administradores podem acessar esta página</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="flex-1 space-y-4 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="border border-red-900/30 bg-red-950/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Erro ao Carregar</h2>
            <p className="text-red-300 mb-4">Erro ao carregar dados do utilizador</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const user = userData?.user;
  if (!user) {
    return (
      <motion.div 
        className="flex-1 space-y-4 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="border border-gray-900/30 bg-gray-950/20">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Utilizador Não Encontrado</h2>
            <p className="text-gray-300 mb-4">O utilizador solicitado não existe</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600';
      case 'teacher': return 'bg-blue-600';
      case 'student': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <motion.div 
      className="flex-1 space-y-6 p-4 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Modern Header */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        variants={cardVariants}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-violet-900/20 transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Voltar
          </Button>
          <Separator orientation="vertical" className="h-8 bg-violet-900/30" />
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                Perfil do Utilizador
              </h1>
            </div>
            <p className="text-white/70 text-sm lg:text-base">
              Informações detalhadas sobre {user.name}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/users/${userId}/edit`)}
            className="border-violet-700 text-violet-300 hover:bg-violet-700/20 transition-all duration-300"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            onClick={() => router.push(`/admin/users/${userId}/settings`)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </motion.div>

      {/* User Profile Hero */}
      <motion.div variants={cardVariants}>
        <Card className="border border-violet-900/30 bg-gradient-to-br from-black via-violet-950/10 to-purple-950/10 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5" />
          <CardContent className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="h-24 w-24 lg:h-32 lg:w-32 rounded-full ring-4 ring-violet-500/20 group-hover:ring-violet-500/40 transition-all duration-300"
                  />
                ) : (
                  <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl lg:text-3xl group-hover:scale-105 transition-transform duration-300">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <motion.div 
                  className={`absolute -bottom-2 -right-2 h-6 w-6 lg:h-8 lg:w-8 rounded-full border-4 border-black flex items-center justify-center ${
                    user.is_active ? 'bg-emerald-400' : 'bg-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {user.is_active ? (
                    <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                  ) : (
                    <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                  )}
                </motion.div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">
                    {user.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-violet-400" />
                      <span className="text-white/80">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-violet-400" />
                        <span className="text-white/80">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={`${getRoleBadgeColor(user.role)} text-white shadow-lg`}>
                    <div className="flex items-center gap-1">
                      {user.role === 'student' && <GraduationCap className="h-3 w-3" />}
                      {user.role === 'teacher' && <BookOpen className="h-3 w-3" />}
                      {user.role === 'admin' && <Shield className="h-3 w-3" />}
                      {user.role === 'student' ? 'Estudante' : 
                       user.role === 'teacher' ? 'Professor' : 
                       user.role === 'admin' ? 'Administrador' : user.role}
                    </div>
                  </Badge>
                  <Badge className={`${user.is_active ? 'bg-emerald-600' : 'bg-gray-600'} text-white shadow-lg`}>
                    <div className="flex items-center gap-1">
                      {user.is_active ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </div>
                  </Badge>
                  {user.email_verified && (
                    <Badge className="bg-blue-600 text-white shadow-lg">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Email Verificado
                      </div>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        variants={containerVariants}
      >
        <motion.div variants={statsVariants} whileHover="hover">
          <Card className="border border-violet-900/30 bg-gradient-to-br from-violet-950/20 to-purple-950/10 backdrop-blur-sm">
            <CardContent className="p-4 lg:p-6 text-center">
              <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-violet-400 mx-auto mb-2" />
              <div className="text-sm lg:text-base text-white/70 mb-1">Registado há</div>
              <div className="text-lg lg:text-xl font-bold text-white">
                {Math.floor((new Date().getTime() - new Date(user.date_joined).getTime()) / (1000 * 60 * 60 * 24))} dias
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants} whileHover="hover">
          <Card className="border border-violet-900/30 bg-gradient-to-br from-green-950/20 to-emerald-950/10 backdrop-blur-sm">
            <CardContent className="p-4 lg:p-6 text-center">
              <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-green-400 mx-auto mb-2" />
              <div className="text-sm lg:text-base text-white/70 mb-1">Último Login</div>
              <div className="text-lg lg:text-xl font-bold text-white">
                {user.last_login ? (
                  Math.floor((new Date().getTime() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24)) === 0 ? 'Hoje' :
                  Math.floor((new Date().getTime() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24)) + 'd'
                ) : (
                  'Nunca'
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants} whileHover="hover">
          <Card className="border border-violet-900/30 bg-gradient-to-br from-blue-950/20 to-cyan-950/10 backdrop-blur-sm">
            <CardContent className="p-4 lg:p-6 text-center">
              <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-sm lg:text-base text-white/70 mb-1">Tempo Ativo</div>
              <div className="text-lg lg:text-xl font-bold text-white">
                {user.is_active ? 'Online' : 'Offline'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants} whileHover="hover">
          <Card className="border border-violet-900/30 bg-gradient-to-br from-amber-950/20 to-orange-950/10 backdrop-blur-sm">
            <CardContent className="p-4 lg:p-6 text-center">
              <Award className="h-6 w-6 lg:h-8 lg:w-8 text-amber-400 mx-auto mb-2" />
              <div className="text-sm lg:text-base text-white/70 mb-1">Status</div>
              <div className="text-lg lg:text-xl font-bold text-white">
                {user.email_verified ? 'Verificado' : 'Pendente'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Detailed Information Tabs */}
      <motion.div variants={cardVariants}>
        <Card className="border border-violet-900/30 bg-black/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-violet-950/30">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Visão Geral</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-violet-600">
                    <Activity className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Atividade</span>
                    <span className="sm:hidden">Ativo</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-violet-600">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Segurança</span>
                    <span className="sm:hidden">Seg</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-violet-600">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Configurações</span>
                    <span className="sm:hidden">Config</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border border-violet-900/30 bg-violet-950/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Informações Pessoais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Nome Completo:</span>
                            <span className="text-white font-medium">{user.name}</span>
                          </div>
                          <Separator className="bg-violet-900/30" />
                          <div className="flex justify-between">
                            <span className="text-white/70">Email:</span>
                            <span className="text-white font-medium break-all">{user.email}</span>
                          </div>
                          {user.phone && (
                            <>
                              <Separator className="bg-violet-900/30" />
                              <div className="flex justify-between">
                                <span className="text-white/70">Telefone:</span>
                                <span className="text-white font-medium">{user.phone}</span>
                              </div>
                            </>
                          )}
                          <Separator className="bg-violet-900/30" />
                          <div className="flex justify-between">
                            <span className="text-white/70">Tipo de Conta:</span>
                            <span className="text-white font-medium">
                              {user.role === 'student' ? 'Estudante' : 
                               user.role === 'teacher' ? 'Professor' : 
                               user.role === 'admin' ? 'Administrador' : user.role}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-violet-900/30 bg-violet-950/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Estado da Conta
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Estado:</span>
                            <Badge className={user.is_active ? 'bg-emerald-600' : 'bg-gray-600'}>
                              {user.is_active ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Email verificado:</span>
                            <Badge className={user.email_verified ? 'bg-green-600' : 'bg-red-600'}>
                              {user.email_verified ? 'Sim' : 'Não'}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-white/70">Data de registo:</span>
                            <span className="text-white text-sm">
                              {new Date(user.date_joined).toLocaleDateString('pt-PT', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-white/70">Último acesso:</span>
                            <span className="text-white text-sm">
                              {user.last_login ? (
                                new Date(user.last_login).toLocaleDateString('pt-PT', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              ) : (
                                'Nunca fez login'
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6 mt-0">
                  <Card className="border border-violet-900/30 bg-violet-950/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Atividade Recente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-white/70">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-white/50" />
                        <p>Histórico de atividade será implementado em breve</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-0">
                  <Card className="border border-violet-900/30 bg-violet-950/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Configurações de Segurança
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-white/70">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-white/50" />
                        <p>Configurações de segurança serão implementadas em breve</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 mt-0">
                  <Card className="border border-violet-900/30 bg-violet-950/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configurações Avançadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-white/70">
                        <Settings className="h-12 w-12 mx-auto mb-4 text-white/50" />
                        <p>Configurações avançadas serão implementadas em breve</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}