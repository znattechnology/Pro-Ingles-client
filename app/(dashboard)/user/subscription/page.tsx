"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Calendar,
  Zap,
  Heart,
  Users,
  Headphones,
  ArrowUp,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Bot
} from "lucide-react";
import Link from "next/link";
import Loading from "@/components/course/Loading";

interface SubscriptionAnalytics {
  subscription: {
    plan_name: string;
    plan_type: string;
    status: string;
    expires_at: string;
    days_remaining: number;
    is_trial: boolean;
    is_active: boolean;
  };
  usage: {
    lessons: {
      used: number;
      limit: number;
      unlimited: boolean;
      percentage: number;
      can_use: boolean;
    };
    speaking: {
      used: number;
      limit: number;
      unlimited: boolean;
      percentage: number;
      can_use: boolean;
    };
    listening: {
      used: number;
      limit: number;
      unlimited: boolean;
      percentage: number;
      can_use: boolean;
    };
    hearts: {
      current: number;
      limit: number;
      unlimited: boolean;
      percentage: number;
      recharge_hours: number;
      last_recharge: string;
    };
  };
  features: {
    offline_downloads: boolean;
    certificates: boolean;
    ai_tutor: boolean;
    native_teacher_sessions: number;
    advanced_analytics: boolean;
    priority_support: boolean;
    streak_freeze: number;
    multiple_devices: number;
  };
}

