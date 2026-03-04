
"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AITutorDemo from "@/components/AITutorDemo";

const Hero = () => {
  const handlePlayDemo = () => {
    // Scroll to practice lab section for demo
    const element = document.getElementById('practice-lab');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stats = [
    { value: "24/7", label: "Disponível sempre" },
    { value: "IA", label: "Tutor personalizado" },
    { value: "AOA", label: "Preços locais" }
  ];

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-600/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="gradient" className="text-sm px-4 py-2 mb-6">
                🇦🇴 A primeira plataforma de inglês feita para Angola
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight">
                Inglês Especializado
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  com IA Personal Tutor
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-base sm:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
              A única plataforma que combina <strong className="text-white">IA Personal Tutor</strong> com
              <strong className="text-violet-300"> English Practice Lab exclusivo</strong> para setores como petróleo, bancos e TI.
              Preços em AOA, conteúdo adaptado para Angola.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Começar Grátis - 7 Dias
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handlePlayDemo}
                className="border-2 border-violet-500 text-violet-300 hover:bg-violet-900/20 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demonstração do IA Tutor
              </Button>
            </motion.div>

            {/* Social Proof - Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 pt-8"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 border-2 border-white flex items-center justify-center text-white font-bold text-sm"
                  >
                    A{i}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-white font-semibold">Junte-se aos nossos alunos</p>
                <p className="text-sm text-gray-400">Aprenda inglês especializado para sua carreira</p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-violet-900/30"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <AITutorDemo />

            {/* Setores atendidos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-400 text-sm mb-4">Inglês especializado para:</p>
              <div className="grid grid-cols-2 gap-4">
                {["🛢️ Petróleo & Gás", "🏦 Setor Bancário", "💻 Tecnologia", "🏛️ Setor Público"].map((sector, index) => (
                  <div
                    key={index}
                    className="bg-violet-900/20 rounded-lg p-3 border border-violet-700/30 text-white text-sm font-semibold"
                  >
                    {sector}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


export default Hero;