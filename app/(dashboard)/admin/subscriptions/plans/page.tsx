"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/course/Loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Crown,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  DollarSign,
  Users,
  Settings,
  AlertCircle,
  Zap,
  Heart,
  Clock,
  Download,
  Award,
  Bot,
  UserCheck,
  BarChart3,
  Headphones,
  Smartphone,
  TrendingUp
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionPlan {
  id: string;
  name: string;
  plan_type: "FREE" | "PREMIUM" | "PREMIUM_PLUS";
  description: string;
  monthly_price: string;
  yearly_price: string;
  yearly_discount_percentage: number;
  is_most_popular: boolean;
  features: string[];
  daily_lessons_limit: number | null;
  daily_speaking_minutes: number | null;
  daily_listening_minutes: number | null;
  hearts_limit: number;
  hearts_recharge_hours: number;
  offline_downloads: boolean;
  certificates: boolean;
  ai_tutor: boolean;
  native_teacher_sessions: number;
  advanced_analytics: boolean;
  priority_support: boolean;
  streak_freeze: number;
  multiple_devices: number;
  sort_order: number;
  is_active: boolean;
}

export default function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyPlan: Omit<SubscriptionPlan, 'id'> = {
    name: "",
    plan_type: "FREE",
    description: "",
    monthly_price: "0",
    yearly_price: "0",
    yearly_discount_percentage: 0,
    is_most_popular: false,
    features: [],
    daily_lessons_limit: 3,
    daily_speaking_minutes: 5,
    daily_listening_minutes: 5,
    hearts_limit: 3,
    hearts_recharge_hours: 4,
    offline_downloads: false,
    certificates: false,
    ai_tutor: false,
    native_teacher_sessions: 0,
    advanced_analytics: false,
    priority_support: false,
    streak_freeze: 0,
    multiple_devices: 1,
    sort_order: 1,
    is_active: true
  };

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/subscriptions?endpoint=admin-plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        setError('Falha ao carregar planos');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(num);
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'FREE': return 'bg-gray-500';
      case 'PREMIUM': return 'bg-blue-500';
      case 'PREMIUM_PLUS': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    console.log('Editing plan:', plan); // Debug
    setEditingPlan({ ...plan });
    setShowCreateForm(false);
  };

  const handleCreatePlan = () => {
    setEditingPlan({ ...emptyPlan, id: 'new' } as SubscriptionPlan);
    setShowCreateForm(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      setSaving(true);
      
      const planData = {
        ...editingPlan,
        // Convert null limits to 0 for unlimited features
        daily_lessons_limit: editingPlan.daily_lessons_limit || 0,
        daily_speaking_minutes: editingPlan.daily_speaking_minutes || 0,
        daily_listening_minutes: editingPlan.daily_listening_minutes || 0
      };

      const url = showCreateForm 
        ? '/api/v1/subscriptions/admin/plans/'
        : `/api/v1/subscriptions/admin/plans/${editingPlan.id}/`;
      
      const method = showCreateForm ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        await fetchPlans(); // Refresh plans
        setEditingPlan(null);
        setShowCreateForm(false);
        setError(null);
      } else {
        setError('Falha ao salvar plano');
      }
    } catch {
      setError('Erro ao salvar plano');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return;

    try {
      const response = await fetch(`/api/v1/subscriptions/admin/plans/${planId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPlans(); // Refresh plans
        setError(null);
      } else {
        setError('Falha ao deletar plano');
      }
    } catch {
      setError('Erro ao deletar plano');
    }
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setShowCreateForm(false);
  };

  const updateEditingPlan = (field: keyof SubscriptionPlan, value: any) => {
    if (!editingPlan) {
      console.log('No editingPlan available'); // Debug
      return;
    }
    console.log('Updating field:', field, 'with value:', value); // Debug
    setEditingPlan({ ...editingPlan, [field]: value });
  };

  if (loading) {
    return (
      <Loading 
        title="Gestão de Planos"
        subtitle="Sistema de Assinaturas"
        description="Carregando planos de assinatura..."
        icon={Crown}
        progress={75}
        theme={{
          primary: "yellow",
          secondary: "orange",
          accent: "amber"
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
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-yellow-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-orange-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-amber-500/5 rounded-full blur-3xl" />
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-yellow-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-orange-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-amber-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-yellow-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-amber-500/10 border border-yellow-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm shadow-lg shadow-yellow-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </motion.div>
              <span className="text-yellow-300 font-semibold text-sm sm:text-base lg:text-lg">Gestão de Planos</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight"
            >
              Planos{' '}
              <motion.span 
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 bg-clip-text text-transparent"
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
                👑
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 font-light"
            >
              Gerencie <motion.span className="text-yellow-400 font-medium" whileHover={{ scale: 1.05 }}>planos de assinatura</motion.span>,{' '}
              <motion.span className="text-orange-400 font-medium" whileHover={{ scale: 1.05 }}>preços</motion.span> e{' '}
              <motion.span className="text-amber-400 font-medium" whileHover={{ scale: 1.05 }}>funcionalidades</motion.span>
            </motion.p>
          </div>

          {/* Action Button */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleCreatePlan}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:shadow-yellow-500/40"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
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

        {/* Enhanced Edit/Create Form */}
        {editingPlan && (
          <div>
            <Card className="bg-customgreys-secondarybg border border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-yellow-400" />
                  {showCreateForm ? 'Criar Novo Plano' : 'Editar Plano'}
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Nome do Plano</Label>
                    <Input
                      value={editingPlan.name || ''}
                      onChange={(e) => updateEditingPlan('name', e.target.value)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="Ex: Premium"
                      disabled={false}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Tipo do Plano</Label>
                    <select
                      value={editingPlan.plan_type || 'FREE'}
                      onChange={(e) => updateEditingPlan('plan_type', e.target.value)}
                      className="w-full p-2 bg-customgreys-darkGrey border border-gray-600 rounded text-white"
                      disabled={false}
                    >
                      <option value="FREE">Gratuito</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="PREMIUM_PLUS">Premium Plus</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Descrição</Label>
                    <Textarea
                      value={editingPlan.description || ''}
                      onChange={(e) => updateEditingPlan('description', e.target.value)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="Descrição do plano..."
                      disabled={false}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-gray-300">Preço Mensal (AOA)</Label>
                      <Input
                        type="number"
                        value={editingPlan.monthly_price || ''}
                        onChange={(e) => updateEditingPlan('monthly_price', e.target.value)}
                        className="bg-customgreys-darkGrey border-gray-600 text-white"
                        placeholder="14950"
                        disabled={false}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-gray-300">Preço Anual (AOA)</Label>
                      <Input
                        type="number"
                        value={editingPlan.yearly_price || ''}
                        onChange={(e) => updateEditingPlan('yearly_price', e.target.value)}
                        className="bg-customgreys-darkGrey border-gray-600 text-white"
                        placeholder="149500"
                        disabled={false}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingPlan.is_most_popular}
                        onCheckedChange={(checked) => updateEditingPlan('is_most_popular', checked)}
                      />
                      <Label className="text-gray-300">Mais Popular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingPlan.is_active}
                        onCheckedChange={(checked) => updateEditingPlan('is_active', checked)}
                      />
                      <Label className="text-gray-300">Ativo</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Limits Section */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Limitações Diárias (0 = Ilimitado)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Lições por Dia
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.daily_lessons_limit ?? ''}
                      onChange={(e) => updateEditingPlan('daily_lessons_limit', parseInt(e.target.value) || null)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="0 para ilimitado"
                      disabled={false}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Speaking (min/dia)
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.daily_speaking_minutes ?? ''}
                      onChange={(e) => updateEditingPlan('daily_speaking_minutes', parseInt(e.target.value) || null)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="0 para ilimitado"
                      disabled={false}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      Listening (min/dia)
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.daily_listening_minutes ?? ''}
                      onChange={(e) => updateEditingPlan('daily_listening_minutes', parseInt(e.target.value) || null)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="0 para ilimitado"
                      disabled={false}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Vidas Máximas
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.hearts_limit || ''}
                      onChange={(e) => updateEditingPlan('hearts_limit', parseInt(e.target.value) || 0)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      disabled={false}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recarga Vidas (horas)
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.hearts_recharge_hours || ''}
                      onChange={(e) => updateEditingPlan('hearts_recharge_hours', parseInt(e.target.value) || 0)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      disabled={false}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Dispositivos
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.multiple_devices || ''}
                      onChange={(e) => updateEditingPlan('multiple_devices', parseInt(e.target.value) || 1)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      disabled={false}
                    />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-white font-semibold mb-4">Funcionalidades Premium</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'offline_downloads', label: 'Downloads Offline', icon: Download },
                    { key: 'certificates', label: 'Certificados', icon: Award },
                    { key: 'ai_tutor', label: 'IA Tutor', icon: Bot },
                    { key: 'advanced_analytics', label: 'Analytics Avançado', icon: BarChart3 },
                    { key: 'priority_support', label: 'Suporte Prioritário', icon: UserCheck }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        checked={editingPlan[key as keyof SubscriptionPlan] as boolean}
                        onCheckedChange={(checked) => updateEditingPlan(key as keyof SubscriptionPlan, checked)}
                      />
                      <Label className="text-gray-300 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-gray-300">Sessões com Nativos/Mês</Label>
                    <Input
                      type="number"
                      value={editingPlan.native_teacher_sessions || ''}
                      onChange={(e) => updateEditingPlan('native_teacher_sessions', parseInt(e.target.value) || 0)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      disabled={false}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Streak Freezes/Semana</Label>
                    <Input
                      type="number"
                      value={editingPlan.streak_freeze || ''}
                      onChange={(e) => updateEditingPlan('streak_freeze', parseInt(e.target.value) || 0)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      disabled={false}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="border-gray-600 text-gray-300 hover:border-red-400 hover:text-red-300 transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Enhanced Plans List */}
        {!editingPlan && (
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card 
                  className={`relative border ${
                    plan.is_most_popular 
                      ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-950/50 to-orange-950/30 shadow-lg shadow-yellow-500/20 ring-2 ring-yellow-400/50' 
                      : 'border-gray-500/30 bg-gradient-to-br from-gray-950/50 to-black'
                  } backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                    plan.is_most_popular ? 'hover:shadow-yellow-500/30' : 'hover:shadow-gray-500/20'
                  }`}
                >
                  {plan.is_most_popular && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/5 rounded-lg" />
                  )}
                  <CardHeader className="relative">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex items-center gap-3">
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <Badge className={`${getPlanBadgeColor(plan.plan_type)} text-white shadow-md`}>
                            {plan.name}
                          </Badge>
                        </motion.div>
                        {plan.is_most_popular && (
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg">
                              <Crown className="w-3 h-3 mr-1" />
                              Mais Popular
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex gap-2 self-start">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPlan(plan)}
                            className="border-gray-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-300 transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </motion.div>
                        {plan.plan_type !== 'FREE' && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePlan(plan.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CardTitle className="text-white flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <DollarSign className="w-5 h-5 text-green-400" />
                        </motion.div>
                        {formatCurrency(plan.monthly_price)}/mês
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {plan.description}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    {/* Enhanced Pricing Info */}
                    {parseFloat(plan.yearly_price) > 0 && (
                      <motion.div 
                        className="p-3 bg-gradient-to-r from-green-950/30 to-emerald-950/30 border border-green-500/20 rounded-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          Anual: {formatCurrency(plan.yearly_price)}
                        </div>
                        <div className="text-xs text-green-400 font-medium">
                          {plan.yearly_discount_percentage}% de desconto
                        </div>
                      </motion.div>
                    )}

                    {/* Enhanced Limits */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4 text-yellow-400" />
                        Limitações:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                        <motion.div 
                          className="flex items-center gap-1 p-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Zap className="w-3 h-3 text-yellow-400" />
                          {plan.daily_lessons_limit ? `${plan.daily_lessons_limit} lições/dia` : 'Ilimitado'}
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-1 p-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Users className="w-3 h-3 text-blue-400" />
                          {plan.daily_speaking_minutes ? `${plan.daily_speaking_minutes}min Speaking` : 'Ilimitado'}
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-1 p-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Headphones className="w-3 h-3 text-purple-400" />
                          {plan.daily_listening_minutes ? `${plan.daily_listening_minutes}min Listening` : 'Ilimitado'}
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-1 p-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Heart className="w-3 h-3 text-red-400" />
                          {plan.hearts_limit ? `${plan.hearts_limit} vidas` : 'Infinitas'}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Enhanced Premium Features */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        Recursos:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                        {[
                          { condition: plan.offline_downloads, icon: Download, label: 'Offline', color: 'text-blue-400' },
                          { condition: plan.certificates, icon: Award, label: 'Certificados', color: 'text-yellow-400' },
                          { condition: plan.ai_tutor, icon: Bot, label: 'IA Tutor', color: 'text-purple-400' },
                          { condition: plan.advanced_analytics, icon: BarChart3, label: 'Analytics', color: 'text-green-400' },
                          { condition: plan.priority_support, icon: UserCheck, label: 'Suporte VIP', color: 'text-orange-400' },
                          { condition: plan.native_teacher_sessions > 0, icon: Users, label: `${plan.native_teacher_sessions} sessões`, color: 'text-pink-400' }
                        ].map(({ condition, icon: Icon, label, color }, index) => (
                          <motion.div 
                            key={index} 
                            className={`flex items-center gap-1 p-1.5 rounded transition-all ${
                              condition 
                                ? `${color} bg-gray-800/40 hover:bg-gray-700/40` 
                                : 'text-gray-500 bg-gray-900/30'
                            }`}
                            whileHover={condition ? { scale: 1.05 } : {}}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Enhanced Status */}
                    <motion.div 
                      className="flex items-center justify-between pt-2 border-t border-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Badge className={`${plan.is_active ? 'bg-green-500' : 'bg-red-500'} shadow-md`}>
                          {plan.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </motion.div>
                      <span className="text-xs text-gray-400">
                        Ordem: {plan.sort_order}
                      </span>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}