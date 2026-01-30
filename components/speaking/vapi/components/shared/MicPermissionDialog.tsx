'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MicOff, CheckCircle, Info } from 'lucide-react';
import type { BrowserType, MicPermission } from '../../types';
import { getMicInstructions } from '../../hooks/useMicrophonePermission';

interface MicPermissionDialogProps {
  show: boolean;
  permission: MicPermission;
  browserType: BrowserType;
  onRequestPermission?: () => void;
  onCheckAgain?: () => void;
  onClose?: () => void;
}

export function MicPermissionDialog({
  show,
  permission,
  browserType,
  onRequestPermission,
  onCheckAgain,
  onClose,
}: MicPermissionDialogProps) {
  if (!show) return null;

  // Permission request in progress dialog
  if (permission === 'checking') {
    return (
      <Card className="bg-blue-900/50 border-blue-700">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Permissao de Microfone Necessaria
              </h3>
              <p className="text-blue-200 text-sm mb-4">
                Para praticar conversacao com a IA, precisamos acessar seu microfone. Seus dados sao usados apenas para analise em tempo real e nao sao armazenados permanentemente.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-300">
                <CheckCircle className="w-4 h-4" />
                <span>Suas conversas sao privadas e seguras</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Permission denied dialog with instructions
  const instructions = getMicInstructions(browserType);
  const browserNames: Record<BrowserType, string> = {
    chrome: 'Chrome',
    firefox: 'Firefox',
    edge: 'Edge',
    safari: 'Safari',
    other: 'seu navegador',
  };

  return (
    <Card className="bg-red-900/50 border-red-700">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <MicOff className="w-5 h-5" />
              Permissao de Microfone Bloqueada
            </h3>
            <p className="text-red-200 text-sm mb-4">
              O acesso ao microfone foi negado. Para usar a pratica de conversacao, voce precisa habilitar o microfone nas configuracoes do navegador.
            </p>

            <div className="bg-red-950/50 rounded-lg p-4 mb-4">
              <h4 className="text-white font-medium text-sm mb-3">
                Como habilitar no {browserNames[browserType]}:
              </h4>

              <ol className="text-red-100 text-xs space-y-2 list-decimal list-inside">
                {instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <div className="flex items-center gap-2">
              {onCheckAgain && (
                <Button
                  onClick={onCheckAgain}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Ja habilitei, verificar novamente
                </Button>
              )}
              {onClose && (
                <Button
                  onClick={onClose}
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-300 hover:bg-red-950"
                >
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MicPermissionDialog;
