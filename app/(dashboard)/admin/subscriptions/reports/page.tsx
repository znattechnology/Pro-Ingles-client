"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/course/Loading";
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
import { motion } from "framer-motion";

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
      
      // Fetch real data from Django backend
      const response = await fetch('/api/v1/subscriptions?endpoint=admin-reports');
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        console.error('Failed to fetch report data:', response.status);
        setError('Erro ao carregar dados de relatórios');
        
        // Fallback to mock data if API fails
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
        
        setReportData(mockData);
      }

    } catch (error) {
      console.error('Error fetching report data:', error);
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
      <Loading 
        title="Relatórios de Assinaturas"
        subtitle="Analytics & Métricas"
        description="Gerando relatórios e estatísticas..."
        icon={BarChart3}
        progress={85}
        theme={{
          primary: "green",
          secondary: "emerald",
          accent: "lime"
        }}
      />
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
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-green-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-lime-500/5 rounded-full blur-3xl" />
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-green-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-lime-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-emerald-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-lime-500/10 border border-emerald-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm shadow-lg shadow-emerald-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </motion.div>
              <span className="text-emerald-300 font-semibold text-sm sm:text-base lg:text-lg">Relatórios de Assinaturas</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight"
            >
              Analytics{' '}
              <motion.span 
                className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent"
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
                📊
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 font-light"
            >
              Analytics detalhado de <motion.span className="text-emerald-400 font-medium" whileHover={{ scale: 1.05 }}>receita</motion.span>,{' '}
              <motion.span className="text-green-400 font-medium" whileHover={{ scale: 1.05 }}>usuários</motion.span> e{' '}
              <motion.span className="text-lime-400 font-medium" whileHover={{ scale: 1.05 }}>performance</motion.span>
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-48 bg-customgreys-secondarybg/60 backdrop-blur-sm border-emerald-500/30 text-white hover:border-emerald-400/50 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                    <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                    <SelectItem value="last_90_days">Últimos 90 dias</SelectItem>
                    <SelectItem value="last_year">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleExportReport('pdf')}
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400/50 transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleExportReport('excel')}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </motion.div>
            </div>
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

        {/* Enhanced Overview Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {/* Total Revenue Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/30 via-customgreys-secondarybg/60 to-green-900/30 backdrop-blur-sm border border-emerald-500/30 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      className="text-sm font-medium text-emerald-300/80 mb-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      Receita Total
                    </motion.p>
                    <motion.p 
                      className="text-2xl font-bold text-white mb-1"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {formatCurrency(reportData.overview.total_revenue)}
                    </motion.p>
                    <motion.div 
                      className="flex items-center gap-1 text-xs text-emerald-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <ArrowUp className="w-3 h-3" />
                      <span>+{formatPercentage(reportData.overview.monthly_growth_rate)} vs. mês anterior</span>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-emerald-500/20 rounded-full border border-emerald-500/30"
                  >
                    <DollarSign className="w-6 h-6 text-emerald-400" />
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
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-900/30 via-customgreys-secondarybg/60 to-lime-900/30 backdrop-blur-sm border border-green-500/30 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
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
                      {reportData.overview.active_subscriptions}
                    </motion.p>
                    <motion.div 
                      className="flex items-center gap-1 text-xs text-green-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <Users className="w-3 h-3" />
                      <span>de {reportData.overview.total_subscriptions} total</span>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-green-500/20 rounded-full border border-green-500/30"
                  >
                    <Users className="w-6 h-6 text-green-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Conversion Rate Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-lime-900/30 via-customgreys-secondarybg/60 to-yellow-900/30 backdrop-blur-sm border border-lime-500/30 shadow-lg shadow-lime-500/10 hover:shadow-lime-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-lime-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      className="text-sm font-medium text-lime-300/80 mb-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      Taxa de Conversão
                    </motion.p>
                    <motion.p 
                      className="text-2xl font-bold text-white mb-1"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      {formatPercentage(reportData.overview.conversion_rate)}
                    </motion.p>
                    <motion.div 
                      className="flex items-center gap-1 text-xs text-lime-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 }}
                    >
                      <Target className="w-3 h-3" />
                      <span>Trial → Assinatura paga</span>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-lime-500/20 rounded-full border border-lime-500/30"
                  >
                    <Target className="w-6 h-6 text-lime-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Churn Rate Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-900/30 via-customgreys-secondarybg/60 to-orange-900/30 backdrop-blur-sm border border-red-500/30 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      className="text-sm font-medium text-red-300/80 mb-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      Churn Rate
                    </motion.p>
                    <motion.p 
                      className="text-2xl font-bold text-white mb-1"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    >
                      {formatPercentage(reportData.overview.churn_rate)}
                    </motion.p>
                    <motion.div 
                      className="flex items-center gap-1 text-xs text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 }}
                    >
                      <Activity className="w-3 h-3" />
                      <span>Cancelamentos mensais</span>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-red-500/20 rounded-full border border-red-500/30"
                  >
                    <Activity className="w-6 h-6 text-red-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Detailed Reports Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="bg-customgreys-secondarybg border-gray-600 grid grid-cols-3 sm:grid-cols-5 w-full">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Enhanced Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4 pt-6"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleExportReport('csv')}
              variant="outline"
              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400/50 transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleExportReport('pdf')}
              variant="outline"
              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400/50 transition-all duration-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={fetchReportData}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Dados
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}