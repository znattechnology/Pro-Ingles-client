'use client';

import { motion } from 'framer-motion';
import { MapPin, Building2, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/sections/Header';
import Footer from '@/sections/Footer';

const AboutPage = () => {
  const angolaCities = [
    "Luanda", "Benguela", "Huambo", "Lobito", "Cabinda", "Malanje"
  ];

  const sectors = [
    { icon: "🛢️", name: "Petróleo & Gás", description: "Inglês técnico para profissionais do setor energético" },
    { icon: "🏦", name: "Setor Bancário", description: "Comunicação profissional para serviços financeiros" },
    { icon: "💻", name: "Tecnologia", description: "Vocabulário técnico para TI e telecomunicações" },
    { icon: "🏛️", name: "Setor Público", description: "Inglês para relações internacionais e administração" }
  ];

  const timeline = [
    { year: "2024", title: "Fundação", description: "Nascemos da necessidade real do mercado angolano" },
    { year: "2024", title: "Lançamento", description: "Primeira versão da plataforma com IA Personal Tutor" },
    { year: "2025", title: "Expansão", description: "Crescimento contínuo e novas funcionalidades" },
  ];

  return (
    <>
      <Header />

      <main className="pt-32 pb-20">
        {/* Back Link */}
        <div className="container mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à página inicial
          </Link>
        </div>

        {/* Hero Section */}
        <section className="container mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 backdrop-blur-sm border border-violet-500/30 rounded-full px-6 py-3 mb-6">
              <MapPin className="w-5 h-5 text-violet-400" />
              <span className="text-violet-300 font-semibold">Feito em Angola, para Angola</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              A História da
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> ProEnglish</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Nascemos da necessidade real do mercado angolano. Vimos profissionais talentosos
              perderem oportunidades por não dominarem o inglês técnico de seus setores.
            </p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="container mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Nossa Missão</h2>
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
                    <div className="text-2xl font-bold text-white">Angola</div>
                    <div className="text-sm text-gray-400">Sede</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="/about-1.jpg"
                alt="ProEnglish Angola"
                className="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl" />

              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">IA</div>
                      <div className="text-xs text-gray-300">Tutor Personalizado</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-xs text-gray-300">Sempre Disponível</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Angola Coverage */}
        <section className="container mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-green-900/20 to-violet-900/20 backdrop-blur-sm border border-green-500/20 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Presente em todo Angola</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Nossa plataforma está disponível para profissionais em todas as províncias de Angola,
              com conteúdo adaptado para as realidades locais.
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {angolaCities.map((city, index) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-600/20 rounded-lg p-3 text-center"
                >
                  <span className="text-green-300 text-sm font-medium">{city}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Sectors */}
        <section className="container mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Setores que Atendemos</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Conteúdo especializado para os principais setores da economia angolana
            </p>
          </motion.div>

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
                <h3 className="text-lg font-bold text-white mb-2">{sector.name}</h3>
                <p className="text-sm text-gray-400">{sector.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="container mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Nossa Jornada</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-4 mb-8"
              >
                <div className="w-20 flex-shrink-0">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg px-3 py-2 text-center">
                    <span className="text-white font-bold text-sm">{item.year}</span>
                  </div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-500/20 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8"
          >
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Não é só inglês. É o inglês que acelera sua carreira em Angola.
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
              Junte-se aos profissionais angolanos que já transformaram suas carreiras
              com nossa metodologia exclusiva e conteúdo especializado.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-xl transition-all duration-300"
            >
              Começar Grátis
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutPage;
