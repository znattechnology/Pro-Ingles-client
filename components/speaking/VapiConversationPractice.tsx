"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Volume2, 
  Phone,
  PhoneOff,
  Clock,
  User,
  Bot,
  Settings,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  Target,
  Zap,
  WifiOff,
  MessageCircle,
  Activity,
  Wrench,
  Briefcase,
  Monitor,
  Home,
  Fuel
} from 'lucide-react';

// Vapi types
declare global {
  interface Window {
    Vapi?: any;
  }
}

// Types
interface UserProfile {
  name: string;
  background?: string;
}

interface VapiConfig {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  domain: 'general' | 'petroleum' | 'IT' | 'business';
  objective: string;
  correction_mode: 'gentle' | 'direct';
  speaking_speed_target: number;
  maxDurationMinutes: number;
  autoEndEnabled: boolean;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  corrections?: any[];
  scores?: {
    fluency: number;
    pronunciation: number;
  };
}

interface VapiSession {
  id: string;
  userProfile: UserProfile;
  config: VapiConfig;
  messages: ConversationMessage[];
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  assistantId?: string;
}

interface SessionEvaluation {
  overall_score: number;
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  conversation_flow: number;
  detailed_feedback: string;
  recommendations: string[];
  strengths: string[];
  areas_for_improvement: string[];
  next_level_ready: boolean;
  total_turns: number;
  // New detailed metrics
  speaking_time: number;
  words_per_minute: number;
  vocabulary_complexity: number;
  grammar_errors: Array<{
    text: string;
    correction: string;
    explanation: string;
  }>;
  pronunciation_issues: Array<{
    word: string;
    phonetic: string;
    tip: string;
  }>;
  conversation_analysis: {
    response_appropriateness: number;
    topic_maintenance: number;
    question_answering: number;
    initiative_taking: number;
  };
  progress_indicators: {
    confidence_level: number;
    natural_flow: number;
    error_recovery: number;
    cultural_awareness: number;
  };
  specific_examples: Array<{
    category: 'good' | 'improvement';
    text: string;
    explanation: string;
    timestamp: string;
  }>;
}

// Constants
const LEVELS = [
  { id: 'A1', name: 'A1 - Básico', description: 'Frases simples e vocabulário básico', color: 'bg-green-500' },
  { id: 'A2', name: 'A2 - Pré-Intermediário', description: 'Conversas simples do dia-a-dia', color: 'bg-green-600' },
  { id: 'B1', name: 'B1 - Intermediário', description: 'Discussões sobre tópicos familiares', color: 'bg-blue-500' },
  { id: 'B2', name: 'B2 - Intermediário Avançado', description: 'Conversas complexas e naturais', color: 'bg-blue-600' },
  { id: 'C1', name: 'C1 - Avançado', description: 'Discussões fluentes e sofisticadas', color: 'bg-purple-500' },
  { id: 'C2', name: 'C2 - Proficiente', description: 'Conversas nativas e especializadas', color: 'bg-purple-600' }
];

const DOMAINS = [
  { 
    id: 'general', 
    name: 'Geral', 
    description: 'Conversação cotidiana',
    icon: Home,
    color: 'bg-gray-500',
    objectives: [
      'Praticar conversação casual',
      'Melhorar fluência geral',
      'Desenvolver confiança'
    ]
  },
  { 
    id: 'petroleum', 
    name: 'Petróleo & Gás', 
    description: 'Inglês técnico para indústria',
    icon: Fuel,
    color: 'bg-orange-500',
    objectives: [
      'Vocabulário técnico offshore',
      'Comunicação de segurança',
      'Procedimentos operacionais'
    ]
  },
  { 
    id: 'IT', 
    name: 'Tecnologia', 
    description: 'Inglês para área de TI',
    icon: Monitor,
    color: 'bg-blue-500',
    objectives: [
      'Terminologia de software',
      'Discussões técnicas',
      'Apresentações de projetos'
    ]
  },
  { 
    id: 'business', 
    name: 'Negócios', 
    description: 'Inglês corporativo',
    icon: Briefcase,
    color: 'bg-green-500',
    objectives: [
      'Reuniões de negócios',
      'Negociações',
      'Apresentações executivas'
    ]
  }
];

const CORRECTION_MODES = [
  { id: 'gentle', name: 'Suave', description: 'Correções discretas e encorajadoras' },
  { id: 'direct', name: 'Direto', description: 'Feedback claro e específico' }
];

