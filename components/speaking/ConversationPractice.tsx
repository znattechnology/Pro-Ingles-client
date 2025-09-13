"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Bot, 
  User, 
  Volume2, 
  Clock, 
  Target,
  TrendingUp,
  Heart,
  Star,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  PlayCircle,
  StopCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import VoiceRecorder from "./VoiceRecorder";

interface ConversationMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  feedback?: {
    pronunciation: number;
    fluency: number;
    accuracy: number;
    confidence: number;
    overallScore: number;
    suggestions: string[];
  };
}

interface ConversationSession {
  id: string;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  scenario: string;
  targetLevel: string;
  estimatedDuration: number;
}

// Mock data - will be replaced with API calls
const mockSession: ConversationSession = {
  id: "1",
  title: "Business Introduction Practice",
  description: "Practice introducing yourself in professional settings",
  difficulty: "INTERMEDIATE",
  scenario: "You are meeting a new client at a business conference. Introduce yourself and start a professional conversation.",
  targetLevel: "B2",
  estimatedDuration: 10
};

const initialAiMessage: ConversationMessage = {
  id: "ai-welcome",
  role: "ai",
  content: "Hello! I'm your AI conversation partner. Let's practice a business introduction scenario. I'll be playing the role of a potential client you're meeting at a conference. Please introduce yourself and tell me about your work.",
  timestamp: new Date()
};

