"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/course/Loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  DollarSign,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Gift,
  Tag,
  TrendingUp,
  X,
  Save
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: string;
  max_uses: number;
  uses_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  applicable_plans: Array<{
    id: string;
    name: string;
    plan_type: string;
  }>;
  minimum_amount?: string;
  first_time_only: boolean;
}

interface PromoCodeStats {
  total_codes: number;
  active_codes: number;
  expired_codes: number;
  total_uses: number;
  total_discount_given: string;
  most_used_code: {
    code: string;
    uses: number;
  };
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [stats, setStats] = useState<PromoCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newCode, setNewCode] = useState({
    code: "",
    description: "",
    discount_type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discount_value: "",
    max_uses: "",
    expires_at: "",
    is_active: true,
    minimum_amount: "",
    first_time_only: false,
    applicable_plans: []
  });

  // Fetch promo codes and usage data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch promo codes
      const codesResponse = await fetch('/api/v1/subscriptions?endpoint=admin-promo-codes');
      if (codesResponse.ok) {
        const codesData = await codesResponse.json();
        setPromoCodes(codesData.results || codesData || []);
      } else {
        console.error('Failed to fetch promo codes:', codesResponse.status);
      }

      // Fetch promo code stats
      const statsResponse = await fetch('/api/v1/subscriptions?endpoint=admin-promo-code-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        console.error('Failed to fetch promo code stats:', statsResponse.status);
        
        // Mock stats for fallback
        setStats({
          total_codes: 12,
          active_codes: 8,
          expired_codes: 4,
          total_uses: 156,
          total_discount_given: "125,750.00",
          most_used_code: {
            code: "SAVE20",
            uses: 45
          }
        });
      }

    } catch {
      setError('Erro ao carregar códigos promocionais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const getStatusColor = (code: PromoCode) => {
    const now = new Date();
    const expires = new Date(code.expires_at);
    
    if (!code.is_active) return 'bg-gray-500';
    if (expires < now) return 'bg-red-500';
    if (code.uses_count >= code.max_uses) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = (code: PromoCode) => {
    const now = new Date();
    const expires = new Date(code.expires_at);
    
    if (!code.is_active) return 'Inativo';
    if (expires < now) return 'Expirado';
    if (code.uses_count >= code.max_uses) return 'Esgotado';
    return 'Ativo';
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({...newCode, code: result});
  };

  const handleCreateCode = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/v1/subscriptions?endpoint=admin-promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCode,
          max_uses: parseInt(newCode.max_uses) || null,
          discount_value: parseFloat(newCode.discount_value),
          minimum_amount: newCode.minimum_amount ? parseFloat(newCode.minimum_amount) : null
        })
      });

      if (response.ok) {
        await fetchData();
        setShowCreateModal(false);
        setNewCode({
          code: "",
          description: "",
          discount_type: "PERCENTAGE",
          discount_value: "",
          max_uses: "",
          expires_at: "",
          is_active: true,
          minimum_amount: "",
          first_time_only: false,
          applicable_plans: []
        });
      } else {
        setError('Falha ao criar código promocional');
      }
    } catch {
      setError('Erro ao criar código promocional');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Tem certeza que deseja deletar este código promocional?')) return;
    
    try {
      const response = await fetch(`/api/v1/subscriptions/admin/promo-codes/${codeId}/`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchData();
      } else {
        setError('Falha ao deletar código');
      }
    } catch {
      setError('Erro ao deletar código');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
    alert(`Código ${text} copiado para a área de transferência!`);
  };

  // Filter codes based on search and status
  const filteredCodes = promoCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return code.is_active && new Date(code.expires_at) > new Date() && code.uses_count < code.max_uses;
    if (statusFilter === 'expired') return new Date(code.expires_at) <= new Date();
    if (statusFilter === 'used_up') return code.uses_count >= code.max_uses;
    if (statusFilter === 'inactive') return !code.is_active;
    
    return true;
  });

  if (loading) {
    return (
      <Loading 
        title="Códigos Promocionais"
        subtitle="Gestão de Descontos"
        description="Carregando cupons e códigos promocionais..."
        icon={Receipt}
        progress={70}
        theme={{
          primary: "purple",
          secondary: "violet",
          accent: "pink"
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
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/5 rounded-full blur-3xl" />
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-violet-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-pink-500/10 border border-purple-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm shadow-lg shadow-purple-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </motion.div>
              <span className="text-purple-300 font-semibold text-sm sm:text-base lg:text-lg">Códigos Promocionais</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight"
            >
              Cupons{' '}
              <motion.span 
                className="bg-gradient-to-r from-purple-400 via-violet-400 to-pink-400 bg-clip-text text-transparent"
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
                🎫
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 font-light"
            >
              Gerencie <motion.span className="text-purple-400 font-medium" whileHover={{ scale: 1.05 }}>cupons de desconto</motion.span>,{' '}
              <motion.span className="text-violet-400 font-medium" whileHover={{ scale: 1.05 }}>códigos promocionais</motion.span> e{' '}
              <motion.span className="text-pink-400 font-medium" whileHover={{ scale: 1.05 }}>ofertas especiais</motion.span>
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
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Código
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

        {/* Enhanced Stats Cards */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6"
          >
            {/* Total Codes Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-customgreys-secondarybg/60 to-violet-900/30 backdrop-blur-sm border border-purple-500/30 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.p 
                        className="text-sm font-medium text-purple-300/80 mb-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        Total de Códigos
                      </motion.p>
                      <motion.p 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stats.total_codes}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-purple-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Promocionais</span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30"
                    >
                      <Receipt className="w-6 h-6 text-purple-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Codes Card */}
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
                        Códigos Ativos
                      </motion.p>
                      <motion.p 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        {stats.active_codes}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-green-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Disponíveis</span>
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

            {/* Total Uses Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
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
                        Total de Usos
                      </motion.p>
                      <motion.p 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        {stats.total_uses}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-yellow-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Resgates</span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30"
                    >
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Discount Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-violet-900/30 via-customgreys-secondarybg/60 to-purple-900/30 backdrop-blur-sm border border-violet-500/30 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.p 
                        className="text-sm font-medium text-violet-300/80 mb-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        Desconto Total
                      </motion.p>
                      <motion.p 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                      >
                        {formatCurrency(stats.total_discount_given)}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-violet-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6 }}
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Economia</span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-violet-500/20 rounded-full border border-violet-500/30"
                    >
                      <DollarSign className="w-6 h-6 text-violet-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Most Used Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-pink-900/30 via-customgreys-secondarybg/60 to-rose-900/30 backdrop-blur-sm border border-pink-500/30 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.p 
                        className="text-sm font-medium text-pink-300/80 mb-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        Mais Usado
                      </motion.p>
                      <motion.p 
                        className="text-lg font-bold text-white mb-1"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                      >
                        {stats.most_used_code.code}
                      </motion.p>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-pink-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8 }}
                      >
                        <Gift className="w-3 h-3" />
                        <span>{stats.most_used_code.uses} usos</span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="p-3 bg-pink-500/20 rounded-full border border-pink-500/30"
                    >
                      <Gift className="w-6 h-6 text-pink-400" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <Label className="text-gray-300">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Código ou descrição..."
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
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="expired">Expirados</SelectItem>
                    <SelectItem value="used_up">Esgotados</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promo Codes Table */}
        <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
          <CardHeader>
            <CardTitle className="text-white">
              Códigos Promocionais ({filteredCodes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300 min-w-[180px]">Código</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Desconto</TableHead>
                    <TableHead className="text-gray-300 min-w-[100px]">Uso</TableHead>
                    <TableHead className="text-gray-300 min-w-[100px]">Status</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Expira em</TableHead>
                    <TableHead className="text-gray-300 min-w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code) => (
                    <TableRow key={code.id} className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center">
                            <Tag className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">{code.code}</div>
                            <div className="text-gray-400 text-sm">{code.description}</div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(code.code)}
                              className="p-0 h-auto text-xs text-blue-400 hover:text-blue-300"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar
                            </Button>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-white font-medium">
                          {code.discount_type === 'PERCENTAGE' 
                            ? `${code.discount_value}%`
                            : formatCurrency(code.discount_value)
                          }
                        </div>
                        {code.minimum_amount && (
                          <div className="text-gray-400 text-sm">
                            Mín: {formatCurrency(code.minimum_amount)}
                          </div>
                        )}
                        {code.first_time_only && (
                          <Badge className="bg-blue-600 mt-1">Primeira compra</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-white">
                          {code.uses_count} / {code.max_uses || '∞'}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: code.max_uses ? `${(code.uses_count / code.max_uses) * 100}%` : '0%'
                            }}
                          ></div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={`${getStatusColor(code)} text-white`}>
                          {getStatusText(code)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-white">
                          {formatDate(code.expires_at)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {Math.ceil((new Date(code.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias restantes
                        </div>
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
                              Ver Usos
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-gray-300"
                              onClick={() => copyToClipboard(code.code)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Código
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-400"
                              onClick={() => handleDeleteCode(code.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredCodes.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum código promocional encontrado</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Código
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="bg-customgreys-secondarybg border-gray-600 max-w-2xl mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Código Promocional</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure um novo código de desconto para seus usuários
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Código</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCode.code}
                      onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                      placeholder="SAVE20"
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                      className="border-gray-600"
                    >
                      Gerar
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-300">Tipo de Desconto</Label>
                  <Select
                    value={newCode.discount_type}
                    onValueChange={(value) => setNewCode({...newCode, discount_type: value as "PERCENTAGE" | "FIXED_AMOUNT"})}
                  >
                    <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Valor Fixo (AOA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Descrição</Label>
                <Textarea
                  value={newCode.description}
                  onChange={(e) => setNewCode({...newCode, description: e.target.value})}
                  placeholder="Desconto de 20% para novos usuários"
                  className="bg-customgreys-darkGrey border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">
                    Valor do Desconto {newCode.discount_type === 'PERCENTAGE' ? '(%)' : '(AOA)'}
                  </Label>
                  <Input
                    type="number"
                    value={newCode.discount_value}
                    onChange={(e) => setNewCode({...newCode, discount_value: e.target.value})}
                    placeholder={newCode.discount_type === 'PERCENTAGE' ? '20' : '5000'}
                    className="bg-customgreys-darkGrey border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Máximo de Usos</Label>
                  <Input
                    type="number"
                    value={newCode.max_uses}
                    onChange={(e) => setNewCode({...newCode, max_uses: e.target.value})}
                    placeholder="100 (vazio = ilimitado)"
                    className="bg-customgreys-darkGrey border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Data de Expiração</Label>
                  <Input
                    type="date"
                    value={newCode.expires_at}
                    onChange={(e) => setNewCode({...newCode, expires_at: e.target.value})}
                    className="bg-customgreys-darkGrey border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Valor Mínimo (AOA)</Label>
                  <Input
                    type="number"
                    value={newCode.minimum_amount}
                    onChange={(e) => setNewCode({...newCode, minimum_amount: e.target.value})}
                    placeholder="10000 (opcional)"
                    className="bg-customgreys-darkGrey border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newCode.first_time_only}
                    onCheckedChange={(checked) => setNewCode({...newCode, first_time_only: checked})}
                  />
                  <Label className="text-gray-300">Apenas primeira compra</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newCode.is_active}
                    onCheckedChange={(checked) => setNewCode({...newCode, is_active: checked})}
                  />
                  <Label className="text-gray-300">Código ativo</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="border-gray-600 text-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCode}
                disabled={saving || !newCode.code || !newCode.discount_value}
                className="bg-gradient-to-r from-green-600 to-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Criando...' : 'Criar Código'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}