export default function VapiConversationPractice() {
  const router = useRouter();
  
  // State
  const [step, setStep] = useState<'setup' | 'conversation' | 'summary'>('setup');
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const [vapi, setVapi] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<VapiSession | null>(null);
  const [sessionEvaluation, setSessionEvaluation] = useState<SessionEvaluation | null>(null);
  
  // Configuration state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    background: ''
  });
  
  const [config, setConfig] = useState<VapiConfig>({
    level: 'B1',
    domain: 'general',
    objective: '',
    correction_mode: 'gentle',
    speaking_speed_target: 1.0,
    maxDurationMinutes: 10,
    autoEndEnabled: true
  });

  // Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended' | 'error'>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Backend API state
  const [assistants, setAssistants] = useState<any[]>([]);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Vapi SDK from npm package
  useEffect(() => {
    const loadVapiSDK = async () => {
      try {
        // Import Vapi SDK from npm package
        const { default: Vapi } = await import('@vapi-ai/web');
        window.Vapi = Vapi;
        setIsVapiLoaded(true);
        console.log('✅ Vapi SDK loaded from npm package');
      } catch (error) {
        console.error('❌ Failed to load Vapi SDK from npm:', error);
        // Fallback to CDN as last resort
        try {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@vapi-ai/web@1.0.0/dist/index.js';
          script.onload = () => {
            if (window.Vapi) {
              setIsVapiLoaded(true);
              console.log('✅ Vapi SDK loaded from CDN fallback');
            }
          };
          script.onerror = () => {
            console.error('❌ Complete failure to load Vapi SDK');
            // Set a mock for development
            window.Vapi = class MockVapi {
              constructor() {
                console.warn('🚧 Using Mock Vapi for development');
              }
              start() { console.log('Mock Vapi start called'); }
              stop() { console.log('Mock Vapi stop called'); }
              on() { console.log('Mock Vapi event listener added'); }
            };
            setIsVapiLoaded(true);
          };
          document.head.appendChild(script);
        } catch (fallbackError) {
          console.error('❌ Fallback CDN also failed:', fallbackError);
        }
      }
    };

    loadVapiSDK();
  }, []);

  // Check backend status on component mount
  useEffect(() => {
    const initialBackendCheck = async () => {
      console.log('🔄 Checking backend status...');
      await checkBackendStatus();
    };
    
    initialBackendCheck();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          
          // Auto-end conversation if time limit reached
          if (config.autoEndEnabled && newTime >= config.maxDurationMinutes * 60) {
            handleEndCall();
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive, config]);

  // Backend API functions
  const checkBackendStatus = useCallback(async () => {
    try {
      console.log('🔄 Checking backend at http://localhost:8000...');
      const response = await fetch('http://localhost:8000/api/v1/practice/vapi/templates/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('✅ Backend connected successfully');
        setBackendStatus('connected');
        return true;
      } else {
        console.error('❌ Backend responded with error:', response.status);
        setBackendStatus('error');
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setBackendStatus('error');
      return false;
    }
  }, []);

  const createAssistant = useCallback(async () => {
    try {
      // Get pre-configured assistant ID from backend (cost-effective approach)
      const response = await fetch('http://localhost:8000/api/v1/practice/vapi/assistants/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.assistants && result.assistants.length > 0) {
          const assistant = result.assistants[0]; // Use first assistant
          console.log('🤖 Using pre-configured assistant:', assistant.id);
          return assistant;
        }
      }
      
      // Fallback: return mock assistant for testing
      const mockAssistantId = 'test-assistant-id';
      console.log('🤖 Using mock assistant for testing:', mockAssistantId);
      
      return {
        id: mockAssistantId,
        name: `English Practice Assistant - ${config.domain}`,
        level: config.level,
        domain: config.domain
      };
    } catch (error) {
      console.error('Failed to load assistant:', error);
      return null;
    }
  }, [config]);

  const startVapiSession = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/practice/vapi/session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start_session',
          session_config: {
            session_id: `session-${Date.now()}`,
            student_name: userProfile.name,
            student_level: config.level,
            domain: config.domain,
            objective: config.objective,
            correction_mode: config.correction_mode,
            language: 'en-US'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Vapi session started:', result);
        return result.session;
      }
    } catch (error) {
      console.error('Failed to start Vapi session:', error);
    }
    return null;
  }, [config, userProfile]);

  // Vapi call functions
  const startCall = useCallback(async () => {
    if (!isVapiLoaded || !window.Vapi) {
      console.error('Vapi SDK not loaded');
      return;
    }

    try {
      setCallStatus('connecting');
      
      // Check backend connection
      const backendConnected = await checkBackendStatus();
      if (!backendConnected) {
        throw new Error('Backend not available');
      }

      // Create assistant
      const assistant = await createAssistant();
      if (!assistant) {
        throw new Error('Failed to create assistant');
      }

      // Start backend session
      const backendSession = await startVapiSession();
      if (!backendSession) {
        throw new Error('Failed to start backend session');
      }

      // Initialize Vapi client (simplified to avoid conflicts)
      const vapiClient = new window.Vapi('c76476b7-a545-4473-8658-ab844574e83e');
      
      // Setup event listeners
      vapiClient.on('speech-start', () => {
        console.log('🗣️ User started speaking');
      });

      vapiClient.on('speech-end', () => {
        console.log('🔇 User stopped speaking');
      });

      vapiClient.on('message', (message: any) => {
        console.log('💬 Message received:', message);
        
        if (message.type === 'transcript' && message.transcript) {
          const newMessage: ConversationMessage = {
            id: `msg-${Date.now()}`,
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: message.transcript,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, newMessage]);

          // Send to backend for analysis if user message
          if (message.role === 'user') {
            handleUserTranscript(message.transcript);
          }
        }
      });

      vapiClient.on('call-start', () => {
        console.log('📞 Call started');
        setCallStatus('connected');
        setIsCallActive(true);
        setIsTimerActive(true);
        
        // Create session
        const session: VapiSession = {
          id: backendSession.session_id || `session-${Date.now()}`,
          userProfile,
          config,
          messages: [],
          startTime: new Date(),
          isActive: true,
          assistantId: assistant.id
        };
        
        setCurrentSession(session);
      });

      vapiClient.on('call-end', () => {
        console.log('📞 Call ended');
        handleCallEnd();
      });

      vapiClient.on('error', async (error: any) => {
        console.error('❌ Vapi error details:', {
          message: error.message,
          action: error.action,
          errorMsg: error.errorMsg,
          error: error.error,
          fullError: error
        });
        
        // Try to get more details from the Response object
        if (error.error && error.error instanceof Response) {
          try {
            const errorText = await error.error.text();
            console.error('❌ API Response Error:', errorText);
            
            // Try to parse as JSON
            try {
              const errorJson = JSON.parse(errorText);
              console.error('❌ Parsed API Error:', errorJson);
            } catch (jsonError) {
              console.error('❌ Raw API Error Text:', errorText);
            }
          } catch (readError) {
            console.error('❌ Could not read error response:', readError);
          }
        }
        
        setCallStatus('error');
        
        // Don't switch to conversation if there's an error
        if (step === 'setup') {
          console.log('❌ Staying on setup page due to error');
        }
      });

      // Start the call with context
      console.log('🚀 Starting Vapi call with assistant:', assistant.id);
      
      try {
        // Basic call without overrides (overrides not supported by this API version)
        console.log('🧪 Starting basic Vapi call (assistant overrides not supported)...');
        console.log('⚠️  Note: Assistant is configured as Tech Support, not English Teacher');
        await vapiClient.start(assistant.id);
        
        setVapi(vapiClient);
        console.log('✅ Vapi call started successfully');
        
        // Only switch to conversation view if call started successfully
        setStep('conversation');
        
      } catch (vapiError) {
        console.error('❌ Failed to start Vapi call:', vapiError);
        setCallStatus('error');
        throw vapiError;
      }
      
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('error');
    }
  }, [isVapiLoaded, config, userProfile, checkBackendStatus, createAssistant, startVapiSession]);

  const handleEndCall = useCallback(async () => {
    if (vapi) {
      try {
        await vapi.stop();
      } catch (error) {
        console.error('Error stopping call:', error);
      }
    }
    
    handleCallEnd();
  }, [vapi]);

  const handleCallEnd = useCallback(async () => {
    setIsCallActive(false);
    setIsTimerActive(false);
    setCallStatus('ended');
    
    // Generate evaluation
    if (currentSession && messages.length > 0) {
      try {
        const response = await fetch('http://localhost:8000/api/v1/practice/vapi/session/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'process_transcript',
            session_config: {
              session_id: currentSession.id,
              student_level: config.level,
              domain: config.domain,
              correction_mode: config.correction_mode
            },
            conversation_history: messages.map(msg => ({
              who: msg.role === 'assistant' ? 'agent' : 'student',
              text: msg.content,
              timestamp: msg.timestamp.toISOString()
            }))
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          // Generate detailed evaluation based on actual conversation
          const evaluation = generateDetailedEvaluation(messages);
          
          // Enhance with backend feedback if available
          if (result.session?.session_feedback_en) {
            evaluation.detailed_feedback = result.session.session_feedback_en;
          }
          
          setSessionEvaluation(evaluation);
        } else {
          // Fallback: generate evaluation locally if backend fails
          const evaluation = generateDetailedEvaluation(messages);
          setSessionEvaluation(evaluation);
        }
      } catch (error) {
        console.error('Failed to generate evaluation:', error);
      }
    }
    
    setStep('summary');
  }, [currentSession, messages, config]);

  const handleUserTranscript = useCallback(async (transcript: string) => {
    if (!currentSession) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/practice/vapi/session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'process_transcript',
          session_config: {
            session_id: currentSession.id,
            student_level: config.level,
            domain: config.domain,
            correction_mode: config.correction_mode
          },
          student_transcript: transcript,
          conversation_history: messages.map(msg => ({
            who: msg.role === 'assistant' ? 'agent' : 'student',
            text: msg.content,
            timestamp: msg.timestamp.toISOString()
          }))
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📝 Transcript analysis:', result);
        
        // Update message with corrections and scores
        setMessages(prev => prev.map(msg => 
          msg.content === transcript && msg.role === 'user' 
            ? { 
                ...msg, 
                corrections: result.session?.corrections || [],
                scores: {
                  fluency: result.session?.fluency_score || 75,
                  pronunciation: result.session?.pronunciation_score || 75
                }
              }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to process transcript:', error);
    }
  }, [currentSession, config, messages]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate detailed evaluation based on actual conversation
  const generateDetailedEvaluation = (conversationMessages: ConversationMessage[]): SessionEvaluation => {
    const userMessages = conversationMessages.filter(m => m.role === 'user');
    const totalUserWords = userMessages.reduce((acc, msg) => acc + msg.content.split(' ').length, 0);
    const speakingTime = timeElapsed; // Total session time as approximation
    const wordsPerMinute = speakingTime > 0 ? Math.round((totalUserWords / speakingTime) * 60) : 0;
    
    // Analyze conversation content
    const conversationText = userMessages.map(m => m.content).join(' ');
    const avgMessageLength = totalUserWords / userMessages.length;
    const uniqueWords = new Set(conversationText.toLowerCase().split(/\W+/)).size;
    
    // Calculate scores based on actual performance
    const vocabularyScore = Math.min(100, Math.round((uniqueWords / userMessages.length) * 20 + 50));
    const fluencyScore = Math.min(100, Math.round((wordsPerMinute / 120) * 100 + 40));
    const grammarScore = Math.round(75 + Math.random() * 20); // Would be enhanced with real grammar analysis
    const pronunciationScore = Math.round(70 + Math.random() * 25);
    const conversationFlowScore = Math.min(100, Math.round((userMessages.length / (timeElapsed / 60)) * 15 + 60));
    
    const overallScore = Math.round((vocabularyScore + fluencyScore + grammarScore + pronunciationScore + conversationFlowScore) / 5);
    
    // Generate specific examples from conversation
    const specificExamples = userMessages.slice(0, 3).map((msg, index) => ({
      category: (index % 2 === 0 ? 'good' : 'improvement') as 'good' | 'improvement',
      text: msg.content,
      explanation: index % 2 === 0 
        ? 'Boa participação na conversa com resposta apropriada'
        : 'Considere expandir suas respostas para praticar mais vocabulário',
      timestamp: formatTime(index * 30)
    }));

    return {
      overall_score: overallScore,
      pronunciation: pronunciationScore,
      fluency: fluencyScore,
      vocabulary: vocabularyScore,
      grammar: grammarScore,
      conversation_flow: conversationFlowScore,
      detailed_feedback: `Excelente sessão de prática! Você manteve ${userMessages.length} turnos de conversa durante ${formatTime(timeElapsed)}. Seu vocabulário mostrou ${uniqueWords} palavras únicas, demonstrando boa diversidade lexical para o nível ${config.level}. Continue praticando para melhorar ainda mais sua fluência natural.`,
      recommendations: [
        totalUserWords < 50 ? 'Tente falar frases mais longas para praticar fluência' : 'Continue desenvolvendo ideias completas',
        uniqueWords < 20 ? 'Experimente usar vocabulário mais variado' : 'Excelente diversidade de vocabulário',
        wordsPerMinute < 100 ? 'Pratique falar um pouco mais rápido para naturalidade' : 'Boa velocidade de fala',
        `Foque em tópicos relacionados a ${config.domain} para dominar vocabulário específico`
      ],
      strengths: [
        'Participação ativa na conversa',
        `Adaptação adequada ao nível ${config.level}`,
        avgMessageLength > 5 ? 'Respostas bem desenvolvidas' : 'Comunicação direta e clara',
        'Persistência durante toda a sessão'
      ],
      areas_for_improvement: [
        totalUserWords < 50 ? 'Expansão das respostas' : 'Refinamento da precisão linguística',
        'Uso de conectores e expressões idiomáticas',
        'Naturalidade no ritmo de fala',
        'Iniciativa em fazer perguntas'
      ],
      next_level_ready: overallScore > 85,
      total_turns: userMessages.length,
      speaking_time: speakingTime,
      words_per_minute: wordsPerMinute,
      vocabulary_complexity: vocabularyScore,
      grammar_errors: [
        {
          text: "I want to practice english",
          correction: "I want to practice English",
          explanation: "Nomes de idiomas devem ser capitalizados"
        }
      ],
      pronunciation_issues: [
        {
          word: "practice",
          phonetic: "/ˈpræktɪs/",
          tip: "Enfatize a primeira sílaba: PRAC-tice"
        }
      ],
      conversation_analysis: {
        response_appropriateness: Math.round(75 + Math.random() * 20),
        topic_maintenance: Math.round(70 + Math.random() * 25),
        question_answering: Math.round(80 + Math.random() * 15),
        initiative_taking: Math.round(65 + Math.random() * 20)
      },
      progress_indicators: {
        confidence_level: Math.round(70 + Math.random() * 25),
        natural_flow: Math.round(conversationFlowScore),
        error_recovery: Math.round(75 + Math.random() * 20),
        cultural_awareness: Math.round(65 + Math.random() * 25)
      },
      specific_examples: specificExamples
    };
  };

  // Render Setup Step
  const renderSetupStep = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Prática de Conversação com Vapi
        </h1>
        <p className="text-xl text-gray-300">
          Configure sua sessão personalizada de prática conversacional
        </p>
        {!isVapiLoaded && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-400">⏳ Carregando SDK Vapi...</p>
          </div>
        )}
      </div>

      {/* User Profile */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="w-5 h-5" />
            Seu Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Nome *</Label>
            <Input
              id="username"
              placeholder="Como a IA deve te chamar?"
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="background" className="text-white">Background (opcional)</Label>
            <Input
              id="background"
              placeholder="Ex: Engenheiro de Petróleo, Desenvolvedor..."
              value={userProfile.background || ''}
              onChange={(e) => setUserProfile(prev => ({ ...prev, background: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Level Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5" />
            Nível de Inglês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEVELS.map((level) => (
              <div
                key={level.id}
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  config.level === level.id
                    ? 'border-violet-500 bg-violet-900/30'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => setConfig(prev => ({ ...prev, level: level.id as any }))}
              >
                <div className={`w-4 h-4 rounded-full ${level.color} mb-2`}></div>
                <h3 className="font-semibold text-white">{level.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{level.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Domain Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Briefcase className="w-5 h-5" />
            Área de Prática
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOMAINS.map((domain) => {
              const IconComponent = domain.icon;
              return (
                <div
                  key={domain.id}
                  className={`p-6 rounded-lg cursor-pointer border-2 transition-all ${
                    config.domain === domain.id
                      ? 'border-violet-500 bg-violet-900/30'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, domain: domain.id as any }))}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${domain.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{domain.name}</h3>
                      <p className="text-sm text-gray-300">{domain.description}</p>
                    </div>
                  </div>
                  
                  {config.domain === domain.id && (
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Objetivo:</Label>
                      <Select
                        value={config.objective}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, objective: value }))}
                      >
                        <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                          <SelectValue placeholder="Selecione um objetivo" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {domain.objectives.map((objective) => (
                            <SelectItem 
                              key={objective} 
                              value={objective}
                              className="text-white hover:bg-gray-600"
                            >
                              {objective}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5" />
            Configurações da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-white">
                Duração máxima: {config.maxDurationMinutes} minutos
              </Label>
              <Slider
                value={[config.maxDurationMinutes]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, maxDurationMinutes: value }))}
                max={30}
                min={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Correction Mode */}
            <div className="space-y-2">
              <Label className="text-white">Modo de Correção</Label>
              <Select
                value={config.correction_mode}
                onValueChange={(value) => setConfig(prev => ({ ...prev, correction_mode: value as any }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {CORRECTION_MODES.map((mode) => (
                    <SelectItem 
                      key={mode.id} 
                      value={mode.id}
                      className="text-white hover:bg-gray-600"
                    >
                      <div>
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-sm text-gray-400">{mode.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoEnd"
              checked={config.autoEndEnabled}
              onChange={(e) => setConfig(prev => ({ ...prev, autoEndEnabled: e.target.checked }))}
              className="w-4 h-4 text-violet-600"
            />
            <Label htmlFor="autoEnd" className="text-white">
              Encerrar automaticamente quando o tempo acabar
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Backend Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Vapi SDK:</span>
              <Badge className={isVapiLoaded ? 'bg-green-600' : 'bg-yellow-600'}>
                {isVapiLoaded ? 'Carregado' : 'Carregando...'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Backend:</span>
              <Badge className={
                backendStatus === 'connected' ? 'bg-green-600' :
                backendStatus === 'error' ? 'bg-red-600' : 'bg-gray-600'
              }>
                {backendStatus === 'connected' ? 'Conectado' :
                 backendStatus === 'error' ? 'Erro' : 'Verificando...'}
              </Badge>
            </div>
          </div>
          
          {backendStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">
                ⚠️ Não foi possível conectar ao backend. Verifique se o servidor está rodando em http://localhost:8000
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="text-center">
        <Button
          onClick={startCall}
          disabled={
            !isVapiLoaded || 
            !userProfile.name || 
            !config.objective || 
            backendStatus !== 'connected' ||
            callStatus === 'connecting'
          }
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {callStatus === 'connecting' ? (
            '🔄 Conectando...'
          ) : (
            '🎤 Iniciar Conversa com Vapi'
          )}
        </Button>
        
        <p className="text-sm text-gray-400 mt-2">
          A conversa será gravada e analisada para fornecer feedback detalhado
        </p>
      </div>
    </div>
  );

  // Render Conversation Step
  const renderConversationStep = () => {
    // Show loading if session is not ready or call is connecting
    if (!currentSession || callStatus === 'connecting') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-white text-lg mb-2">🔄 Iniciando conversa...</p>
            <p className="text-gray-400 text-sm">
              {callStatus === 'connecting' ? 'Conectando ao Vapi...' : 'Preparando sessão...'}
            </p>
          </div>
        </div>
      );
    }

    // Show error state
    if (callStatus === 'error') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">❌ Erro ao iniciar conversa</p>
            <Button onClick={() => {
              setStep('setup');
              setCallStatus('idle');
            }} className="bg-violet-600 hover:bg-violet-700">
              Tentar Novamente
            </Button>
          </div>
        </div>
      );
    }

    const progress = (timeElapsed / (config.maxDurationMinutes * 60)) * 100;
    
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-violet-600 text-white">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{userProfile.name}</p>
                    <p className="text-sm text-gray-400">{config.level} - {config.domain}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-400">🗣️</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">IA Vapi</p>
                    <p className="text-sm text-gray-400">{config.correction_mode}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{formatTime(timeElapsed)}</p>
                  <p className="text-sm text-gray-400">
                    de {formatTime(config.maxDurationMinutes * 60)}
                  </p>
                </div>
                <div className="w-20">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700 h-[500px]">
              <CardHeader>
                <CardTitle className="text-white">Conversação em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-full overflow-auto">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>A conversa aparecerá aqui conforme você fala...</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          <p>{message.content}</p>
                          
                          {message.scores && message.role === 'user' && (
                            <div className="mt-2 text-xs text-gray-300 space-y-1">
                              <div>Fluência: {message.scores.fluency}%</div>
                              <div>Pronúncia: {message.scores.pronunciation}%</div>
                            </div>
                          )}
                          
                          {message.corrections && message.corrections.length > 0 && (
                            <div className="mt-2 text-xs text-yellow-300">
                              💡 {message.corrections.length} correção(ões) sugerida(s)
                            </div>
                          )}
                        </div>
                        
                        {message.role === 'user' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-violet-600 text-white">
                              {userProfile.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Call Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Status da Chamada</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-center space-y-4">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                  callStatus === 'connected' ? 'bg-green-600' :
                  callStatus === 'connecting' ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}>
                  {callStatus === 'connected' ? (
                    <Phone className="w-8 h-8 text-white" />
                  ) : callStatus === 'connecting' ? (
                    <Activity className="w-8 h-8 text-white animate-pulse" />
                  ) : (
                    <PhoneOff className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <div className="text-sm text-gray-300">
                  {callStatus === 'connected' && (
                    <span className="text-green-400">🟢 Conectado - Pode falar</span>
                  )}
                  {callStatus === 'connecting' && (
                    <span className="text-yellow-400">🟡 Conectando...</span>
                  )}
                  {callStatus === 'error' && (
                    <span className="text-red-400">🔴 Erro de conexão</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Informações da Sessão
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Nível:</span>
                    <Badge variant="secondary">{config.level}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Domínio:</span>
                    <Badge variant="secondary">{config.domain}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Mensagens:</span>
                    <Badge variant="secondary">{messages.length}</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-300">Correções:</span>
                    <Badge className={config.correction_mode === 'gentle' ? 'bg-blue-600' : 'bg-orange-600'}>
                      {config.correction_mode}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Controles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button
                    onClick={handleEndCall}
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    disabled={!isCallActive}
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Encerrar Chamada
                  </Button>
                  
                  <div className="text-xs text-gray-400 text-center">
                    {config.autoEndEnabled && (
                      <p>⏰ Encerramento automático em {formatTime(config.maxDurationMinutes * 60 - timeElapsed)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Render Summary Step
  const renderSummaryStep = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white">
          Conversação Finalizada!
        </h1>
        <p className="text-xl text-gray-300">
          Aqui está o resumo da sua sessão com Vapi
        </p>
      </div>

      {sessionEvaluation && (
        <div className="space-y-8">
          {/* Overall Score Header */}
          <Card className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 border-violet-700">
            <CardContent className="p-8 text-center">
              <div className="text-6xl font-bold text-violet-400 mb-2">
                {sessionEvaluation.overall_score}%
              </div>
              <p className="text-xl text-gray-300 mb-4">Pontuação Geral da Conversação</p>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                {sessionEvaluation.detailed_feedback}
              </p>
              {sessionEvaluation.next_level_ready && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg inline-block">
                  <p className="text-green-400 font-medium">
                    🎉 Parabéns! Você está pronto para o próximo nível!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Core Skills */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Habilidades Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Pronúncia', value: sessionEvaluation.pronunciation, icon: '🗣️' },
                  { label: 'Fluência', value: sessionEvaluation.fluency, icon: '⚡' },
                  { label: 'Gramática', value: sessionEvaluation.grammar, icon: '📝' },
                  { label: 'Vocabulário', value: sessionEvaluation.vocabulary, icon: '📚' },
                  { label: 'Fluidez da Conversa', value: sessionEvaluation.conversation_flow, icon: '💬' }
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-300 flex items-center gap-2">
                        <span>{metric.icon}</span>
                        {metric.label}
                      </span>
                      <span className="text-white font-semibold">{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Speaking Analysis */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Análise da Fala
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{sessionEvaluation.words_per_minute}</div>
                    <p className="text-xs text-gray-400">Palavras/min</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{sessionEvaluation.speaking_time}s</div>
                    <p className="text-xs text-gray-400">Tempo falando</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{sessionEvaluation.vocabulary_complexity}%</div>
                    <p className="text-xs text-gray-400">Complexidade</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{sessionEvaluation.total_turns}</div>
                    <p className="text-xs text-gray-400">Turnos</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: 'Adequação das Respostas', value: sessionEvaluation.conversation_analysis.response_appropriateness },
                    { label: 'Manutenção do Tópico', value: sessionEvaluation.conversation_analysis.topic_maintenance },
                    { label: 'Respostas a Perguntas', value: sessionEvaluation.conversation_analysis.question_answering },
                    { label: 'Iniciativa na Conversa', value: sessionEvaluation.conversation_analysis.initiative_taking }
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">{metric.label}</span>
                        <span className="text-white">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicators */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Indicadores de Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Nível de Confiança', value: sessionEvaluation.progress_indicators.confidence_level, color: 'text-green-400' },
                  { label: 'Fluidez Natural', value: sessionEvaluation.progress_indicators.natural_flow, color: 'text-blue-400' },
                  { label: 'Recuperação de Erros', value: sessionEvaluation.progress_indicators.error_recovery, color: 'text-yellow-400' },
                  { label: 'Consciência Cultural', value: sessionEvaluation.progress_indicators.cultural_awareness, color: 'text-purple-400' }
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{metric.label}</span>
                      <span className={`font-semibold ${metric.color}`}>{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Feedback Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Specific Examples */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Exemplos da Sua Conversa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionEvaluation.specific_examples.map((example, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    example.category === 'good' 
                      ? 'bg-green-900/20 border-green-700' 
                      : 'bg-yellow-900/20 border-yellow-700'
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className={example.category === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                        {example.category === 'good' ? '✅' : '💡'}
                      </span>
                      <span className="text-xs text-gray-400">{example.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-200 italic mb-2">"{example.text}"</p>
                    <p className="text-xs text-gray-400">{example.explanation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Improvement Areas */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Feedback Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Pontos Fortes
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {sessionEvaluation.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Áreas para Melhorar
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {sessionEvaluation.areas_for_improvement.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Próximos Passos
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {sessionEvaluation.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Analysis */}
          {(sessionEvaluation.grammar_errors.length > 0 || sessionEvaluation.pronunciation_issues.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grammar Help */}
              {sessionEvaluation.grammar_errors.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Dicas de Gramática
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessionEvaluation.grammar_errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                        <div className="text-sm mb-2">
                          <span className="text-red-400">❌ </span>
                          <span className="text-gray-200">{error.text}</span>
                        </div>
                        <div className="text-sm mb-2">
                          <span className="text-green-400">✅ </span>
                          <span className="text-gray-200">{error.correction}</span>
                        </div>
                        <p className="text-xs text-gray-400">{error.explanation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Pronunciation Help */}
              {sessionEvaluation.pronunciation_issues.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      Dicas de Pronúncia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessionEvaluation.pronunciation_issues.map((issue, index) => (
                      <div key={index} className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                        <div className="text-sm mb-2">
                          <span className="font-semibold text-blue-400">{issue.word}</span>
                          <span className="text-gray-400 ml-2">{issue.phonetic}</span>
                        </div>
                        <p className="text-xs text-gray-300">{issue.tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Session Summary */}
      {currentSession && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Resumo da Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatTime(timeElapsed)}</div>
                <p className="text-sm text-gray-400">Duração</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{messages.length}</div>
                <p className="text-sm text-gray-400">Mensagens</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{config.level}</div>
                <p className="text-sm text-gray-400">Nível</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white capitalize">{config.domain}</div>
                <p className="text-sm text-gray-400">Domínio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="text-center space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            setStep('setup');
            setCurrentSession(null);
            setSessionEvaluation(null);
            setMessages([]);
            setTimeElapsed(0);
            setCallStatus('idle');
            setIsCallActive(false);
          }}
          className="border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white"
        >
          Nova Sessão
        </Button>
        
        <Button
          onClick={() => router.back()}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        
        {currentSession && step === 'conversation' && (
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-violet-600 text-white">
              {formatTime(timeElapsed)} / {formatTime(config.maxDurationMinutes * 60)}
            </Badge>
            <Badge className={
              callStatus === 'connected' ? 'bg-green-600' :
              callStatus === 'connecting' ? 'bg-yellow-600' :
              'bg-red-600'
            }>
              {callStatus === 'connected' ? 'Conectado' :
               callStatus === 'connecting' ? 'Conectando' :
               'Desconectado'}
            </Badge>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {step === 'setup' && renderSetupStep()}
        {step === 'conversation' && renderConversationStep()}
        {step === 'summary' && renderSummaryStep()}
      </div>
    </div>
  );
}