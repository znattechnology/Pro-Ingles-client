"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Download,
  CreditCard,
  FileText,
  Eye,
  Banknote,
  Clock
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';

// Mock data for internal teacher earnings
const mockEarningsData = {
  currentMonth: {
    amount: 2850.50,
    students: 45,
    courses: 3,
    hoursCreated: 12.5
  },
  totalEarnings: 18420.75,
  paymentInfo: {
    method: "Transferência Bancária",
    nextPaymentDate: "2024-02-01",
    bankAccount: "****-****-****-1234"
  },
  recentPayments: [
    { id: 1, date: "2024-01-01", amount: 2650.30, status: "pago", month: "Janeiro 2024" },
    { id: 2, date: "2023-12-01", amount: 2980.75, status: "pago", month: "Dezembro 2023" },
    { id: 3, date: "2023-11-01", amount: 2420.15, status: "pago", month: "Novembro 2023" },
    { id: 4, date: "2023-10-01", amount: 2780.40, status: "pago", month: "Outubro 2023" },
    { id: 5, date: "2023-09-01", amount: 2590.85, status: "pago", month: "Setembro 2023" },
  ]
};

export default function TeacherBilling() {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  if (isLoading) return <Loading />;
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para visualizar suas informações de pagamento.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Modern Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-4 sm:py-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
        
        <div className='relative max-w-7xl mx-auto'>
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6"
            >
              <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-green-300 font-medium text-xs sm:text-sm">Pagamentos do Professor</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2"
            >
              Seus <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Ganhos</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4"
            >
              Acompanhe os seus ganhos mensais e histórico de pagamentos como professor da ProEnglish
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Earnings Overview */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-green-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-green-600/20 rounded-lg"
                >
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Este Mês</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{formatCurrency(mockEarningsData.currentMonth.amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-green-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-blue-600/20 rounded-lg"
                >
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Estudantes Ativos</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{mockEarningsData.currentMonth.students}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-green-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-orange-600/20 rounded-lg"
                >
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Cursos Criados</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{mockEarningsData.currentMonth.courses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-green-900/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 sm:p-3 bg-purple-600/20 rounded-lg"
                >
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Total Ganho</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{formatCurrency(mockEarningsData.totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Information */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-green-900/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                Informações de Pagamento
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs sm:text-sm">
                Método de pagamento e próximas transferências
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Método de Pagamento</p>
                      <p className="text-sm sm:text-base font-medium text-white">{mockEarningsData.paymentInfo.method}</p>
                    </div>
                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Conta Bancária</p>
                      <p className="text-sm sm:text-base font-medium text-white">{mockEarningsData.paymentInfo.bankAccount}</p>
                    </div>
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Próximo Pagamento</p>
                      <p className="text-sm sm:text-base font-medium text-white">1 de Fevereiro, 2024</p>
                    </div>
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Status</p>
                      <Badge className="bg-green-600 text-white text-xs">Ativo</Badge>
                    </div>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-green-900/30">
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Histórico de Pagamentos
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Últimos pagamentos recebidos
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-green-600/30 text-green-300 hover:bg-green-600/20 text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {mockEarningsData.recentPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center justify-between p-3 sm:p-4 bg-customgreys-darkGrey/20 rounded-lg border border-gray-600/20 hover:bg-customgreys-darkGrey/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 bg-green-600/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-medium text-white">{payment.month}</p>
                        <p className="text-xs sm:text-sm text-gray-400">{new Date(payment.date).toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-semibold text-green-400">{formatCurrency(payment.amount)}</p>
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
