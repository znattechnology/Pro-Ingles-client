"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

const CallToAction = () => {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-violet-900/60 to-purple-900/60 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 md:p-12 text-center"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl mb-6 shadow-xl"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Pronto para transformar
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                sua carreira?
              </span>
            </h2>

            {/* Subtext */}
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Junte-se aos profissionais angolanos que já dominam o inglês do seu setor.
              <strong className="text-white"> Comece grátis por 7 dias.</strong>
            </p>

            {/* CTA Button */}
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300"
              >
                Começar Grátis
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Garantia 30 dias</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
