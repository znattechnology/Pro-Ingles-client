"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { motion } from 'framer-motion';
import {
  Receipt,
  Calendar,
  CreditCard,
  Download,
  Filter,
  DollarSign,
  FileText,
  ArrowDownToLine,
  Crown,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatPrice } from "@/lib/utils";
import { useGetTransactionsQuery, useGetSubscriptionHistoryQuery } from "@/state/api";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";

interface SubscriptionInfo {
  plan_name: string;
  plan_type: string;
  status: string;
  expires_at: string;
  started_at: string;
  days_remaining: number;
  is_trial: boolean;
  is_active: boolean;
}

interface SubscriptionPayment {
  id: string;
  event_type: 'PAYMENT_SUCCESS' | 'UPGRADED' | 'RENEWED' | 'CREATED' | 'TRIAL_STARTED';
  amount_paid: string;
  created_at: string;
  notes?: string;
  previous_plan?: string;
  new_plan?: string;
  discount_applied?: string;
}

interface CourseTransaction {
  transactionId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  dateTime: string;
  paymentProvider: string;
  payment_intent_id?: string;
  course?: {
    id: string;
    title: string;
  };
}

interface AllTransactions {
  subscription_payments: SubscriptionPayment[];
  course_purchases: CourseTransaction[];
  total_subscription_amount: string;
  total_course_amount: string;
}