export default function MySubscriptionPage() {
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/subscriptions?endpoint=analytics', {
        credentials: 'include', // Ensure HttpOnly cookies are sent
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else if (response.status === 401) {
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError('Falha ao carregar dados da subscrição');
      }
    } catch (err) {
      setError('Erro de ligação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'FREE': return 'bg-gray-500';
      case 'PREMIUM': return 'bg-blue-500';
      case 'PREMIUM_PLUS': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400';
      case 'expired': return 'text-red-400';
      case 'canceled': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Loading 
        title="Minha Assinatura"
        subtitle="Planos & Benefícios"
        description="Carregando informações da sua assinatura..."
        icon={Crown}
        progress={60}
      />
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-red-300 mb-3 sm:mb-4 text-sm sm:text-base">{error || 'Falha ao carregar dados'}</p>
            <Button onClick={fetchAnalytics} variant="outline" className="border-gray-600 text-gray-300 w-full sm:w-auto">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { subscription, usage, features } = analytics;

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              Minha Subscrição
            </h1>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">
              Gira o seu plano e acompanha o seu uso
            </p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/user/upgrade" className="w-full sm:w-auto">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 w-full sm:w-auto">
                <ArrowUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Fazer Upgrade</span>
                <span className="sm:hidden">Upgrade</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Subscription Status */}
        <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="min-w-0">
                <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    <span className="text-lg sm:text-xl">Plano {subscription.plan_name}</span>
                  </div>
                  <Badge className={`${getPlanBadgeColor(subscription.plan_type)} text-white text-xs sm:text-sm`}>
                    {subscription.plan_type}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={getStatusColor(subscription.status)}>
                    {subscription.is_active ? (
                      <><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />Activo</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />Inactivo</>
                    )}
                  </span>
                  {subscription.is_trial && (
                    <Badge className="bg-orange-600 text-xs">Período de Teste</Badge>
                  )}
                </CardDescription>
              </div>
              
              <div className="text-left sm:text-right">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Expira em</span>
                </div>
                <div className="text-white font-bold text-lg sm:text-xl">
                  {subscription.days_remaining} dias
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {formatDate(subscription.expires_at)}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Lessons */}
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  <span className="text-gray-300 text-sm sm:text-base">Lições</span>
                </div>
                <Badge className={`${usage.lessons.can_use ? 'bg-green-600' : 'bg-red-600'} text-xs`}>
                  <span className="hidden sm:inline">{usage.lessons.can_use ? 'Disponível' : 'Esgotado'}</span>
                  <span className="sm:hidden">{usage.lessons.can_use ? 'OK' : 'X'}</span>
                </Badge>
              </div>
              
              {usage.lessons.unlimited ? (
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">∞</div>
                  <div className="text-xs sm:text-sm text-gray-400">Ilimitado</div>
                </div>
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                    {usage.lessons.used} / {usage.lessons.limit}
                  </div>
                  <Progress 
                    value={usage.lessons.percentage} 
                    className="h-1.5 sm:h-2 bg-gray-700"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {usage.lessons.percentage.toFixed(0)}% usado
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Speaking */}
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span className="text-gray-300 text-sm sm:text-base">Conversação</span>
                </div>
                <Badge className={`${usage.speaking.can_use ? 'bg-green-600' : 'bg-red-600'} text-xs`}>
                  <span className="hidden sm:inline">{usage.speaking.can_use ? 'Disponível' : 'Esgotado'}</span>
                  <span className="sm:hidden">{usage.speaking.can_use ? 'OK' : 'X'}</span>
                </Badge>
              </div>
              
              {usage.speaking.unlimited ? (
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">∞</div>
                  <div className="text-xs sm:text-sm text-gray-400">Ilimitado</div>
                </div>
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                    {usage.speaking.used} / {usage.speaking.limit} min
                  </div>
                  <Progress 
                    value={usage.speaking.percentage} 
                    className="h-1.5 sm:h-2 bg-gray-700"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {usage.speaking.percentage.toFixed(0)}% usado
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Listening */}
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span className="text-gray-300 text-sm sm:text-base">Audição</span>
                </div>
                <Badge className={`${usage.listening.can_use ? 'bg-green-600' : 'bg-red-600'} text-xs`}>
                  <span className="hidden sm:inline">{usage.listening.can_use ? 'Disponível' : 'Esgotado'}</span>
                  <span className="sm:hidden">{usage.listening.can_use ? 'OK' : 'X'}</span>
                </Badge>
              </div>
              
              {usage.listening.unlimited ? (
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">∞</div>
                  <div className="text-xs sm:text-sm text-gray-400">Ilimitado</div>
                </div>
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                    {usage.listening.used} / {usage.listening.limit} min
                  </div>
                  <Progress 
                    value={usage.listening.percentage} 
                    className="h-1.5 sm:h-2 bg-gray-700"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {usage.listening.percentage.toFixed(0)}% usado
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Hearts */}
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <span className="text-gray-300 text-sm sm:text-base">Vidas</span>
                </div>
                <Badge className={`${usage.hearts.current > 0 ? 'bg-green-600' : 'bg-red-600'} text-xs`}>
                  <span className="hidden sm:inline">{usage.hearts.current > 0 ? 'Disponível' : 'A carregar'}</span>
                  <span className="sm:hidden">{usage.hearts.current > 0 ? 'OK' : '⏳'}</span>
                </Badge>
              </div>
              
              {usage.hearts.unlimited ? (
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">∞</div>
                  <div className="text-xs sm:text-sm text-gray-400">Infinitas</div>
                </div>
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                    {usage.hearts.current} / {usage.hearts.limit}
                  </div>
                  <Progress 
                    value={(usage.hearts.current / usage.hearts.limit) * 100} 
                    className="h-1.5 sm:h-2 bg-gray-700"
                  />
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">Recarga a cada {usage.hearts.recharge_hours}h</span>
                    <span className="sm:hidden">+1 em {usage.hearts.recharge_hours}h</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              Recursos do Seu Plano
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Funcionalidades disponíveis na sua subscrição actual
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[
                { key: 'offline_downloads', label: 'Downloads Offline', icon: ArrowUp, enabled: features.offline_downloads },
                { key: 'certificates', label: 'Certificados', icon: Award, enabled: features.certificates },
                { key: 'ai_tutor', label: 'IA Professor', icon: Bot, enabled: features.ai_tutor },
                { key: 'advanced_analytics', label: 'Análises Avançadas', icon: TrendingUp, enabled: features.advanced_analytics },
                { key: 'priority_support', label: 'Suporte Prioritário', icon: CheckCircle, enabled: features.priority_support },
                { key: 'multiple_devices', label: `${features.multiple_devices} Dispositivos`, icon: Settings, enabled: features.multiple_devices > 1 }
              ].map(({ key, label, icon: Icon, enabled }) => (
                <div 
                  key={key}
                  className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg ${
                    enabled ? 'bg-green-900/30 border border-green-600/30' : 'bg-gray-800/30 border border-gray-600/30'
                  }`}
                >
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${enabled ? 'text-green-400' : 'text-gray-500'}`} />
                  <span className={`text-xs sm:text-sm flex-1 ${enabled ? 'text-green-300' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {enabled ? (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  )}
                </div>
              ))}
              
              {features.native_teacher_sessions > 0 && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-purple-900/30 border border-purple-600/30">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-purple-300 flex-1">
                    <span className="hidden sm:inline">{features.native_teacher_sessions} Sessões com Nativos/Mês</span>
                    <span className="sm:hidden">{features.native_teacher_sessions} Sessões/Mês</span>
                  </span>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                </div>
              )}
              
              {features.streak_freeze > 0 && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-blue-900/30 border border-blue-600/30">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-blue-300 flex-1">
                    <span className="hidden sm:inline">{features.streak_freeze} Congelamento/Semana</span>
                    <span className="sm:hidden">{features.streak_freeze} Freeze/Sem</span>
                  </span>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {subscription.plan_type === 'FREE' && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-2 border-purple-600/30">
            <CardContent className="p-6 sm:p-8 text-center">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Desbloqueie Todo o Seu Potencial
              </h2>
              <p className="text-gray-300 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                Faça upgrade para Premium e tenha acesso ilimitado a lições, 
                prática de conversação, prática de audição e muito mais com o ProEnglish!
              </p>
              <Link href="/user/upgrade">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto">
                  <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Ver Planos Premium</span>
                  <span className="sm:hidden">Planos Premium</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}