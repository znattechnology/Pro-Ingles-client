"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Save, X, Shield, Mail, Phone, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { useGetUserByIdQuery, useUpdateUserMutation, useUpdateUserRoleMutation, useToggleUserStatusMutation } from "@/redux/features/admin/adminApi";
// Simple toast replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    if (variant === "destructive") {
      alert(`❌ ${title}: ${description}`);
    } else {
      alert(`✅ ${title}: ${description}`);
    }
  }
});

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading } = useDjangoAuth();
  const { toast } = useToast();
  
  // API queries and mutations
  const { data: userData, isLoading: userLoading, error, refetch } = useGetUserByIdQuery(id as string);
  const [updateUser] = useUpdateUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();

  // Edit state
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: "",
    email: "",
    phone: "",
  });

  // Initialize edit form when user data loads
  React.useEffect(() => {
    if (userData?.user) {
      setEditForm({
        name: userData.user.name,
        email: userData.user.email,
        phone: userData.user.phone || "",
      });
    }
  }, [userData]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !currentUser) {
    return <div>Faça login para acessar esta página.</div>;
  }

  if (currentUser.role !== 'admin') {
    return <div>Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  if (userLoading) return <Loading />;
  
  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4">
        <div className="text-red-400">Erro ao carregar usuário. Tente novamente.</div>
        <Button onClick={() => router.back()} variant="outline" className="border-violet-900/30 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className="flex-1 space-y-4 p-4">
        <div className="text-white/70">Usuário não encontrado.</div>
        <Button onClick={() => router.back()} variant="outline" className="border-violet-900/30 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const user = userData.user;

  // Handle role change
  const handleRoleChange = async (newRole: 'student' | 'teacher' | 'admin') => {
    try {
      await updateUserRole({ id: user.id, role: newRole }).unwrap();
      toast({
        title: "Sucesso",
        description: "Role do usuário alterada com sucesso.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.data?.error || "Erro ao alterar role do usuário.",
        variant: "destructive",
      });
    }
  };

  // Handle status toggle
  const handleStatusToggle = async () => {
    try {
      await toggleUserStatus(user.id).unwrap();
      toast({
        title: "Sucesso",
        description: "Status do usuário alterado com sucesso.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.data?.error || "Erro ao alterar status do usuário.",
        variant: "destructive",
      });
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUser({
        id: user.id,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      }).unwrap();
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso.",
      });
      
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.data?.error || "Erro ao atualizar usuário.",
        variant: "destructive",
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600';
      case 'teacher': return 'bg-blue-600';
      case 'student': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-600' : 'bg-gray-600';
  };

  return (
    <div className="flex-1 space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="border-violet-900/30 text-white hover:bg-violet-900/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Detalhes do Usuário
            </h1>
            <p className="text-white/70">
              Informações e configurações de {user.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-violet-800 hover:bg-violet-900"
              disabled={user.id === currentUser.id}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSaveEdit}
                className="bg-green-700 hover:bg-green-800"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
              <Button 
                onClick={handleCancelEdit}
                variant="outline"
                className="border-violet-900/30 text-white hover:bg-violet-900/20"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card className="border border-violet-900/30 bg-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture */}
            {user.avatar && (
              <div className="flex justify-center">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="h-20 w-20 rounded-full border-2 border-violet-700"
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label className="text-white/70">Nome</Label>
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-violet-900/20 border-violet-900/30 text-white"
                    placeholder="Nome completo"
                  />
                ) : (
                  <div className="text-white font-medium">{user.name}</div>
                )}
              </div>

              <div>
                <Label className="text-white/70 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-violet-900/20 border-violet-900/30 text-white"
                    placeholder="email@exemplo.com"
                  />
                ) : (
                  <div className="text-white">{user.email}</div>
                )}
              </div>

              <div>
                <Label className="text-white/70 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefone
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-violet-900/20 border-violet-900/30 text-white"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <div className="text-white">{user.phone || 'Não informado'}</div>
                )}
              </div>

              <div>
                <Label className="text-white/70">Role</Label>
                <Select
                  value={user.role}
                  onValueChange={handleRoleChange}
                  disabled={user.id === currentUser.id}
                >
                  <SelectTrigger className="bg-violet-900/20 border-violet-900/30 text-white">
                    <Badge className={`${getRoleBadgeColor(user.role)} text-white border-none`}>
                      {user.role === 'student' ? 'Estudante' : 
                       user.role === 'teacher' ? 'Professor' : 
                       user.role === 'admin' ? 'Admin' : user.role}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent className="bg-black border-violet-900/30">
                    <SelectItem value="student" className="text-white hover:bg-violet-900/20">Estudante</SelectItem>
                    <SelectItem value="teacher" className="text-white hover:bg-violet-900/20">Professor</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-violet-900/20">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/70">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    className={`${getStatusBadgeColor(user.is_active)} text-white cursor-pointer`}
                    onClick={() => user.id !== currentUser.id && handleStatusToggle()}
                  >
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  {!user.email_verified && (
                    <Badge className="bg-yellow-600 text-white">
                      Email não verificado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="border border-violet-900/30 bg-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/70 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Data de Cadastro
              </Label>
              <div className="text-white">
                {new Date(user.date_joined).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div>
              <Label className="text-white/70">Último Login</Label>
              <div className="text-white">
                {user.last_login ? 
                  new Date(user.last_login).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'Nunca fez login'
                }
              </div>
            </div>

            <div>
              <Label className="text-white/70">ID do Usuário</Label>
              <div className="text-white/90 text-sm font-mono bg-violet-900/20 p-2 rounded border border-violet-900/30">
                {user.id}
              </div>
            </div>

            {user.google_id && (
              <div>
                <Label className="text-white/70">Google ID</Label>
                <div className="text-white/90 text-sm font-mono bg-violet-900/20 p-2 rounded border border-violet-900/30">
                  {user.google_id}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {user.id !== currentUser.id && (
        <Card className="border border-violet-900/30 bg-black">
          <CardHeader>
            <CardTitle className="text-white">Ações Administrativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleStatusToggle}
                variant="outline"
                className={`border-violet-900/30 ${user.is_active ? 'text-red-400 hover:bg-red-900/20' : 'text-green-400 hover:bg-green-900/20'}`}
              >
                {user.is_active ? 'Desativar Usuário' : 'Ativar Usuário'}
              </Button>
              
              <div className="text-white/70 text-sm">
                {user.is_active ? 
                  'Desativar impedirá o usuário de fazer login no sistema.' :
                  'Ativar permitirá que o usuário faça login no sistema.'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}