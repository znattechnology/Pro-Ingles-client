"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  RefreshCw
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
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    location?: string;
    joined_date: string;
    is_active: boolean;
  };
  plan: {
    id: string;
    name: string;
    plan_type: "FREE" | "PREMIUM" | "PREMIUM_PLUS";
  };
  status: "ACTIVE" | "EXPIRED" | "CANCELED" | "TRIAL";
  started_at: string;
  expires_at: string;
  days_remaining: number;
  is_trial: boolean;
  monthly_payment: string;
  yearly_payment?: string;
  auto_renew: boolean;
  payment_method?: string;
  last_payment_date?: string;
  next_payment_date?: string;
  total_paid: string;
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
  
  // Filter and sort subscriptions on frontend
  const filteredSubscriptions = React.useMemo(() => {
    let filtered = [...subscriptions];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          return parseFloat(b.monthly_payment) - parseFloat(a.monthly_payment);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [subscriptions, searchTerm, statusFilter, planFilter, sortBy]);

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
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300">Carregando usuários assinantes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-yellow-400" />
              Usuários Assinantes
            </h1>
            <p className="text-gray-300 mt-2">
              Gerencie usuários com assinaturas ativas, trials e expiradas
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button 
              onClick={() => fetchData()}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-900/50 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total_subscriptions}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Ativas</p>
                    <p className="text-2xl font-bold text-green-400">{stats.active_subscriptions}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Trial</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.trial_subscriptions}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Receita/Mês</p>
                    <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.monthly_revenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Usuário</TableHead>
                    <TableHead className="text-gray-300">Plano</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Expira em</TableHead>
                    <TableHead className="text-gray-300">Valor</TableHead>
                    <TableHead className="text-gray-300">Pagamento</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => {
                    const StatusIcon = getStatusIcon(subscription.status);
                    
                    return (
                      <TableRow key={subscription.id} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-800 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-white font-medium">{subscription.user.name}</div>
                              <div className="text-gray-400 text-sm flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {subscription.user.email}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Desde {formatDate(subscription.user.joined_date)}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={`${getPlanBadgeColor(subscription.plan.plan_type)} text-white`}>
                            {subscription.plan.name}
                          </Badge>
                          {subscription.is_trial && (
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
                            {subscription.days_remaining > 0 
                              ? `${subscription.days_remaining} dias`
                              : 'Expirado'
                            }
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatDate(subscription.expires_at)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-white font-medium">
                            {formatCurrency(subscription.monthly_payment)}/mês
                          </div>
                          <div className="text-gray-400 text-sm">
                            Total: {formatCurrency(subscription.total_paid)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {subscription.auto_renew ? (
                              <Badge className="bg-green-600">Auto-renovação</Badge>
                            ) : (
                              <Badge className="bg-gray-600">Manual</Badge>
                            )}
                          </div>
                          {subscription.next_payment_date && (
                            <div className="text-xs text-gray-400 mt-1">
                              Próximo: {formatDate(subscription.next_payment_date)}
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
              
              {filteredSubscriptions.length === 0 && !loading && (
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
      </div>
    </div>
  );
}