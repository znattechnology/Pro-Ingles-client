'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PhoneOff, Mic, Bot, Clock } from 'lucide-react';
import type { CallStatus, VapiConfig } from '../../types';

interface ConversationHeaderProps {
  formattedTime: string;
  maxDurationFormatted: string;
  progress: number;
  callStatus: CallStatus;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  config: VapiConfig;
  isCallActive: boolean;
  onEndCall: () => void;
}

export function ConversationHeader({
  formattedTime,
  maxDurationFormatted,
  progress,
  callStatus,
  isUserSpeaking,
  isAISpeaking,
  config,
  isCallActive,
  onEndCall,
}: ConversationHeaderProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700 mb-4">
      <CardContent className="p-3 sm:p-4">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* Top row: Time + End Call */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-bold text-white">{formattedTime}</span>
              <span className="text-xs text-gray-400">/ {maxDurationFormatted}</span>
            </div>
            <Button
              onClick={onEndCall}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              disabled={!isCallActive}
            >
              <PhoneOff className="w-4 h-4 mr-1" />
              Finalizar
            </Button>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-1.5" />

          {/* Status badges - scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <Badge className={`flex-shrink-0 ${callStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}`}>
              {callStatus === 'connected' ? 'Online' : 'Offline'}
            </Badge>

            {isUserSpeaking && (
              <Badge className="flex-shrink-0 bg-green-600 animate-pulse flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Voce
              </Badge>
            )}
            {isAISpeaking && (
              <Badge className="flex-shrink-0 bg-blue-600 animate-pulse flex items-center gap-1">
                <Bot className="w-3 h-3" />
                IA
              </Badge>
            )}

            <Badge variant="secondary" className="flex-shrink-0">{config.level}</Badge>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-white">{formattedTime}</p>
              <p className="text-xs lg:text-sm text-gray-400">de {maxDurationFormatted}</p>
            </div>
            <div className="w-24 lg:w-40">
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 flex-wrap justify-end">
            <Badge className={callStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}>
              {callStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>

            {/* Speaking status badge */}
            {isUserSpeaking && (
              <Badge className="bg-green-600 animate-pulse flex items-center gap-1">
                <Mic className="w-3 h-3" />
                <span className="hidden lg:inline">Voce esta falando</span>
                <span className="lg:hidden">Voce</span>
              </Badge>
            )}
            {isAISpeaking && (
              <Badge className="bg-blue-600 animate-pulse flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span className="hidden lg:inline">IA esta falando</span>
                <span className="lg:hidden">IA</span>
              </Badge>
            )}
            {!isUserSpeaking && !isAISpeaking && callStatus === 'connected' && (
              <Badge variant="outline" className="border-gray-500 text-gray-400 hidden lg:flex">
                Aguardando...
              </Badge>
            )}

            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary">{config.level}</Badge>
              <Badge variant="outline">{config.domain}</Badge>
            </div>

            {/* End Call Button */}
            <Button
              onClick={onEndCall}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              disabled={!isCallActive}
            >
              <PhoneOff className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden lg:inline">Finalizar Conversa</span>
              <span className="lg:hidden">Finalizar</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConversationHeader;
