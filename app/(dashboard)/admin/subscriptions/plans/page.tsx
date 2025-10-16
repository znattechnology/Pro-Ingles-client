"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Smartphone
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
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300">Carregando planos...</p>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              Gestão de Planos
            </h1>
            <p className="text-gray-300 mt-2">
              Gerencie planos de assinatura, preços e funcionalidades
            </p>
          </div>
          
          <Button 
            onClick={handleCreatePlan}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
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

        {/* Edit/Create Form */}
        {editingPlan && (
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {showCreateForm ? 'Criar Novo Plano' : 'Editar Plano'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Nome do Plano</Label>
                    <Input
                      value={editingPlan.name}
                      onChange={(e) => updateEditingPlan('name', e.target.value)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="Ex: Premium"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Tipo do Plano</Label>
                    <select
                      value={editingPlan.plan_type}
                      onChange={(e) => updateEditingPlan('plan_type', e.target.value)}
                      className="w-full p-2 bg-customgreys-darkGrey border border-gray-600 rounded text-white"
                    >
                      <option value="FREE">Gratuito</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="PREMIUM_PLUS">Premium Plus</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Descrição</Label>
                    <Textarea
                      value={editingPlan.description}
                      onChange={(e) => updateEditingPlan('description', e.target.value)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="Descrição do plano..."
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
                        value={editingPlan.monthly_price}
                        onChange={(e) => updateEditingPlan('monthly_price', e.target.value)}
                        className="bg-customgreys-darkGrey border-gray-600 text-white"
                        placeholder="14950"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-gray-300">Preço Anual (AOA)</Label>
                      <Input
                        type="number"
                        value={editingPlan.yearly_price}
                        onChange={(e) => updateEditingPlan('yearly_price', e.target.value)}
                        className="bg-customgreys-darkGrey border-gray-600 text-white"
                        placeholder="149500"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Lições por Dia
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.daily_lessons_limit || ''}
                      onChange={(e) => updateEditingPlan('daily_lessons_limit', parseInt(e.target.value) || null)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="0 para ilimitado"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Speaking (min/dia)
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.daily_speaking_minutes || ''}
                      onChange={(e) => updateEditingPlan('daily_speaking_minutes', parseInt(e.target.value) || null)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="0 para ilimitado"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      Listening (min/dia)
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.daily_listening_minutes || ''}
                      onChange={(e) => updateEditingPlan('daily_listening_minutes', parseInt(e.target.value) || null)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                      placeholder="0 para ilimitado"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Vidas Máximas
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.hearts_limit}
                      onChange={(e) => updateEditingPlan('hearts_limit', parseInt(e.target.value) || 0)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recarga Vidas (horas)
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.hearts_recharge_hours}
                      onChange={(e) => updateEditingPlan('hearts_recharge_hours', parseInt(e.target.value) || 0)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Dispositivos
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.multiple_devices}
                      onChange={(e) => updateEditingPlan('multiple_devices', parseInt(e.target.value) || 1)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-white font-semibold mb-4">Funcionalidades Premium</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-gray-300">Sessões com Nativos/Mês</Label>
                    <Input
                      type="number"
                      value={editingPlan.native_teacher_sessions}
                      onChange={(e) => updateEditingPlan('native_teacher_sessions', parseInt(e.target.value) || 0)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Streak Freezes/Semana</Label>
                    <Input
                      type="number"
                      value={editingPlan.streak_freeze}
                      onChange={(e) => updateEditingPlan('streak_freeze', parseInt(e.target.value) || 0)}
                      className="bg-customgreys-darkGrey border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="border-gray-600 text-gray-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans List */}
        {!editingPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 ${
                  plan.is_most_popular ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getPlanBadgeColor(plan.plan_type)} text-white`}>
                        {plan.name}
                      </Badge>
                      {plan.is_most_popular && (
                        <Badge className="bg-yellow-500 text-black">
                          Mais Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPlan(plan)}
                        className="border-gray-600 text-gray-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {plan.plan_type !== 'FREE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    {formatCurrency(plan.monthly_price)}/mês
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing Info */}
                  {parseFloat(plan.yearly_price) > 0 && (
                    <div className="p-3 bg-customgreys-darkGrey rounded-lg">
                      <div className="text-sm text-gray-300">
                        Anual: {formatCurrency(plan.yearly_price)}
                      </div>
                      <div className="text-xs text-green-400">
                        {plan.yearly_discount_percentage}% de desconto
                      </div>
                    </div>
                  )}

                  {/* Limits */}
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">Limitações:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {plan.daily_lessons_limit ? `${plan.daily_lessons_limit} lições/dia` : 'Ilimitado'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {plan.daily_speaking_minutes ? `${plan.daily_speaking_minutes}min Speaking` : 'Ilimitado'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {plan.daily_listening_minutes ? `${plan.daily_listening_minutes}min Listening` : 'Ilimitado'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {plan.hearts_limit ? `${plan.hearts_limit} vidas` : 'Infinitas'}
                      </div>
                    </div>
                  </div>

                  {/* Premium Features */}
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">Recursos:</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {[
                        { condition: plan.offline_downloads, icon: Download, label: 'Offline' },
                        { condition: plan.certificates, icon: Award, label: 'Certificados' },
                        { condition: plan.ai_tutor, icon: Bot, label: 'IA Tutor' },
                        { condition: plan.advanced_analytics, icon: BarChart3, label: 'Analytics' },
                        { condition: plan.priority_support, icon: UserCheck, label: 'Suporte VIP' },
                        { condition: plan.native_teacher_sessions > 0, icon: Users, label: `${plan.native_teacher_sessions} sessões` }
                      ].map(({ condition, icon: Icon, label }, index) => (
                        <div key={index} className={`flex items-center gap-1 ${condition ? 'text-green-400' : 'text-gray-500'}`}>
                          <Icon className="w-3 h-3" />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                    <Badge className={plan.is_active ? 'bg-green-500' : 'bg-red-500'}>
                      {plan.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Ordem: {plan.sort_order}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}