const UserBilling = () => {
  const [paymentType, setPaymentType] = useState("all");
  const [transactionType, setTransactionType] = useState("all"); // subscription, course, all
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<AllTransactions>({
    subscription_payments: [],
    course_purchases: [],
    total_subscription_amount: "0",
    total_course_amount: "0"
  });
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  
  // Legacy course transactions
  const { data: courseTransactions, isLoading: isLoadingCourseTransactions } =
    useGetTransactionsQuery(user?.id || "", {
      skip: !isAuthenticated || !user,
    });
    
  // Subscription payment history  
  const { data: subscriptionPayments, isLoading: isLoadingSubscriptionPayments } =
    useGetSubscriptionHistoryQuery(user?.id || "", {
      skip: !isAuthenticated || !user,
    });

  // Combine and process transaction data
  useEffect(() => {
    if (!isLoadingCourseTransactions && !isLoadingSubscriptionPayments) {
      setTransactionsLoading(true);
      
      // Process course transactions
      const courses: CourseTransaction[] = (courseTransactions || []).map((t: any) => ({
        transactionId: t.transactionId,
        amount: t.amount,
        currency: t.currency || 'EUR',
        status: t.status,
        dateTime: t.dateTime,
        paymentProvider: t.paymentProvider,
        payment_intent_id: t.payment_intent_id,
        course: t.course
      }));
      
      // Create mock subscription payments for demonstration
      // In real implementation, this would use subscriptionPayments data
      const subscriptionMockData: SubscriptionPayment[] = subscriptionInfo ? [
        {
          id: 'sub_payment_1',
          event_type: 'PAYMENT_SUCCESS',
          amount_paid: '2500.00',
          created_at: subscriptionInfo.started_at,
          notes: `Pagamento da subscrição ${subscriptionInfo.plan_name}`,
          new_plan: subscriptionInfo.plan_name
        }
      ] : [];
      
      const totalCourseAmount = courses.reduce((sum, t) => sum + t.amount, 0).toString();
      const totalSubAmount = subscriptionMockData.reduce((sum, t) => sum + parseFloat(t.amount_paid), 0).toString();
      
      setAllTransactions({
        subscription_payments: subscriptionMockData,
        course_purchases: courses,
        total_subscription_amount: totalSubAmount,
        total_course_amount: totalCourseAmount
      });
      
      setTransactionsLoading(false);
    }
  }, [courseTransactions, subscriptionPayments, isLoadingCourseTransactions, isLoadingSubscriptionPayments, subscriptionInfo]);

  // Filter transactions based on type and payment method
  const getFilteredTransactions = () => {
    let filtered: (SubscriptionPayment | CourseTransaction)[] = [];
    
    if (transactionType === "all" || transactionType === "subscription") {
      filtered = [...filtered, ...allTransactions.subscription_payments];
    }
    
    if (transactionType === "all" || transactionType === "course") {
      const courseFiltered = allTransactions.course_purchases.filter(transaction => {
        return paymentType === "all" || transaction.paymentProvider === paymentType;
      });
      filtered = [...filtered, ...courseFiltered];
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date('dateTime' in a ? a.dateTime : a.created_at);
      const dateB = new Date('dateTime' in b ? b.dateTime : b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const filteredData = getFilteredTransactions();

  // Convert image to base64
  const getImageAsBase64 = async (imagePath: string): Promise<string> => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return '';
    }
  };

  // Generate invoice PDF
  const generateInvoice = async (transaction: SubscriptionPayment | CourseTransaction) => {
    const isSubscription = 'event_type' in transaction;
    const amount = isSubscription ? parseFloat(transaction.amount_paid) : transaction.amount;
    const date = isSubscription ? transaction.created_at : transaction.dateTime;
    const currency = isSubscription ? 'AOA' : (transaction.currency || 'EUR');
    const type = isSubscription ? 'Subscrição' : 'Curso';
    
    // Get logo as base64
    const logoBase64 = await getImageAsBase64('/logo/Logo_Preto.png');
    
    // Simple invoice generation using browser's print functionality
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura ProEnglish</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo-img { max-width: 200px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
            .logo-text { color: #7c3aed; font-size: 24px; font-weight: bold; margin-top: 10px; }
            .invoice-info { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            .total { text-align: right; margin: 20px 0; font-size: 18px; font-weight: bold; }
            .company-info { text-align: center; margin-bottom: 30px; }
            
            /* Print-specific styles */
            @media print {
              body { margin: 20px; }
              .logo-img { max-width: 150px; }
              .no-print { display: none; }
            }
            
            /* Fallback if logo doesn't load */
            .logo-fallback {
              color: #7c3aed;
              font-size: 32px;
              font-weight: bold;
              border: 2px solid #7c3aed;
              padding: 20px;
              border-radius: 10px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoBase64 ? 
              `<img src="${logoBase64}" alt="ProEnglish Logo" class="logo-img" />` : 
              `<div class="logo-fallback">ProEnglish</div>`
            }
            <div class="logo-text">ProEnglish</div>
            <h2>Factura de Pagamento</h2>
          </div>
          
          <div class="company-info">
            <p><strong>ProEnglish - Plataforma de Ensino de Inglês</strong></p>
            <p>Email: support@proenglish.ao | Website: www.proenglish.ao</p>
            <p>Angola - Luanda</p>
          </div>
          
          <div class="invoice-info">
            <p><strong>Data:</strong> ${new Date(date).toLocaleDateString('pt-AO')}</p>
            <p><strong>Tipo:</strong> ${type}</p>
            <p><strong>Cliente:</strong> ${user?.name || 'Cliente ProEnglish'}</p>
            <p><strong>Email:</strong> ${user?.email || 'cliente@proenglish.ao'}</p>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Quantidade</th>
                <th>Valor Unitário</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${isSubscription ? `Subscrição ${(transaction.new_plan || 'Premium').replace('Tuwi', 'ProEnglish')}` : 'Compra de Curso'}</td>
                <td>1</td>
                <td>${currency === 'AOA' ? `${amount.toFixed(2)} AOA` : `€${amount.toFixed(2)}`}</td>
                <td>${currency === 'AOA' ? `${amount.toFixed(2)} AOA` : `€${amount.toFixed(2)}`}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">
            Total: ${currency === 'AOA' ? `${amount.toFixed(2)} AOA` : `€${amount.toFixed(2)}`}
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #666;">
            <p>Obrigado por escolher a ProEnglish!</p>
            <p>Para questões relacionadas com esta factura, contacte-nos em support@proenglish.ao</p>
          </div>
        </body>
      </html>
    `;
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const fetchSubscriptionInfo = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await fetch('/api/v1/subscriptions?endpoint=analytics');
      if (response.ok) {
        const data = await response.json();
        if (data.subscription) {
          setSubscriptionInfo({
            ...data.subscription,
            started_at: data.subscription.started_at || new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Erro ao carregar informações da subscrição:', err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscriptionInfo();
    }
  }, [isAuthenticated, user]);

  // Initial loading management
  useEffect(() => {
    if (!authLoading && (!subscriptionLoading && !transactionsLoading)) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 1000); // Small delay to ensure smooth transition
      return () => clearTimeout(timer);
    }
  }, [authLoading, subscriptionLoading, transactionsLoading]);

  if (authLoading || initialLoading) {
    return (
      <Loading 
        title="Facturação"
        subtitle="Transações & Pagamentos"
        description="Carregando histórico de pagamentos..."
        icon={Receipt}
        progress={70}
      />
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para visualizar as suas informações de facturação.</p>
        </div>
      </div>
    );
  }

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
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
        
        <div className='relative max-w-7xl mx-auto'>
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6"
            >
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
              <span className="text-violet-300 font-medium text-xs sm:text-sm">Facturação</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2"
            >
              Histórico de <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Pagamentos</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4"
            >
              Consulte o seu histórico de transações e gerencie as suas facturas da plataforma ProEnglish
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Subscription Information Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                Informações da Subscrição
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs sm:text-sm md:text-base">
                Detalhes da sua subscrição actual na plataforma ProEnglish
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6">
              {subscriptionInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Plan Information */}
                  <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-white font-semibold text-sm sm:text-base">Plano Actual</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-bold text-lg sm:text-xl">
                        {subscriptionInfo.plan_name.replace('Tuwi', 'ProEnglish')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`text-xs ${
                            subscriptionInfo.is_active 
                              ? 'bg-green-600/20 text-green-300' 
                              : 'bg-red-600/20 text-red-300'
                          }`}
                        >
                          {subscriptionInfo.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {subscriptionInfo.is_trial && (
                          <Badge className="bg-blue-600/20 text-blue-300 text-xs">
                            Período de Teste
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <h3 className="text-white font-semibold text-sm sm:text-base">Data de Início</h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold text-base sm:text-lg">
                        {new Date(subscriptionInfo.started_at).toLocaleDateString('pt-AO', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Início da subscrição
                      </p>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <h3 className="text-white font-semibold text-sm sm:text-base">Data de Expiração</h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold text-base sm:text-lg">
                        {new Date(subscriptionInfo.expires_at).toLocaleDateString('pt-AO', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className={`text-xs sm:text-sm font-medium ${
                        subscriptionInfo.days_remaining <= 7 
                          ? 'text-red-400' 
                          : subscriptionInfo.days_remaining <= 30 
                          ? 'text-orange-400' 
                          : 'text-green-400'
                      }`}>
                        {subscriptionInfo.days_remaining > 0 
                          ? `${subscriptionInfo.days_remaining} dias restantes`
                          : 'Expirada'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRight className="w-4 h-4 text-violet-400" />
                      <h3 className="text-white font-semibold text-sm sm:text-base">Acções</h3>
                    </div>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        className="w-full bg-violet-600 hover:bg-violet-700 text-xs sm:text-sm"
                        onClick={() => window.location.href = '/user/subscription'}
                      >
                        Ver Detalhes
                      </Button>
                      {subscriptionInfo.plan_type === 'FREE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600/20 text-xs sm:text-sm"
                          onClick={() => window.location.href = '/user/upgrade'}
                        >
                          Fazer Upgrade
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <p className="text-white font-medium text-sm sm:text-base">
                    Não foi possível carregar informações da subscrição
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Tente actualizar a página ou contacte o suporte
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                Transações e Facturas
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs sm:text-sm md:text-base">
                Histórico completo das suas transações na plataforma ProEnglish
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Filter Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Filtrar por:</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-customgreys-darkGrey border-gray-600 text-white text-sm">
                      <SelectValue placeholder="Tipo de transação" />
                    </SelectTrigger>
                    <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                      <SelectItem className="text-white hover:bg-violet-600/20 text-sm" value="all">
                        Todas as transações
                      </SelectItem>
                      <SelectItem className="text-white hover:bg-violet-600/20 text-sm" value="subscription">
                        Subscrições
                      </SelectItem>
                      <SelectItem className="text-white hover:bg-violet-600/20 text-sm" value="course">
                        Cursos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-customgreys-darkGrey border-gray-600 text-white text-sm">
                      <SelectValue placeholder="Método de pagamento" />
                    </SelectTrigger>
                    <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                      <SelectItem className="text-white hover:bg-violet-600/20 text-sm" value="all">
                        Todos os métodos
                      </SelectItem>
                      <SelectItem className="text-white hover:bg-violet-600/20 text-sm" value="stripe">
                        Stripe
                      </SelectItem>
                      <SelectItem className="text-white hover:bg-violet-600/20 text-sm" value="paypal">
                        PayPal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 text-sm hover:bg-violet-600/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Exportar</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-lg border border-gray-600 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-customgreys-darkGrey">
                        <TableRow className="border-gray-600 hover:bg-transparent">
                          <TableHead className="text-gray-300 font-semibold p-3 sm:p-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              Data
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-300 font-semibold p-3 sm:p-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Tipo</span>
                              <span className="sm:hidden">Tipo</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-300 font-semibold p-3 sm:p-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                              Valor
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-300 font-semibold p-3 sm:p-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Método</span>
                              <span className="sm:hidden">Método</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-300 font-semibold p-3 sm:p-4 text-xs sm:text-sm text-center">
                            <span className="hidden sm:inline">Factura</span>
                            <span className="sm:hidden">PDF</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-customgreys-primarybg">
                        {filteredData.length > 0 ? (
                          filteredData.map((transaction, index) => {
                            const isSubscription = 'event_type' in transaction;
                            const amount = isSubscription ? parseFloat(transaction.amount_paid) : transaction.amount;
                            const date = isSubscription ? transaction.created_at : transaction.dateTime;
                            const key = isSubscription ? transaction.id : transaction.transactionId;
                            const currency = isSubscription ? 'AOA' : (transaction.currency || 'EUR');
                            
                            return (
                              <motion.tr
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="border-gray-600 hover:bg-violet-500/5 transition-colors"
                              >
                                <TableCell className="p-3 sm:p-4 text-white text-xs sm:text-sm">
                                  {new Date(date).toLocaleDateString('pt-AO', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </TableCell>
                                <TableCell className="p-3 sm:p-4 text-xs sm:text-sm">
                                  <Badge 
                                    variant="secondary"
                                    className={`text-xs ${
                                      isSubscription 
                                        ? 'bg-green-600/20 text-green-300'
                                        : 'bg-blue-600/20 text-blue-300'
                                    }`}
                                  >
                                    {isSubscription ? 'Subscrição' : 'Curso'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="p-3 sm:p-4 text-white font-medium text-xs sm:text-sm">
                                  {currency === 'AOA' 
                                    ? `${amount.toFixed(2)} AOA`
                                    : formatPrice(amount)
                                  }
                                </TableCell>
                                <TableCell className="p-3 sm:p-4 text-xs sm:text-sm">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${
                                      isSubscription
                                        ? 'bg-purple-600/20 text-purple-300'
                                        : transaction.paymentProvider?.toLowerCase() === 'stripe' 
                                          ? 'bg-blue-600/20 text-blue-300' 
                                          : 'bg-purple-600/20 text-purple-300'
                                    }`}
                                  >
                                    {isSubscription ? 'Stripe' : transaction.paymentProvider}
                                  </Badge>
                                </TableCell>
                                <TableCell className="p-3 sm:p-4 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-violet-400 hover:text-violet-300 text-xs"
                                    onClick={() => {
                                      generateInvoice(transaction).catch(error => {
                                        console.error('Erro ao gerar factura:', error);
                                        console.log('Gerando factura para transação:', transaction);
                                      });
                                    }}
                                  >
                                    <ArrowDownToLine className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline ml-1">Factura</span>
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            );
                          })
                        ) : (
                          <TableRow className="border-gray-600">
                            <TableCell
                              className="p-8 sm:p-12 text-center text-gray-400"
                              colSpan={5}
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center gap-3"
                              >
                                <div className="bg-gray-600/20 rounded-full p-4">
                                  <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm sm:text-base">Nenhuma transação encontrada</p>
                                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                    Não há transações para o filtro seleccionado
                                  </p>
                                </div>
                              </motion.div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
              </div>

              {/* Summary Stats */}
              {filteredData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-600"
                >
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm">Total de Transações</p>
                    <p className="text-white font-bold text-lg sm:text-xl">{filteredData.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm">Gastos em Subscrições</p>
                    <p className="text-green-400 font-bold text-sm sm:text-lg">
                      {parseFloat(allTransactions.total_subscription_amount).toFixed(2)} AOA
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm">Gastos em Cursos</p>
                    <p className="text-blue-400 font-bold text-sm sm:text-lg">
                      {formatPrice(parseFloat(allTransactions.total_course_amount))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm">Última Transação</p>
                    <p className="text-white font-bold text-sm sm:text-base">
                      {filteredData.length > 0 
                        ? new Date(Math.max(...filteredData.map(t => {
                            const date = 'event_type' in t ? t.created_at : t.dateTime;
                            return new Date(date).getTime();
                          }))).toLocaleDateString('pt-AO')
                        : '-'
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UserBilling;
