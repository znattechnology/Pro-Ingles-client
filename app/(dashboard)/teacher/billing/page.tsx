"use client";

import Loading from "@/components/course/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { useGetTransactionsQuery } from "@/state/api";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Download,
  Calendar,
  CreditCard,
  TrendingUp,
  DollarSign,
  Receipt,
  FileText
} from "lucide-react";

const TeacherBilling = () => {
  const [paymentType, setPaymentType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, this-month, last-month, this-year
  
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const { data: transactions, isLoading: isLoadingTransactions } =
    useGetTransactionsQuery(user?.id || "", {
      skip: !isAuthenticated || !user,
    });

  // Enhanced filtering and statistics
  const { filteredData, stats } = useMemo(() => {
    if (!transactions) return { filteredData: [], stats: { totalAmount: 0, totalTransactions: 0, averageTransaction: 0 } };

    let filtered = transactions.filter((transaction) => {
      // Payment type filter
      const matchesPaymentType = paymentType === "all" || transaction.paymentProvider === paymentType;
      
      // Search filter
      const matchesSearch = searchTerm === "" || 
        transaction.paymentProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatPrice(transaction.amount).toLowerCase().includes(searchTerm.toLowerCase());

      // Date filter
      const transactionDate = new Date(transaction.dateTime);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      let matchesDate = true;
      if (dateFilter === "this-month") {
        matchesDate = transactionDate >= startOfMonth;
      } else if (dateFilter === "last-month") {
        matchesDate = transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth;
      } else if (dateFilter === "this-year") {
        matchesDate = transactionDate >= startOfYear;
      }

      return matchesPaymentType && matchesSearch && matchesDate;
    });

    // Calculate statistics
    const totalAmount = filtered.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalTransactions = filtered.length;
    const averageTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

    return {
      filteredData: filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
      stats: { totalAmount, totalTransactions, averageTransaction }
    };
  }, [transactions, paymentType, searchTerm, dateFilter]);

  if (authLoading) return <Loading />;
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para visualizar suas informações de faturamento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Enhanced Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="h-4 w-px bg-violet-900/30" />
            <span className="text-gray-400 text-sm">Faturamento</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Histórico de Faturamento</h1>
            <p className="text-gray-400">Gerencie e visualize todas as suas transações financeiras</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Recebido</p>
                    <p className="text-xl font-semibold text-white">{formatPrice(stats.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Receipt className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total de Transações</p>
                    <p className="text-xl font-semibold text-white">{stats.totalTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-600/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Média por Transação</p>
                    <p className="text-xl font-semibold text-white">{formatPrice(stats.averageTransaction)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-customgreys-primarybg/40 backdrop-blur-sm rounded-lg border border-violet-900/30 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Pesquisar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px] bg-customgreys-darkGrey/50 border-violet-900/30 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="bg-customgreys-primarybg border-violet-900/30">
                    <SelectItem value="all" className="text-white hover:bg-violet-800/20">Todos</SelectItem>
                    <SelectItem value="this-month" className="text-white hover:bg-violet-800/20">Este Mês</SelectItem>
                    <SelectItem value="last-month" className="text-white hover:bg-violet-800/20">Mês Passado</SelectItem>
                    <SelectItem value="this-year" className="text-white hover:bg-violet-800/20">Este Ano</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger className="w-[140px] bg-customgreys-darkGrey/50 border-violet-900/30 text-white">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent className="bg-customgreys-primarybg border-violet-900/30">
                    <SelectItem value="all" className="text-white hover:bg-violet-800/20">Todos</SelectItem>
                    <SelectItem value="stripe" className="text-white hover:bg-violet-800/20">Stripe</SelectItem>
                    <SelectItem value="paypal" className="text-white hover:bg-violet-800/20">PayPal</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="border-violet-900/30 text-gray-300 hover:text-white hover:bg-violet-800/20"
                  onClick={() => {
                    // Export functionality could be added here
                    console.log('Export transactions');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="bg-customgreys-secondarybg/40 border-violet-900/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Transações ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <Loading />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-violet-900/30">
                      <TableHead className="text-gray-300">Data</TableHead>
                      <TableHead className="text-gray-300">Montante</TableHead>
                      <TableHead className="text-gray-300">Método</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((transaction) => (
                        <TableRow
                          key={transaction.transactionId}
                          className="border-violet-900/30 hover:bg-customgreys-darkGrey/20"
                        >
                          <TableCell className="text-white">
                            <div className="flex flex-col">
                              <span>{new Date(transaction.dateTime).toLocaleDateString('pt-PT')}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(transaction.dateTime).toLocaleTimeString('pt-PT', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-400">
                              {formatPrice(transaction.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={cn(
                                "text-xs",
                                transaction.paymentProvider === "stripe" 
                                  ? "border-purple-500/30 text-purple-400 bg-purple-500/10"
                                  : "border-blue-500/30 text-blue-400 bg-blue-500/10"
                              )}
                            >
                              {transaction.paymentProvider}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                              Concluída
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Receipt className="w-12 h-12 text-gray-500" />
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-2">
                                Nenhuma transação encontrada
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {searchTerm || paymentType !== "all" || dateFilter !== "all"
                                  ? "Tente ajustar seus filtros"
                                  : "Suas transações aparecerão aqui quando disponíveis"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherBilling;
