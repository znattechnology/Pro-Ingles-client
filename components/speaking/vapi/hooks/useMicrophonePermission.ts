/**
 * Custom hook for managing microphone permissions
 *
 * Handles:
 * - Checking current permission state
 * - Requesting microphone access
 * - Browser-specific guidance for denied permissions
 * - Permission change monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import type { MicPermission, BrowserType } from '../types';

interface UseMicrophonePermissionReturn {
  permission: MicPermission;
  showDialog: boolean;
  showDeniedAlert: boolean;
  browserType: BrowserType;
  check: () => Promise<boolean>;
  request: () => Promise<boolean>;
  setShowDialog: (show: boolean) => void;
  setShowDeniedAlert: (show: boolean) => void;
}

export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [permission, setPermission] = useState<MicPermission>('unknown');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeniedAlert, setShowDeniedAlert] = useState(false);
  const [browserType, setBrowserType] = useState<BrowserType>('other');

  // Detect browser type on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
        setBrowserType('chrome');
      } else if (userAgent.includes('firefox')) {
        setBrowserType('firefox');
      } else if (userAgent.includes('edge')) {
        setBrowserType('edge');
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        setBrowserType('safari');
      } else {
        setBrowserType('other');
      }
    }
  }, []);

  /**
   * Check current microphone permission state
   */
  const check = useCallback(async (): Promise<boolean> => {
    try {
      setPermission('checking');

      // Check if browser supports Permissions API
      if ('permissions' in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({
            name: 'microphone' as PermissionName
          });

          if (permissionStatus.state === 'granted') {
            setPermission('granted');
            return true;
          } else if (permissionStatus.state === 'denied') {
            setPermission('denied');
            setShowDeniedAlert(true);
            return false;
          } else {
            // 'prompt' state - permission not yet requested
            setPermission('unknown');
            return false;
          }
        } catch {
          // Permissions API query failed, will try getUserMedia
          setPermission('unknown');
          return false;
        }
      } else {
        // Permissions API not supported
        setPermission('unknown');
        return false;
      }
    } catch {
      setPermission('unknown');
      return false;
    }
  }, []);

  /**
   * Request microphone access using getUserMedia
   */
  const request = useCallback(async (): Promise<boolean> => {
    try {
      setPermission('checking');
      setShowDialog(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop all tracks immediately (we just needed to check permission)
      stream.getTracks().forEach(track => track.stop());

      setPermission('granted');
      setShowDialog(false);
      setShowDeniedAlert(false);

      return true;
    } catch (error: any) {
      setShowDialog(false);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermission('denied');
        setShowDeniedAlert(true);
      } else if (error.name === 'NotFoundError') {
        // No microphone found
        setPermission('denied');
        setShowDeniedAlert(true);
      } else {
        setPermission('unknown');
      }

      return false;
    }
  }, []);

  // Listen for permission changes (when supported)
  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;

    const setupPermissionListener = async () => {
      if ('permissions' in navigator) {
        try {
          permissionStatus = await navigator.permissions.query({
            name: 'microphone' as PermissionName
          });

          const handleChange = () => {
            if (permissionStatus) {
              if (permissionStatus.state === 'granted') {
                setPermission('granted');
                setShowDeniedAlert(false);
              } else if (permissionStatus.state === 'denied') {
                setPermission('denied');
                setShowDeniedAlert(true);
              }
            }
          };

          permissionStatus.addEventListener('change', handleChange);

          return () => {
            permissionStatus?.removeEventListener('change', handleChange);
          };
        } catch {
          // Permissions API not available for microphone
        }
      }
    };

    setupPermissionListener();
  }, []);

  return {
    permission,
    showDialog,
    showDeniedAlert,
    browserType,
    check,
    request,
    setShowDialog,
    setShowDeniedAlert,
  };
}

/**
 * Get browser-specific instructions for enabling microphone
 */
export function getMicInstructions(browserType: BrowserType): string[] {
  switch (browserType) {
    case 'chrome':
      return [
        'Clique no icone de cadeado na barra de endereco',
        'Encontre "Microfone" nas permissoes',
        'Altere para "Permitir"',
        'Recarregue a pagina'
      ];
    case 'firefox':
      return [
        'Clique no icone de escudo/cadeado na barra de endereco',
        'Clique em "Permissoes"',
        'Encontre "Microfone" e clique em "Permitir"',
        'Recarregue a pagina'
      ];
    case 'edge':
      return [
        'Clique no icone de cadeado na barra de endereco',
        'Clique em "Permissoes do site"',
        'Encontre "Microfone" e altere para "Permitir"',
        'Recarregue a pagina'
      ];
    case 'safari':
      return [
        'Abra Safari > Preferencias > Sites',
        'Selecione "Microfone" na barra lateral',
        'Encontre este site e altere para "Permitir"',
        'Recarregue a pagina'
      ];
    default:
      return [
        'Acesse as configuracoes do seu navegador',
        'Encontre as permissoes de site',
        'Habilite o acesso ao microfone para este site',
        'Recarregue a pagina'
      ];
  }
}

export default useMicrophonePermission;
