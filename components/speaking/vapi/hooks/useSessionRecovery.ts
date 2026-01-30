/**
 * Custom hook for managing session recovery from localStorage
 *
 * Handles:
 * - Checking for recoverable sessions on mount
 * - Session age validation (30 minute limit)
 * - Recovery dialog state management
 * - Session data restoration or cleanup
 */

import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, VapiConfig, ConversationMessage } from '../types';

const STORAGE_KEYS = {
  SESSION_ID: 'vapi-session-id',
  MESSAGES: 'vapi-messages',
  SESSION_DATA: 'vapi-session-data',
} as const;

const SESSION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

export interface RecoverableSession {
  sessionId: string;
  messages: ConversationMessage[];
  userProfile: UserProfile;
  config: Partial<VapiConfig>;
  startTime: string;
  assistantId?: string;
}

interface UseSessionRecoveryReturn {
  showDialog: boolean;
  savedData: RecoverableSession | null;
  checkForSavedSession: () => void;
  recover: () => RecoverableSession | null;
  discard: () => void;
  saveSession: (sessionId: string, userProfile: UserProfile, config: VapiConfig, assistantId?: string) => void;
  updateMessages: (messages: ConversationMessage[]) => void;
  clearStorage: () => void;
  getStoredMessages: () => ConversationMessage[];
  getStoredSessionId: () => string | null;
}

export function useSessionRecovery(): UseSessionRecoveryReturn {
  const [showDialog, setShowDialog] = useState(false);
  const [savedData, setSavedData] = useState<RecoverableSession | null>(null);

  /**
   * Check for saved session in localStorage
   */
  const checkForSavedSession = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const storedSessionData = localStorage.getItem(STORAGE_KEYS.SESSION_DATA);

      if (storedSessionId && storedSessionData) {
        const sessionData = JSON.parse(storedSessionData);
        const messages = storedMessages ? JSON.parse(storedMessages) : [];

        // Check if session is recent enough
        const sessionAge = Date.now() - new Date(sessionData.startTime).getTime();

        if (sessionAge < SESSION_MAX_AGE_MS) {
          const recoverableSession: RecoverableSession = {
            sessionId: storedSessionId,
            messages,
            userProfile: sessionData.userProfile,
            config: sessionData.config || {},
            startTime: sessionData.startTime,
            assistantId: sessionData.assistantId,
          };

          setSavedData(recoverableSession);
          setShowDialog(true);
        } else {
          // Session too old, clear it
          clearStorageInternal();
        }
      }
    } catch (error) {
      // Failed to check recovery, clear potentially corrupted data
      clearStorageInternal();
    }
  }, []);

  /**
   * Recover saved session data
   */
  const recover = useCallback((): RecoverableSession | null => {
    setShowDialog(false);
    return savedData;
  }, [savedData]);

  /**
   * Discard saved session and clear storage
   */
  const discard = useCallback(() => {
    clearStorageInternal();
    setSavedData(null);
    setShowDialog(false);
  }, []);

  /**
   * Save session data to localStorage for recovery
   */
  const saveSession = useCallback((
    sessionId: string,
    userProfile: UserProfile,
    config: VapiConfig,
    assistantId?: string
  ) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify({
        userProfile,
        config,
        startTime: new Date().toISOString(),
        assistantId,
      }));
    } catch (error) {
      // localStorage may be full or disabled
    }
  }, []);

  /**
   * Update stored messages
   */
  const updateMessages = useCallback((messages: ConversationMessage[]) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      // localStorage may be full
    }
  }, []);

  /**
   * Get stored messages from localStorage
   */
  const getStoredMessages = useCallback((): ConversationMessage[] => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (stored) {
        const messages = JSON.parse(stored);
        // Validate messages
        return messages.filter((msg: any) =>
          msg && msg.role && msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0
        );
      }
    } catch (error) {
      // Failed to parse
    }
    return [];
  }, []);

  /**
   * Get stored session ID
   */
  const getStoredSessionId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  }, []);

  /**
   * Clear all session storage
   */
  const clearStorage = useCallback(() => {
    clearStorageInternal();
  }, []);

  // Check for saved session on mount
  useEffect(() => {
    checkForSavedSession();
  }, [checkForSavedSession]);

  return {
    showDialog,
    savedData,
    checkForSavedSession,
    recover,
    discard,
    saveSession,
    updateMessages,
    clearStorage,
    getStoredMessages,
    getStoredSessionId,
  };
}

/**
 * Internal function to clear localStorage (no React state dependencies)
 */
function clearStorageInternal() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
  } catch (error) {
    // localStorage may be disabled
  }
}

export default useSessionRecovery;
