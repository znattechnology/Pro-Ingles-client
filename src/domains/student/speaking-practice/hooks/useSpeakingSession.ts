/**
 * Hook para gerenciar sessões de speaking practice
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useCreateSpeakingSessionMutation,
  useCompleteSpeakingSessionMutation,
  useCreateSpeakingTurnMutation,
  useAnalyzeSpeechMutation,
  useGetSpeakingSessionQuery
} from '../api';
import type { 
  SpeakingExercise, 
  SpeakingSession, 
  SpeakingSessionState,
  SpeechAnalysis 
} from '../types';

interface UseSpeakingSessionProps {
  exercise?: SpeakingExercise;
  maxHearts?: number;
}

export const useSpeakingSession = ({ 
  exercise, 
  maxHearts = 5 
}: UseSpeakingSessionProps = {}) => {
  const router = useRouter();
  
  // Estado da sessão
  const [sessionState, setSessionState] = useState<SpeakingSessionState>({
    currentSession: null,
    isRecording: false,
    isProcessing: false,
    isSessionActive: false,
    sessionStats: {
      messagesExchanged: 0,
      averageScore: 0,
      timeSpent: 0,
      heartsUsed: 0
    },
    currentHearts: maxHearts
  });

  // Timer da sessão
  const [sessionTimer, setSessionTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mutations
  const [createSession] = useCreateSpeakingSessionMutation();
  const [completeSession] = useCompleteSpeakingSessionMutation();
  const [createTurn] = useCreateSpeakingTurnMutation();
  const [analyzeSpeech] = useAnalyzeSpeechMutation();

  // Query para dados da sessão atual
  const { data: currentSessionData, refetch: refetchSession } = useGetSpeakingSessionQuery(
    sessionState.currentSession?.id || '',
    { 
      skip: !sessionState.currentSession?.id,
      pollingInterval: sessionState.isSessionActive ? 30000 : 0 // Poll a cada 30s se ativa
    }
  );

  // Atualizar estado quando dados da sessão mudam
  useEffect(() => {
    if (currentSessionData) {
      setSessionState(prev => ({
        ...prev,
        currentSession: currentSessionData,
        sessionStats: {
          messagesExchanged: currentSessionData.turns_count,
          averageScore: currentSessionData.overall_score || 0,
          timeSpent: sessionTimer,
          heartsUsed: currentSessionData.hearts_used || 0
        }
      }));
      
      // Atualizar corações
      const heartsUsed = currentSessionData.hearts_used || 0;
      setSessionState(prev => ({
        ...prev,
        currentHearts: Math.max(0, maxHearts - heartsUsed)
      }));
    }
  }, [currentSessionData, sessionTimer, maxHearts]);

  // Timer da sessão
  useEffect(() => {
    if (sessionState.isSessionActive) {
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
  }, [sessionState.isSessionActive]);

  /**
   * Inicia nova sessão de speaking
   */
  const startSession = useCallback(async (exerciseId: string) => {
    try {
      const session = await createSession({ exercise: exerciseId }).unwrap();
      
      setSessionState(prev => ({
        ...prev,
        currentSession: session,
        isSessionActive: true,
        sessionStats: {
          messagesExchanged: 0,
          averageScore: 0,
          timeSpent: 0,
          heartsUsed: 0
        }
      }));
      
      setSessionTimer(0);
      
      return session;
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      throw error;
    }
  }, [createSession]);

  /**
   * Finaliza sessão atual
   */
  const endSession = useCallback(async () => {
    if (!sessionState.currentSession) return;

    try {
      await completeSession(sessionState.currentSession.id).unwrap();
      
      setSessionState(prev => ({
        ...prev,
        isSessionActive: false
      }));
      
      // Navegar para página de progresso
      router.push('/user/laboratory/speaking/progress');
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      throw error;
    }
  }, [sessionState.currentSession, completeSession, router]);

  /**
   * Processa turno de fala do usuário
   */
  const processUserSpeech = useCallback(async (
    audioBlob: Blob,
    targetText?: string
  ): Promise<SpeechAnalysis> => {
    if (!sessionState.currentSession) {
      throw new Error('Nenhuma sessão ativa');
    }

    setSessionState(prev => ({ ...prev, isProcessing: true }));

    try {
      // 1. Primeiro, analisar o áudio
      const audioFile = new File([audioBlob], 'speech.wav', { type: 'audio/wav' });
      const analysis = await analyzeSpeech({ 
        audio_file: audioFile, 
        target_text: targetText 
      }).unwrap();

      // 2. Criar turno com os resultados da análise
      await createTurn({
        session: sessionState.currentSession.id,
        turn_type: 'USER_SPEECH',
        transcribed_text: analysis.transcribed_text,
        target_text: targetText,
        audio_file: audioFile,
        pronunciation_score: analysis.pronunciation_score,
        fluency_score: analysis.fluency_score,
        accuracy_score: analysis.accuracy_score,
        confidence_score: analysis.confidence_score,
        // TODO: Adicionar análise de palavras e erros se disponível
      }).unwrap();

      // 3. Atualizar estatísticas
      setSessionState(prev => ({
        ...prev,
        sessionStats: {
          ...prev.sessionStats,
          messagesExchanged: prev.sessionStats.messagesExchanged + 1,
          averageScore: Math.round(
            (prev.sessionStats.averageScore + analysis.overall_score) / 2
          )
        }
      }));

      // 4. Verificar se perdeu vida (score < 70%)
      if (analysis.overall_score < 70) {
        setSessionState(prev => ({
          ...prev,
          currentHearts: Math.max(0, prev.currentHearts - 1),
          sessionStats: {
            ...prev.sessionStats,
            heartsUsed: prev.sessionStats.heartsUsed + 1
          }
        }));
      }

      // 5. Refetch session data para ter dados atualizados
      refetchSession();

      return analysis;

    } catch (error) {
      console.error('Erro ao processar fala:', error);
      throw error;
    } finally {
      setSessionState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [sessionState.currentSession, analyzeSpeech, createTurn, refetchSession]);

  /**
   * Inicia gravação
   */
  const startRecording = useCallback(() => {
    setSessionState(prev => ({ ...prev, isRecording: true }));
  }, []);

  /**
   * Para gravação e processa áudio
   */
  const stopRecording = useCallback(async (
    audioBlob: Blob, 
    targetText?: string
  ) => {
    setSessionState(prev => ({ ...prev, isRecording: false }));
    
    try {
      const analysis = await processUserSpeech(audioBlob, targetText);
      return analysis;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      throw error;
    }
  }, [processUserSpeech]);

  /**
   * Formata tempo em MM:SS
   */
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Verifica se pode continuar (tem corações)
   */
  const canContinue = useCallback(() => {
    return sessionState.currentHearts > 0;
  }, [sessionState.currentHearts]);

  /**
   * Reset do estado da sessão
   */
  const resetSession = useCallback(() => {
    setSessionState({
      currentSession: null,
      isRecording: false,
      isProcessing: false,
      isSessionActive: false,
      sessionStats: {
        messagesExchanged: 0,
        averageScore: 0,
        timeSpent: 0,
        heartsUsed: 0
      },
      currentHearts: maxHearts
    });
    setSessionTimer(0);
  }, [maxHearts]);

  return {
    // Estado
    sessionState,
    sessionTimer,
    formattedTimer: formatTime(sessionTimer),
    
    // Ações
    startSession,
    endSession,
    startRecording,
    stopRecording,
    processUserSpeech,
    resetSession,
    
    // Utilitários
    canContinue,
    formatTime,
    
    // Loading states
    isCreatingSession: false, // TODO: Adicionar loading states das mutations
    isCompletingSession: false,
    isProcessingTurn: sessionState.isProcessing,
  };
};

export default useSpeakingSession;