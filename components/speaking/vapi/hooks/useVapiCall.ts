/**
 * Custom hook for managing Vapi call lifecycle
 *
 * This is the main orchestrator hook that coordinates:
 * - Vapi client initialization and management
 * - Call start/end lifecycle
 * - Message handling and state
 * - Speaking indicators
 * - Session management
 */

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { VapiConfig, UserProfile, ConversationMessage, CallStatus, VapiSession } from '../types';
import { VAPI_PUBLIC_KEY } from '../constants';

declare global {
  interface Window {
    Vapi?: any;
  }
}

interface UseVapiCallDeps {
  VapiClass: any | null;
  sdkLoaded: boolean;
  micGranted: boolean;
  checkBackendStatus: () => Promise<boolean>;
  createAssistant: () => Promise<{ id: string; name: string } | null>;
  startSession: () => Promise<{ session_id: string } | null>;
  saveSessionToStorage: (sessionId: string, userProfile: UserProfile, config: VapiConfig, assistantId?: string) => void;
  updateMessagesInStorage: (messages: ConversationMessage[]) => void;
  requestMicPermission: () => Promise<boolean>;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseVapiCallReturn {
  vapi: any | null;
  status: CallStatus;
  connectionStep: string;
  messages: ConversationMessage[];
  session: VapiSession | null;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  isCallActive: boolean;
  isEndingCall: boolean;
  start: () => Promise<void>;
  end: () => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
}

export function useVapiCall(
  config: VapiConfig,
  userProfile: UserProfile,
  deps: UseVapiCallDeps
): UseVapiCallReturn {
  const [vapi, setVapi] = useState<any>(null);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [connectionStep, setConnectionStep] = useState<string>('Iniciando...');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [session, setSession] = useState<VapiSession | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);

  // Refs to avoid closure issues
  const messagesRef = useRef<ConversationMessage[]>([]);
  const sessionRef = useRef<VapiSession | null>(null);

  // Keep refs in sync with state
  messagesRef.current = messages;
  sessionRef.current = session;

