/**
 * Custom hook for managing backend API interactions
 *
 * Handles:
 * - Backend health check
 * - Assistant retrieval/creation
 * - Session management (start/end)
 * - Batch transcript analysis
 * - Retry logic for all API calls
 */

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { retryFetchJSON } from '@/lib/apiRetry';
import type { VapiConfig, UserProfile, ConversationMessage, BackendStatus } from '../types';
import { API_BASE_URL } from '../constants';

interface Assistant {
  id: string;
  name: string;
  level?: string;
  domain?: string;
}

interface BackendSession {
  session_id: string;
  [key: string]: any;
}

interface QuotaInfo {
  success: boolean;
  can_start: boolean;
  message: string;
  quota: {
    plan_name: string;
    plan_type: string;
    daily_limit: number;
    max_session_minutes: number;
    daily_minutes_used: number;
    daily_minutes_remaining: number;
    ai_tutor: boolean;
    advanced_analytics: boolean;
  };
}

interface UseBackendAPIReturn {
  status: BackendStatus;
  isProcessing: boolean;
  error: string | null;
  quotaInfo: QuotaInfo | null;
  checkStatus: () => Promise<boolean>;
  checkQuota: () => Promise<QuotaInfo | null>;
  createAssistant: () => Promise<Assistant | null>;
  startSession: () => Promise<BackendSession | null>;
  sendBatchAnalysis: (sessionId: string, messages: ConversationMessage[], elapsedSeconds: number) => Promise<boolean>;
  clearError: () => void;
}

