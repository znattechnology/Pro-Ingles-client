"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Receipt,
  Settings,
  Plus
} from "lucide-react";
import Link from "next/link";

// Mock data - replace with real API calls
const mockStats = {
  totalSubscribers: 1247,
  monthlyRevenue: 18675000, // em AOA
  conversionRate: 4.2,
  churnRate: 2.8,
  freeUsers: 8543,
  premiumUsers: 897,
  premiumPlusUsers: 350,
  promoCodes: 12
};

const mockRecentSubscriptions = [
  {
    id: 1,
    userName: "Ana Silva",
    planType: "PREMIUM_PLUS",
    planName: "Premium Plus",
    amount: 24950,
    date: "2024-01-15",
    status: "active"
  },
  {
    id: 2,
    userName: "João Santos",
    planType: "PREMIUM",
    planName: "Premium", 
    amount: 14950,
    date: "2024-01-14",
    status: "active"
  },
  {
    id: 3,
    userName: "Maria Costa",
    planType: "PREMIUM",
    planName: "Premium",
    amount: 14950,
    date: "2024-01-13",
    status: "trial"
  }
];

export default function AdminSubscriptionsPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'FREE': return 'bg-gray-500';
      case 'PREMIUM': return 'bg-blue-500';
      case 'PREMIUM_PLUS': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              Gestão de Assinaturas
            </h1>
            <p className="text-gray-300 mt-2">
              Gerencie planos, assinantes e relatórios financeiros
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/admin/subscriptions/promo-codes">
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Receipt className="w-4 h-4 mr-2" />
                Códigos Promo
              </Button>
            </Link>
            <Link href="/admin/subscriptions/plans">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Planos
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Assinantes</p>
                  <p className="text-2xl font-bold text-white">{mockStats.totalSubscribers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Receita Mensal</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.monthlyRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Taxa Conversão</p>
                  <p className="text-2xl font-bold text-white">{mockStats.conversionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Taxa Churn</p>
                  <p className="text-2xl font-bold text-white">{mockStats.churnRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Planos Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Distribuição por Plano
              </CardTitle>
              <CardDescription>
                Número de usuários em cada plano de assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-gray-300">Gratuito</span>
                </div>
                <div className="text-white font-bold">{mockStats.freeUsers.toLocaleString()}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-300">Premium</span>
                </div>
                <div className="text-white font-bold">{mockStats.premiumUsers.toLocaleString()}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-gray-300">Premium Plus</span>
                </div>
                <div className="text-white font-bold">{mockStats.premiumPlusUsers.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardHeader>
              <CardTitle className="text-white">Assinaturas Recentes</CardTitle>
              <CardDescription>
                Últimas ativações e upgrades de planos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentSubscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-customgreys-darkGrey rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold">{sub.userName}</span>
                        <span className="text-gray-400 text-sm">{new Date(sub.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={`${getPlanBadgeColor(sub.planType)} text-white`}>
                        {sub.planName}
                      </Badge>
                      <Badge className={`${getStatusBadgeColor(sub.status)} text-white`}>
                        {sub.status === 'active' ? 'Ativo' : 'Trial'}
                      </Badge>
                      <span className="text-white font-bold min-w-0">
                        {formatCurrency(sub.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <Link href="/admin/subscriptions/users">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-blue-600">
                    Ver Todos os Assinantes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/subscriptions/plans">
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-800 hover:border-blue-600 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-xl font-bold text-white mb-2">Gerenciar Planos</h3>
                <p className="text-gray-300">Editar preços, recursos e limitações dos planos</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/subscriptions/reports">
            <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-800 hover:border-green-600 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-bold text-white mb-2">Relatórios</h3>
                <p className="text-gray-300">Analytics e métricas de performance</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/subscriptions/promo-codes">
            <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-800 hover:border-orange-600 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                <h3 className="text-xl font-bold text-white mb-2">Códigos Promo</h3>
                <p className="text-gray-300">Criar e gerenciar códigos promocionais</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}