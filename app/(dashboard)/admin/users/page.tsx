"use client";

import * as React from "react";
import { Users, UserPlus, Search, MoreHorizontal, Edit, Power, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { useGetUsersQuery, useUpdateUserRoleMutation, useToggleUserStatusMutation, useDeleteUserMutation } from "@modules/admin";
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

interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | 'student' | 'teacher' | 'admin';
  status?: 'all' | 'active' | 'inactive';
}

export default function UsersManagement() {
  const { user: currentUser, isAuthenticated, isLoading } = useDjangoAuth();
  const { toast } = useToast();
  
  // State for filters and pagination
  const [params, setParams] = React.useState<UsersListParams>({
    page: 1,
    limit: 20,
    search: "",
    role: "all",
    status: "all",
  });
  
  // API queries and mutations
  const { data: usersData, isLoading: usersLoading, error, refetch } = useGetUsersQuery(params);
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Debounced search
  const [searchTerm, setSearchTerm] = React.useState("");
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setParams(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !currentUser) {
    return <div>Faça login para acessar esta página.</div>;
  }

  if (currentUser.role !== 'admin') {
    return <div>Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  if (usersLoading && !usersData) return <Loading />;
  
  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4">
        <div className="text-red-400">Erro ao carregar usuários. Tente novamente.</div>
      </div>
    );
  }

  const users = usersData?.users || [];
  const stats = usersData?.stats || {
    total_users: 0,
    active_users: 0,
    student_users: 0,
    teacher_users: 0,
    admin_users: 0,
    verified_users: 0,
  };
  const pagination = usersData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      await updateUserRole({ id: userId, role: newRole }).unwrap();
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
  const handleStatusToggle = async (userId: string) => {
    try {
      await toggleUserStatus(userId).unwrap();
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

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      await deleteUser(userId).unwrap();
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.data?.error || "Erro ao excluir usuário.",
        variant: "destructive",
      });
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

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-600' : 'bg-gray-600';
  };

  return (
    <div className="flex-1 space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Gerir Utilizadores
          </h1>
          <p className="text-white/70">
            Gira todos os utilizadores da plataforma ProEnglish
          </p>
        </div>
        <Button className="bg-violet-800 hover:bg-violet-900">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Utilizadores
            </CardTitle>
            <Users className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total_users || 0}</div>
            <p className="text-xs text-white/70">Todos os utilizadores</p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Estudantes
            </CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.student_users || 0}</div>
            <p className="text-xs text-white/70">
              {stats.total_users ? Math.round((stats.student_users / stats.total_users) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Professores
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.teacher_users || 0}</div>
            <p className="text-xs text-white/70">
              {stats.total_users ? Math.round((stats.teacher_users / stats.total_users) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Utilizadores Activos
            </CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.active_users || 0}</div>
            <p className="text-xs text-green-400">
              {stats.total_users ? Math.round((stats.active_users / stats.total_users) * 100) : 0}% ativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border border-violet-900/30 bg-black">
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 relative min-w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
              <Input
                placeholder="Buscar usuários por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-violet-900/20 border-violet-900/30 text-white"
              />
            </div>
            
            {/* Role Filter */}
            <Select
              value={params.role}
              onValueChange={(value) => setParams(prev => ({ ...prev, role: value as any, page: 1 }))}
            >
              <SelectTrigger className="w-[140px] bg-violet-900/20 border-violet-900/30 text-white">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-black border-violet-900/30">
                <SelectItem value="all" className="text-white hover:bg-violet-900/20">Todas as Roles</SelectItem>
                <SelectItem value="student" className="text-white hover:bg-violet-900/20">Estudante</SelectItem>
                <SelectItem value="teacher" className="text-white hover:bg-violet-900/20">Professor</SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-violet-900/20">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={params.status}
              onValueChange={(value) => setParams(prev => ({ ...prev, status: value as any, page: 1 }))}
            >
              <SelectTrigger className="w-[140px] bg-violet-900/20 border-violet-900/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-black border-violet-900/30">
                <SelectItem value="all" className="text-white hover:bg-violet-900/20">Todos Status</SelectItem>
                <SelectItem value="active" className="text-white hover:bg-violet-900/20">Ativo</SelectItem>
                <SelectItem value="inactive" className="text-white hover:bg-violet-900/20">Inativo</SelectItem>
              </SelectContent>
            </Select>
            
            {usersLoading && (
              <div className="text-white/70 text-sm">Carregando...</div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-violet-900/20 border-violet-900/30">
                <TableHead className="text-white/70">Usuário</TableHead>
                <TableHead className="text-white/70">Role</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
                <TableHead className="text-white/70">Data de Cadastro</TableHead>
                <TableHead className="text-white/70">Último Login</TableHead>
                <TableHead className="text-white/70">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-violet-900/20 border-violet-900/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatar && (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-white/70">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole as any)}
                      disabled={user.id === currentUser.id} // Prevent admin from changing their own role
                    >
                      <SelectTrigger className="w-[120px] h-8 bg-transparent border-none">
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
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getStatusBadgeColor(user.is_active ? 'active' : 'inactive')} text-white cursor-pointer`}
                      onClick={() => handleStatusToggle(user.id)}
                    >
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {!user.email_verified && (
                      <Badge className="ml-2 bg-yellow-600 text-white text-xs">
                        Email não verificado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-white">
                    {new Date(user.date_joined).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-white">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black border-violet-900/30">
                        <DropdownMenuLabel className="text-white">Ações</DropdownMenuLabel>
                        
                        <DropdownMenuItem 
                          className="text-white hover:bg-violet-900/20 cursor-pointer"
                          onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-violet-900/30" />
                        
                        <DropdownMenuItem 
                          className="text-white hover:bg-violet-900/20 cursor-pointer"
                          onClick={() => handleStatusToggle(user.id)}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {user.is_active ? 'Desativar' : 'Ativar'} usuário
                        </DropdownMenuItem>
                        
                        {user.id !== currentUser.id && ( // Prevent admin from deleting themselves
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir usuário
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && !usersLoading && (
            <div className="text-center py-8">
              <p className="text-white/70">Nenhum usuário encontrado</p>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-violet-900/30">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/70">
                  Página {pagination.page} de {pagination.total_pages}
                </span>
                <span className="text-sm text-white/70">
                  ({pagination.total} usuários no total)
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-violet-900/30 text-white hover:bg-violet-900/20"
                  disabled={!pagination.has_prev || usersLoading}
                  onClick={() => setParams(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                >
                  Anterior
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-violet-900/30 text-white hover:bg-violet-900/20"
                  disabled={!pagination.has_next || usersLoading}
                  onClick={() => setParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}