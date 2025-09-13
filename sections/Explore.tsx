'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin, TrendingUp, Users, Star, ArrowRight } from 'lucide-react';

import styles from '../styles';
import { exploreWorlds } from '../constants';
import { staggerContainer } from '../utils/motion';
import ServiceCard from '@/components/ServiceCard';


const Explore: React.FC = () => {
  const [active, setActive] = useState<string>('world-1');

  const stats = [
    { value: "8K+", label: "Estudantes Ativos", icon: Users },
    { value: "15+", label: "Setores Cobertos", icon: TrendingUp },
    { value: "94%", label: "Taxa de Sucesso", icon: Star },
    { value: "6", label: "Cidades em Angola", icon: MapPin }
  ];

  return (
    <section className="py-24 relative overflow-hidden" id='service'>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />

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
            <span className="text-violet-300 font-semibold">Especializados para Angola</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Nossos
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> Serviços</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Cursos de inglês especializados para os principais setores da economia angolana. 
            <strong className="text-white"> Conteúdo criado</strong> especificamente para profissionais de 
            <strong className="text-violet-300"> Sonangol, BAI, Unitel</strong> e outras empresas líderes.
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 backdrop-blur-sm border border-violet-500/20 rounded-xl p-4 text-center"
              >
                <stat.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Services Cards */}
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className={`${styles.innerWidth} mx-auto flex flex-col`}
        >
          <div className="flex lg:flex-row flex-col min-h-[70vh] gap-4">
            {exploreWorlds.map((world, index) => (
              <ServiceCard
                key={world.id}
                {...world}
                index={index}
                active={active}
                handleClick={(id: string) => setActive(id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Não tem certeza qual curso é ideal para você?
                </h3>
                <p className="text-gray-300 mb-6">
                  Nossos consultores especializados ajudam você a escolher o curso perfeito 
                  baseado na sua carreira e objetivos profissionais em Angola.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    Falar com Consultor
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-violet-500 text-violet-300 hover:bg-violet-900/20 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Teste de Nível Grátis
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-violet-900/30 border border-violet-700/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">📞 Consultoria Gratuita</h4>
                  <p className="text-gray-300 text-sm">Análise de perfil e recomendação personalizada</p>
                </div>
                <div className="bg-purple-900/30 border border-purple-700/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">🎯 Teste de Nível</h4>
                  <p className="text-gray-300 text-sm">Avaliação completa em 15 minutos</p>
                </div>
                <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">✅ 7 Dias Grátis</h4>
                  <p className="text-gray-300 text-sm">Experimente qualquer curso sem compromisso</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Explore;
