'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { RecoverableSession } from '../../hooks/useSessionRecovery';

interface RecoveryDialogProps {
  show: boolean;
  sessionData: RecoverableSession | null;
  onRecover: () => void;
  onDiscard: () => void;
}

export function RecoveryDialog({
  show,
  sessionData,
  onRecover,
  onDiscard,
}: RecoveryDialogProps) {
  if (!show || !sessionData) return null;

  return (
    <Card className="bg-yellow-900/30 border-yellow-700 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Sessao Anterior Detectada
            </h3>
            <p className="text-yellow-200 text-sm mb-4">
              Encontramos uma sessao de conversacao que nao foi finalizada. Voce gostaria de recupera-la?
            </p>

            <div className="bg-yellow-950/50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-300">Usuario:</span>
                <span className="text-white font-medium">{sessionData.userProfile?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-300">Nivel:</span>
                <Badge variant="secondary">{sessionData.config?.level}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-300">Dominio:</span>
                <Badge variant="outline">{sessionData.config?.domain}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-300">Mensagens:</span>
                <span className="text-white font-medium">{sessionData.messages?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-300">Inicio:</span>
                <span className="text-white font-medium">
                  {new Date(sessionData.startTime).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={onRecover}
                className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Recuperar Sessao
              </Button>
              <Button
                onClick={onDiscard}
                variant="outline"
                className="border-yellow-500 text-yellow-300 hover:bg-yellow-950"
              >
                Descartar e Comecar Nova
              </Button>
            </div>

            <p className="text-xs text-yellow-300 mt-3">
              A sessao sera recuperada com todas as mensagens anteriores. Voce podera ver o historico e encerrar a sessao para ver o resumo.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecoveryDialog;
