"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Crown,
  Check,
  X,
  Zap,
  Heart,
  Clock,
  Users,
  Download,
  Award,
  Bot,
  UserCheck,
  BarChart3,
  Headphones,
  Smartphone,
  ArrowUp,
  DollarSign,
  Gift,
  CreditCard,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loading from "@/components/course/Loading";

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

interface CurrentSubscription {
  plan: SubscriptionPlan;
  status: string;
  expires_at: string;
  days_until_expiry: number;
  is_active_subscription: boolean;
}

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const preselectedPlanType = searchParams.get("plan"); // PREMIUM or PREMIUM_PLUS from landing page

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeValid, setPromoCodeValid] = useState<boolean | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [processing, setProcessing] = useState(false);

  // Fetch plans and current subscription
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch available plans
      const plansResponse = await fetch('/api/v1/subscriptions?endpoint=plans', {
        credentials: 'include',
      });
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData);
      }

      // Fetch current subscription (requires auth)
      const subscriptionResponse = await fetch('/api/v1/subscriptions?endpoint=my-subscription', {
        credentials: 'include',
      });
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setCurrentSubscription(subscriptionData);
      }

    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper function to get plan order (defined early for useEffect)
  const getPlanOrder = (planType: string) => {
    switch (planType) {
      case 'FREE': return 0;
      case 'PREMIUM': return 1;
      case 'PREMIUM_PLUS': return 2;
      default: return 0;
    }
  };

  // Pre-select plan from URL parameter (e.g., from landing page pricing cards)
  useEffect(() => {
    if (preselectedPlanType && plans.length > 0 && !selectedPlan && !loading) {
      const planToSelect = plans.find(p => p.plan_type === preselectedPlanType);
      if (planToSelect) {
        // Check if user can upgrade to this plan
        const canUpgradeToThis = !currentSubscription ||
          getPlanOrder(preselectedPlanType) > getPlanOrder(currentSubscription.plan.plan_type);

        if (canUpgradeToThis) {
          setSelectedPlan(planToSelect.id);
        }
      }
    }
  }, [plans, preselectedPlanType, selectedPlan, currentSubscription, loading]);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(num);
  };

  const calculatePrice = (plan: SubscriptionPlan) => {
    const basePrice = billingCycle === 'YEARLY' && plan.yearly_price
      ? parseFloat(plan.yearly_price)
      : parseFloat(plan.monthly_price);
    
    const discountAmount = (basePrice * discount) / 100;
    return basePrice - discountAmount;
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim() || !selectedPlan) return;

    try {
      const response = await fetch('/api/v1/subscriptions?endpoint=apply-promo-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          promo_code: promoCode,
          plan_id: selectedPlan
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPromoCodeValid(true);
        setDiscount(data.discount_amount);
      } else {
        setPromoCodeValid(false);
        setDiscount(0);
      }
    } catch (err) {
      setPromoCodeValid(false);
      setDiscount(0);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/v1/subscriptions?endpoint=upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: selectedPlan,
          billing_cycle: billingCycle,
          promo_code: promoCode || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh subscription data
        await fetchData();
        // Show success message
        alert(`Upgrade realizado com sucesso! Poupaste ${formatCurrency(data.discount_applied.toString())}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Falha no upgrade');
      }

    } catch (err) {
      setError('Erro ao processar upgrade');
    } finally {
      setProcessing(false);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'FREE': return Crown;
      case 'PREMIUM': return Sparkles;
      case 'PREMIUM_PLUS': return Bot;
      default: return Crown;
    }
  };

  const getPlanGradient = (planType: string) => {
    switch (planType) {
      case 'FREE': return 'from-gray-600 to-gray-700';
      case 'PREMIUM': return 'from-blue-600 to-purple-600';
      case 'PREMIUM_PLUS': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan.id === planId;
  };

  const canUpgrade = (planType: string) => {
    if (!currentSubscription) return true;

    const currentPlanOrder = getPlanOrder(currentSubscription.plan.plan_type);
    const targetPlanOrder = getPlanOrder(planType);

    return targetPlanOrder > currentPlanOrder;
  };

  if (loading) {
    return (
      <Loading 
        title="Upgrade Premium"
        subtitle="Planos & Assinaturas"
        description="Carregando planos disponíveis..."
        icon={Crown}
        progress={65}
      />
    );
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <ArrowUp className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            <span>Melhore a Sua Experiência</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Desbloqueie todo o potencial da sua aprendizagem de inglês com recursos premium do ProEnglish
          </p>
          
          {/* Current Plan Status */}
          {currentSubscription && (
            <div className="bg-customgreys-secondarybg/60 backdrop-blur-sm border border-violet-900/30 rounded-lg p-3 sm:p-4 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
                <Badge className="bg-blue-600 text-xs sm:text-sm">
                  Plano Actual: {currentSubscription.plan.name.replace('Tuwi', 'ProEnglish')}
                </Badge>
                {currentSubscription.days_until_expiry <= 7 && (
                  <Badge className="bg-orange-600 text-xs sm:text-sm">
                    Expira em {currentSubscription.days_until_expiry} dias
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Estado: {currentSubscription.is_active_subscription ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-900/50 border-red-700 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardContent className="p-3 sm:p-4">
              <RadioGroup 
                value={billingCycle} 
                onValueChange={(value) => setBillingCycle(value as "MONTHLY" | "YEARLY")}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MONTHLY" />
                  <Label className="text-gray-300 text-sm sm:text-base">Mensal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="YEARLY" />
                  <Label className="text-gray-300 text-sm sm:text-base">Anual</Label>
                  <Badge className="bg-green-600 text-white ml-2 text-xs">
                    <span className="hidden sm:inline">Economiza 16%</span>
                    <span className="sm:hidden">-16%</span>
                  </Badge>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan) => {
            const PlanIcon = getPlanIcon(plan.plan_type);
            const isCurrent = isCurrentPlan(plan.id);
            const canUpgradeToThis = canUpgrade(plan.plan_type);
            
            return (
              <Card 
                key={plan.id}
                className={`relative bg-customgreys-secondarybg/60 backdrop-blur-sm border-2 transition-all cursor-pointer
                  ${selectedPlan === plan.id ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-violet-900/30'}
                  ${plan.is_most_popular ? 'ring-2 ring-blue-400/50' : ''}
                  ${isCurrent ? 'ring-2 ring-green-400/50' : ''}
                  ${!canUpgradeToThis ? 'opacity-60' : ''}
                `}
                onClick={() => canUpgradeToThis && !isCurrent && setSelectedPlan(plan.id)}
              >
                {/* Popular Badge */}
                {plan.is_most_popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 sm:px-4 py-1 text-xs">
                      <span className="hidden sm:inline">Mais Popular</span>
                      <span className="sm:hidden">Popular</span>
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 sm:-top-4 right-2 sm:right-4">
                    <Badge className="bg-green-600 text-xs">
                      Actual
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-r ${getPlanGradient(plan.plan_type)} flex items-center justify-center mb-3 sm:mb-4`}>
                    <PlanIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                    {plan.name.replace('Tuwi', 'ProEnglish')}
                  </CardTitle>
                  
                  <div className="space-y-1 sm:space-y-2">
                    {plan.plan_type === 'FREE' ? (
                      <div className="text-2xl sm:text-3xl font-bold text-white">Gratuito</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-white">
                          {billingCycle === 'YEARLY' && plan.yearly_price
                            ? formatCurrency(plan.yearly_price)
                            : formatCurrency(plan.monthly_price)
                          }
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          {billingCycle === 'YEARLY' ? 'por ano' : 'por mês'}
                        </div>
                        
                        {billingCycle === 'YEARLY' && plan.yearly_discount_percentage > 0 && (
                          <Badge className="bg-green-600 text-xs">
                            {plan.yearly_discount_percentage}% OFF
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  
                  <CardDescription className="text-gray-300 text-sm sm:text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {/* Features List */}
                  <div className="space-y-2 sm:space-y-3">
                    {plan.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-xs sm:text-sm leading-tight">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.features.length > 6 && (
                      <div className="text-center">
                        <Badge variant="outline" className="text-gray-400 text-xs">
                          +{plan.features.length - 6} recursos extras
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 sm:pt-4">
                    {isCurrent ? (
                      <Button disabled className="w-full bg-gray-600 text-sm sm:text-base py-2 sm:py-3">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        <span className="hidden sm:inline">Plano Actual</span>
                        <span className="sm:hidden">Actual</span>
                      </Button>
                    ) : canUpgradeToThis ? (
                      <Button
                        className={`w-full bg-gradient-to-r ${getPlanGradient(plan.plan_type)} hover:scale-105 transition-transform text-sm sm:text-base py-2 sm:py-3`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {plan.plan_type === 'FREE' ? (
                          <><span className="hidden sm:inline">Fazer Downgrade</span><span className="sm:hidden">Downgrade</span></>
                        ) : (
                          <><span className="hidden sm:inline">Fazer Upgrade</span><span className="sm:hidden">Upgrade</span></>
                        )}
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-gray-600 text-sm sm:text-base py-2 sm:py-3">
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Indisponível
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Checkout Section */}
        {selectedPlan && selectedPlanData && (
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 max-w-2xl mx-auto">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Finalizar Upgrade</span>
                <span className="sm:hidden">Finalizar</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Está a fazer upgrade para o plano {selectedPlanData.name.replace('Tuwi', 'ProEnglish')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Price Summary */}
              <div className="bg-customgreys-darkGrey rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm sm:text-base">Plano {selectedPlanData.name.replace('Tuwi', 'ProEnglish')}</span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    {formatCurrency(
                      billingCycle === 'YEARLY' && selectedPlanData.yearly_price
                        ? selectedPlanData.yearly_price
                        : selectedPlanData.monthly_price
                    )}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-green-400 text-sm sm:text-base">
                    <span>Desconto promocional</span>
                    <span>-{formatCurrency(discount.toString())}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between items-center text-base sm:text-lg font-bold text-white">
                    <span>Total</span>
                    <span>{formatCurrency(calculatePrice(selectedPlanData).toString())}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2 text-sm sm:text-base">
                  <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
                  Código Promocional (Opcional)
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Digite o seu código"
                    className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base"
                  />
                  <Button
                    variant="outline"
                    onClick={validatePromoCode}
                    className="border-gray-600 text-gray-300 text-sm sm:text-base whitespace-nowrap"
                  >
                    Validar
                  </Button>
                </div>
                
                {promoCodeValid === true && (
                  <div className="text-green-400 text-xs sm:text-sm flex items-center gap-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    Código válido! Desconto aplicado.
                  </div>
                )}
                
                {promoCodeValid === false && (
                  <div className="text-red-400 text-xs sm:text-sm flex items-center gap-1">
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    Código inválido ou expirado.
                  </div>
                )}
              </div>

              {/* Upgrade Button */}
              <Button
                onClick={handleUpgrade}
                disabled={processing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-sm sm:text-lg py-3 sm:py-4"
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 h-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">A processar...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Confirmar Upgrade - {formatCurrency(calculatePrice(selectedPlanData).toString())}</span>
                    <span className="sm:hidden">Confirmar - {formatCurrency(calculatePrice(selectedPlanData).toString())}</span>
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Ao confirmar, concorda com os nossos termos de serviço. 
                O pagamento será processado de forma segura.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <div className="text-center space-y-4 sm:space-y-6 pt-6 sm:pt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Porque fazer upgrade?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Aprendizagem Ilimitada",
                description: "Pratica quantas lições quiser, quando quiser"
              },
              {
                icon: Bot,
                title: "IA Professor Pessoal",
                description: "Feedback personalizado e exercícios adaptativos"
              },
              {
                icon: Award,
                title: "Certificados Oficiais",
                description: "Comprova o seu nível de inglês com certificados reconhecidos"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-customgreys-secondarybg/40 rounded-lg p-4 sm:p-6">
                <benefit.icon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{benefit.title}</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}