"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  DollarSign,
  Users,
  Crown,
  Download,
  RefreshCw,
  FileText,
  PieChart,
  LineChart,
  AlertCircle,
  Target,
  ArrowUp,
  ArrowDown,
  Activity
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportData {
  overview: {
    total_revenue: string;
    total_subscriptions: number;
    active_subscriptions: number;
    trial_subscriptions: number;
    canceled_subscriptions: number;
    conversion_rate: number;
    monthly_growth_rate: number;
    churn_rate: number;
    average_revenue_per_user: string;
  };
  revenue_by_month: Array<{
    month: string;
    revenue: string;
    subscriptions: number;
  }>;
  plan_distribution: Array<{
    plan_type: string;
    plan_name: string;
    count: number;
    percentage: number;
    revenue: string;
  }>;
  user_acquisition: Array<{
    date: string;
    new_users: number;
    new_subscriptions: number;
    trial_conversions: number;
  }>;
  retention_metrics: {
    day_1: number;
    day_7: number;
    day_30: number;
    day_90: number;
  };
  geographic_data: Array<{
    location: string;
    users: number;
    revenue: string;
  }>;
}

export default function AdminSubscriptionReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("last_30_days");

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use mock data since the backend endpoint might not exist
      // In production, this would call the actual API endpoint
      const mockData: ReportData = {
        overview: {
          total_revenue: "1,250,000.00",
          total_subscriptions: 847,
          active_subscriptions: 623,
          trial_subscriptions: 98,
          canceled_subscriptions: 126,
          conversion_rate: 73.5,
          monthly_growth_rate: 12.8,
          churn_rate: 3.2,
          average_revenue_per_user: "15,750.00"
        },
        revenue_by_month: [
          { month: "Jan 2024", revenue: "85,000.00", subscriptions: 45 },
          { month: "Fev 2024", revenue: "92,500.00", subscriptions: 52 },
          { month: "Mar 2024", revenue: "108,000.00", subscriptions: 63 },
          { month: "Abr 2024", revenue: "125,000.00", subscriptions: 71 },
          { month: "Mai 2024", revenue: "134,500.00", subscriptions: 78 },
          { month: "Jun 2024", revenue: "156,000.00", subscriptions: 89 }
        ],
        plan_distribution: [
          { plan_type: "FREE", plan_name: "Gratuito", count: 1247, percentage: 68.2, revenue: "0.00" },
          { plan_type: "PREMIUM", plan_name: "Premium", count: 423, percentage: 23.1, revenue: "845,000.00" },
          { plan_type: "PREMIUM_PLUS", plan_name: "Premium Plus", count: 156, percentage: 8.7, revenue: "405,000.00" }
        ],
        user_acquisition: [
          { date: "2024-06-01", new_users: 23, new_subscriptions: 12, trial_conversions: 8 },
          { date: "2024-06-02", new_users: 31, new_subscriptions: 18, trial_conversions: 11 },
          { date: "2024-06-03", new_users: 28, new_subscriptions: 15, trial_conversions: 9 },
          { date: "2024-06-04", new_users: 35, new_subscriptions: 22, trial_conversions: 14 },
          { date: "2024-06-05", new_users: 41, new_subscriptions: 25, trial_conversions: 16 }
        ],
        retention_metrics: {
          day_1: 89.2,
          day_7: 67.8,
          day_30: 45.3,
          day_90: 32.1
        },
        geographic_data: [
          { location: "Luanda", users: 456, revenue: "680,000.00" },
          { location: "Benguela", users: 123, revenue: "185,000.00" },
          { location: "Huambo", users: 98, revenue: "147,000.00" },
          { location: "Lobito", users: 87, revenue: "131,000.00" },
          { location: "Outras", users: 236, revenue: "107,000.00" }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReportData(mockData);

    } catch (_err) {
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exporting report as ${format}`);
    // Implementation would generate and download the file
    alert(`Exportando relatório como ${format.toUpperCase()}...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <BarChart3 className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300">Gerando relatórios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-300">{error || 'Falha ao carregar relatórios'}</p>
            <Button onClick={fetchReportData} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
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
              <BarChart3 className="w-8 h-8 text-yellow-400" />
              Relatórios de Assinaturas
            </h1>
            <p className="text-gray-300 mt-2">
              Analytics detalhado de receita, usuários e performance
            </p>
          </div>
          
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48 bg-customgreys-secondarybg border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                <SelectItem value="last_90_days">Últimos 90 dias</SelectItem>
                <SelectItem value="last_year">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => handleExportReport('pdf')}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            
            <Button
              onClick={() => handleExportReport('excel')}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <FileText className="w-4 h-4 mr-2" />
              Excel
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

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Receita Total</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(reportData.overview.total_revenue)}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">
                      +{formatPercentage(reportData.overview.monthly_growth_rate)} vs. mês anterior
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Assinaturas Ativas</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {reportData.overview.active_subscriptions}
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    de {reportData.overview.total_subscriptions} total
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {formatPercentage(reportData.overview.conversion_rate)}
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    Trial → Assinatura paga
                  </div>
                </div>
                <Target className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Churn Rate</p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatPercentage(reportData.overview.churn_rate)}
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    Cancelamentos mensais
                  </div>
                </div>
                <Activity className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="bg-customgreys-secondarybg border-gray-600">
            <TabsTrigger value="revenue" className="text-gray-300">Receita</TabsTrigger>
            <TabsTrigger value="users" className="text-gray-300">Usuários</TabsTrigger>
            <TabsTrigger value="plans" className="text-gray-300">Planos</TabsTrigger>
            <TabsTrigger value="retention" className="text-gray-300">Retenção</TabsTrigger>
            <TabsTrigger value="geography" className="text-gray-300">Geografia</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Receita por Mês
                </CardTitle>
                <CardDescription>
                  Crescimento da receita e número de assinaturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.revenue_by_month.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-customgreys-darkGrey rounded-lg">
                      <div>
                        <div className="text-white font-medium">{item.month}</div>
                        <div className="text-gray-400 text-sm">{item.subscriptions} novas assinaturas</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-lg">
                          {formatCurrency(item.revenue)}
                        </div>
                        {index > 0 && (
                          <div className="flex items-center text-xs">
                            {parseFloat(item.revenue) > parseFloat(reportData.revenue_by_month[index - 1].revenue) ? (
                              <ArrowUp className="w-3 h-3 text-green-400 mr-1" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-red-400 mr-1" />
                            )}
                            <span className="text-gray-400">vs. mês anterior</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white">ARPU - Average Revenue Per User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {formatCurrency(reportData.overview.average_revenue_per_user)}
                  </div>
                  <p className="text-gray-400">Por usuário ativo/mês</p>
                </CardContent>
              </Card>

              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white">Crescimento Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    +{formatPercentage(reportData.overview.monthly_growth_rate)}
                  </div>
                  <p className="text-gray-400">Receita vs. mês anterior</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plans Distribution Tab */}
          <TabsContent value="plans" className="space-y-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribuição por Planos
                </CardTitle>
                <CardDescription>
                  Performance de cada plano de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.plan_distribution.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-customgreys-darkGrey rounded-lg">
                      <div className="flex items-center gap-3">
                        <Crown className={`w-5 h-5 ${
                          plan.plan_type === 'FREE' ? 'text-gray-400' :
                          plan.plan_type === 'PREMIUM' ? 'text-blue-400' : 'text-purple-400'
                        }`} />
                        <div>
                          <div className="text-white font-medium">{plan.plan_name}</div>
                          <div className="text-gray-400 text-sm">{plan.count} usuários</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {formatPercentage(plan.percentage)}
                        </div>
                        <div className="text-green-400 text-sm">
                          {formatCurrency(plan.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retention Tab */}
          <TabsContent value="retention" className="space-y-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Taxa de Retenção de Usuários
                </CardTitle>
                <CardDescription>
                  Percentual de usuários que permanecem ativos após o período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { period: '1 Dia', rate: reportData.retention_metrics.day_1, color: 'text-green-400' },
                    { period: '7 Dias', rate: reportData.retention_metrics.day_7, color: 'text-blue-400' },
                    { period: '30 Dias', rate: reportData.retention_metrics.day_30, color: 'text-yellow-400' },
                    { period: '90 Dias', rate: reportData.retention_metrics.day_90, color: 'text-red-400' }
                  ].map((item, index) => (
                    <div key={index} className="text-center p-4 bg-customgreys-darkGrey rounded-lg">
                      <div className={`text-2xl font-bold ${item.color}`}>
                        {formatPercentage(item.rate)}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">{item.period}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-6">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white">Distribuição Geográfica</CardTitle>
                <CardDescription>
                  Usuários e receita por localização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.geographic_data.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-customgreys-darkGrey rounded-lg">
                      <div>
                        <div className="text-white font-medium">{location.location}</div>
                        <div className="text-gray-400 text-sm">{location.users} usuários</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">
                          {formatCurrency(location.revenue)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {formatCurrency((parseFloat(location.revenue) / location.users).toString())}/usuário
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            onClick={() => handleExportReport('csv')}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Button
            onClick={() => handleExportReport('pdf')}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <FileText className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          
          <Button
            onClick={fetchReportData}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar Dados
          </Button>
        </div>
      </div>
    </div>
  );
}