"use client";

import { CheckIcon, Crown, MapPin, Star, ArrowRight, TrendingUp } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { motion } from "framer-motion";

const pricingTiers = [
  {
    title: "Básico",
    subtitle: "Para começar",
    monthlyPrice: 0,
    yearlyPrice: 0,
    buttonText: "Começar Grátis",
    popular: false,
    inverse: false,
    icon: "🚀",
    badge: null,
    features: [
      "3 lições por dia",
      "5 min de Speaking com IA",
      "5 min de Listening diário", 
      "3 vidas (recarrega 4h)",
      "1 curso: Inglês Geral",
      "Progresso básico",
      "Comunidade ProEnglish Angola"
    ],
    angolaBenefit: "Ideal para testar nossa metodologia angolana",
    testimonial: "Perfeito para começar!" 
  },
  {
    title: "Professional",
    subtitle: "Para quem quer crescer",
    monthlyPrice: 14950,
    yearlyPrice: 149500,
    discount: "2 meses grátis",
    buttonText: "Acelerar Carreira",
    popular: true,
    inverse: true,
    icon: "👑",
    badge: "Mais Escolhido",
    features: [
      "Lições ILIMITADAS",
      "Speaking & Listening ILIMITADO",
      "Vidas infinitas",
      "15+ cursos especializados",
      "Inglês para Petróleo & Gás",
      "Inglês Bancário (BAI/BFA)",
      "Certificados oficiais",
      "Analytics detalhado",
      "Download offline",
      "Suporte especializado",
      "2 dispositivos simultâneos"
    ],
    angolaBenefit: "Criado especificamente para profissionais angolanos",
    testimonial: "Consegui promoção na Sonangol!" 
  },
  {
    title: "Enterprise",
    subtitle: "Para líderes",
    monthlyPrice: 24950,
    yearlyPrice: 249500,
    discount: "2 meses grátis",
    buttonText: "Ser Líder Global",
    popular: false,
    inverse: false,
    icon: "⚡",
    badge: "Mais Avançado",
    features: [
      "TUDO do Professional",
      "IA Personal Tutor exclusivo",
      "2 sessões com nativos/mês",
      "Correção avançada com IA",
      "Inglês para C-Level",
      "Preparação para reuniões internacionais",
      "Suporte VIP 24/7",
      "Acesso antecipado",
      "3 dispositivos simultâneos",
      "Relatórios executivos"
    ],
    angolaBenefit: "Para executivos que lideram em empresas multinacionais",
    testimonial: "Essencial para meu cargo executivo!"
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getCurrentPrice = (tier: any) => {
    return isYearly ? tier.yearlyPrice : tier.monthlyPrice;
  };

  const angolaBenefits = [
    "💰 Preços em AOA - sem conversões",
    "🇦🇴 Conteúdo adaptado para Angola", 
    "🏢 Usado por empresas angolanas",
    "⚡ Resultados em 30 dias"
  ];

  return (
    <section className="py-24 relative overflow-hidden" id="plan">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-violet-600/5 via-purple-600/3 to-transparent rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 backdrop-blur-sm border border-violet-500/30 rounded-full px-6 py-3 mb-6"
          >
            <MapPin className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-semibold">Preços justos para Angola</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Planos que Cabem no Seu
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> Orçamento</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Desenvolvidos especificamente para profissionais angolanos. 
            <strong className="text-white"> Preços em AOA</strong>, conteúdo localizado e resultados comprovados.
          </p>

          {/* Angola Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
          >
            {angolaBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 backdrop-blur-sm border border-violet-500/20 rounded-xl p-4 text-center"
              >
                <span className="text-sm text-white font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 p-1 rounded-2xl">
              <div className="flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsYearly(false)}
                  className={twMerge(
                    "px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    !isYearly 
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl" 
                      : "text-gray-300 hover:text-white hover:bg-violet-900/20"
                  )}
                >
                  💳 Mensal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsYearly(true)}
                  className={twMerge(
                    "px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    isYearly 
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl" 
                      : "text-gray-300 hover:text-white hover:bg-violet-900/20"
                  )}
                >
                  💰 Anual
                  <span className="text-xs bg-green-600 px-2 py-1 rounded-full text-white font-bold">
                    2 MESES GRÁTIS
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Price Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => {
              const currentPrice = getCurrentPrice(tier);
              
              return (
                <motion.div
                  key={tier.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  onHoverStart={() => setHoveredCard(tier.title)}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={{ scale: 1.02, y: -8 }}
                  className={twMerge( 
                    "relative bg-gradient-to-br from-violet-900/20 to-purple-900/20 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300",
                    tier.inverse ? "border-violet-500/50 bg-gradient-to-br from-violet-800/30 to-purple-800/30" : "border-violet-500/20",
                    tier.popular && "ring-2 ring-violet-400 shadow-2xl shadow-violet-500/25"
                  )}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm px-4 py-2 rounded-full font-bold flex items-center gap-1 shadow-xl">
                        <Crown className="w-4 h-4" />
                        {tier.badge}
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="text-4xl mb-4">{tier.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.title}</h3>
                    <p className="text-violet-300 font-medium">{tier.subtitle}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    {currentPrice === 0 ? (
                      <div className="text-4xl font-bold text-white">Gratuito</div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl lg:text-5xl font-bold text-white">
                            {formatPrice(currentPrice)}
                          </span>
                          <div className="text-left">
                            <div className="text-sm text-white/70">AOA</div>
                            <div className="text-xs text-white/50">/{isYearly ? 'ano' : 'mês'}</div>
                          </div>
                        </div>
                        
                        {isYearly && tier.discount && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-2 inline-block bg-green-600 text-white text-sm px-3 py-1 rounded-full font-bold"
                          >
                            {tier.discount}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Angola Benefit */}
                  <div className="bg-violet-900/30 rounded-xl p-4 mb-6 border border-violet-700/30">
                    <p className="text-violet-300 text-sm font-medium text-center">
                      {tier.angolaBenefit}
                    </p>
                  </div>
                  
                  {/* CTA Button */}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={twMerge(
                      "w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 mb-8 flex items-center justify-center gap-2", 
                      tier.inverse 
                        ? "bg-white text-black hover:bg-gray-100 shadow-xl" 
                        : tier.title === "Básico"
                        ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600"
                        : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-xl"
                    )}
                    onClick={() => {
                      if (tier.title === "Básico") {
                        window.location.href = "/signup";
                      } else {
                        window.location.href = "/user/upgrade";
                      }
                    }}
                  >
                    {tier.buttonText}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  {/* Features */}
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                        className="flex items-start gap-3 text-sm"
                      >
                        <CheckIcon className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Testimonial */}
                  <div className="mt-8 pt-6 border-t border-violet-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm italic">"{tier.testimonial}"</p>
                    <p className="text-xs text-gray-500 mt-2">- Cliente ProEnglish Angola</p>
                  </div>
                </motion.div>
              );
            }
          )}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 max-w-3xl mx-auto">
            <TrendingUp className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Garantia de 30 dias ou seu dinheiro de volta
            </h3>
            <p className="text-gray-300 mb-6">
              Estamos tão confiantes nos nossos resultados que oferecemos garantia total. 
              Se não ver progresso em 30 dias, devolvemos 100% do valor pago.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-xl transition-all duration-300"
              >
                Começar Teste Grátis
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-violet-500 text-violet-300 hover:bg-violet-900/20 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Falar com Consultor
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;