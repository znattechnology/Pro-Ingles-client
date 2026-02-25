'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, XCircle, Mic, MicOff } from 'lucide-react';
import type { BackendStatus, MicPermission } from '../../types';

interface ConnectionStatusProps {
  isVapiLoaded: boolean;
  backendStatus: BackendStatus;
  micPermission: MicPermission;
  onRequestMicPermission: () => void;
}

export function ConnectionStatus({
  isVapiLoaded,
  backendStatus,
  micPermission,
  onRequestMicPermission,
}: ConnectionStatusProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="w-5 h-5" />
          Status da Conexao
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
            <Badge
              className={
                backendStatus === 'connected'
                  ? 'bg-green-600'
                  : backendStatus === 'error'
                  ? 'bg-red-600'
                  : 'bg-gray-600'
              }
            >
              {backendStatus === 'connected'
                ? 'Conectado'
                : backendStatus === 'error'
                ? 'Erro'
                : 'Verificando...'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Microfone:</span>
            <Badge
              className={
                micPermission === 'granted'
                  ? 'bg-green-600'
                  : micPermission === 'denied'
                  ? 'bg-red-600'
                  : micPermission === 'checking'
                  ? 'bg-yellow-600'
                  : 'bg-gray-600'
              }
            >
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
                'Nao verificado'
              )}
            </Badge>
          </div>
        </div>

        {backendStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">
              Nao foi possivel conectar ao backend. Verifique se o servidor esta rodando.
            </p>
          </div>
        )}

        {micPermission === 'denied' && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <div className="flex items-start gap-2">
              <MicOff className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium mb-1">
                  Permissao de microfone negada
                </p>
                <p className="text-red-300 text-xs">
                  E necessario permitir o acesso ao microfone para usar a pratica de conversacao.
                </p>
                <Button
                  onClick={onRequestMicPermission}
                  size="sm"
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="w-4 h-4 mr-1" />
                  Solicitar Permissao
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ConnectionStatus;
