"use client";
import avatar1 from "@/public/avatar-1.png";
import avatar2 from "@/public/avatar-2.png";
import avatar3 from "@/public/avatar-3.png";
import avatar4 from "@/public/avatar-4.png";
import avatar5 from "@/public/avatar-5.png";
import avatar6 from "@/public/avatar-6.png";
import avatar7 from "@/public/avatar-7.png";
import avatar8 from "@/public/avatar-8.png";
import avatar9 from "@/public/avatar-9.png";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import React from "react";

const testimonials = [
  {
    text: "O IA Personal Tutor mudou tudo! Em 3 meses consegui a promoção na Sonangol que queria há anos. O inglês técnico para petróleo é exatamente o que precisava.",
    imageSrc: avatar1.src,
    name: "Carlos Mendes",
    username: "🛢️ Engenheiro - Sonangol",
    location: "Luanda",
    result: "Promoção em 3 meses"
  },
  {
    text: "Finalmente uma plataforma feita para Angola! Os preços em AOA e conteúdo bancário específico fizeram toda diferença. Agora atendo clientes internacionais com confiança.",
    imageSrc: avatar2.src,
    name: "Ana Silva",
    username: "🏦 Gestora - BAI",
    location: "Luanda", 
    result: "Aumento de 40% no salário"
  },
  {
    text: "A IA corrige minha pronunciação em tempo real! Em 4 meses já estava liderando calls com a Microsoft e Google. Revolucionário para nós angolanos.",
    imageSrc: avatar3.src,
    name: "Miguel Santos",
    username: "💻 Diretor TI - Unitel",
    location: "Benguela",
    result: "Liderança internacional"
  },
  {
    text: "As simulações de auditorias em inglês me prepararam para certificações internacionais. ProEnglish entende as necessidades do mercado angolano.",
    imageSrc: avatar4.src,
    name: "Beatriz Costa",
    username: "📊 Auditora - BFA",
    location: "Huambo",
    result: "Certificação internacional"
  },
  {
    text: "Trabalho com equipes da Total França diariamente. O ProEnglish me deu confiança para liderar reuniões e apresentações em inglês naturalmente.",
    imageSrc: avatar5.src,
    name: "João Fernandes",
    username: "🔧 Gestor - Total Angola",
    location: "Cabinda",
    result: "Liderança de projetos globais"
  },
  {
    text: "Recomendo para toda minha equipe! O suporte em português angolano e casos do setor bancário tornaram o aprendizado muito eficaz.",
    imageSrc: avatar6.src,
    name: "Maria Rodrigues",
    username: "👥 RH - Standard Bank",
    location: "Lobito",
    result: "Equipe 90% mais qualificada"
  },
  {
    text: "Em 6 meses passei de básico a fluente. Agora lidero treinamentos em inglês e represento minha empresa em eventos internacionais!",
    imageSrc: avatar7.src,
    name: "Pedro Nunes",
    username: "⚡ Engenheiro - ENDE",
    location: "Luanda",
    result: "Speaker internacional"
  },
  {
    text: "O melhor investimento da minha carreira! Consegui oportunidade na embaixada dos EUA após completar o curso Business English.",
    imageSrc: avatar8.src,
    name: "Lucia Tavares",
    username: "🏛️ Diplomata - Min. Relações Ext.",
    location: "Luanda",
    result: "Nova carreira diplomática"
  },
  {
    text: "Os preços são justos para Angola e o conteúdo é de qualidade mundial. Meus alunos na universidade também usam ProEnglish!",
    imageSrc: avatar9.src,
    name: "Prof. Antonio Dias",
    username: "🎓 Professor - UAN",
    location: "Luanda",
    result: "Melhoria no ensino"
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TenstimonialColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  durations?: number;
}) => (
  <div className={props.className}>
        <motion.div className="flex flex-col gap-6 " 
        animate={{
          translateY:"-50%",
        }}

        transition={{
          duration:props.durations || 25,
          repeat:Infinity,
          ease:"linear",
          repeatType:"loop",

        }}
        
        >
    {[...new Array(2)].fill(0).map((_, index) => (
      <React.Fragment key={index}>
        {props.testimonials.map(({ text, imageSrc, name, username, location, result }) => (
          <div key={imageSrc} className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-6 relative">
            {/* Quote decoration */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💬</span>
            </div>
            
            <div className="text-white/80 leading-relaxed mb-4 text-sm">{text}</div>
            
            {/* Result badge */}
            {result && (
              <div className="bg-green-900/30 border border-green-700/30 rounded-lg p-2 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-green-400 text-xs">📈</span>
                  <span className="text-green-300 text-xs font-semibold">{result}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Image
                src={imageSrc}
                alt={name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-violet-600"
              />
              <div className="flex-1">
                <div className="font-medium tracking-tight leading-5 text-white text-sm">
                  {name}
                </div>
                <div className="leading-4 tracking-tight text-violet-300 text-xs">
                  {username}
                </div>
                {location && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-gray-500 text-xs">📍</span>
                    <span className="text-gray-400 text-xs">{location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </React.Fragment>
    ))}
  </motion.div>
  </div>

);
 const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />

      <div className="container relative z-10">
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
            <span className="text-violet-300 font-semibold">🇦🇴 Casos de sucesso reais</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Histórias de Sucesso
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> em Angola</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Mais de <strong className="text-white">10.000 profissionais angolanos</strong> já transformaram suas carreiras 
            com nossa metodologia exclusiva. Veja alguns resultados reais.
          </p>
        </motion.div>
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_50%,black_75%, white_25%,white_75%,transparent)] max-h-[700px] overflow-hidden mt-10 ">
          <TenstimonialColumn testimonials={firstColumn} durations={15} />
          <TenstimonialColumn
            testimonials={secondColumn }
            className="hidden md:block"
            durations={25}
          />
          <TenstimonialColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            durations={30}
          />
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Junte-se aos milhares de angolanos que já transformaram suas carreiras
            </h3>
            <p className="text-gray-300 mb-6">
              Não fique para trás. Comece hoje mesmo e veja resultados em 30 dias ou devolvemos seu dinheiro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-xl transition-all duration-300"
              >
                Começar Minha Transformação
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-violet-500 text-violet-300 hover:bg-violet-900/20 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Ver Mais Casos de Sucesso
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
