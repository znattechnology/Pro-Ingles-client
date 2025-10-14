/**
 * TokenManagerInitializer - Component to initialize token management
 */

'use client';

import { useEffect } from 'react';
import { tokenManager } from '@/lib/token-manager';

export default function TokenManagerInitializer() {
  useEffect(() => {
    // Initialize token manager on app start
    tokenManager.init();

    // Cleanup on unmount
    return () => {
      tokenManager.cleanup();
    };
  }, []);

  // This component doesn't render anything
  return null;
}