export default function ConversationPractice() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([initialAiMessage]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    messagesExchanged: 0,
    averageScore: 0,
    timeSpent: 0,
    heartsUsed: 0
  });
  const [currentHearts, setCurrentHearts] = useState(5);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session timer
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    setSessionTimer(0);
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setIsRecording(false);
    // Show session summary or redirect
    router.push('/user/speaking/progress');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = async (audioBlob: Blob) => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Mock API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock user message with feedback
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: "Hello, my name is [User Name] and I work as a software developer. I specialize in web applications and I'm excited to learn about your business needs.",
        timestamp: new Date(),
        audioUrl: URL.createObjectURL(audioBlob),
        feedback: {
          pronunciation: 85,
          fluency: 78,
          accuracy: 92,
          confidence: 80,
          overallScore: 84,
          suggestions: [
            "Try to speak a bit slower for better clarity",
            "Great use of professional vocabulary!"
          ]
        }
      };

      // Mock AI response
      const aiResponse: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: "ai", 
        content: "Nice to meet you! That's fascinating. I'm actually looking for someone to help modernize our company's web presence. What kind of web applications do you typically work on?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage, aiResponse]);
      setSessionStats(prev => ({
        ...prev,
        messagesExchanged: prev.messagesExchanged + 1,
        averageScore: Math.round((prev.averageScore + userMessage.feedback!.overallScore) / 2)
      }));

      if (userMessage.feedback!.overallScore < 70) {
        setCurrentHearts(prev => Math.max(0, prev - 1));
        setSessionStats(prev => ({ ...prev, heartsUsed: prev.heartsUsed + 1 }));
      }

    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = (messageId: string, audioUrl: string) => {
    if (isPlayingAudio === messageId) {
      setIsPlayingAudio(null);
      return;
    }

    const audio = new Audio(audioUrl);
    setIsPlayingAudio(messageId);
    
    audio.onended = () => setIsPlayingAudio(null);
    audio.onerror = () => setIsPlayingAudio(null);
    
    audio.play();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-900/50 text-green-300";
    if (score >= 70) return "bg-yellow-900/50 text-yellow-300";
    return "bg-red-900/50 text-red-300";
  };

  if (!isSessionActive) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Back Button */}
          <Button 
            onClick={() => router.back()} 
            variant="ghost" 
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {/* Session Overview */}
          <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">{mockSession.title}</CardTitle>
                  <p className="text-gray-400">{mockSession.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Session Details */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getScoreBadgeColor(75)}>
                    {mockSession.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    <Clock className="w-3 h-3 mr-1" />
                    {mockSession.estimatedDuration} min
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    <Target className="w-3 h-3 mr-1" />
                    Nível {mockSession.targetLevel}
                  </Badge>
                </div>

                <div className="bg-customgreys-darkGrey/50 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Cenário:</h4>
                  <p className="text-gray-300">{mockSession.scenario}</p>
                </div>
              </div>

              {/* Start Session */}
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: currentHearts }).map((_, i) => (
                    <Heart key={i} className="w-6 h-6 text-red-400 fill-current" />
                  ))}
                </div>
                
                <Button 
                  onClick={handleStartSession}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  size="lg"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Iniciar Conversa
                </Button>
                
                <p className="text-sm text-gray-400">
                  Você tem {currentHearts} vidas. Perde uma vida se sua pontuação for menor que 70%.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Session Header */}
        <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg border border-gray-800">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleEndSession} 
              variant="ghost" 
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-white font-semibold">{mockSession.title}</h1>
              <p className="text-sm text-gray-400">Nível {mockSession.targetLevel}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(sessionTimer)}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: currentHearts }).map((_, i) => (
                <Heart key={i} className="w-4 h-4 text-red-400 fill-current" />
              ))}
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <TrendingUp className="w-4 h-4" />
              <span>{sessionStats.averageScore}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          
          {/* Conversation Area */}
          <div className="lg:col-span-3">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 h-full flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversação
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] pr-2">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'ai' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-purple-600">
                              <Bot className="w-4 h-4 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[80%] space-y-2 ${message.role === 'user' ? 'order-first' : ''}`}>
                          <div className={`p-3 rounded-lg ${
                            message.role === 'ai' 
                              ? 'bg-customgreys-darkGrey text-white' 
                              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                          }`}>
                            <p>{message.content}</p>
                            {message.audioUrl && (
                              <Button
                                onClick={() => handlePlayAudio(message.id, message.audioUrl!)}
                                variant="ghost"
                                size="sm"
                                className="mt-2 p-1 h-auto text-gray-300 hover:text-white"
                              >
                                {isPlayingAudio === message.id ? (
                                  <StopCircle className="w-4 h-4" />
                                ) : (
                                  <PlayCircle className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                          
                          {/* Feedback for user messages */}
                          {message.role === 'user' && message.feedback && (
                            <div className="bg-customgreys-darkGrey/50 p-3 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span className={`font-semibold ${getScoreColor(message.feedback.overallScore)}`}>
                                  {message.feedback.overallScore}%
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>Pronúncia: {message.feedback.pronunciation}%</div>
                                <div>Fluência: {message.feedback.fluency}%</div>
                                <div>Precisão: {message.feedback.accuracy}%</div>
                                <div>Confiança: {message.feedback.confidence}%</div>
                              </div>
                              
                              {message.feedback.suggestions.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-300">Sugestões:</p>
                                  {message.feedback.suggestions.map((suggestion, idx) => (
                                    <p key={idx} className="text-xs text-gray-400">• {suggestion}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {message.role === 'user' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-600">
                              <User className="w-4 h-4 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <Separator className="bg-customgreys-darkGrey" />
                
                {/* Voice Recorder */}
                <div className="space-y-4">
                  {isProcessing && (
                    <div className="text-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-400" />
                      <p className="text-sm text-gray-400">Analisando sua fala...</p>
                    </div>
                  )}
                  
                  <VoiceRecorder
                    isRecording={isRecording}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    maxDuration={30}
                    className="bg-customgreys-darkGrey/50"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Stats Sidebar */}
          <div className="space-y-4">
            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mensagens</span>
                    <span className="text-white">{sessionStats.messagesExchanged}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pontuação Média</span>
                    <span className={getScoreColor(sessionStats.averageScore)}>
                      {sessionStats.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vidas Usadas</span>
                    <span className="text-white">{sessionStats.heartsUsed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tempo</span>
                    <span className="text-white font-mono">{formatTime(sessionTimer)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Manter +80% pontuação</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">10+ trocas de mensagens</span>
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Manter todas as vidas</span>
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleEndSession}
              variant="outline" 
              className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Finalizar Sessão
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}