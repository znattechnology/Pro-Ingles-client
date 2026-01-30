'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface SessionSidebarProps {
  objective: string;
  messagesCount: number;
  timeElapsed: number;
}

export function SessionSidebar({ objective, messagesCount, timeElapsed }: SessionSidebarProps) {
  // Estimate speaking time (rough approximation)
  const estimatedSpeakingTime = Math.round(timeElapsed * 0.4);

  return (
    <div className="w-80 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium text-white">Contexto da Sessao</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Session objective */}
        <Card className="bg-gray-700/50 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-300">{objective || 'Praticar conversacao em ingles'}</p>
          </CardContent>
        </Card>

        {/* Session stats */}
        <Card className="bg-gray-700/50 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Estatisticas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Mensagens:</span>
              <span className="text-white font-medium">{messagesCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tempo falando:</span>
              <span className="text-green-400 font-medium">~{estimatedSpeakingTime}s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <div className="text-xs text-gray-400 text-center">
          <p>Use o botao "Finalizar Conversa" no topo para encerrar a sessao</p>
        </div>
      </div>
    </div>
  );
}

export default SessionSidebar;
