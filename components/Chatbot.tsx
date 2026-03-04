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
  Zap,
  BookOpen,
  Play,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  sendChatMessage,
  ChatMessage as APIChatMessage,
} from "@/src/domains/shared/chatbot/api/chatbotApi";

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

// Constantes
const SESSION_STORAGE_KEY = 'proenglish_chatbot_session';
const MAX_MESSAGES_DISPLAY = 50;
const MAX_HISTORY_API = 20;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [conversationHistory, setConversationHistory] = useState<APIChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar session ID do sessionStorage ao iniciar
  useEffect(() => {
    try {
      const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        setSessionId(savedSession);
      }
    } catch {
      // sessionStorage não disponível (ex: modo privado em alguns browsers)
    }
  }, []);

  // Salvar session ID quando mudar
  useEffect(() => {
    if (sessionId) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      } catch {
        // Ignorar erros de storage
      }
    }
  }, [sessionId]);

  const quickActions: QuickAction[] = [
    {
      id: "pricing",
      label: "Preços",
      icon: <Zap className="w-4 h-4" />,
      message: "Quais são os preços dos planos?",
    },
    {
      id: "courses",
      label: "Cursos",
      icon: <BookOpen className="w-4 h-4" />,
      message: "Que cursos especializados oferecem?",
    },
    {
      id: "demo",
      label: "Demo",
      icon: <Play className="w-4 h-4" />,
      message: "Como posso experimentar a plataforma?",
    },
    {
      id: "support",
      label: "Suporte",
      icon: <Headphones className="w-4 h-4" />,
      message: "Como posso contactar o suporte?",
    },
  ];

  const welcomeMessage: Message = {
    id: "welcome",
    content:
      "Olá! 👋 Sou o assistente virtual da ProEnglish Angola!\n\nPosso ajudar-te com informações sobre os nossos cursos, planos, funcionalidades ou qualquer dúvida sobre inglês especializado. Em que posso ajudar?",
    isBot: true,
    timestamp: new Date(),
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

  const addTypingIndicator = () => {
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      content: "",
      isBot: true,
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);
  };

  const removeTypingIndicator = () => {
    setMessages((prev) => prev.filter((msg) => !msg.isTyping));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);

    // Update conversation history for API (limitado)
    const newHistory: APIChatMessage[] = [
      ...conversationHistory.slice(-MAX_HISTORY_API + 1),
      { role: "user", content: inputValue },
    ];
    setConversationHistory(newHistory);

    const question = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Show typing indicator
    addTypingIndicator();

    try {
      // Call API
      const response = await sendChatMessage(question, newHistory, sessionId);

      // Update session ID if received
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      // Remove typing indicator
      removeTypingIndicator();

      // Add bot response (limitando total de mensagens exibidas)
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: response.response,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(-MAX_MESSAGES_DISPLAY + 1), botMessage]);

      // Update conversation history with bot response (limitado)
      setConversationHistory((prev) => [
        ...prev.slice(-MAX_HISTORY_API + 1),
        { role: "assistant", content: response.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      removeTypingIndicator();

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content:
          "Desculpe, ocorreu um erro. Por favor, tente novamente ou contacte-nos em suporte@proenglish.ao",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: action.message,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const newHistory: APIChatMessage[] = [
      ...conversationHistory.slice(-MAX_HISTORY_API + 1),
      { role: "user", content: action.message },
    ];
    setConversationHistory(newHistory);

    setIsTyping(true);
    addTypingIndicator();

    try {
      const response = await sendChatMessage(action.message, newHistory, sessionId);

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      removeTypingIndicator();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: response.response,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(-MAX_MESSAGES_DISPLAY + 1), botMessage]);

      setConversationHistory((prev) => [
        ...prev.slice(-MAX_HISTORY_API + 1),
        { role: "assistant", content: response.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      removeTypingIndicator();

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(-MAX_MESSAGES_DISPLAY + 1), errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.isBot
              ? "bg-gradient-to-r from-violet-600 to-purple-600"
              : "bg-gray-600"
          }`}
        >
          {message.isBot ? (
            <Bot className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 max-w-xs lg:max-w-sm ${
            message.isBot
              ? "bg-gray-800 rounded-tl-sm text-gray-100"
              : "bg-gradient-to-r from-violet-600 to-purple-600 rounded-tr-sm text-white"
          }`}
        >
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {message.content}
          </div>
          <div
            className={`text-xs mt-2 ${
              message.isBot ? "text-gray-500" : "text-violet-200"
            }`}
          >
            {message.timestamp.toLocaleTimeString("pt-AO", {
              hour: "2-digit",
              minute: "2-digit",
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
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-violet-500/25 transition-all duration-300"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
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
              height: isMinimized ? "60px" : "600px",
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-96 max-w-[calc(100vw-32px)] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    ProEnglish Assistant
                  </h3>
                  <p className="text-violet-200 text-xs">
                    {isTyping ? "A escrever..." : "Online - IA Inteligente"}
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
                    <div key={message.id}>{renderMessage(message)}</div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2">
                    <div className="text-xs text-gray-400 mb-2">
                      Perguntas frequentes:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) => (
                        <motion.button
                          key={action.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickAction(action)}
                          disabled={isTyping}
                          className="flex items-center gap-2 bg-gray-800/50 hover:bg-violet-600/20 border border-gray-700 hover:border-violet-500/50 rounded-full px-3 py-2 text-xs text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50"
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
                      placeholder="Escreva a sua pergunta..."
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