export function useBackendAPI(
  config: VapiConfig,
  userProfile: UserProfile
): UseBackendAPIReturn {
  const [status, setStatus] = useState<BackendStatus>('unknown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);

  // Prevent duplicate batch analysis calls
  const batchAnalysisInProgressRef = useRef(false);

  /**
   * Check backend API health/connectivity
   */
  const checkStatus = useCallback(async (): Promise<boolean> => {
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
        maxRetries: 2,
        initialDelay: 500,
        timeout: 10000,
      }
    );

    if (result.success) {
      setStatus('connected');
      return true;
    } else {
      setStatus('error');
      return false;
    }
  }, []);

  /**
   * Check user's conversation quota before starting session
   */
  const checkQuota = useCallback(async (): Promise<QuotaInfo | null> => {
    const result = await retryFetchJSON<QuotaInfo>(
      `${API_BASE_URL}/practice/vapi/quota/check/`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      },
      {
        maxRetries: 2,
        initialDelay: 500,
        timeout: 10000,
      }
    );

    if (result.success && result.data) {
      setQuotaInfo(result.data);
      return result.data;
    }

    // Em caso de erro, permitir (fail-open)
    return {
      success: true,
      can_start: true,
      message: 'OK',
      quota: {
        plan_name: 'Gratuito',
        plan_type: 'FREE',
        daily_limit: 15,
        max_session_minutes: 10,
        daily_minutes_used: 0,
        daily_minutes_remaining: 15,
        ai_tutor: false,
        advanced_analytics: false,
      }
    };
  }, []);

  /**
   * Get pre-configured assistant from backend
   */
  const createAssistant = useCallback(async (): Promise<Assistant | null> => {
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
      }
    );

    if (result.success && result.data?.success && result.data?.assistants?.length > 0) {
      const assistant = result.data.assistants[0];
      return assistant;
    }

    // Fallback: return mock assistant for testing
    const mockAssistantId = 'test-assistant-id';
    return {
      id: mockAssistantId,
      name: `English Practice Assistant - ${config.domain}`,
      level: config.level,
      domain: config.domain
    };
  }, [config.domain, config.level]);

  /**
   * Start a new Vapi session on the backend
   */
  const startSession = useCallback(async (): Promise<BackendSession | null> => {
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
            session_id: `session-${uuidv4()}`,
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
      }
    );

    if (result.success && result.data) {
      return result.data.session;
    }
    return null;
  }, [config, userProfile.name]);

  /**
   * Send batch analysis of conversation to backend
   * Includes message validation, merging of short fragments, and retry logic
   */
  const sendBatchAnalysis = useCallback(async (
    sessionId: string,
    messagesList: ConversationMessage[],
    elapsedSeconds: number = 0
  ): Promise<boolean> => {
    // Prevent duplicate calls
    if (batchAnalysisInProgressRef.current) {
      console.log('[BATCH] Analysis already in progress, skipping duplicate call');
      return false;
    }

    batchAnalysisInProgressRef.current = true;
    setIsProcessing(true);
    setError(null);

    // Debug logging
    console.log('[BATCH] Starting batch analysis for session:', sessionId);
    console.log('[BATCH] Total messages received:', messagesList.length);
    console.log('[BATCH] Messages:', messagesList);

    try {
      // Validate student messages exist
      const studentMessages = messagesList.filter(msg => msg.role === 'user');
      console.log('[BATCH] Student messages count:', studentMessages.length);

      if (studentMessages.length === 0) {
        // No student messages - consider success (nothing to analyze)
        console.log('[BATCH] SKIPPING - No student messages found');
        setIsProcessing(false);
        batchAnalysisInProgressRef.current = false;
        return true;
      }

      // Validate total content length (reduced from 50 to 10 to capture short sessions)
      const MIN_TOTAL_CHARS = 10;
      const totalStudentChars = studentMessages.reduce(
        (sum, msg) => sum + (msg.content?.length || 0),
        0
      );
      console.log('[BATCH] Total student chars:', totalStudentChars);

      if (totalStudentChars < MIN_TOTAL_CHARS) {
        // Content too short for meaningful analysis
        console.log('[BATCH] SKIPPING - Content too short:', totalStudentChars, '<', MIN_TOTAL_CHARS);
        setIsProcessing(false);
        batchAnalysisInProgressRef.current = false;
        return true;
      }

      console.log('[BATCH] Proceeding with backend call...');

      // Transform messages for backend format
      const conversationHistory = messagesList
        .filter((msg) => {
          return msg.role && msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0;
        })
        .map((msg) => ({
          who: msg.role === 'assistant' ? 'agent' : 'student',
          text: msg.content.trim(),
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }));

      // Merge short fragments to improve analysis quality
      const MIN_MESSAGE_LENGTH = 10;
      const mergedHistory: Array<{ who: string; text: string; timestamp: string }> = [];

      for (let i = 0; i < conversationHistory.length; i++) {
        const current = conversationHistory[i];

        if (current.who === 'student' && current.text.length < MIN_MESSAGE_LENGTH) {
          let mergedText = current.text;
          const mergedTimestamp = current.timestamp;
          let j = i + 1;

          // Merge consecutive short student messages
          while (
            j < conversationHistory.length &&
            conversationHistory[j].who === 'student' &&
            conversationHistory[j].text.length < MIN_MESSAGE_LENGTH * 2
          ) {
            mergedText += ' ' + conversationHistory[j].text;
            j++;
            if (mergedText.length >= MIN_MESSAGE_LENGTH * 2) break;
          }

          if (j > i + 1) {
            mergedHistory.push({
              who: 'student',
              text: mergedText,
              timestamp: mergedTimestamp
            });
            i = j - 1;
          } else {
            mergedHistory.push(current);
          }
        } else {
          mergedHistory.push(current);
        }
      }

      const payload = {
        action: 'process_transcript',
        session_config: {
          session_id: sessionId,
          student_level: config.level,
          domain: config.domain,
          correction_mode: config.correction_mode,
          elapsed_seconds: elapsedSeconds,  // Tempo real da sessão
        },
        conversation_history: mergedHistory
      };

      console.log('[BATCH] Sending with elapsed_seconds:', elapsedSeconds);

      // Batch analysis requires longer timeout due to AI processing
      // The orchestrator can take 30-60+ seconds for transcript analysis
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
          maxRetries: 2,  // Fewer retries since each attempt takes longer
          initialDelay: 2000,
          maxDelay: 10000,
          timeout: 90000,  // 90 seconds for AI processing
        }
      );

      setIsProcessing(false);
      batchAnalysisInProgressRef.current = false;

      if (result.success) {
        console.log('[BATCH] Analysis completed successfully');
        return true;
      } else {
        console.error('[BATCH] Analysis failed:', result.error);
        setError('Nao foi possivel processar a sessao. Seus dados foram salvos e voce pode tentar novamente.');
        return false;
      }
    } catch (err) {
      console.error('[BATCH] Exception during analysis:', err);
      setIsProcessing(false);
      batchAnalysisInProgressRef.current = false;
      setError('Erro ao processar sessao.');
      return false;
    }
  }, [config]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    isProcessing,
    error,
    quotaInfo,
    checkStatus,
    checkQuota,
    createAssistant,
    startSession,
    sendBatchAnalysis,
    clearError,
  };
}

export default useBackendAPI;
