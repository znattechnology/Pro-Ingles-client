"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft,
  Settings,
  Shield,
  Key,
  Bell,
  Database,
  Activity,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useGetAdminUserByIdQuery } from "@/src/domains/admin";
import Loading from "@/components/course/Loading";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

export default function UserSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useDjangoAuth();

  // Fetch user data
  const { data: userData, isLoading, error } = useGetAdminUserByIdQuery(userId, {
    skip: !userId || !isAuthenticated || !currentUser
  });

  if (authLoading || isLoading) return <Loading />;
  
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex-1 space-y-4 p-4">
        <div className="text-white">Faça login para acessar esta página.</div>
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="flex-1 space-y-4 p-4">
        <div className="text-white">Acesso negado. Apenas administradores podem acessar esta página.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4">
        <div className="text-red-400">Erro ao carregar dados do utilizador.</div>
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  const user = userData?.user;
  if (!user) {
    return (
      <div className="flex-1 space-y-4 p-4">
        <div className="text-white/70">Utilizador não encontrado.</div>
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          variants={cardVariants}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:bg-violet-900/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="h-8 w-px bg-violet-900/30" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Configurações Avançadas
              </h1>
              <p className="text-white/70">
                Configurações de segurança e preferências para {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-violet-700 text-violet-300 hover:bg-violet-700/20"
              onClick={() => router.push(`/admin/users/${userId}`)}
            >
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              className="border-violet-700 text-violet-300 hover:bg-violet-700/20"
              onClick={() => router.push(`/admin/users/${userId}/edit`)}
            >
              Editar Utilizador
            </Button>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div variants={cardVariants}>
          <Card className="border border-violet-900/30 bg-gradient-to-br from-black to-violet-950/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-violet-900/20 border border-violet-900/30">
                    <div className="space-y-1">
                      <Label className="text-white font-medium">Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-white/70">Adicionar camada extra de segurança</p>
                    </div>
                    <Switch disabled />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-violet-900/20 border border-violet-900/30">
                    <div className="space-y-1">
                      <Label className="text-white font-medium">Sessões Ativas</Label>
                      <p className="text-sm text-white/70">Gerir dispositivos conectados</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Activity className="h-4 w-4 mr-2" />
                      Ver Sessões
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-violet-900/20 border border-violet-900/30">
                    <div className="space-y-1">
                      <Label className="text-white font-medium">Forçar Reset de Password</Label>
                      <p className="text-sm text-white/70">Obrigar utilizador a alterar password</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Key className="h-4 w-4 mr-2" />
                      Forçar Reset
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-900/30">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Informações da Conta
                    </h4>
                    <div className="space-y-2 text-sm text-white/70">
                      <p>ID: {user.id}</p>
                      <p>Email verificado: {user.email_verified ? 'Sim' : 'Não'}</p>
                      <p>Data de registo: {new Date(user.date_joined).toLocaleDateString('pt-PT')}</p>
                      <p>Último login: {user.last_login ? new Date(user.last_login).toLocaleDateString('pt-PT') : 'Nunca'}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/30">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Zona de Perigo
                    </h4>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-amber-600 text-amber-300 hover:bg-amber-600/20"
                        disabled
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Completo da Conta
                      </Button>
                      <p className="text-xs text-amber-400">
                        Esta ação irá limpar todos os dados do utilizador
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div variants={cardVariants}>
          <Card className="border border-violet-900/30 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-violet-900/20 border border-violet-900/30">
                  <div className="space-y-1">
                    <Label className="text-white font-medium">Email de Boas-vindas</Label>
                    <p className="text-sm text-white/70">Enviar email quando a conta for criada</p>
                  </div>
                  <Switch disabled defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-violet-900/20 border border-violet-900/30">
                  <div className="space-y-1">
                    <Label className="text-white font-medium">Notificações de Segurança</Label>
                    <p className="text-sm text-white/70">Alertas sobre login suspeito</p>
                  </div>
                  <Switch disabled defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-violet-900/20 border border-violet-900/30">
                  <div className="space-y-1">
                    <Label className="text-white font-medium">Updates da Plataforma</Label>
                    <p className="text-sm text-white/70">Novidades e atualizações</p>
                  </div>
                  <Switch disabled defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-violet-900/20 border border-violet-900/30">
                  <div className="space-y-1">
                    <Label className="text-white font-medium">Relatórios Mensais</Label>
                    <p className="text-sm text-white/70">Resumo de atividade mensal</p>
                  </div>
                  <Switch disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Development Note */}
        <motion.div variants={cardVariants}>
          <Card className="border border-blue-900/30 bg-gradient-to-br from-blue-950/10 to-cyan-950/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="font-medium text-white">Funcionalidades em Desenvolvimento</h3>
                  <p className="text-sm text-white/70 mt-1">
                    Estas configurações avançadas serão implementadas em versões futuras da plataforma. 
                    Atualmente servem como visualização das funcionalidades planeadas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}