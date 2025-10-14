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
      const response = await fetch('/api/v1/subscriptions?endpoint=analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Falha ao carregar dados da assinatura');
      }
    } catch (err) {
      setError('Erro de conexão');
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
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300">Carregando sua assinatura...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-300 mb-4">{error || 'Falha ao carregar dados'}</p>
            <Button onClick={fetchAnalytics} variant="outline" className="border-gray-600 text-gray-300">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { subscription, usage, features } = analytics;

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              Minha Assinatura
            </h1>
            <p className="text-gray-300 mt-2">
              Gerencie seu plano e acompanhe seu uso
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/user/upgrade">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <ArrowUp className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </Link>
          </div>
        </div>

        {/* Subscription Status */}
        <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Plano {subscription.plan_name}
                  <Badge className={`${getPlanBadgeColor(subscription.plan_type)} text-white ml-2`}>
                    {subscription.plan_type}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <span className={getStatusColor(subscription.status)}>
                    {subscription.is_active ? (
                      <><CheckCircle className="w-4 h-4 inline mr-1" />Ativo</>
                    ) : (
                      <><AlertCircle className="w-4 h-4 inline mr-1" />Inativo</>
                    )}
                  </span>
                  {subscription.is_trial && (
                    <Badge className="bg-orange-600">Trial</Badge>
                  )}
                </CardDescription>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>Expira em</span>
                </div>
                <div className="text-white font-bold">
                  {subscription.days_remaining} dias
                </div>
                <div className="text-sm text-gray-400">
                  {formatDate(subscription.expires_at)}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Lessons */}
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Lições</span>
                </div>
                <Badge className={usage.lessons.can_use ? 'bg-green-600' : 'bg-red-600'}>
                  {usage.lessons.can_use ? 'Disponível' : 'Esgotado'}
                </Badge>
              </div>
              
              {usage.lessons.unlimited ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">∞</div>
                  <div className="text-sm text-gray-400">Ilimitado</div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    {usage.lessons.used} / {usage.lessons.limit}
                  </div>
                  <Progress 
                    value={usage.lessons.percentage} 
                    className="h-2 bg-gray-700"
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Speaking</span>
                </div>
                <Badge className={usage.speaking.can_use ? 'bg-green-600' : 'bg-red-600'}>
                  {usage.speaking.can_use ? 'Disponível' : 'Esgotado'}
                </Badge>
              </div>
              
              {usage.speaking.unlimited ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">∞</div>
                  <div className="text-sm text-gray-400">Ilimitado</div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    {usage.speaking.used} / {usage.speaking.limit} min
                  </div>
                  <Progress 
                    value={usage.speaking.percentage} 
                    className="h-2 bg-gray-700"
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Listening</span>
                </div>
                <Badge className={usage.listening.can_use ? 'bg-green-600' : 'bg-red-600'}>
                  {usage.listening.can_use ? 'Disponível' : 'Esgotado'}
                </Badge>
              </div>
              
              {usage.listening.unlimited ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">∞</div>
                  <div className="text-sm text-gray-400">Ilimitado</div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    {usage.listening.used} / {usage.listening.limit} min
                  </div>
                  <Progress 
                    value={usage.listening.percentage} 
                    className="h-2 bg-gray-700"
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Vidas</span>
                </div>
                <Badge className={usage.hearts.current > 0 ? 'bg-green-600' : 'bg-red-600'}>
                  {usage.hearts.current > 0 ? 'Disponível' : 'Recarregando'}
                </Badge>
              </div>
              
              {usage.hearts.unlimited ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">∞</div>
                  <div className="text-sm text-gray-400">Infinitas</div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    {usage.hearts.current} / {usage.hearts.limit}
                  </div>
                  <Progress 
                    value={(usage.hearts.current / usage.hearts.limit) * 100} 
                    className="h-2 bg-gray-700"
                  />
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recarga a cada {usage.hearts.recharge_hours}h
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Recursos do Seu Plano
            </CardTitle>
            <CardDescription>
              Funcionalidades disponíveis na sua assinatura atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { key: 'offline_downloads', label: 'Downloads Offline', icon: ArrowUp, enabled: features.offline_downloads },
                { key: 'certificates', label: 'Certificados', icon: Award, enabled: features.certificates },
                { key: 'ai_tutor', label: 'IA Tutor', icon: Bot, enabled: features.ai_tutor },
                { key: 'advanced_analytics', label: 'Analytics Avançado', icon: TrendingUp, enabled: features.advanced_analytics },
                { key: 'priority_support', label: 'Suporte Prioritário', icon: CheckCircle, enabled: features.priority_support },
                { key: 'multiple_devices', label: `${features.multiple_devices} Dispositivos`, icon: Settings, enabled: features.multiple_devices > 1 }
              ].map(({ key, label, icon: Icon, enabled }) => (
                <div 
                  key={key}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    enabled ? 'bg-green-900/30 border border-green-600/30' : 'bg-gray-800/30 border border-gray-600/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${enabled ? 'text-green-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${enabled ? 'text-green-300' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {enabled ? (
                    <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-500 ml-auto" />
                  )}
                </div>
              ))}
              
              {features.native_teacher_sessions > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-900/30 border border-purple-600/30">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">
                    {features.native_teacher_sessions} Sessões com Nativos/Mês
                  </span>
                  <CheckCircle className="w-4 h-4 text-purple-400 ml-auto" />
                </div>
              )}
              
              {features.streak_freeze > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-900/30 border border-blue-600/30">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">
                    {features.streak_freeze} Freeze/Semana
                  </span>
                  <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {subscription.plan_type === 'FREE' && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-2 border-purple-600/30">
            <CardContent className="p-8 text-center">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Desbloqueie Todo Seu Potencial
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Faça upgrade para Premium e tenha acesso ilimitado a lições, 
                speaking practice, listening practice e muito mais!
              </p>
              <Link href="/user/upgrade">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <ArrowUp className="w-5 h-5 mr-2" />
                  Ver Planos Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}