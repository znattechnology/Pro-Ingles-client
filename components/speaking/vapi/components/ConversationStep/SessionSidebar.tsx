'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ChevronUp, ChevronDown, BarChart3, Clock } from 'lucide-react';

interface SessionSidebarProps {
  objective: string;
  messagesCount: number;
  timeElapsed: number;
}

export function SessionSidebar({ objective, messagesCount, timeElapsed }: SessionSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Estimate speaking time (rough approximation)
  const estimatedSpeakingTime = Math.round(timeElapsed * 0.4);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Mobile: Collapsible bottom panel */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40">
        {/* Collapsed header - always visible */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 h-auto hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">{messagesCount} msgs</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">~{formatTime(estimatedSpeakingTime)}</span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </Button>

        {/* Expandable content */}
        {isExpanded && (
          <div className="p-4 pt-0 space-y-3 max-h-[40vh] overflow-y-auto">
            {/* Session objective */}
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader className="pb-2 p-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objetivo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-3 pt-0">
                <p className="text-sm text-gray-300">{objective || 'Praticar conversacao em ingles'}</p>
              </CardContent>
            </Card>

            {/* Session stats */}
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader className="pb-2 p-3">
                <CardTitle className="text-white text-sm">Estatisticas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-3 pt-0 space-y-2 text-sm">
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

            <p className="text-xs text-gray-400 text-center">
              Use o botao "Finalizar" no topo para encerrar
            </p>
          </div>
        )}
      </div>

      {/* Desktop: Fixed sidebar */}
      <div className="hidden lg:flex w-64 xl:w-80 bg-gray-800 rounded-lg border border-gray-700 flex-col flex-shrink-0">
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
    </>
  );
}

export default SessionSidebar;
