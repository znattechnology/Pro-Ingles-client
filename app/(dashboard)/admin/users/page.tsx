"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Power, 
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  Shield,
  GraduationCap,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Activity,
  Settings,
  Crown
} from "lucide-react";
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
import { 
  useGetAdminUsersQuery, 
  useUpdateUserStatusMutation, 
  useUpdateUserRoleMutation,
  useDeleteUserMutation 
} from "@/src/domains/admin";
import { ConfirmationModal } from "@/src/components/admin/ConfirmationModal";
import { Pagination } from "@/src/components/admin/Pagination";
import { toast } from "@/components/ui/toast";

interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | 'student' | 'teacher' | 'admin';
  status?: 'all' | 'active' | 'inactive';
}

// Animation variants
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

const statsCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

export default function UsersManagement() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading } = useDjangoAuth();
  
  // State for filters and pagination
  const [params, setParams] = React.useState<UsersListParams>({
    page: 1,
    limit: 10,
    search: "",
    role: "all",
    status: "all",
  });
  
  // UI State
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('table');
  
  // Modal states
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    type: 'delete' | 'deactivate' | 'activate' | 'role';
    user?: any;
    newRole?: string;
  }>({ isOpen: false, type: 'delete' });
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // API queries and mutations
  const { data: usersData, isLoading: usersLoading, error, refetch } = useGetAdminUsersQuery(params);
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Debounced search
  const [searchTerm, setSearchTerm] = React.useState("");
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setParams(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <Loading 
        title="Gestão de Utilizadores"
        subtitle="Sistema de Administração"
        description="Carregando dados dos utilizadores..."
        icon={Users}
        progress={70}
        theme={{
          primary: "violet",
          secondary: "purple",
          accent: "blue"
        }}
        size="lg"
      />
    );
  }
  if (!isAuthenticated || !currentUser) {
    return <div>Faça login para acessar esta página.</div>;
  }

  if (currentUser.role !== 'admin') {
    return <div>Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  if (usersLoading && !usersData) {
    return (
      <Loading 
        title="Carregando Utilizadores"
        subtitle="Base de Dados"
        description="Processando informações dos utilizadores..."
        icon={Users}
        progress={85}
        theme={{
          primary: "emerald",
          secondary: "green",
          accent: "teal"
        }}
      />
    );
  }
  
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

  // Handle role change - with confirmation
  const handleRoleChange = (userId: string, newRole: 'student' | 'teacher' | 'admin', user: any) => {
    setConfirmModal({
      isOpen: true,
      type: 'role',
      user,
      newRole
    });
  };
  
  const confirmRoleChange = async () => {
    if (!confirmModal.user || !confirmModal.newRole) return;
    
    setIsProcessing(true);
    try {
      await updateUserRole({ userId: confirmModal.user.id, role: confirmModal.newRole as 'student' | 'teacher' | 'admin' }).unwrap();
      toast.success("Role do utilizador alterada com sucesso!");
      refetch();
      setConfirmModal({ isOpen: false, type: 'role' });
    } catch (error: any) {
      toast.error(error.data?.error || "Erro ao alterar role do utilizador.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle status toggle - with confirmation
  const handleStatusToggle = (userId: string, currentStatus: boolean, user: any) => {
    setConfirmModal({
      isOpen: true,
      type: currentStatus ? 'deactivate' : 'activate',
      user
    });
  };
  
  const confirmStatusToggle = async () => {
    if (!confirmModal.user) return;
    
    setIsProcessing(true);
    try {
      await updateUserStatus({ userId: confirmModal.user.id, is_active: !confirmModal.user.is_active }).unwrap();
      toast.success("Status do utilizador alterado com sucesso!");
      refetch();
      setConfirmModal({ isOpen: false, type: 'activate' });
    } catch (error: any) {
      toast.error(error.data?.error || "Erro ao alterar status do utilizador.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user deletion - with confirmation
  const handleDeleteUser = (userId: string, user: any) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      user
    });
  };
  
  const confirmDeleteUser = async () => {
    if (!confirmModal.user) return;
    
    setIsProcessing(true);
    try {
      const result = await deleteUser(confirmModal.user.id).unwrap();
      toast.success(result.message || "Conta do utilizador foi desativada com sucesso!");
      refetch();
      setConfirmModal({ isOpen: false, type: 'delete' });
    } catch (error: any) {
      toast.error(error.data?.error || "Erro ao desativar a conta do utilizador.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle confirmation modal
  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case 'role':
        confirmRoleChange();
        break;
      case 'activate':
      case 'deactivate':
        confirmStatusToggle();
        break;
      case 'delete':
        confirmDeleteUser();
        break;
    }
  };
  
  const getConfirmModalProps = () => {
    const { type, user, newRole } = confirmModal;
    
    switch (type) {
      case 'role':
        return {
          title: 'Alterar Role do Utilizador',
          description: `Tem certeza que deseja alterar a role deste utilizador? Esta ação irá alterar as permissões e acesso do utilizador na plataforma.`,
          confirmText: 'Alterar Role',
          userName: user?.name,
          userRole: user?.role,
          newRole
        };
      case 'activate':
        return {
          title: 'Ativar Utilizador',
          description: `Tem certeza que deseja ativar a conta deste utilizador? O utilizador poderá aceder novamente à plataforma.`,
          confirmText: 'Ativar Conta',
          userName: user?.name,
          userRole: user?.role
        };
      case 'deactivate':
        return {
          title: 'Desativar Utilizador',
          description: `Tem certeza que deseja desativar a conta deste utilizador? O utilizador não poderá aceder à plataforma até que a conta seja reativada.`,
          confirmText: 'Desativar Conta',
          userName: user?.name,
          userRole: user?.role
        };
      case 'delete':
        return {
          title: 'Desativar Conta Permanentemente',
          description: `Esta ação irá desativar permanentemente a conta do utilizador. Por motivos de segurança e auditoria, a conta será apenas desativada, não eliminada completamente.`,
          confirmText: 'Desativar Permanentemente',
          userName: user?.name,
          userRole: user?.role
        };
      default:
        return {
          title: 'Confirmar Ação',
          description: 'Tem certeza que deseja realizar esta ação?',
          confirmText: 'Confirmar'
        };
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
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Enhanced Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-6 sm:py-8"
      >
        {/* Background Effects */}
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
          <div className="text-center mb-8">
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
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              </motion.div>
              <span className="text-violet-300 font-semibold text-sm sm:text-base lg:text-lg">Gestão de Utilizadores</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight"
            >
              Controle{' '}
              <motion.span 
                className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Supremo
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                👥
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 font-light"
            >
              Administre todos os <motion.span className="text-violet-400 font-medium" whileHover={{ scale: 1.05 }}>utilizadores da plataforma</motion.span> com{' '}
              <motion.span className="text-purple-400 font-medium" whileHover={{ scale: 1.05 }}>controle total</motion.span>
              {pagination.total > 0 && (
                <span className="block mt-2 text-indigo-400 font-medium">
                  • {pagination.total} utilizadores registados
                </span>
              )}
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400/50 transition-all duration-300"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40"
                onClick={() => router.push('/admin/users/new')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Utilizador
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Enhanced Stats Cards */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative"
        >
          {/* Background glow effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-purple-600/5 to-indigo-600/5 rounded-2xl blur-xl" />
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative border border-violet-500/30 bg-gradient-to-br from-violet-950/50 to-black backdrop-blur-sm shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent rounded-lg" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">
                  Total de Utilizadores
                </CardTitle>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Users className="h-4 w-4 text-violet-400" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="text-2xl font-bold text-white"
                >
                  {stats.total_users || 0}
                </motion.div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/70">Todos os utilizadores</span>
                  {stats.total_users > 0 && (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative border border-green-500/30 bg-gradient-to-br from-green-950/50 to-black backdrop-blur-sm shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">
                  Estudantes
                </CardTitle>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <GraduationCap className="h-4 w-4 text-green-400" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                  className="text-2xl font-bold text-white"
                >
                  {stats.student_users || 0}
                </motion.div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/70">
                    {stats.total_users ? Math.round((stats.student_users / stats.total_users) * 100) : 0}% do total
                  </span>
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-black backdrop-blur-sm shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">
                  Professores
                </CardTitle>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BookOpen className="h-4 w-4 text-blue-400" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0, type: "spring" }}
                  className="text-2xl font-bold text-white"
                >
                  {stats.teacher_users || 0}
                </motion.div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/70">
                    {stats.total_users ? Math.round((stats.teacher_users / stats.total_users) * 100) : 0}% do total
                  </span>
                  <TrendingUp className="h-3 w-3 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-black backdrop-blur-sm shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">
                  Utilizadores Ativos
                </CardTitle>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1, type: "spring" }}
                  className="text-2xl font-bold text-white"
                >
                  {stats.active_users || 0}
                </motion.div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-emerald-400 font-medium">
                    {stats.total_users ? Math.round((stats.active_users / stats.total_users) * 100) : 0}% ativo
                  </span>
                  <div className={`h-2 w-2 rounded-full ${
                    stats.total_users ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
                  }`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Filters and Search */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Card className="relative border border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-black backdrop-blur-sm shadow-lg shadow-violet-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-indigo-500/5 rounded-lg" />
            <CardHeader className="relative">
              <div className="space-y-4">
                {/* Enhanced Search Bar */}
                <div className="relative group">
                  <motion.div
                    animate={{ x: [0, 2, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-violet-400/70 group-focus-within:text-violet-400 transition-colors" />
                  </motion.div>
                  <Input
                    placeholder="Pesquisar utilizadores por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-violet-900/20 border-violet-500/30 text-white placeholder:text-white/50 focus:border-violet-400/50 focus:bg-violet-900/30 transition-all duration-300 hover:border-violet-400/40"
                  />
                </div>
              
              {/* Filters - Collapsible */}
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {/* Role Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Tipo de Utilizador</label>
                    <Select
                      value={params.role}
                      onValueChange={(value) => setParams(prev => ({ ...prev, role: value as any, page: 1 }))}
                    >
                      <SelectTrigger className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-violet-900/30 text-white hover:border-violet-500 transition-all duration-300">
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-sm border-violet-900/30">
                        <SelectItem value="all" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Todos os Tipos
                          </div>
                        </SelectItem>
                        <SelectItem value="student" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-green-400" />
                            Estudante
                          </div>
                        </SelectItem>
                        <SelectItem value="teacher" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-400" />
                            Professor
                          </div>
                        </SelectItem>
                        <SelectItem value="admin" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-400" />
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Estado</label>
                    <Select
                      value={params.status}
                      onValueChange={(value) => setParams(prev => ({ ...prev, status: value as any, page: 1 }))}
                    >
                      <SelectTrigger className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-violet-900/30 text-white hover:border-violet-500 transition-all duration-300">
                        <SelectValue placeholder="Selecionar estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-sm border-violet-900/30">
                        <SelectItem value="all" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <Minus className="h-4 w-4" />
                            Todos os Estados
                          </div>
                        </SelectItem>
                        <SelectItem value="active" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            Ativo
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            Inativo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Results Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <span>
                        Mostrando {users.length} de {pagination.total} utilizadores
                        {(params.search || params.role !== 'all' || params.status !== 'all') && (
                          <span className="text-violet-400 ml-1">(filtrados)</span>
                        )}
                      </span>
                      {(params.search || params.role !== 'all' || params.status !== 'all') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-violet-400 hover:text-white hover:bg-violet-900/20"
                          onClick={() => {
                            setSearchTerm("");
                            setParams({
                              page: 1,
                              limit: params.limit || 10,
                              search: "",
                              role: "all",
                              status: "all",
                            });
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Limpar Filtros
                        </Button>
                      )}
                    </div>
                    {usersLoading && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                        <span>A carregar...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative p-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-violet-900/20 border-violet-900/30 bg-gradient-to-r from-violet-950/20 to-purple-950/20">
                    <TableHead className="text-white/90 font-semibold px-6 py-4">
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Users className="h-4 w-4" />
                        Utilizador
                      </motion.div>
                    </TableHead>
                    <TableHead className="text-white/90 font-semibold">
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Shield className="h-4 w-4" />
                        Tipo
                      </motion.div>
                    </TableHead>
                    <TableHead className="text-white/90 font-semibold">
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Estado
                      </motion.div>
                    </TableHead>
                    <TableHead className="text-white/90 font-semibold hidden lg:table-cell">
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Clock className="h-4 w-4" />
                        Registado
                      </motion.div>
                    </TableHead>
                    <TableHead className="text-white/90 font-semibold hidden xl:table-cell">
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Activity className="h-4 w-4" />
                        Último Login
                      </motion.div>
                    </TableHead>
                    <TableHead className="text-white/90 font-semibold text-center">
                      <motion.span whileHover={{ scale: 1.05 }}>Ações</motion.span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <motion.tr 
                    key={user.id} 
                    className="group hover:bg-violet-900/20 border-violet-900/30 transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="h-10 w-10 rounded-full ring-2 ring-violet-500/20 group-hover:ring-violet-500/40 transition-all duration-300"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm group-hover:scale-105 transition-transform duration-300">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-black ${
                            user.is_active ? 'bg-emerald-400' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-white group-hover:text-violet-300 transition-colors duration-300">
                            {user.name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => handleRoleChange(user.id, newRole as any, user)}
                        disabled={user.id === currentUser.id}
                      >
                        <SelectTrigger className="w-[130px] h-8 bg-transparent border-none hover:bg-violet-900/20 transition-colors duration-300">
                          <Badge className={`${getRoleBadgeColor(user.role)} text-white border-none shadow-sm`}>
                            <div className="flex items-center gap-1">
                              {user.role === 'student' && <GraduationCap className="h-3 w-3" />}
                              {user.role === 'teacher' && <BookOpen className="h-3 w-3" />}
                              {user.role === 'admin' && <Shield className="h-3 w-3" />}
                              {user.role === 'student' ? 'Estudante' : 
                               user.role === 'teacher' ? 'Professor' : 
                               user.role === 'admin' ? 'Admin' : user.role}
                            </div>
                          </Badge>
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 backdrop-blur-sm border-violet-900/30">
                          <SelectItem value="student" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-green-400" />
                              Estudante
                            </div>
                          </SelectItem>
                          <SelectItem value="teacher" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-400" />
                              Professor
                            </div>
                          </SelectItem>
                          <SelectItem value="admin" className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-red-400" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-2">
                        <Badge 
                          className={`${getStatusBadgeColor(user.is_active ? 'active' : 'inactive')} text-white cursor-pointer hover:scale-105 transition-transform duration-300 shadow-sm`}
                          onClick={() => handleStatusToggle(user.id, user.is_active, user)}
                        >
                          <div className="flex items-center gap-1">
                            {user.is_active ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </div>
                        </Badge>
                        {!user.email_verified && (
                          <Badge className="bg-amber-600 text-white text-xs shadow-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              Email não verificado
                            </div>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-white/80 hidden lg:table-cell">
                      <div className="text-sm">
                        {new Date(user.date_joined).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-white/80 hidden xl:table-cell">
                      <div className="text-sm">
                        {user.last_login ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            {new Date(user.last_login).toLocaleDateString('pt-PT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-white/50">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            Nunca
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-violet-900/20 transition-colors duration-300"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <Eye className="h-4 w-4 text-violet-400 hover:text-violet-300" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-violet-900/20 transition-colors duration-300"
                            >
                              <MoreHorizontal className="h-4 w-4 text-white hover:text-violet-300" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-sm border-violet-900/30 shadow-xl">
                            <DropdownMenuLabel className="text-white font-semibold">
                              Ações para {user.name}
                            </DropdownMenuLabel>
                            
                            <DropdownMenuItem 
                              className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20 cursor-pointer transition-colors duration-300"
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4 text-violet-400" />
                              Ver detalhes
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20 cursor-pointer transition-colors duration-300"
                              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4 text-blue-400" />
                              Editar utilizador
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-violet-900/30" />
                            
                            <DropdownMenuItem 
                              className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20 cursor-pointer transition-colors duration-300"
                              onClick={() => handleStatusToggle(user.id, user.is_active, user)}
                            >
                              <Power className="mr-2 h-4 w-4 text-yellow-400" />
                              {user.is_active ? 'Desativar' : 'Ativar'} utilizador
                            </DropdownMenuItem>
                            
                            {user.id !== currentUser.id && (
                              <DropdownMenuItem 
                                className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20 cursor-pointer transition-colors duration-300"
                                onClick={() => handleDeleteUser(user.id, user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Desativar conta
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

            {users.length === 0 && !usersLoading && (
              <motion.div 
                className="text-center py-16 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="mx-auto w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/25"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Users className="h-8 w-8 text-white" />
                </motion.div>
                <div className="space-y-2">
                  <motion.p 
                    className="text-xl font-semibold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Nenhum utilizador encontrado
                  </motion.p>
                  <motion.p 
                    className="text-white/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Tenta ajustar os filtros ou cria um novo utilizador
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300"
                    onClick={() => router.push('/admin/users/new')}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Novo Utilizador
                  </Button>
                </motion.div>
              </motion.div>
            )}
          
            {/* Enhanced Pagination */}
            {pagination.total_pages > 1 && (
              <motion.div 
                className="px-6 py-6 border-t border-violet-900/30 bg-gradient-to-r from-violet-950/10 to-purple-950/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Pagination
                  pagination={pagination}
                  onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
                  onLimitChange={(limit) => setParams(prev => ({ ...prev, limit, page: 1 }))}
                  isLoading={usersLoading}
                  showSizeSelector={true}
                  showInfo={true}
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
        </motion.div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'delete' })}
        onConfirm={handleConfirmAction}
        type={confirmModal.type}
        isLoading={isProcessing}
        {...getConfirmModalProps()}
      />
      </div>
    </div>
  );
}