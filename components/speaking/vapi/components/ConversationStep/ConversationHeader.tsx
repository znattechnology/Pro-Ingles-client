'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PhoneOff, Mic, Bot } from 'lucide-react';
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
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formattedTime}</p>
              <p className="text-sm text-gray-400">de {maxDurationFormatted}</p>
            </div>
            <div className="w-40">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={callStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}>
              {callStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>

            {/* Speaking status badge */}
            {isUserSpeaking && (
              <Badge className="bg-green-600 animate-pulse flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Voce esta falando
              </Badge>
            )}
            {isAISpeaking && (
              <Badge className="bg-blue-600 animate-pulse flex items-center gap-1">
                <Bot className="w-3 h-3" />
                IA esta falando
              </Badge>
            )}
            {!isUserSpeaking && !isAISpeaking && callStatus === 'connected' && (
              <Badge variant="outline" className="border-gray-500 text-gray-400">
                Aguardando...
              </Badge>
            )}

            <div className="flex items-center gap-2">
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
              <PhoneOff className="w-4 h-4 mr-2" />
              Finalizar Conversa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConversationHeader;
