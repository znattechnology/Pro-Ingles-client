"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Bot, Mic, Volume2, RotateCcw, Play, Check, Zap, Sparkles } from "lucide-react";

interface DemoMessage {
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp?: string;
  accuracy?: number;
  feedback?: string;
}

const AITutorDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSequence = [
    {
      step: 0,
      title: "Iniciar Demo",
      description: "Clique para ver o IA Personal Tutor em ação"
    },
    {
      step: 1,
      title: "Gravação de Áudio",
      description: "Você diz: 'I work in the oil industry in Luanda'"
    },
    {
      step: 2,
      title: "Análise da IA",
      description: "IA analisa pronunciação em tempo real"
    },
    {
      step: 3,
      title: "Feedback Personalizado",
      description: "Correções específicas para sotaque angolano"
    }
  ];

  const scenarios = [
    {
      title: "Inglês para Petróleo",
      userAudio: "I work in the oil industry",
      aiResponse: "Excelente! Pronunciação 94% correta. Para 'industry', tente /ˈɪndəstri/ - enfatize a primeira sílaba.",
      accuracy: 94,
      sector: "🛢️"
    },
    {
      title: "Inglês Bancário", 
      userAudio: "I need to process this transaction",
      aiResponse: "Muito bom! 89% de precisão. Em 'process', o som é /ˈprɒsɛs/ não /proˈsɛs/. Pratique mais!",
      accuracy: 89,
      sector: "🏦"
    },
    {
      title: "Inglês para TI",
      userAudio: "Let's deploy the application",
      aiResponse: "Perfeito! 96% correto. Sua pronunciação de termos técnicos está excelente. Continue assim!",
      accuracy: 96,
      sector: "💻"
    }
  ];

  const [currentScenario, setCurrentScenario] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < 3) {
          setCurrentStep(prev => prev + 1);
          
          if (currentStep === 1) {
            setIsRecording(true);
            setTimeout(() => setIsRecording(false), 2000);
          }
          
          if (currentStep === 2) {
            const scenario = scenarios[currentScenario];
            setMessages([
              {
                type: 'user',
                content: scenario.userAudio,
                timestamp: 'Agora'
              },
              {
                type: 'ai',
                content: scenario.aiResponse,
                accuracy: scenario.accuracy,
                feedback: 'Feedback personalizado para Angola'
              }
            ]);
          }
        } else {
          setIsPlaying(false);
          setTimeout(() => {
            // Auto restart demo with next scenario
            setCurrentScenario((prev) => (prev + 1) % scenarios.length);
            handleRestart();
          }, 3000);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, currentScenario]);

  const handleStartDemo = () => {
    setIsPlaying(true);
    setCurrentStep(1);
    setMessages([]);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsRecording(false);
    setMessages([]);
  };

  return (
    <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl rounded-3xl p-6 border border-violet-500/30 relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5 rounded-3xl" />
      
      {/* Floating particles */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl"
      >
        <Sparkles className="w-4 h-4 text-white" />
      </motion.div>

      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center shadow-xl"
      >
        <Zap className="w-4 h-4 text-white" />
      </motion.div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
              className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl"
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg">IA Personal Tutor</h3>
              <p className="text-violet-300 text-sm">
                {scenarios[currentScenario].sector} {scenarios[currentScenario].title}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isPlaying && currentStep === 0 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartDemo}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4" />
                Ver Demo
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestart}
                className="border border-violet-500 text-violet-300 hover:bg-violet-900/20 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </motion.button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-6">
          {demoSequence.map((step, index) => (
            <motion.div
              key={step.step}
              className={`flex items-center gap-2 ${
                currentStep >= step.step ? 'text-white' : 'text-gray-500'
              }`}
            >
              <motion.div
                animate={{
                  scale: currentStep === step.step ? [1, 1.2, 1] : 1,
                  backgroundColor: currentStep >= step.step ? '#8b5cf6' : '#374151'
                }}
                transition={{ duration: 0.3 }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              >
                {currentStep > step.step ? <Check className="w-3 h-3" /> : step.step + 1}
              </motion.div>
              {index < demoSequence.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  currentStep > step.step ? 'bg-violet-600' : 'bg-gray-600'
                }`} />
              )}
            </motion.div>
          ))}
        </div>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-bold text-white mb-2">
                Experimente o Futuro do Ensino de Inglês
              </h4>
              <p className="text-gray-300 text-sm">
                Veja como nossa IA Personal Tutor corrige sua pronunciação em tempo real
              </p>
            </motion.div>
          )}

          {currentStep >= 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* User Audio Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-violet-900/30 rounded-xl p-4 border border-violet-700/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{
                      scale: isRecording ? [1, 1.2, 1] : 1,
                      backgroundColor: isRecording ? '#ef4444' : '#8b5cf6'
                    }}
                    transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    <Mic className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="text-violet-300 text-sm font-semibold">
                    {isRecording ? 'Gravando...' : 'Seu áudio:'}
                  </span>
                </div>
                
                {currentStep >= 2 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white"
                  >
                    "{scenarios[currentScenario].userAudio}"
                  </motion.p>
                )}
              </motion.div>

              {/* AI Response */}
              {currentStep >= 3 && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-900/30 rounded-xl p-4 border border-green-700/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 text-sm font-semibold">IA Feedback:</span>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold"
                    >
                      {scenarios[currentScenario].accuracy}% correto
                    </motion.div>
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    {scenarios[currentScenario].aiResponse}
                  </p>
                </motion.div>
              )}

              {/* Progress Bar */}
              {currentStep >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Progresso do Curso</span>
                    <span className="text-violet-300">85% completo</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 2, delay: 1.2 }}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo completed state */}
        {currentStep >= 3 && !isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-violet-900/20 rounded-xl border border-violet-700/30 text-center"
          >
            <p className="text-violet-300 text-sm">
              ✨ Demo concluída! O próximo cenário iniciará automaticamente...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AITutorDemo;