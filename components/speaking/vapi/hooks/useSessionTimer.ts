/**
 * Custom hook for managing session timer
 *
 * Handles:
 * - Elapsed time tracking
 * - Start/stop/reset timer controls
 * - Auto-end callback when time limit is reached
 * - Progress calculation
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSessionTimerReturn {
  elapsed: number;
  isActive: boolean;
  progress: number;
  formattedTime: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSessionTimer(
  maxMinutes: number,
  autoEndEnabled: boolean,
  onTimeUp?: () => void
): UseSessionTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep callback ref updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Timer effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const newTime = prev + 1;

          // Check if time limit reached
          if (autoEndEnabled && newTime >= maxMinutes * 60) {
            // Call onTimeUp callback if provided
            if (onTimeUpRef.current) {
              onTimeUpRef.current();
            }
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
  }, [isActive, maxMinutes, autoEndEnabled]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setElapsed(0);
    setIsActive(false);
  }, []);

  // Calculate progress percentage
  const progress = (elapsed / 60 / maxMinutes) * 100;

  // Format time as mm:ss
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    elapsed,
    isActive,
    progress: Math.min(progress, 100),
    formattedTime,
    start,
    stop,
    reset,
  };
}

export default useSessionTimer;
