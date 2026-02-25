/**
 * Custom hook for loading and managing the Vapi SDK
 *
 * Handles:
 * - Loading Vapi SDK from npm package
 * - CDN fallback if npm fails
 * - Mock fallback for development
 */

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Vapi?: any;
  }
}

interface UseVapiSDKReturn {
  isLoaded: boolean;
  error: Error | null;
  VapiClass: any | null;
}

export function useVapiSDK(): UseVapiSDKReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [VapiClass, setVapiClass] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadVapiSDK = async () => {
      try {
        // Try to import Vapi SDK from npm package
        const { default: Vapi } = await import('@vapi-ai/web');

        if (mounted) {
          window.Vapi = Vapi;
          // Use callback form to prevent React from invoking the class
          setVapiClass(() => Vapi);
          setIsLoaded(true);
        }
      } catch (npmError) {
        console.warn('Failed to load Vapi SDK from npm, trying CDN fallback');

        // Fallback to CDN
        try {
          await loadFromCDN();
          if (mounted && window.Vapi) {
            // Use callback form to prevent React from invoking the class
            setVapiClass(() => window.Vapi);
            setIsLoaded(true);
          }
        } catch (cdnError) {
          console.warn('CDN fallback failed, using mock for development');

          // Mock fallback for development
          if (mounted) {
            const MockVapi = createMockVapi();
            window.Vapi = MockVapi;
            // Use callback form to prevent React from invoking the class
            setVapiClass(() => MockVapi);
            setIsLoaded(true);
          }
        }
      }
    };

    loadVapiSDK();

    return () => {
      mounted = false;
    };
  }, []);

  return { isLoaded, error, VapiClass };
}

/**
 * Load Vapi SDK from CDN
 */
function loadFromCDN(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vapi-ai/web@1.0.0/dist/index.js';

    script.onload = () => {
      if (window.Vapi) {
        resolve();
      } else {
        reject(new Error('Vapi not available after CDN load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Vapi SDK from CDN'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Create a mock Vapi class for development/testing
 */
function createMockVapi() {
  return class MockVapi {
    private listeners: Map<string, Function[]> = new Map();

    constructor(publicKey: string) {
      console.warn('[MockVapi] Using mock Vapi for development. Public key:', publicKey);
    }

    on(event: string, callback: Function) {
      const existing = this.listeners.get(event) || [];
      this.listeners.set(event, [...existing, callback]);
    }

    off(event: string, callback: Function) {
      const existing = this.listeners.get(event) || [];
      this.listeners.set(event, existing.filter(cb => cb !== callback));
    }

    async start(assistantId: string) {
      console.warn('[MockVapi] start() called with assistant:', assistantId);
      // Simulate call-start event after a short delay
      setTimeout(() => {
        this.emit('call-start');
      }, 1000);
    }

    async stop() {
      console.warn('[MockVapi] stop() called');
      this.emit('call-end');
    }

    private emit(event: string, data?: any) {
      const callbacks = this.listeners.get(event) || [];
      callbacks.forEach(cb => cb(data));
    }
  };
}

export default useVapiSDK;
