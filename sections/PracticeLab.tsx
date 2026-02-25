"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Target,
  Trophy,
  Brain,
  Headphones,
  Mic,
  BookOpen,
  Users,
  Clock,
  Award,
  TrendingUp,
  Play,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

const PracticeLab = () => {
  const [activeExercise, setActiveExercise] = useState(0);

  const labFeatures = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA Adaptive Learning",
      description: "Sistema inteligente que adapta exercícios ao seu nível e progresso",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Exercícios Direcionados",
      description: "Práticas específicas para petróleo, bancos e TI angolanos",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Sistema de Gamificação", 
      description: "Pontos, ligas e conquistas para manter motivação alta",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics Avançado",
      description: "Relatórios detalhados de progresso e áreas de melhoria",
      color: "from-green-500 to-teal-600"
    }
  ];

  const exerciseTypes = [
    {
      id: 0,
      title: "Speaking Challenge",
      subtitle: "Pronunciação & Fluência",
      icon: <Mic className="w-8 h-8" />,
      description: "Pratique conversação com IA em cenários reais de trabalho angolanos",
      features: [
        "Correção de pronunciação em tempo real",
        "Simulação de reuniões com Sonangol",
        "Feedback personalizado para sotaque angolano",
        "Exercícios de apresentação executiva"
      ],
      stats: "15K+ sessões/mês",
      difficulty: "Todos os níveis",
      duration: "5-30 min",
      bgColor: "from-red-900/40 to-pink-900/40",
      borderColor: "border-red-500/30"
    },
    {
      id: 1,
      title: "Listening Lab",
      subtitle: "Compreensão & Contexto",
      icon: <Headphones className="w-8 h-8" />,
      description: "Áudios reais de empresas angolanas e contextos profissionais",
      features: [
        "Áudios de reuniões BAI/BFA",
        "Conversas técnicas da Unitel",
        "Sotaques internacionais diversos",
        "Exercícios de compreensão contextual"
      ],
      stats: "8K+ horas ouvidas",
      difficulty: "Iniciante a Avançado",
      duration: "10-45 min",
      bgColor: "from-blue-900/40 to-indigo-900/40",
      borderColor: "border-blue-500/30"
    },
    {
      id: 2,
      title: "Writing Workshop",
      subtitle: "Comunicação Profissional",
      icon: <BookOpen className="w-8 h-8" />,
      description: "Redação de emails, relatórios e documentos corporativos",
      features: [
        "Templates para setor petrolífero",
        "Emails corporativos em inglês",
        "Relatórios técnicos",
        "Correção automática com IA"
      ],
      stats: "12K+ textos corrigidos",
      difficulty: "Intermediário+",
      duration: "15-60 min",
      bgColor: "from-green-900/40 to-emerald-900/40",
      borderColor: "border-green-500/30"
    },
    {
      id: 3,
      title: "Interactive Scenarios",
      subtitle: "Simulação Real",
      icon: <Users className="w-8 h-8" />,
      description: "Cenários interativos baseados em situações reais de trabalho",
      features: [
        "Negociações com empresas estrangeiras",
        "Entrevistas de emprego",
        "Apresentações para investidores",
        "Atendimento ao cliente internacional"
      ],
      stats: "5K+ cenários completados",
      difficulty: "Intermediário a Avançado",
      duration: "20-90 min",
      bgColor: "from-purple-900/40 to-violet-900/40",
      borderColor: "border-purple-500/30"
    }
  ];

  const labStats = [
    {
      value: "25K+",
      label: "Exercícios Completados",
      icon: <Target className="w-5 h-5" />
    },
    {
      value: "92%",
      label: "Taxa de Melhoria",
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      value: "4.8★",
      label: "Avaliação Média",
      icon: <Award className="w-5 h-5" />
    },
    {
      value: "24/7",
      label: "Disponibilidade",
      icon: <Clock className="w-5 h-5" />
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden" id="practice-lab">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-purple-900/5 to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      
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
            <Zap className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-semibold">Laboratório Exclusivo</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            English Practice Lab
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> Inteligente</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            O laboratório de prática mais avançado de Angola. 
            <strong className="text-white"> Exercícios adaptativos</strong> com IA que se ajustam ao seu progresso e necessidades profissionais específicas.
          </p>

          {/* Lab Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12"
          >
            {labStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 backdrop-blur-sm border border-violet-500/20 rounded-xl p-4 text-center"
              >
                <div className="flex items-center justify-center text-violet-400 mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Lab Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {labFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl hover:border-violet-500/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Exercise Types - Interactive Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Tipos de Exercícios</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Escolha o tipo de prática que mais se adequa aos seus objetivos profissionais
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Exercise Type Selector */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {exerciseTypes.map((exercise) => (
                  <motion.button
                    key={exercise.id}
                    onClick={() => setActiveExercise(exercise.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-300 ${
                      activeExercise === exercise.id
                        ? `bg-gradient-to-br ${exercise.bgColor} ${exercise.borderColor} border-2`
                        : 'bg-gray-900/50 border-gray-700/50 hover:border-violet-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-white ${activeExercise === exercise.id ? 'scale-110' : ''} transition-transform`}>
                        {exercise.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{exercise.title}</h4>
                        <p className="text-sm text-gray-400">{exercise.subtitle}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${
                        activeExercise === exercise.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Active Exercise Details */}
            <div className="lg:col-span-2">
              <motion.div
                key={activeExercise}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`p-8 rounded-2xl border-2 bg-gradient-to-br ${exerciseTypes[activeExercise].bgColor} ${exerciseTypes[activeExercise].borderColor}`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-white">
                    {exerciseTypes[activeExercise].icon}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">
                      {exerciseTypes[activeExercise].title}
                    </h4>
                    <p className="text-gray-300 mb-4">
                      {exerciseTypes[activeExercise].description}
                    </p>
                    
                    {/* Exercise Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {exerciseTypes[activeExercise].stats}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {exerciseTypes[activeExercise].difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exerciseTypes[activeExercise].duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  {exerciseTypes[activeExercise].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      {feature}
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/signup">
                    <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Experimentar Agora
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Simplified Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 mb-4">
            Experimente todos os exercícios gratuitamente por 7 dias
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transition-all duration-200">
                <Zap className="w-5 h-5 mr-2" />
                Começar Grátis
              </Button>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default PracticeLab;