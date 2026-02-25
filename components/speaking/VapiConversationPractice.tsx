"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loading from '@/components/course/Loading';
import { useGetProfileQuery } from '@/src/domains/auth/services/authApi';
import { retryFetchJSON } from '@/lib/apiRetry';
import {
  ArrowLeft,
  PhoneOff,
  User,
  Bot,
  Settings,
  Target,
  MessageCircle,
  Activity,
  Briefcase,
  Monitor,
  Home,
  Fuel,
  Mic,
  MicOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
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

// ✅ Environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

if (!VAPI_PUBLIC_KEY) {
  console.error('❌ VAPI_PUBLIC_KEY not configured in environment variables');
}

export default function VapiConversationPractice() {
  const router = useRouter();
  const { data: loggedInUser } = useGetProfileQuery();

  // State
  const [step, setStep] = useState<'setup' | 'conversation' | 'summary'>('setup');
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const [vapi, setVapi] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<VapiSession | null>(null);

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
  const [connectionStep, setConnectionStep] = useState<string>('Iniciando...');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false); // Prevent multiple call ends

  // 🔴 BLOCKER #1: Session processing state
  const [isProcessingSession, setIsProcessingSession] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Speaking status indicators
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Session recovery
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoverySessionData, setRecoverySessionData] = useState<any>(null);

  // Backend API state
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  // Microphone permission state
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied' | 'checking'>('unknown');
  const [showMicDialog, setShowMicDialog] = useState(false);
  const [showMicDeniedAlert, setShowMicDeniedAlert] = useState(false);
  const [browserType, setBrowserType] = useState<'chrome' | 'firefox' | 'edge' | 'other'>('other');

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ Auto-fill user name from logged-in profile
  useEffect(() => {
    if (loggedInUser?.name && !userProfile.name) {
      console.log('👤 [DEBUG] Auto-filling user name from logged-in profile:', loggedInUser.name);
      setUserProfile(prev => ({
        ...prev,
        name: loggedInUser.name
      }));
    }
  }, [loggedInUser, userProfile.name]);

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

  // Check backend status and browser type on component mount
  useEffect(() => {
    const initialBackendCheck = async () => {
      console.log('🔄 Checking backend status...');
      await checkBackendStatus();
    };

    // Detect browser type
    const detectBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('edg/')) {
        setBrowserType('edge');
      } else if (userAgent.includes('chrome') && !userAgent.includes('edg/')) {
        setBrowserType('chrome');
      } else if (userAgent.includes('firefox')) {
        setBrowserType('firefox');
      } else {
        setBrowserType('other');
      }
    };

    // Check for existing session recovery data
    const checkSessionRecovery = () => {
      try {
        const storedSessionId = localStorage.getItem('vapi-session-id');
        const storedMessages = localStorage.getItem('vapi-messages');
        const storedSessionData = localStorage.getItem('vapi-session-data');

        if (storedSessionId && storedSessionData) {
          const sessionData = JSON.parse(storedSessionData);
          const messages = storedMessages ? JSON.parse(storedMessages) : [];

          // Check if session is recent (within last 30 minutes)
          const sessionAge = Date.now() - new Date(sessionData.startTime).getTime();
          const thirtyMinutes = 30 * 60 * 1000;

          if (sessionAge < thirtyMinutes) {
            console.log('🔄 Found recoverable session:', storedSessionId);
            setRecoverySessionData({
              sessionId: storedSessionId,
              messages,
              ...sessionData
            });
            setShowRecoveryDialog(true);
          } else {
            console.log('🗑️  Session too old, clearing localStorage');
            localStorage.removeItem('vapi-session-id');
            localStorage.removeItem('vapi-messages');
            localStorage.removeItem('vapi-session-data');
          }
        }
      } catch (error) {
        console.error('Failed to check session recovery:', error);
      }
    };

    initialBackendCheck();
    detectBrowser();
    checkMicrophonePermission();
    checkSessionRecovery();
  }, []);

  // Debug: Log when step changes
  useEffect(() => {
    console.log('🔄 [DEBUG] Step changed to:', step, 'Messages count:', messages.length);
  }, [step]);

  // Debug: Log when messages change
  useEffect(() => {
    console.log('📨 [DEBUG] Messages state changed, new count:', messages.length);
    if (messages.length > 0) {
      console.log('📋 [DEBUG] Latest message:', messages[messages.length - 1]);
    }
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      console.log('📜 [DEBUG] Auto-scrolling to latest message');
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

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

  // 🟠 P1: BLOCKER #2 - Backend API functions with retry logic
  const checkBackendStatus = useCallback(async () => {
    console.log(`🔄 Checking backend at ${API_BASE_URL}...`);

    const result = await retryFetchJSON(
      `${API_BASE_URL}/practice/vapi/templates/`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      },
      {
        maxRetries: 2, // Less retries for health check
        initialDelay: 500,
        timeout: 10000,
        onRetry: (attempt) => {
          console.log(`🔄 [BACKEND CHECK] Retry attempt ${attempt}...`);
        },
      }
    );

    if (result.success) {
      console.log('✅ Backend connected successfully');
      setBackendStatus('connected');
      return true;
    } else {
      console.error('❌ Backend connection failed after retries:', result.error);
      setBackendStatus('error');
      return false;
    }
  }, []);

  const createAssistant = useCallback(async () => {
    // 🟠 P1: BLOCKER #2 - Get pre-configured assistant ID with retry logic
    const result = await retryFetchJSON(
      `${API_BASE_URL}/practice/vapi/assistants/`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        timeout: 10000,
        onRetry: (attempt) => {
          console.log(`🔄 [ASSISTANT] Retry attempt ${attempt}...`);
        },
      }
    );

    if (result.success && result.data?.success && result.data?.assistants && result.data.assistants.length > 0) {
      const assistant = result.data.assistants[0]; // Use first assistant
      console.log('🤖 Using pre-configured assistant:', assistant.id);
      return assistant;
    }

    // Fallback: return mock assistant for testing
    const mockAssistantId = 'test-assistant-id';
    console.log('🤖 Using mock assistant for testing (API failed):', mockAssistantId);

    return {
      id: mockAssistantId,
      name: `English Practice Assistant - ${config.domain}`,
      level: config.level,
      domain: config.domain
    };
  }, [config]);

  const startVapiSession = useCallback(async () => {
    // 🟠 P1: BLOCKER #2 - Start Vapi session with retry logic
    const result = await retryFetchJSON(
      `${API_BASE_URL}/practice/vapi/session/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'start_session',
          session_config: {
            session_id: `session-${uuidv4()}`, // ✅ UUID para segurança
            student_name: userProfile.name,
            student_level: config.level,
            domain: config.domain,
            objective: config.objective,
            correction_mode: config.correction_mode,
            language: 'en-US'
          }
        })
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        timeout: 15000,
        onRetry: (attempt) => {
          console.log(`🔄 [SESSION] Retry attempt ${attempt}...`);
        },
      }
    );

    if (result.success && result.data) {
      console.log('✅ Vapi session started:', result.data);
      return result.data.session;
    } else {
      console.error('❌ Failed to start Vapi session after retries:', result.error);
      return null;
    }
  }, [config, userProfile]);

  // Microphone permission functions
  const checkMicrophonePermission = useCallback(async () => {
    try {
      setMicPermission('checking');
      console.log('🎤 Checking microphone permission...');

      // Check if browser supports Permissions API
      if ('permissions' in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });

          if (permissionStatus.state === 'granted') {
            console.log('✅ Microphone permission: granted');
            setMicPermission('granted');
          } else if (permissionStatus.state === 'denied') {
            console.log('❌ Microphone permission: denied');
            setMicPermission('denied');
            setShowMicDeniedAlert(true);
          } else {
            console.log('⚠️  Microphone permission: prompt');
            setMicPermission('unknown');
          }

          // Listen for permission changes
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              setMicPermission('granted');
              setShowMicDeniedAlert(false);
            } else if (permissionStatus.state === 'denied') {
              setMicPermission('denied');
              setShowMicDeniedAlert(true);
            }
          };

          return permissionStatus.state === 'granted';
        } catch (permError) {
          console.warn('⚠️  Permissions API failed, will try getUserMedia:', permError);
          setMicPermission('unknown');
          return false;
        }
      } else {
        console.log('⚠️  Permissions API not supported');
        setMicPermission('unknown');
        return false;
      }
    } catch (error) {
      console.error('Failed to check microphone permission:', error);
      setMicPermission('unknown');
      return false;
    }
  }, []);

  const requestMicrophoneAccess = useCallback(async () => {
    try {
      setMicPermission('checking');
      console.log('🎤 Requesting microphone access...');

      // Show permission dialog
      setShowMicDialog(true);

      // Request microphone access using getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop all tracks immediately (we just needed to check permission)
      stream.getTracks().forEach(track => track.stop());

      console.log('✅ Microphone access granted');
      setMicPermission('granted');
      setShowMicDialog(false);
      setShowMicDeniedAlert(false);

      return true;
    } catch (error: any) {
      console.error('❌ Microphone access denied:', error);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setShowMicDeniedAlert(true);
      } else if (error.name === 'NotFoundError') {
        console.error('❌ No microphone found');
        setMicPermission('denied');
      } else {
        setMicPermission('unknown');
      }

      setShowMicDialog(false);
      return false;
    }
  }, []);

  // Vapi call functions
  const startCall = useCallback(async () => {
    if (!isVapiLoaded || !window.Vapi) {
      console.error('Vapi SDK not loaded');
      return;
    }

    // 🔴 BLOCKER #1: Prevent multiple simultaneous calls
    if (callStatus === 'connecting' || callStatus === 'connected' || isCallActive) {
      console.warn('⚠️ Call already in progress, ignoring new start request');
      return;
    }

    // Check microphone permission first
    if (micPermission === 'denied') {
      console.error('❌ Cannot start call: microphone permission denied');
      setShowMicDeniedAlert(true);
      return;
    }

    if (micPermission !== 'granted') {
      console.log('🎤 Requesting microphone permission...');
      const granted = await requestMicrophoneAccess();
      if (!granted) {
        console.error('❌ Cannot start call: microphone permission not granted');
        return;
      }
    }

    try {
      // 🔴 BLOCKER #1: Cleanup previous VAPI instance if exists
      if (vapi) {
        console.log('🧹 Cleaning up previous VAPI instance...');
        try {
          await vapi.stop();
        } catch (e) {
          console.log('Previous instance already stopped');
        }
        setVapi(null);
      }

      // Reset ending call state for new call
      setIsEndingCall(false);
      setCallStatus('connecting');
      setConnectionStep('Iniciando conexão...');
      console.log('⏱️ [TIMING] Call start initiated at:', new Date().toISOString());

      // Check backend connection
      setConnectionStep('Verificando backend...');
      console.log('⏱️ [TIMING] Checking backend status...');
      const startBackend = Date.now();
      const backendConnected = await checkBackendStatus();
      console.log('⏱️ [TIMING] Backend check took:', Date.now() - startBackend, 'ms');
      if (!backendConnected) {
        throw new Error('Backend not available');
      }

      // Create assistant
      setConnectionStep('Preparando assistente de IA...');
      console.log('⏱️ [TIMING] Creating assistant...');
      const startAssistant = Date.now();
      const assistant = await createAssistant();
      console.log('⏱️ [TIMING] Assistant creation took:', Date.now() - startAssistant, 'ms');
      if (!assistant) {
        throw new Error('Failed to create assistant');
      }

      // Start backend session
      setConnectionStep('Criando sessão...');
      console.log('⏱️ [TIMING] Starting backend session...');
      const startSession = Date.now();
      const backendSession = await startVapiSession();
      console.log('⏱️ [TIMING] Backend session took:', Date.now() - startSession, 'ms');
      if (!backendSession) {
        throw new Error('Failed to start backend session');
      }

      // Initialize Vapi client (simplified to avoid conflicts)
      if (!VAPI_PUBLIC_KEY) {
        throw new Error('VAPI_PUBLIC_KEY not configured');
      }
      const vapiClient = new window.Vapi(VAPI_PUBLIC_KEY);
      
      // Setup event listeners
      vapiClient.on('speech-start', () => {
        console.log('🗣️ User started speaking');
        setIsUserSpeaking(true);
        setIsAISpeaking(false); // User speaking means AI is not speaking
      });

      vapiClient.on('speech-end', () => {
        console.log('🔇 User stopped speaking');
        setIsUserSpeaking(false);
      });

      vapiClient.on('message', (message: any) => {
        console.log('💬 [DEBUG] Message received:', {
          type: message.type,
          role: message.role,
          transcriptType: message.transcriptType,
          hasTranscript: !!message.transcript,
          transcript: message.transcript,
          fullMessage: message
        });

        // Track AI speaking status
        if (message.type === 'transcript' && message.role === 'assistant') {
          if (message.transcriptType === 'partial') {
            // AI is currently speaking (partial transcript)
            console.log('🗣️ [DEBUG] AI speaking (partial)');
            setIsAISpeaking(true);
            setIsUserSpeaking(false);
          } else if (message.transcriptType === 'final') {
            // AI finished speaking
            console.log('✅ [DEBUG] AI finished speaking (final)');
            setIsAISpeaking(false);
          }
        }

        if (message.type === 'transcript' && message.transcript && message.transcriptType === 'final') {
          const newMessage: ConversationMessage = {
            id: `msg-${Date.now()}-${Math.random()}`,
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: message.transcript,
            timestamp: new Date()
          };

          console.log('📝 [DEBUG] Adding message to state:', newMessage);
          console.log('📊 [DEBUG] Current messages before add:', messages.length);

          setMessages(prev => {
            const updated = [...prev, newMessage];
            console.log('✅ [DEBUG] Messages state updated, new total:', updated.length);
            console.log('📋 [DEBUG] All messages:', updated.map(m => ({
              role: m.role,
              content: m.content.substring(0, 50) + '...'
            })));

            // Update localStorage backup
            localStorage.setItem('vapi-messages', JSON.stringify(updated));
            console.log('💾 [DEBUG] Saved to localStorage');

            return updated;
          });

          // ✅ BATCH OPTIMIZATION: Removed real-time analysis to prevent N+1 HTTP requests
          // Analysis will be done in batch at session end via handleCallEnd()
          // This reduces 30-50 requests per session to just 1 request at the end
        } else {
          console.log('⚠️  [DEBUG] Message not added - conditions not met:', {
            isTranscript: message.type === 'transcript',
            hasTranscript: !!message.transcript,
            isFinal: message.transcriptType === 'final'
          });
        }
      });

      vapiClient.on('call-start', () => {
        console.log('⏱️ [TIMING] call-start event received at:', new Date().toISOString());
        console.log('📞 Call started - connection established');
        setConnectionStep('Conectado! Iniciando conversa...');
        setCallStatus('connected');
        setIsCallActive(true);
        setIsTimerActive(true);

        // 🔴 BLOCKER #1: Clear messages from previous session to prevent sending old data
        console.log('🧹 [SESSION CLEANUP] Clearing old messages from previous session');
        setMessages([]);

        // Create session with guaranteed valid ID
        const sessionId = backendSession?.session_id || `session-${uuidv4()}`; // ✅ UUID fallback
        const session: VapiSession = {
          id: sessionId,
          userProfile,
          config,
          messages: [],
          startTime: new Date(),
          isActive: true,
          assistantId: assistant.id
        };

        console.log('✅ Session created with ID:', sessionId);
        setCurrentSession(session);

        // Store in localStorage as backup with full session data
        localStorage.setItem('vapi-session-id', sessionId);
        localStorage.setItem('vapi-messages', JSON.stringify([]));
        localStorage.setItem('vapi-session-data', JSON.stringify({
          userProfile,
          config,
          startTime: new Date().toISOString(),
          assistantId: assistant.id
        }));
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

        // 🔴 BLOCKER #1: Better error handling
        let userFriendlyMessage = 'Erro ao conectar com o Tutor de IA.';

        // Try to get more details from the Response object
        if (error.error && error.error instanceof Response) {
          try {
            const errorText = await error.error.text();
            console.error('❌ API Response Error:', errorText);

            // Try to parse as JSON
            try {
              const errorJson = JSON.parse(errorText);
              console.error('❌ Parsed API Error:', errorJson);

              if (errorJson.message) {
                userFriendlyMessage = errorJson.message;
              }
            } catch (jsonError) {
              console.error('❌ Raw API Error Text:', errorText);
            }
          } catch (readError) {
            console.error('❌ Could not read error response:', readError);
          }
        } else if (error.message) {
          // Use error message if available
          if (error.message.includes('multiple call instances')) {
            userFriendlyMessage = 'Já existe uma chamada em andamento. Por favor, aguarde.';
          } else if (error.message.includes('Meeting has ended')) {
            userFriendlyMessage = 'A chamada foi encerrada inesperadamente. Tente novamente.';
          } else if (error.message.includes('network') || error.message.includes('connection')) {
            userFriendlyMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
          } else {
            userFriendlyMessage = `Erro: ${error.message}`;
          }
        }

        setCallStatus('error');
        setConnectionStep(userFriendlyMessage);

        // Don't switch to conversation if there's an error
        if (step === 'setup') {
          console.log('❌ Staying on setup page due to error');
        }
      });

      // Start the call with context
      console.log('🚀 Starting Vapi call with assistant:', assistant.id);

      try {
        // Basic call without overrides (overrides not supported by this API version)
        setConnectionStep('Conectando com Tutor de IA...');
        console.log('🧪 Starting basic Vapi call (assistant overrides not supported)...');
        console.log('⚠️  Note: Assistant is configured as Tech Support, not English Teacher');
        console.log('⏱️ [TIMING] Calling vapiClient.start() at:', new Date().toISOString());
        const startVapi = Date.now();

        await vapiClient.start(assistant.id);

        console.log('⏱️ [TIMING] vapiClient.start() completed, took:', Date.now() - startVapi, 'ms');
        console.log('⚠️ [INFO] Waiting for call-start event to fire...');
        setConnectionStep('Aguardando conexão com assistente...');

        setVapi(vapiClient);
        console.log('✅ Vapi call started successfully');

        // Only switch to conversation view if call started successfully
        setStep('conversation');
        
      } catch (vapiError) {
        console.error('❌ Failed to start Vapi call:', vapiError);
        setConnectionStep('Erro ao iniciar chamada');
        setCallStatus('error');
        throw vapiError;
      }

    } catch (error) {
      console.error('Failed to start call:', error);
      setConnectionStep('Erro na conexão');
      setCallStatus('error');
    }
  }, [isVapiLoaded, config, userProfile, micPermission, checkBackendStatus, createAssistant, startVapiSession, requestMicrophoneAccess]);

  // 🟠 P1: BLOCKER #2 - Global Retry Logic Implementation
  const sendBatchAnalysisWithRetry = useCallback(async (
    sessionId: string,
    messagesList: ConversationMessage[],
    maxRetries = 3
  ): Promise<boolean> => {
    // 🔴 BLOCKER #1: Validate that we have student messages before sending
    const studentMessages = messagesList.filter(msg => msg.role === 'user');

    console.log('🔍 [BATCH VALIDATION] Analyzing messages:', {
      totalMessages: messagesList.length,
      studentMessages: studentMessages.length,
      sampleMessages: messagesList.slice(0, 3).map(m => ({
        role: m.role,
        content: m.content?.substring(0, 30),
        hasRole: !!m.role,
        hasContent: !!m.content
      }))
    });

    if (studentMessages.length === 0) {
      console.warn('⚠️ [BATCH VALIDATION] No student messages found in conversation. Skipping backend analysis.');
      console.warn('📋 [BATCH VALIDATION] Total messages:', messagesList.length);
      console.warn('📋 [BATCH VALIDATION] All message roles:', messagesList.map(m => ({role: m.role, hasContent: !!m.content})));

      // Skip sending to backend if no student spoke - consider it success
      // This prevents backend 400 error: "Empty student transcript"
      return true;
    }

    console.log(`✅ [BATCH VALIDATION] Found ${studentMessages.length} student messages out of ${messagesList.length} total`);

    // 🔴 BLOCKER: Validate TOTAL student content length
    // Backend rejects conversations with too little student speech
    const MIN_TOTAL_CHARS = 50; // Minimum total characters needed for AI analysis
    const totalStudentChars = studentMessages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
    const avgCharsPerMessage = totalStudentChars / studentMessages.length;

    console.log(`📊 [CONTENT VALIDATION] Student speech: ${totalStudentChars} chars total, ${avgCharsPerMessage.toFixed(1)} avg, ${studentMessages.length} messages`);

    if (totalStudentChars < MIN_TOTAL_CHARS) {
      console.warn(`⚠️ [CONTENT VALIDATION] Student speech too short (${totalStudentChars} < ${MIN_TOTAL_CHARS} chars). Skipping backend analysis.`);
      console.warn('📋 [CONTENT VALIDATION] Student said:', studentMessages.map(m => `"${m.content}"`));

      // Skip sending - conversation too short for meaningful AI analysis
      // This prevents backend 400 error: "Empty student transcript"
      return true;
    }

    console.log(`✅ [CONTENT VALIDATION] Student speech is substantial enough for analysis`);

    // Prepare payload (transformation and merge logic)
    console.log('📤 [BATCH ANALYSIS] Preparing payload...');

    // 🔴 BLOCKER #1: Transform and validate messages for payload
    const conversationHistory = messagesList
      .filter((msg: any) => {
        // Validate message has required fields
        const isValid = msg.role && msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0;
        if (!isValid) {
          console.warn('⚠️ [BATCH PAYLOAD] Skipping invalid message:', {
            hasRole: !!msg.role,
            role: msg.role,
            hasContent: !!msg.content,
            contentLength: msg.content?.length
          });
        }
        return isValid;
      })
      .map((msg: any) => ({
        who: msg.role === 'assistant' ? 'agent' : 'student',
        text: msg.content.trim(),
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));

    console.log(`📋 [BATCH PAYLOAD] Transformed ${messagesList.length} messages to ${conversationHistory.length} valid entries`);

    // 🔧 MERGE SHORT FRAGMENTS: Combine consecutive short student messages
    // This solves the "Empty student transcript" backend semantic validation error
    const MIN_MESSAGE_LENGTH = 10; // Minimum characters for a meaningful message
    const mergedHistory: any[] = [];

    for (let i = 0; i < conversationHistory.length; i++) {
      const current = conversationHistory[i];

      // If this is a student message that's too short, try to merge with next student messages
      if (current.who === 'student' && current.text.length < MIN_MESSAGE_LENGTH) {
        let mergedText = current.text;
        let mergedTimestamp = current.timestamp;
        let j = i + 1;

        // Look ahead and merge consecutive short student messages
        while (j < conversationHistory.length &&
               conversationHistory[j].who === 'student' &&
               conversationHistory[j].text.length < MIN_MESSAGE_LENGTH * 2) {
          mergedText += ' ' + conversationHistory[j].text;
          j++;

          // Stop if merged text is long enough
          if (mergedText.length >= MIN_MESSAGE_LENGTH * 2) break;
        }

        // If we merged messages, add the combined version
        if (j > i + 1) {
          console.log(`🔗 [MERGE] Combined ${j - i} short student messages: "${current.text}" + others → "${mergedText}"`);
          mergedHistory.push({
            who: 'student',
            text: mergedText,
            timestamp: mergedTimestamp
          });
          i = j - 1; // Skip the merged messages
        } else {
          // No merge happened, but message is still short - keep it anyway
          mergedHistory.push(current);
        }
      } else {
        // Agent message or already long enough student message
        mergedHistory.push(current);
      }
    }

    console.log(`🔗 [MERGE] Message count: ${conversationHistory.length} → ${mergedHistory.length}`);
    if (mergedHistory.length < conversationHistory.length) {
      console.log(`✅ [MERGE] Reduced message count by ${conversationHistory.length - mergedHistory.length} through fragment merging`);
    }

    const payload = {
      action: 'process_transcript',
      session_config: {
        session_id: sessionId,
        student_level: config.level,
        domain: config.domain,
        correction_mode: config.correction_mode
      },
      conversation_history: mergedHistory
    };

    // 🔍 DEBUG: Analyze payload
    const roleAnalysis = messagesList.reduce((acc: any, msg: any) => {
      const role = msg.role;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    console.log(`📋 [BATCH DEBUG] Message roles in messagesList:`, roleAnalysis);
    console.log(`📋 [BATCH DEBUG] First 3 messages from input:`, messagesList.slice(0, 3).map((m: any) => ({
      role: m.role,
      content: m.content?.substring(0, 50),
      hasContent: !!m.content
    })));

    console.log(`📋 [BATCH DEBUG] Payload:`, {
      action: payload.action,
      session_id: payload.session_config.session_id,
      messages_count: payload.conversation_history.length,
      first_message_sample: payload.conversation_history[0],
      config: payload.session_config
    });

    const payloadRoles = payload.conversation_history.reduce((acc: any, msg: any) => {
      acc[msg.who] = (acc[msg.who] || 0) + 1;
      return acc;
    }, {});
    console.log(`📋 [BATCH DEBUG] Payload roles after transformation:`, payloadRoles);
    console.log(`📋 [BATCH DEBUG] First 3 messages in payload:`, payload.conversation_history.slice(0, 3));

    const studentMessagesInPayload = payload.conversation_history.filter((m: any) => m.who === 'student');
    console.log(`🚨 [BATCH CRITICAL DEBUG] Student messages in payload (${studentMessagesInPayload.length}):`,
      studentMessagesInPayload.map((m: any) => ({
        who: m.who,
        text: m.text,
        textLength: m.text?.length,
        textType: typeof m.text,
        isEmpty: !m.text || m.text.trim().length === 0,
        isTooShort: m.text?.length < 10
      }))
    );

    const avgStudentMessageLength = studentMessagesInPayload.length > 0
      ? studentMessagesInPayload.reduce((sum: number, m: any) => sum + (m.text?.length || 0), 0) / studentMessagesInPayload.length
      : 0;
    console.log(`📊 [QUALITY METRICS] Student messages: count=${studentMessagesInPayload.length}, avgLength=${avgStudentMessageLength.toFixed(1)} chars`);

    console.log(`📋 [BATCH DEBUG] FULL conversation_history (${payload.conversation_history.length} messages):`,
      JSON.stringify(payload.conversation_history, null, 2)
    );

    // 🟠 P1: BLOCKER #2 - Use global retry utility with exponential backoff
    const result = await retryFetchJSON(
      `${API_BASE_URL}/practice/vapi/session/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      },
      {
        maxRetries,
        initialDelay: 1000,
        maxDelay: 10000,
        timeout: 15000,
        onRetry: (attempt, error, delay) => {
          console.log(`🔄 [GLOBAL RETRY] Attempt ${attempt} failed, retrying in ${delay}ms...`);
          console.error(`❌ [GLOBAL RETRY] Error:`, error.message || error);
        },
        onAllRetiresFailed: (error) => {
          console.error(`❌ [GLOBAL RETRY] All ${maxRetries} retries failed!`);

          // Try to parse and log error details
          if (error.response) {
            error.response.text().then((text: string) => {
              console.error(`📋 [GLOBAL RETRY ERROR BODY]:`, text);
              try {
                const errorJson = JSON.parse(text);
                console.error(`📋 [GLOBAL RETRY ERROR JSON]:`, errorJson);
              } catch (e) {
                // Not JSON, already logged text
              }
            }).catch(() => {
              console.error(`⚠️ Could not read error response body`);
            });
          }
        }
      }
    );

    if (result.success) {
      console.log(`✅ [GLOBAL RETRY] Success after ${result.attempts} attempt(s)!`);
      return true;
    } else {
      console.error(`❌ [GLOBAL RETRY] Failed after ${result.attempts} attempt(s)`);
      return false;
    }
  }, [config]);

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
    // Prevent multiple executions
    if (isEndingCall) {
      console.log('🔄 Call end already in progress, ignoring...');
      return;
    }
    
    setIsEndingCall(true);
    setIsCallActive(false);
    setIsTimerActive(false);
    setCallStatus('ended');

    // Reset speaking indicators
    setIsUserSpeaking(false);
    setIsAISpeaking(false);

    // 🔴 BLOCKER #1 FIX: ALWAYS read from localStorage first to avoid closure issues
    // The event listeners capture old values in closure, localStorage always has latest
    console.log('🔍 [CALL END] Reading session data from localStorage (most recent)...');
    const storedSessionId = localStorage.getItem('vapi-session-id');
    const storedMessages = localStorage.getItem('vapi-messages');

    let finalSessionId = storedSessionId;
    let finalMessages: ConversationMessage[] = [];

    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);

        // 🔴 BLOCKER #1: Validate and clean messages from localStorage
        // Filter out invalid messages (missing role, content, etc.)
        finalMessages = parsedMessages.filter((msg: any) => {
          const isValid = msg && msg.role && msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0;
          if (!isValid) {
            console.warn('⚠️ [CALL END] Filtering out invalid message:', msg);
          }
          return isValid;
        });

        console.log('✅ [CALL END] Retrieved from localStorage:', {
          sessionId: finalSessionId,
          totalMessages: parsedMessages.length,
          validMessages: finalMessages.length,
          filtered: parsedMessages.length - finalMessages.length
        });

        // Log role distribution for debugging
        const roleDistribution = finalMessages.reduce((acc: any, msg: any) => {
          acc[msg.role] = (acc[msg.role] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 [CALL END] Message roles:', roleDistribution);

      } catch (e) {
        console.error('❌ [CALL END] Failed to parse messages from localStorage:', e);
      }
    }

    // Fallback to state if localStorage is empty (shouldn't happen)
    if (!finalSessionId) {
      console.warn('⚠️ [CALL END] localStorage empty, falling back to state (may be stale!)');
      finalSessionId = currentSession?.id;
      finalMessages = [...messages];
      console.log('🔄 [CALL END] Using state values:', {
        sessionId: finalSessionId,
        messagesCount: finalMessages.length
      });
    }

    console.log('📊 [CALL END] Final values to process:', {
      sessionId: finalSessionId,
      messagesCount: finalMessages.length,
      firstMessage: finalMessages[0]
    });
    
    // Always redirect if we have a session ID, regardless of messages
    if (finalSessionId) {
      // 🔴 BLOCKER #1 FIX: AWAIT backend confirmation before redirect
      if (finalMessages.length > 0) {
        console.log('📤 [BATCH] Sending all transcripts to backend for analysis...');
        console.log(`📊 [BATCH] Processing ${finalMessages.length} messages in single request`);

        // Show processing state
        setIsProcessingSession(true);
        setProcessingError(null);

        // ✅ AWAIT with retry logic
        const success = await sendBatchAnalysisWithRetry(finalSessionId, finalMessages);

        if (success) {
          console.log('✅ [BATCH] All transcripts processed successfully - safe to redirect');

          // Clean up localStorage only after success
          localStorage.removeItem('vapi-session-id');
          localStorage.removeItem('vapi-messages');
          localStorage.removeItem('vapi-session-data');

          // Redirect to summary
          const summaryUrl = `/user/laboratory/speaking/summary/${finalSessionId}`;
          console.log('🚀 Redirecting to:', summaryUrl);

          try {
            router.push(summaryUrl);

            setTimeout(() => {
              if (window.location.pathname.includes('/real-time')) {
                console.log('🔄 Router.push failed, using window.location.href');
                window.location.href = summaryUrl;
              }
            }, 100);
          } catch (error) {
            console.error('Router.push failed:', error);
            window.location.href = summaryUrl;
          }
          return;
        } else {
          // ❌ Backend failed after retries
          console.error('❌ [BATCH] Failed to process session after 3 attempts');
          setIsProcessingSession(false);
          setProcessingError('Não foi possível processar a sessão. Seus dados foram salvos e você pode tentar novamente.');

          // Keep data in localStorage for retry
          // DO NOT redirect - show error to user
          return;
        }
      } else {
        console.log('📭 No messages to process, redirecting to summary');

        // Clean up localStorage
        localStorage.removeItem('vapi-session-id');
        localStorage.removeItem('vapi-messages');
        localStorage.removeItem('vapi-session-data');

        // Redirect even without messages
        const summaryUrl = `/user/laboratory/speaking/summary/${finalSessionId}`;
        router.push(summaryUrl);
        return;
      }
    } else {
      console.error('❌ No session ID found, cannot redirect to summary');
    }

    // Fallback: redirect to laboratory if no session ID
    console.log('🔄 Fallback: redirecting to real-time page');
    router.push('/user/laboratory/speaking/real-time');
  }, [currentSession, messages, config, router, isEndingCall, sendBatchAnalysisWithRetry]);

  // ⚠️ DEPRECATED: This function is no longer called during the conversation
  // Real-time analysis has been replaced with batch processing at session end (handleCallEnd)
  // This prevents N+1 HTTP requests and improves performance
  // Keeping for reference only - can be removed in future cleanup
  const handleUserTranscript = useCallback(async (transcript: string) => {
    console.warn('⚠️  handleUserTranscript is deprecated and should not be called');
    if (!currentSession) return;

    try {
      const response = await fetch(`${API_BASE_URL}/practice/vapi/session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Envia cookies HttpOnly
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

  // Session recovery functions
  const handleRecoverSession = useCallback(() => {
    if (!recoverySessionData) return;

    console.log('🔄 Recovering session:', recoverySessionData.sessionId);

    // Restore user profile and config
    setUserProfile(recoverySessionData.userProfile);
    setConfig(recoverySessionData.config);

    // Restore messages
    setMessages(recoverySessionData.messages);

    // Calculate elapsed time
    const startTime = new Date(recoverySessionData.startTime);
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    setTimeElapsed(elapsed);

    // Create session object
    const session: VapiSession = {
      id: recoverySessionData.sessionId,
      userProfile: recoverySessionData.userProfile,
      config: recoverySessionData.config,
      messages: recoverySessionData.messages,
      startTime: startTime,
      isActive: false, // Not active yet, will be active when call restarts
      assistantId: recoverySessionData.assistantId
    };
    setCurrentSession(session);

    // Close dialog and go to conversation view
    setShowRecoveryDialog(false);
    setStep('conversation');

    console.log('✅ Session recovered, ready to resume');
  }, [recoverySessionData]);

  const handleDiscardSession = useCallback(() => {
    console.log('🗑️  Discarding recovered session');

    // Clear localStorage
    localStorage.removeItem('vapi-session-id');
    localStorage.removeItem('vapi-messages');
    localStorage.removeItem('vapi-session-data');

    // Reset state
    setRecoverySessionData(null);
    setShowRecoveryDialog(false);
  }, []);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Render Setup Step
  const renderSetupStep = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Session Recovery Dialog */}
      {showRecoveryDialog && recoverySessionData && (
        <Card className="bg-yellow-900/50 border-yellow-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Sessão Anterior Detectada
                </h3>
                <p className="text-yellow-200 text-sm mb-4">
                  Encontramos uma sessão de conversação que não foi finalizada. Você gostaria de recuperá-la?
                </p>

                <div className="bg-yellow-950/50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-300">Usuário:</span>
                    <span className="text-white font-medium">{recoverySessionData.userProfile?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-300">Nível:</span>
                    <Badge variant="secondary">{recoverySessionData.config?.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-300">Domínio:</span>
                    <Badge variant="outline">{recoverySessionData.config?.domain}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-300">Mensagens:</span>
                    <span className="text-white font-medium">{recoverySessionData.messages?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-300">Início:</span>
                    <span className="text-white font-medium">
                      {new Date(recoverySessionData.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleRecoverSession}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Recuperar Sessão
                  </Button>
                  <Button
                    onClick={handleDiscardSession}
                    variant="outline"
                    className="border-yellow-500 text-yellow-300 hover:bg-yellow-950"
                  >
                    Descartar e Começar Nova
                  </Button>
                </div>

                <p className="text-xs text-yellow-300 mt-3">
                  💡 A sessão será recuperada com todas as mensagens anteriores. Você poderá ver o histórico e encerrar a sessão para ver o resumo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Prática de Conversação com Tutor de IA
        </h1>
        <p className="text-xl text-gray-300">
          Configure sua sessão personalizada de prática conversacional
        </p>
        {!isVapiLoaded && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-400">⏳ Preparando Tutor de IA...</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Tutor de IA:</span>
              <Badge className={isVapiLoaded ? 'bg-green-600' : 'bg-yellow-600'}>
                {isVapiLoaded ? 'Pronto' : 'Preparando...'}
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

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Microfone:</span>
              <Badge className={
                micPermission === 'granted' ? 'bg-green-600' :
                micPermission === 'denied' ? 'bg-red-600' :
                micPermission === 'checking' ? 'bg-yellow-600' : 'bg-gray-600'
              }>
                {micPermission === 'granted' ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Permitido
                  </span>
                ) : micPermission === 'denied' ? (
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Bloqueado
                  </span>
                ) : micPermission === 'checking' ? (
                  'Verificando...'
                ) : (
                  'Não verificado'
                )}
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

          {micPermission === 'denied' && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <div className="flex items-start gap-2">
                <MicOff className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-medium mb-1">
                    Permissão de microfone negada
                  </p>
                  <p className="text-red-300 text-xs">
                    É necessário permitir o acesso ao microfone para usar a prática de conversação.
                  </p>
                  <Button
                    onClick={requestMicrophoneAccess}
                    size="sm"
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Mic className="w-4 h-4 mr-1" />
                    Solicitar Permissão
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Microphone Permission Dialog */}
      {showMicDialog && (
        <Card className="bg-blue-900/50 border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Permissão de Microfone Necessária
                </h3>
                <p className="text-blue-200 text-sm mb-4">
                  Para praticar conversação com a IA, precisamos acessar seu microfone. Seus dados são usados apenas para análise em tempo real e não são armazenados permanentemente.
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-300">
                  <CheckCircle className="w-4 h-4" />
                  <span>Suas conversas são privadas e seguras</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Microphone Permission Denied Alert with Browser Instructions */}
      {showMicDeniedAlert && (
        <Card className="bg-red-900/50 border-red-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <MicOff className="w-5 h-5" />
                  Permissão de Microfone Bloqueada
                </h3>
                <p className="text-red-200 text-sm mb-4">
                  O acesso ao microfone foi negado. Para usar a prática de conversação, você precisa habilitar o microfone nas configurações do navegador.
                </p>

                <div className="bg-red-950/50 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium text-sm mb-3">
                    Como habilitar no {browserType === 'chrome' ? 'Chrome' : browserType === 'edge' ? 'Edge' : browserType === 'firefox' ? 'Firefox' : 'seu navegador'}:
                  </h4>

                  {browserType === 'chrome' && (
                    <ol className="text-red-100 text-xs space-y-2 list-decimal list-inside">
                      <li>Clique no ícone de cadeado (🔒) ou informações (ⓘ) na barra de endereços</li>
                      <li>Encontre "Microfone" nas permissões do site</li>
                      <li>Altere para "Permitir"</li>
                      <li>Recarregue a página</li>
                    </ol>
                  )}

                  {browserType === 'edge' && (
                    <ol className="text-red-100 text-xs space-y-2 list-decimal list-inside">
                      <li>Clique no ícone de cadeado (🔒) na barra de endereços</li>
                      <li>Clique em "Permissões para este site"</li>
                      <li>Encontre "Microfone" e selecione "Permitir"</li>
                      <li>Recarregue a página</li>
                    </ol>
                  )}

                  {browserType === 'firefox' && (
                    <ol className="text-red-100 text-xs space-y-2 list-decimal list-inside">
                      <li>Clique no ícone de cadeado (🔒) na barra de endereços</li>
                      <li>Clique na seta ao lado de "Permissões bloqueadas"</li>
                      <li>Encontre "Usar o microfone" e clique no X</li>
                      <li>Clique em "Atualizar permissões" e recarregue a página</li>
                    </ol>
                  )}

                  {browserType === 'other' && (
                    <ol className="text-red-100 text-xs space-y-2 list-decimal list-inside">
                      <li>Clique no ícone de cadeado ou informações na barra de endereços</li>
                      <li>Procure pelas configurações de permissões do site</li>
                      <li>Encontre "Microfone" e altere para "Permitir"</li>
                      <li>Recarregue a página</li>
                    </ol>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setShowMicDeniedAlert(false);
                      checkMicrophonePermission();
                    }}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Já habilitei, verificar novamente
                  </Button>
                  <Button
                    onClick={() => setShowMicDeniedAlert(false)}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-300 hover:bg-red-950"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Button */}
      <div className="text-center">
        <Button
          onClick={startCall}
          disabled={
            !isVapiLoaded ||
            !userProfile.name ||
            !config.objective ||
            backendStatus !== 'connected' ||
            callStatus === 'connecting' ||
            callStatus === 'connected' ||
            isCallActive ||
            micPermission === 'denied'
          }
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
        >
          {callStatus === 'connecting' ? (
            <>
              <Activity className="w-5 h-5 animate-spin" />
              Conectando...
            </>
          ) : micPermission === 'denied' ? (
            <>
              <MicOff className="w-5 h-5" />
              Microfone Bloqueado
            </>
          ) : micPermission === 'granted' ? (
            <>
              <Mic className="w-5 h-5" />
              Iniciar Conversa
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Iniciar Conversa
            </>
          )}
        </Button>

        <p className="text-sm text-gray-400 mt-2">
          {micPermission === 'granted' ? (
            <>A conversa será gravada e analisada para fornecer feedback detalhado</>
          ) : micPermission === 'denied' ? (
            <span className="text-red-400 flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Habilite o microfone para iniciar a conversa
            </span>
          ) : (
            <>Você será solicitado a permitir o acesso ao microfone</>
          )}
        </p>
      </div>
    </div>
  );

  // Render Conversation Step
  const renderConversationStep = () => {
    console.log('🎬 [DEBUG] renderConversationStep called, messages:', messages.length);
    console.log('📊 [DEBUG] Current state:', {
      currentSession: !!currentSession,
      callStatus,
      messagesCount: messages.length,
      isCallActive
    });

    // 🔴 BLOCKER #1: Show processing state
    if (isProcessingSession) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gray-800 border-gray-700 p-8 max-w-md">
            <CardContent className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <Activity className="w-8 h-8 text-violet-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Processando sua sessão...</h3>
                <p className="text-gray-400 text-sm">
                  Estamos analisando sua conversa e gerando o feedback personalizado.
                  <br />
                  Isso pode levar alguns segundos.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // 🔴 BLOCKER #1: Show error state with retry option
    if (processingError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gray-800 border-red-900 border-2 p-8 max-w-md">
            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Erro ao processar sessão</h3>
                <p className="text-gray-400 text-sm mb-4">{processingError}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setProcessingError(null);
                    handleCallEnd();
                  }}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Tentar Novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Go back to setup
                    setProcessingError(null);
                    setStep('setup');
                    setCallStatus('idle');
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // 🔴 BLOCKER #1: Improved error state UI
    if (callStatus === 'error') {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gray-800 border-red-900 border-2 p-8 max-w-md">
            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Erro ao iniciar conversa</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {connectionStep || 'Não foi possível conectar ao Tutor de IA. Verifique sua conexão e tente novamente.'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setStep('setup');
                    setCallStatus('idle');
                    setConnectionStep('Iniciando...');
                  }}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Tentar Novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/user/laboratory')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Voltar ao Laboratório
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header with session info and timer */}
        <Card className="bg-gray-800/50 border-gray-700 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{formatTime(timeElapsed)}</p>
                  <p className="text-sm text-gray-400">de {formatTime(config.maxDurationMinutes * 60)}</p>
                </div>
                <div className="w-40">
                  <Progress value={(timeElapsed / (config.maxDurationMinutes * 60)) * 100} className="h-2" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={callStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}>
                  {callStatus === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
                </Badge>
                {/* Speaking status badge */}
                {isUserSpeaking && (
                  <Badge className="bg-green-600 animate-pulse flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    Você está falando
                  </Badge>
                )}
                {isAISpeaking && (
                  <Badge className="bg-blue-600 animate-pulse flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    IA está falando
                  </Badge>
                )}
                {!isUserSpeaking && !isAISpeaking && callStatus === 'connected' && (
                  <Badge variant="outline" className="border-gray-500 text-gray-400">
                    Aguardando...
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{config.level}</Badge>
                  <Badge variant="outline">{config.domain}</Badge>
                </div>
                {/* End Call Button moved to top */}
                <Button
                  onClick={handleEndCall}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  disabled={!isCallActive}
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  Finalizar Conversa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 flex gap-6">
          {/* Main conversation area with avatars */}
          <div className="flex-1 flex flex-col bg-gray-800/30 rounded-lg border border-gray-700">
            {/* Avatar section side by side */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-b border-gray-700 p-6">
              <div className="flex items-center justify-center gap-16">
                {/* AI Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className={`w-16 h-16 transition-all duration-300 ${isAISpeaking ? 'ring-4 ring-blue-500 ring-opacity-75' : ''}`}>
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Bot className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    {isAISpeaking && (
                      <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                        <span className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
                            <Activity className="w-3 h-3 text-white animate-pulse" />
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-white">Alex (IA)</p>
                    <p className={`text-xs transition-colors ${isAISpeaking ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                      {isAISpeaking ? '🗣️ Falando...' : 'Assistant'}
                    </p>
                  </div>
                </div>

                {/* Visual connection between avatars */}
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-0.5 transition-all duration-300 ${
                    isAISpeaking ? 'bg-gradient-to-r from-blue-500 to-gray-500' :
                    isUserSpeaking ? 'bg-gradient-to-r from-gray-500 to-green-500' :
                    'bg-gradient-to-r from-blue-500 to-green-500 opacity-50'
                  }`}></div>
                  <MessageCircle className={`w-6 h-6 my-2 transition-colors ${
                    isAISpeaking || isUserSpeaking ? 'text-white' : 'text-gray-400'
                  }`} />
                  <div className={`w-16 h-0.5 transition-all duration-300 ${
                    isUserSpeaking ? 'bg-gradient-to-r from-green-500 to-gray-500' :
                    isAISpeaking ? 'bg-gradient-to-r from-gray-500 to-blue-500' :
                    'bg-gradient-to-r from-green-500 to-blue-500 opacity-50'
                  }`}></div>
                </div>

                {/* User Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className={`w-16 h-16 transition-all duration-300 ${isUserSpeaking ? 'ring-4 ring-green-500 ring-opacity-75' : ''}`}>
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg font-semibold">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isUserSpeaking && (
                      <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                        <span className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 items-center justify-center">
                            <Mic className="w-3 h-3 text-white animate-pulse" />
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-white">{userProfile.name}</p>
                    <p className={`text-xs transition-colors ${isUserSpeaking ? 'text-green-400 font-medium' : 'text-gray-400'}`}>
                      {isUserSpeaking ? '🎤 Falando...' : `${config.level} - ${config.domain}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages area with improved design - Fixed height with scroll */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[400px]" style={{ scrollBehavior: 'smooth' }}>
              {console.log('🎨 [DEBUG] Rendering messages, count:', messages.length)}
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Pronto para conversar</h3>
                    <p className="text-gray-400 max-w-sm">
                      Comece a falar para iniciar sua prática de conversação. Suas mensagens aparecerão aqui em tempo real.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={
                          message.role === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white'
                        }>
                          {message.role === 'user' 
                            ? userProfile.name.charAt(0).toUpperCase() 
                            : <Bot className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-900 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-100 rounded-tr-md'
                          : 'bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-900 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-100 rounded-tl-md'
                      }`}>
                        <p className="leading-relaxed">{message.content}</p>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 dark:border-gray-700/30">
                          <span className="text-xs opacity-60">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.role === 'user' && (
                            <span className="text-xs opacity-60 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Análise ao final
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing indicator when AI is speaking */}
                {isAISpeaking && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-tl-md">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Right sidebar with session context */}
          <div className="w-80 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-medium text-white">Contexto da Sessão</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Session objective */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-300">{config.objective || 'Praticar conversação em inglês'}</p>
                </CardContent>
              </Card>

              {/* Session stats */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mensagens:</span>
                    <span className="text-white font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tempo falando:</span>
                    <span className="text-green-400 font-medium">~{Math.round(timeElapsed * 0.4)}s</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 border-t border-gray-700 space-y-2">
              <div className="text-xs text-gray-400 text-center">
                <p>💡 Use o botão "Finalizar Conversa" no topo para encerrar a sessão</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Summary step removed - redirects to dedicated summary page

  // Show loading overlay independently if call is connecting
  if (step === 'conversation' && (!currentSession || callStatus === 'connecting')) {
    // Calculate dynamic progress based on connection step
    let progress = 45;
    if (connectionStep.includes('backend')) progress = 50;
    if (connectionStep.includes('assistente')) progress = 60;
    if (connectionStep.includes('sessão')) progress = 70;
    if (connectionStep.includes('Tutor de IA')) progress = 80;
    if (connectionStep.includes('Aguardando')) progress = 90;

    return (
      <Loading
        title="AI Tutor"
        subtitle="Prática de Conversação"
        description={connectionStep}
        icon={MessageCircle}
        progress={progress}
        theme={{
          primary: "violet",
          secondary: "purple",
          accent: "yellow"
        }}
        size="md"
      />
    );
  }

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
      </div>
    </div>
  );
}