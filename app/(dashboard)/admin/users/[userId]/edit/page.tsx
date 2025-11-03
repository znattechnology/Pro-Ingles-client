"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { 
  useGetAdminUserByIdQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation
} from "@/src/domains/admin";
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

import { toast } from "@/components/ui/toast";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useDjangoAuth();

  // Fetch user data
  const { data: userData, isLoading, error, refetch } = useGetAdminUserByIdQuery(userId, {
    skip: !userId || !isAuthenticated || !currentUser
  });

  // Mutations
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    is_active: true
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Update form when user data loads
  React.useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active
      });
    }
  }, [userData]);

  // Track changes
  React.useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      const changed = 
        formData.name !== user.name ||
        formData.email !== user.email ||
        formData.phone !== (user.phone || '') ||
        formData.role !== user.role ||
        formData.is_active !== user.is_active;
      setHasChanges(changed);
    }
  }, [formData, userData]);

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

  const handleSave = async () => {
    setIsSaving(true);
    let hasErrors = false;

    try {
      // Update role if changed
      if (formData.role !== user.role) {
        await updateUserRole({ userId: user.id, role: formData.role }).unwrap();
      }

      // Update status if changed
      if (formData.is_active !== user.is_active) {
        await updateUserStatus({ userId: user.id, is_active: formData.is_active }).unwrap();
      }

      // For name, email, phone - we'd need a separate endpoint
      // For now, just show success for role and status changes
      if (formData.role !== user.role || formData.is_active !== user.is_active) {
        toast.success("Informações do utilizador atualizadas com sucesso!");
        refetch();
        setHasChanges(false);
      } else {
        toast.info("Nenhuma alteração foi feita nos campos disponíveis.");
      }

    } catch (error: any) {
      hasErrors = true;
      toast.error(error.data?.error || "Erro ao atualizar utilizador.");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600';
      case 'teacher': return 'bg-blue-600';
      case 'student': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

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
                Editar Utilizador
              </h1>
              <p className="text-white/70">
                Editar informações de {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-violet-700 text-violet-300 hover:bg-violet-700/20"
              onClick={() => router.push(`/admin/users/${userId}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalhes
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  A guardar...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Alterações
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Current Status */}
        <motion.div variants={cardVariants}>
          <Card className="border border-violet-900/30 bg-gradient-to-br from-black to-violet-950/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Estado Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-16 w-16 rounded-full ring-4 ring-violet-500/20"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-black flex items-center justify-center ${
                    user.is_active ? 'bg-emerald-400' : 'bg-gray-400'
                  }`}>
                    {user.is_active ? (
                      <CheckCircle className="h-2 w-2 text-white" />
                    ) : (
                      <AlertCircle className="h-2 w-2 text-white" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                      {user.role === 'student' ? 'Estudante' : 
                       user.role === 'teacher' ? 'Professor' : 
                       user.role === 'admin' ? 'Administrador' : user.role}
                    </Badge>
                    <Badge className={user.is_active ? 'bg-emerald-600' : 'bg-gray-600'}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Form */}
        <motion.div variants={cardVariants}>
          <Card className="border border-violet-900/30 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Editar Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/80">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-violet-900/20 border-violet-900/30 text-white"
                      placeholder="Nome do utilizador"
                      disabled
                    />
                    <p className="text-xs text-white/50">Nota: Edição de nome não disponível ainda</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-violet-900/20 border-violet-900/30 text-white"
                      placeholder="email@exemplo.com"
                      disabled
                    />
                    <p className="text-xs text-white/50">Nota: Edição de email não disponível ainda</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/80">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-violet-900/20 border-violet-900/30 text-white"
                      placeholder="+244 123 456 789"
                      disabled
                    />
                    <p className="text-xs text-white/50">Nota: Edição de telefone não disponível ainda</p>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Configurações da Conta</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white/80">Tipo de Utilizador</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
                      disabled={user.id === currentUser.id}
                    >
                      <SelectTrigger className="bg-violet-900/20 border-violet-900/30 text-white">
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-sm border-violet-900/30">
                        <SelectItem value="student" className="text-white hover:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-400" />
                            Estudante
                          </div>
                        </SelectItem>
                        <SelectItem value="teacher" className="text-white hover:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-400" />
                            Professor
                          </div>
                        </SelectItem>
                        <SelectItem value="admin" className="text-white hover:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {user.id === currentUser.id && (
                      <p className="text-xs text-amber-400">Não pode alterar a sua própria role</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-white/80">Estado da Conta</Label>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-violet-900/20 border border-violet-900/30">
                      <div className="flex items-center gap-2">
                        {formData.is_active ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-white">
                          {formData.is_active ? 'Conta Ativa' : 'Conta Inativa'}
                        </span>
                      </div>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        disabled={user.id === currentUser.id}
                      />
                    </div>
                    {user.id === currentUser.id && (
                      <p className="text-xs text-amber-400">Não pode desativar a sua própria conta</p>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-900/30">
                    <h4 className="font-medium text-white mb-2">Informações Adicionais</h4>
                    <div className="space-y-1 text-sm text-white/70">
                      <p>Data de registo: {new Date(user.date_joined).toLocaleDateString('pt-PT')}</p>
                      <p>Último login: {user.last_login ? new Date(user.last_login).toLocaleDateString('pt-PT') : 'Nunca'}</p>
                      <p>Email verificado: {user.email_verified ? 'Sim' : 'Não'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {hasChanges && (
                <motion.div 
                  className="flex items-center justify-end pt-4 border-t border-violet-900/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-amber-400">Tem alterações não guardadas</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (userData?.user) {
                          const user = userData.user;
                          setFormData({
                            name: user.name,
                            email: user.email,
                            phone: user.phone || '',
                            role: user.role,
                            is_active: user.is_active
                          });
                        }
                      }}
                      className="border-violet-700 text-violet-300 hover:bg-violet-700/20"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          A guardar...
                        </div>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}