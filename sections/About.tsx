'use client';

import { motion } from 'framer-motion';
import { MapPin, Building2, Users, Zap, Target, Trophy } from 'lucide-react';
import styles from '@/styles';
import { fadeIn, staggerContainer } from '@/utils/motion';

const About = () => {
  const angolaCities = [
    "Luanda", "Benguela", "Huambo", "Lobito", "Cabinda", "Malanje"
  ];

  const sectors = [
    { icon: "🛢️", name: "Petróleo & Gás", companies: "Sonangol, Total, Chevron" },
    { icon: "🏦", name: "Setor Bancário", companies: "BAI, BFA, Standard Bank" },
    { icon: "💻", name: "Tecnologia", companies: "Unitel, MS Telecom" },
    { icon: "🏛️", name: "Setor Público", companies: "Ministérios, Empresas Públicas" }
  ];

  return (
    <section id="about" className={`${styles.paddings} sm:p-8 xs:p-4 px-6 py-16`}>
      <div className="container max-w-7xl mx-auto">
        <div className="section-heading text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 backdrop-blur-sm border border-violet-500/30 rounded-full px-6 py-3 mb-6"
          >
            <MapPin className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-semibold">Feito em Angola, para Angola</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            A História da
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> ProEnglish</span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Nascemos da necessidade real do mercado angolano. Vimos profissionais talentosos perderem oportunidades 
            por não dominarem o inglês técnico de seus setores.
          </p>
        </div>

        <motion.div
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className="grid lg:grid-cols-2 gap-12 items-center mb-20"
        >
          {/* Left - Story */}
          <motion.div
            variants={fadeIn('right', 'tween', 0.2, 1)}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Nossa Missão</h3>
                  <p className="text-violet-300 font-medium">Democratizar o inglês especializado em Angola</p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">
                A ProEnglish nasceu quando percebemos que os métodos tradicionais de ensino não preparavam 
                os angolanos para o inglês que realmente precisavam: o inglês dos negócios, do petróleo, 
                da tecnologia e dos bancos.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-violet-900/30 rounded-xl p-4 border border-violet-700/30">
                  <div className="text-2xl font-bold text-white">2024</div>
                  <div className="text-sm text-gray-400">Fundação</div>
                </div>
                <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-700/30">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-gray-400">Vidas impactadas</div>
                </div>
              </div>
            </div>

            {/* Angola Coverage */}
            <div className="bg-gradient-to-br from-green-900/20 to-violet-900/20 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-green-400" />
                <h4 className="text-xl font-bold text-white">Presente em todo Angola</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {angolaCities.map((city, index) => (
                  <motion.div
                    key={city}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-green-600/20 rounded-lg p-2 text-center"
                  >
                    <span className="text-green-300 text-sm font-medium">{city}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            variants={fadeIn('left', 'tween', 0.2, 1)}
            className="relative"
          >
            <div className="relative">
              <img
                src="/about-1.jpg"
                alt="ProEnglish Angola"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              
              {/* Overlay with stats */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">94%</div>
                      <div className="text-xs text-gray-300">Taxa de Sucesso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-xs text-gray-300">Cursos Especializados</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 shadow-xl"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Sectors We Serve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl font-bold text-white mb-4">Setores que Atendemos</h3>
          <p className="text-gray-300 mb-12">
            Conteúdo especializado para os principais setores da economia angolana
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sectors.map((sector, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6 text-center hover:border-violet-500/40 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{sector.icon}</div>
                <h4 className="text-lg font-bold text-white mb-2">{sector.name}</h4>
                <p className="text-sm text-gray-400">{sector.companies}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8"
        >
          <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Não é só inglês. É o inglês que acelera sua carreira em Angola.
          </h3>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Junte-se aos milhares de profissionais angolanos que já transformaram suas carreiras 
            com nossa metodologia exclusiva e conteúdo especializado.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;