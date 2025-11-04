"use client";

import { motion } from "framer-motion";
import { Bot, Mic, Headphones, Award, BarChart3, Globe, Zap, Users, Crown, Sparkles } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const Features = () => {
  const features = [
    {
      title: "IA Personal Tutor",
      description: "Correção de pronunciação em tempo real com inteligência artificial. Feedback personalizado para cada sotaque angolano.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 p-4 items-center justify-center">
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
            >
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          </div>
        </div>
      ),
      icon: <Bot className="w-5 h-5" />,
      gradient: "from-violet-600 to-purple-600",
      className: "md:col-span-2"
    },
    {
      title: "Speaking Practice Avançado",
      description: "Pratique conversação com cenários reais do setor petrolífero e bancário angolano.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-900/40 to-violet-900/40 backdrop-blur-xl border border-blue-500/30 p-4 items-center justify-center">
          <motion.div
            animate={{ 
              y: [-5, 5, -5],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center"
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      ),
      icon: <Mic className="w-5 h-5" />,
      gradient: "from-blue-600 to-violet-600"
    },
    {
      title: "Listening Especializado",
      description: "Áudios de reuniões reais em empresas angolanas. Entenda sotaques internacionais.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-900/40 to-violet-900/40 backdrop-blur-xl border border-green-500/30 p-4 items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-green-600 to-violet-600 rounded-full flex items-center justify-center"
          >
            <Headphones className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      ),
      icon: <Headphones className="w-5 h-5" />,
      gradient: "from-green-600 to-violet-600"
    },
    {
      title: "Inglês para Setores Angolanos",
      description: "Cursos específicos para petróleo, bancos, TI e setor público. Vocabulário técnico que você usa no trabalho.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-900/40 to-violet-900/40 backdrop-blur-xl border border-orange-500/30 p-4">
          <div className="grid grid-cols-2 gap-2 w-full">
            {["Oil & Gas", "Banking", "IT", "Government"].map((sector, i) => (
              <motion.div
                key={sector}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="bg-orange-600/30 rounded-lg p-2 text-center"
              >
                <p className="text-white text-xs font-medium">{sector}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
      icon: <Globe className="w-5 h-5" />,
      gradient: "from-orange-600 to-violet-600",
      className: "md:col-span-2"
    },
    {
      title: "Certificação Internacional",
      description: "Certificados reconhecidos por empresas angolanas e internacionais. Comprove seu nível profissionalmente.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-xl border border-yellow-500/30 p-4 items-center justify-center">
          <motion.div
            animate={{ 
              rotateY: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center"
          >
            <Award className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      ),
      icon: <Award className="w-5 h-5" />,
      gradient: "from-yellow-600 to-orange-600"
    },
    {
      title: "Analytics Detalhado",
      description: "Acompanhe seu progresso com métricas avançadas. Veja suas melhorias em tempo real.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl border border-purple-500/30 p-4 items-center justify-center">
          <motion.div
            animate={{ 
              y: [-3, 3, -3],
              x: [-2, 2, -2]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center"
          >
            <BarChart3 className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      ),
      icon: <BarChart3 className="w-5 h-5" />,
      gradient: "from-purple-600 to-pink-600"
    }
  ];

  const stats = [
    { value: "94%", label: "Taxa de sucesso" },
    { value: "10K+", label: "Profissionais treinados" },
    { value: "50+", label: "Cursos especializados" },
    { value: "15", label: "Setores atendidos" }
  ];

  return (
    <section className="py-24 relative overflow-hidden" id="features">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-violet-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 backdrop-blur-sm border border-violet-500/30 rounded-full px-6 py-3 mb-6"
          >
            <Zap className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-semibold">Por que escolher ProEnglish?</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            A Revolução do 
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> Ensino de Inglês</span>
            <br />
            em Angola
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Somos a primeira plataforma que combina <strong className="text-white">inteligência artificial avançada</strong> com 
            conteúdo específico para o mercado angolano. Não é só inglês - é inglês que <strong className="text-violet-300">acelera sua carreira</strong>.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="text-center bg-gradient-to-br from-violet-900/20 to-purple-900/20 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6"
            >
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bento Grid */}
        <BentoGrid className="max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <BentoGridItem
              key={i}
              title={feature.title}
              description={feature.description}
              header={feature.header}
              icon={feature.icon}
              gradient={feature.gradient}
              className={feature.className}
            />
          ))}
        </BentoGrid>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-yellow-400 mr-3" />
              <h3 className="text-2xl font-bold text-white">Pronto para acelerar sua carreira?</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Junte-se aos milhares de angolanos que já dominam inglês profissional com nossa metodologia exclusiva.
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
                Ver Demonstração
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;