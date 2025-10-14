"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
  Percent,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
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
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface PromoCodeUsage {
  id: string;
  user: {
    email: string;
    name: string;
  };
  promo_code: {
    code: string;
  };
  used_at: string;
  discount_applied: string;
  original_amount: string;
  final_amount: string;
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
  const [usage, setUsage] = useState<PromoCodeUsage[]>([]);
  const [stats, setStats] = useState<PromoCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
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

      // Fetch usage data
      const usageResponse = await fetch('/api/v1/subscriptions?endpoint=admin-promo-code-usage');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData.results || usageData || []);
      } else {
        console.warn('Failed to fetch usage data, continuing without it');
      }

      // Mock stats for now
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

    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Receipt className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300">Carregando códigos promocionais...</p>
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
              <Receipt className="w-8 h-8 text-yellow-400" />
              Códigos Promocionais
            </h1>
            <p className="text-gray-300 mt-2">
              Gerencie cupons de desconto e códigos promocionais
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Código
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total_codes}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Ativos</p>
                    <p className="text-2xl font-bold text-green-400">{stats.active_codes}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total de Usos</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.total_uses}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Desconto Total</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {formatCurrency(stats.total_discount_given)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Mais Usado</p>
                    <p className="text-lg font-bold text-orange-400">{stats.most_used_code.code}</p>
                    <p className="text-xs text-gray-400">{stats.most_used_code.uses} usos</p>
                  </div>
                  <Gift className="w-8 h-8 text-orange-400" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Código</TableHead>
                    <TableHead className="text-gray-300">Desconto</TableHead>
                    <TableHead className="text-gray-300">Uso</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Expira em</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
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
          <DialogContent className="bg-customgreys-secondarybg border-gray-600 max-w-2xl">
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

              <div className="flex items-center justify-between">
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