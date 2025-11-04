"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/course/Loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  DollarSign,
  User,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Crown,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserSubscription {
  id: string;
  user_name: string;
  user_email: string;
  plan: {
    id: string;
    name: string;
    plan_type: "FREE" | "PREMIUM" | "PREMIUM_PLUS";
    monthly_price: string;
    yearly_price?: string;
    features: string[];
  };
  status: "ACTIVE" | "EXPIRED" | "CANCELED" | "TRIAL";
  started_at: string;
  expires_at: string;
  canceled_at?: string;
  trial_ends_at?: string;
  days_until_expiry: number;
  is_active_subscription: boolean;
  is_trial_subscription: boolean;
  last_payment_at?: string;
  next_billing_date?: string;
  daily_usage?: {
    lessons_used: number;
    lessons_limit?: number;
    speaking_minutes_used: number;
    speaking_limit?: number;
    listening_minutes_used: number;
    listening_limit?: number;
    can_take_lesson: boolean;
    can_use_speaking: boolean;
    can_use_listening: boolean;
  };
  hearts_status?: {
    current_hearts: number;
    max_hearts: number;
    is_unlimited: boolean;
    next_recharge: string;
    recharge_hours: number;
  };
}

interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  expired_subscriptions: number;
  canceled_subscriptions: number;
  monthly_revenue: string;
  yearly_revenue: string;
  average_subscription_value: string;
}

export default function AdminSubscriptionUsersPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_desc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch subscriptions and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscriptions - filtering will be done on frontend for now
      const subscriptionsUrl = '/api/v1/subscriptions?endpoint=admin-subscriptions';
      
      const subscriptionsResponse = await fetch(subscriptionsUrl);
      
      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        setSubscriptions(subscriptionsData.results || subscriptionsData);
      } else {
        console.error('Failed to fetch subscriptions:', subscriptionsResponse.status);
        setError('Falha ao carregar assinaturas');
      }

      // Fetch stats (optional)
      try {
        const statsResponse = await fetch('/api/v1/subscriptions?endpoint=admin-stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch {
        console.warn('Failed to load stats, continuing without them');
      }

    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Only fetch once on mount
  
  // Filter, sort and paginate subscriptions
  const { filteredSubscriptions, paginatedSubscriptions, totalPages } = React.useMemo(() => {
    let filtered = [...subscriptions];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }
    
    // Plan filter  
    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.plan.plan_type === planFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
        case 'created_asc':
          return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
        case 'expires_asc':
          return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
        case 'value_desc':
          return parseFloat(b.plan.monthly_price) - parseFloat(a.plan.monthly_price);
        default:
          return 0;
      }
    });
    
    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);
    
    return {
      filteredSubscriptions: filtered,
      paginatedSubscriptions: paginated,
      totalPages
    };
  }, [subscriptions, searchTerm, statusFilter, planFilter, sortBy, currentPage]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter, sortBy]);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'TRIAL': return 'bg-blue-500';
      case 'EXPIRED': return 'bg-red-500';
      case 'CANCELED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'FREE': return 'bg-gray-500';
      case 'PREMIUM': return 'bg-blue-500';
      case 'PREMIUM_PLUS': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return CheckCircle;
      case 'TRIAL': return Clock;
      case 'EXPIRED': return XCircle;
      case 'CANCELED': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const handleExportData = () => {
    // Implement CSV/Excel export
    console.log('Export functionality to be implemented');
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return;
    
    try {
      // Implementation for canceling subscription
      console.log('Cancel subscription:', subscriptionId);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error canceling subscription:', err);
    }
  };

  if (loading) {
    return (
      <Loading 
        title="Usuários Assinantes"
        subtitle="Sistema de Assinaturas"
        description="Carregando dados dos assinantes..."
        icon={Users}
        progress={65}
        theme={{
          primary: "blue",
          secondary: "indigo",
          accent: "cyan"
        }}
      />
    );
  }

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
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-indigo-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm shadow-lg shadow-blue-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </motion.div>
              <span className="text-blue-300 font-semibold text-sm sm:text-base lg:text-lg">Usuários Assinantes</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight"
            >
              Gestão{' '}
              <motion.span 
                className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Premium
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                💼
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 font-light"
            >
              Gerencie usuários com <motion.span className="text-blue-400 font-medium" whileHover={{ scale: 1.05 }}>assinaturas ativas</motion.span>,{' '}
              <motion.span className="text-indigo-400 font-medium" whileHover={{ scale: 1.05 }}>trials</motion.span> e{' '}
              <motion.span className="text-cyan-400 font-medium" whileHover={{ scale: 1.05 }}>pagamentos</motion.span>
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
                onClick={handleExportData}
                variant="outline"
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/50 transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => fetchData()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Enhanced Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-4 w-4 text-red-400" />
            <div className="text-red-300">{error}</div>
          </motion.div>
        )}

        {/* Enhanced Stats Cards with Modern Design */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {/* Total Subscriptions Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-customgreys-secondarybg/60 to-indigo-900/30 backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.p 
                        className="text-sm font-medium text-blue-300/80 mb-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        Total Assinaturas
                      </motion.p>
                      <motion.p 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stats.total_subscriptions}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-blue-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Sistema ativo</span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30"
                    >
                      <Users className="w-6 h-6 text-blue-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Subscriptions Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-green-900/30 via-customgreys-secondarybg/60 to-emerald-900/30 backdrop-blur-sm border border-green-500/30 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.p 
                        className="text-sm font-medium text-green-300/80 mb-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        Assinaturas Ativas
                      </motion.p>
                      <motion.p 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        {stats.active_subscriptions}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-green-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Gerando receita</span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-green-500/20 rounded-full border border-green-500/30"
                    >
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trial Subscriptions Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-900/30 via-customgreys-secondarybg/60 to-teal-900/30 backdrop-blur-sm border border-cyan-500/30 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.p 
                        className="text-sm font-medium text-cyan-300/80 mb-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        Período Trial
                      </motion.p>
                      <motion.p 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        {stats.trial_subscriptions}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-cyan-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                      >
                        <Clock className="w-3 h-3" />
                        <span>Experimentando</span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-cyan-500/20 rounded-full border border-cyan-500/30"
                    >
                      <Clock className="w-6 h-6 text-cyan-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Revenue Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-900/30 via-customgreys-secondarybg/60 to-orange-900/30 backdrop-blur-sm border border-yellow-500/30 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.p 
                        className="text-sm font-medium text-yellow-300/80 mb-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        Receita Mensal
                      </motion.p>
                      <motion.p 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                      >
                        {formatCurrency(stats.monthly_revenue)}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-yellow-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Crescimento</span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30"
                    >
                      <DollarSign className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Filters */}
        <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <Label className="text-gray-300">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome ou email..."
                    className="pl-10 bg-customgreys-darkGrey border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-gray-300">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVE">Ativas</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="EXPIRED">Expiradas</SelectItem>
                    <SelectItem value="CANCELED">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plan Filter */}
              <div>
                <Label className="text-gray-300">Plano</Label>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="FREE">Gratuito</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="PREMIUM_PLUS">Premium Plus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Label className="text-gray-300">Ordenar</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_desc">Mais Recentes</SelectItem>
                    <SelectItem value="created_asc">Mais Antigos</SelectItem>
                    <SelectItem value="expires_asc">Expirando Primeiro</SelectItem>
                    <SelectItem value="value_desc">Maior Valor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
          <CardHeader>
            <CardTitle className="text-white">
              Assinaturas ({filteredSubscriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300 min-w-[200px]">Usuário</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Plano</TableHead>
                    <TableHead className="text-gray-300 min-w-[100px]">Status</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Expira em</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Valor</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Pagamento</TableHead>
                    <TableHead className="text-gray-300 min-w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubscriptions.map((subscription) => {
                    const StatusIcon = getStatusIcon(subscription.status);
                    
                    return (
                      <TableRow key={subscription.id} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-800 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-white font-medium">{subscription.user_name}</div>
                              <div className="text-gray-400 text-sm flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {subscription.user_email}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Desde {formatDate(subscription.started_at)}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={`${getPlanBadgeColor(subscription.plan.plan_type)} text-white`}>
                            {subscription.plan.name}
                          </Badge>
                          {subscription.is_trial_subscription && (
                            <Badge className="bg-blue-600 ml-2">Trial</Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(subscription.status).replace('bg-', 'text-')}`} />
                            <span className={`text-sm font-medium ${getStatusColor(subscription.status).replace('bg-', 'text-')}`}>
                              {subscription.status}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-white">
                            {subscription.days_until_expiry > 0 
                              ? `${subscription.days_until_expiry} dias`
                              : 'Expirado'
                            }
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatDate(subscription.expires_at)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-white font-medium">
                            {formatCurrency(subscription.plan.monthly_price)}/mês
                          </div>
                          <div className="text-gray-400 text-sm">
                            Desde {formatDate(subscription.started_at)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {subscription.status === 'ACTIVE' ? (
                              <Badge className="bg-green-600">Ativo</Badge>
                            ) : subscription.status === 'TRIAL' ? (
                              <Badge className="bg-blue-600">Trial</Badge>
                            ) : subscription.status === 'CANCELED' ? (
                              <Badge className="bg-red-600">Cancelado</Badge>
                            ) : (
                              <Badge className="bg-gray-600">Expirado</Badge>
                            )}
                          </div>
                          {subscription.next_billing_date && (
                            <div className="text-xs text-gray-400 mt-1">
                              Próximo: {formatDate(subscription.next_billing_date)}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-customgreys-darkGrey border-gray-600">
                              <DropdownMenuLabel className="text-gray-300">Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-gray-300">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-gray-300">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-400"
                                onClick={() => handleCancelSubscription(subscription.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {paginatedSubscriptions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma assinatura encontrada</p>
                  <p className="text-gray-500 text-sm">
                    Ajuste os filtros ou aguarde novos usuários se inscreverem
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Pagination Controls */}
        {filteredSubscriptions.length > 0 && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4"
          >
            {/* Pagination Info */}
            <motion.div 
              className="text-sm text-gray-400"
              whileHover={{ scale: 1.02 }}
            >
              Mostrando{' '}
              <span className="font-medium text-blue-400">
                {((currentPage - 1) * itemsPerPage) + 1}
              </span>
              {' '}a{' '}
              <span className="font-medium text-blue-400">
                {Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)}
              </span>
              {' '}de{' '}
              <span className="font-medium text-blue-400">
                {filteredSubscriptions.length}
              </span>
              {' '}assinaturas
            </motion.div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
              </motion.div>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and adjacent pages
                    return page === 1 || 
                           page === totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-2 py-1 text-gray-500">...</span>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            onClick={() => setCurrentPage(page)}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className={
                              currentPage === page
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                                : "border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/50 transition-all duration-300"
                            }
                          >
                            {page}
                          </Button>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
              </div>

              {/* Next Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}