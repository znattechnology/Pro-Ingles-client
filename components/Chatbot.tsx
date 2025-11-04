"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  HelpCircle,
  Zap,
  Clock,
  CheckCircle,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  message: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: "pricing",
      label: "Preços",
      icon: <Zap className="w-4 h-4" />,
      message: "Quais são os preços dos planos?"
    },
    {
      id: "courses",
      label: "Cursos",
      icon: <HelpCircle className="w-4 h-4" />,
      message: "Que cursos vocês oferecem?"
    },
    {
      id: "demo",
      label: "Demo",
      icon: <Clock className="w-4 h-4" />,
      message: "Como posso ver uma demonstração?"
    },
    {
      id: "support",
      label: "Suporte",
      icon: <CheckCircle className="w-4 h-4" />,
      message: "Preciso de ajuda com minha conta"
    }
  ];

  const faqData: Record<string, string> = {
    "preços": "📋 **Nossos Planos:**\n\n🚀 **Básico** - Gratuito\n• 3 lições por dia\n• 5 min de Speaking com IA\n• 1 curso: Inglês Geral\n\n👑 **Professional** - 14.950 AOA/mês\n• Lições ILIMITADAS\n• 15+ cursos especializados\n• Certificados oficiais\n\n⚡ **Enterprise** - 24.950 AOA/mês\n• TUDO do Professional\n• IA Personal Tutor exclusivo\n• 2 sessões com nativos/mês",
    
    "cursos": "🎯 **Cursos Especializados:**\n\n🛢️ **Inglês para Petróleo & Gás**\n• Sonangol, Total Angola, Chevron\n• Terminologia técnica\n\n🏦 **Inglês Bancário**\n• BAI, BFA, Standard Bank\n• Transações internacionais\n\n💻 **Inglês para TI**\n• Unitel, MS Telecom\n• Vocabulário de programação\n\n👔 **Inglês Executivo**\n• Para C-Level e gestores\n• Negociações estratégicas",
    
    "demo": "🎬 **Ver Demonstração:**\n\nPode ver nossa demo do IA Personal Tutor diretamente na página principal! \n\n✨ **O que vai ver:**\n• Correção de pronunciação em tempo real\n• Feedback personalizado para Angola\n• Interface adaptativa\n\n🎯 **Também temos:**\n• Practice Lab com 4 tipos de exercícios\n• Cenários reais de empresas angolanas\n\n➡️ Clique em \"Ver Demo do IA Tutor\" na página!",
    
    "suporte": "🛠️ **Suporte ProEnglish:**\n\n📧 **Email:** contato@proenglish.ao\n📱 **WhatsApp:** +244 923 456 789\n\n⏰ **Horário de Atendimento:**\n• Segunda a Sexta: 8h às 18h\n• Sábado: 9h às 13h\n\n🚀 **Suporte Premium:**\nPlanos Professional e Enterprise têm suporte prioritário 24/7!\n\n💬 **Dúvidas Frequentes:**\nVisite nossa seção de FAQ para respostas rápidas."
  };

  const welcomeMessage: Message = {
    id: "welcome",
    content: "Olá! 👋 Sou o assistente virtual da ProEnglish Angola!\n\nEm que posso ajudá-lo hoje? Pode perguntar sobre nossos cursos, preços, ou qualquer dúvida sobre inglês especializado para Angola! 🇦🇴",
    isBot: true,
    timestamp: new Date()
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const findAnswer = (question: string): string => {
    const normalizedQuestion = question.toLowerCase();
    
    // Check for exact matches first
    for (const [key, answer] of Object.entries(faqData)) {
      if (normalizedQuestion.includes(key)) {
        return answer;
      }
    }

    // Check for related terms
    if (normalizedQuestion.includes("quanto") || normalizedQuestion.includes("custo") || normalizedQuestion.includes("valor")) {
      return faqData["preços"];
    }
    
    if (normalizedQuestion.includes("curso") || normalizedQuestion.includes("especializado") || normalizedQuestion.includes("setor")) {
      return faqData["cursos"];
    }
    
    if (normalizedQuestion.includes("demonstra") || normalizedQuestion.includes("ver") || normalizedQuestion.includes("teste")) {
      return faqData["demo"];
    }
    
    if (normalizedQuestion.includes("ajuda") || normalizedQuestion.includes("problema") || normalizedQuestion.includes("contato")) {
      return faqData["suporte"];
    }

    // Default response
    return "🤔 Desculpe, não encontrei uma resposta específica para isso.\n\n💡 **Posso ajudar com:**\n• Informações sobre preços e planos\n• Detalhes dos nossos cursos especializados\n• Como ver demonstrações\n• Suporte e contato\n\n📞 **Contato Direto:**\n• WhatsApp: +244 923 456 789\n• Email: contato@proenglish.ao\n\nQue tipo de informação está procurando?";
  };

  const simulateTyping = async (message: string): Promise<void> => {
    setIsTyping(true);
    
    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      content: "",
      isBot: true,
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + message.length * 20));
    
    // Remove typing indicator and add real message
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.isTyping);
      return [...filtered, {
        id: `bot-${Date.now()}`,
        content: message,
        isBot: true,
        timestamp: new Date()
      }];
    });
    
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue;
    setInputValue("");

    const answer = findAnswer(question);
    await simulateTyping(answer);
  };

  const handleQuickAction = async (action: QuickAction) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: action.message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const answer = findAnswer(action.message);
    await simulateTyping(answer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const renderMessage = (message: Message) => {
    if (message.isTyping) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
            <div className="flex gap-1">
              <motion.div
                className="w-2 h-2 bg-violet-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-violet-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-violet-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${message.isBot ? "" : "flex-row-reverse"}`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.isBot 
            ? "bg-gradient-to-r from-violet-600 to-purple-600" 
            : "bg-gray-600"
        }`}>
          {message.isBot ? (
            <Bot className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <div className={`rounded-2xl px-4 py-3 max-w-xs lg:max-w-sm ${
          message.isBot
            ? "bg-gray-800 rounded-tl-sm text-gray-100"
            : "bg-gradient-to-r from-violet-600 to-purple-600 rounded-tr-sm text-white"
        }`}>
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {message.content}
          </div>
          <div className={`text-xs mt-2 ${
            message.isBot ? "text-gray-500" : "text-violet-200"
          }`}>
            {message.timestamp.toLocaleTimeString("pt-AO", { 
              hour: "2-digit", 
              minute: "2-digit" 
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-violet-500/25 transition-all duration-300"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: isMinimized ? 0.95 : 1, 
              y: 0,
              height: isMinimized ? "60px" : "600px"
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">ProEnglish Assistant</h3>
                  <p className="text-violet-200 text-xs">
                    {isTyping ? "Digitando..." : "Online agora"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 hover:bg-white/10"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-white" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-white/10"
                >
                  <X className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {renderMessage(message)}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2">
                    <div className="text-xs text-gray-400 mb-2">Perguntas frequentes:</div>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) => (
                        <motion.button
                          key={action.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickAction(action)}
                          className="flex items-center gap-2 bg-gray-800/50 hover:bg-violet-600/20 border border-gray-700 hover:border-violet-500/50 rounded-full px-3 py-2 text-xs text-gray-300 hover:text-white transition-all duration-200"
                        >
                          {action.icon}
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-700/50">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Introduza a sua pergunta..."
                      className="flex-1 bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500/20 rounded-lg px-3 py-2 text-sm"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-10 w-10 p-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Pressione Enter para enviar
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;