  /**
   * Start a new Vapi call
   */
  const start = useCallback(async () => {
    const {
      VapiClass,
      sdkLoaded,
      micGranted,
      checkBackendStatus,
      createAssistant,
      startSession,
      saveSessionToStorage,
      updateMessagesInStorage,
      requestMicPermission,
      onCallStart,
      onError,
    } = deps;

    if (!sdkLoaded || !VapiClass) {
      onError?.('Vapi SDK nao carregado');
      return;
    }

    // Prevent multiple simultaneous calls
    if (status === 'connecting' || status === 'connected' || isCallActive) {
      return;
    }

    // Check microphone permission
    if (!micGranted) {
      const granted = await requestMicPermission();
      if (!granted) {
        onError?.('Permissao de microfone necessaria');
        return;
      }
    }

    try {
      // Cleanup previous instance
      if (vapi) {
        try {
          await vapi.stop();
        } catch (e) {
          // Previous instance already stopped
        }
        setVapi(null);
      }

      setIsEndingCall(false);
      setStatus('connecting');
      setConnectionStep('Iniciando conexao...');

      // Check backend
      setConnectionStep('Verificando backend...');
      const backendConnected = await checkBackendStatus();
      if (!backendConnected) {
        throw new Error('Backend not available');
      }

      // Get assistant
      setConnectionStep('Preparando assistente de IA...');
      const assistant = await createAssistant();
      if (!assistant) {
        throw new Error('Failed to create assistant');
      }

      // Start backend session
      setConnectionStep('Criando sessao...');
      const backendSession = await startSession();
      if (!backendSession) {
        throw new Error('Failed to start backend session');
      }

      // Initialize Vapi client
      if (!VAPI_PUBLIC_KEY) {
        throw new Error('VAPI_PUBLIC_KEY not configured');
      }

      const vapiClient = new VapiClass(VAPI_PUBLIC_KEY);

      // Setup event listeners
      vapiClient.on('speech-start', () => {
        setIsUserSpeaking(true);
        setIsAISpeaking(false);
      });

      vapiClient.on('speech-end', () => {
        setIsUserSpeaking(false);
      });

      vapiClient.on('message', (message: any) => {
        // Track AI speaking status
        if (message.type === 'transcript' && message.role === 'assistant') {
          if (message.transcriptType === 'partial') {
            setIsAISpeaking(true);
            setIsUserSpeaking(false);
          } else if (message.transcriptType === 'final') {
            setIsAISpeaking(false);
          }
        }

        // Add final transcripts to messages
        if (message.type === 'transcript' && message.transcript && message.transcriptType === 'final') {
          const newMessage: ConversationMessage = {
            id: `msg-${Date.now()}-${Math.random()}`,
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: message.transcript,
            timestamp: new Date()
          };

          setMessages(prev => {
            const updated = [...prev, newMessage];
            // Update localStorage backup
            updateMessagesInStorage(updated);
            return updated;
          });
        }
      });

      vapiClient.on('call-start', () => {
        setConnectionStep('Conectado! Iniciando conversa...');
        setStatus('connected');
        setIsCallActive(true);

        // Clear messages from previous session
        setMessages([]);

        // Create session
        const sessionId = backendSession?.session_id || `session-${uuidv4()}`;
        const newSession: VapiSession = {
          id: sessionId,
          userProfile,
          config,
          messages: [],
          startTime: new Date(),
          isActive: true,
          assistantId: assistant.id
        };

        setSession(newSession);

        // Store in localStorage for recovery
        saveSessionToStorage(sessionId, userProfile, config, assistant.id);

        onCallStart?.();
      });

      vapiClient.on('call-end', () => {
        // Note: handleCallEnd should be called from the component level
        // This just updates local state
        setIsCallActive(false);
        setStatus('ended');
        setIsUserSpeaking(false);
        setIsAISpeaking(false);
      });

      vapiClient.on('error', async (error: any) => {
        let userFriendlyMessage = 'Erro ao conectar com o Tutor de IA.';

        if (error.error && error.error instanceof Response) {
          try {
            const errorText = await error.error.text();
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.message) {
                userFriendlyMessage = errorJson.message;
              }
            } catch {
              // Not JSON
            }
          } catch {
            // Could not read response
          }
        } else if (error.message) {
          if (error.message.includes('multiple call instances')) {
            userFriendlyMessage = 'Ja existe uma chamada em andamento. Por favor, aguarde.';
          } else if (error.message.includes('Meeting has ended')) {
            userFriendlyMessage = 'A chamada foi encerrada inesperadamente. Tente novamente.';
          } else if (error.message.includes('network') || error.message.includes('connection')) {
            userFriendlyMessage = 'Problema de conexao. Verifique sua internet e tente novamente.';
          } else {
            userFriendlyMessage = `Erro: ${error.message}`;
          }
        }

        setStatus('error');
        setConnectionStep(userFriendlyMessage);
        onError?.(userFriendlyMessage);
      });

      // Start the call
      setConnectionStep('Conectando com Tutor de IA...');
      await vapiClient.start(assistant.id);
      setConnectionStep('Aguardando conexao com assistente...');
      setVapi(vapiClient);

    } catch (error: any) {
      setConnectionStep('Erro na conexao');
      setStatus('error');
      deps.onError?.(error.message || 'Failed to start call');
    }
  }, [config, userProfile, deps, vapi, status, isCallActive]);

  /**
   * End the current call
   */
  const end = useCallback(async () => {
    if (isEndingCall) {
      return;
    }

    setIsEndingCall(true);

    if (vapi) {
      try {
        await vapi.stop();
      } catch (error) {
        // Error stopping call
      }
    }

    setIsCallActive(false);
    setStatus('ended');
    setIsUserSpeaking(false);
    setIsAISpeaking(false);

    deps.onCallEnd?.();
  }, [vapi, isEndingCall, deps]);

  return {
    vapi,
    status,
    connectionStep,
    messages,
    session,
    isUserSpeaking,
    isAISpeaking,
    isCallActive,
    isEndingCall,
    start,
    end,
    setMessages,
  };
}

export default useVapiCall;
