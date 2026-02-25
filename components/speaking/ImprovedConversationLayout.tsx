/**
 * Improved Conversation Layout Component
 * 
 * This component provides an enhanced layout for the conversation section
 * that can be integrated into the existing VapiConversationPractice component.
 * 
 * It maintains all existing functionality while improving:
 * - Avatar positioning side by side
 * - Message grouping by time and speaker  
 * - Voice activity indicators
 * - Auto-scroll behavior
 * - Responsive design
 * - Accessibility features
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bot, 
  User, 
  MessageCircle, 
  Clock, 
  Play, 
  Edit,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Settings,
  Target,
  ChevronDown,
  Eye,
  EyeOff,
  MoreHorizontal
} from 'lucide-react';

interface ImprovedConversationLayoutProps {
  // Props que vêm do componente principal existente
  currentSession: any;
  callStatus: string;
  timeElapsed: number;
  config: any;
  userProfile: any;
  messages: any[];
  isCallActive: boolean;
  // Handlers existentes
  handleEndCall: () => void;
  formatTime: (seconds: number) => string;
}

export default function ImprovedConversationLayout({
  currentSession,
  callStatus,
  timeElapsed,
  config,
  userProfile,
  messages,
  isCallActive,
  handleEndCall,
  formatTime
}: ImprovedConversationLayoutProps) {
  
  // Estados locais para melhorias do layout
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll melhorado
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && !userScrolledUp) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userScrolledUp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
    setUserScrolledUp(!isAtBottom);
  }, []);

  // Componente Avatar com indicador de voz
  const VoiceAvatar = ({ type, name, isActive }: { 
    type: 'user' | 'ai'; 
    name: string; 
    isActive: boolean 
  }) => (
    <div className="flex flex-col items-center">
      <div className={`
        relative transition-all duration-200
        ${isActive ? 'scale-110' : 'scale-100'}
      `}>
        <Avatar className={`
          w-16 h-16 transition-all duration-200
          ${isActive ? 'ring-4 ring-yellow-400/50 shadow-lg shadow-yellow-400/25' : ''}
        `}>
          <AvatarFallback className={
            type === 'user' 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg font-semibold'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
          }>
            {type === 'user' ? name.charAt(0).toUpperCase() : <Bot className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>
        
        {/* Indicador de voz animado */}
        {isActive && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`
                    w-1 bg-yellow-400 rounded-full transition-all duration-100
                    ${isActive ? 'h-3 opacity-100' : 'h-1 opacity-40'}
                  `}
                  style={{
                    animation: isActive ? `pulse ${0.6 + i * 0.1}s ease-in-out infinite alternate` : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-gray-400">
          {isActive ? (
            <span className="text-yellow-400 flex items-center gap-1">
              <Mic className="w-3 h-3" />
              Falando
            </span>
          ) : (
            'Ouvindo'
          )}
        </p>
      </div>
    </div>
  );

  // Componente Message Bubble melhorado
  const MessageBubble = ({ message, isGrouped = false }: { 
    message: any; 
    isGrouped?: boolean 
  }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`
        flex gap-3 group
        ${isUser ? 'flex-row-reverse' : 'flex-row'}
        ${isGrouped ? 'mt-1' : 'mt-4'}
      `}>
        {/* Avatar apenas na primeira mensagem do grupo */}
        {!isGrouped && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className={
              isUser
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white'
            }>
              {isUser ? userProfile.name.charAt(0).toUpperCase() : <Bot className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Espaçamento quando avatar não está presente */}
        {isGrouped && <div className="w-8" />}
        
        {/* Conteúdo da mensagem */}
        <div className={`
          max-w-[70%] transition-all duration-200
          ${isUser 
            ? 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-900 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-100' 
            : 'bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-900 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-100'
          }
          ${isGrouped ? 'rounded-2xl' : isUser ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl rounded-tl-md'}
          px-4 py-3 shadow-sm
        `}>
          <p className="leading-relaxed">{message.content}</p>
          
          {/* Timestamp e ações */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 dark:border-gray-700/30">
            <span className="text-xs opacity-60">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Play className="w-3 h-3" />
              </Button>
              {isUser && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Scores para mensagens do usuário */}
          {message.scores && isUser && (
            <div className="mt-3 p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium opacity-80">Fluência</div>
                  <div className={`font-bold ${
                    message.scores.fluency >= 80 ? 'text-green-600 dark:text-green-400' : 
                    message.scores.fluency >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {message.scores.fluency}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium opacity-80">Pronúncia</div>
                  <div className={`font-bold ${
                    message.scores.pronunciation >= 80 ? 'text-green-600 dark:text-green-400' : 
                    message.scores.pronunciation >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {message.scores.pronunciation}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Função para agrupar mensagens
  const groupMessagesByTime = (messages: any[]) => {
    const groups: { messages: any[]; speaker: string }[] = [];
    let currentGroup: any[] = [];
    let lastSpeaker = '';
    let lastTimestamp = 0;

    messages.forEach((message) => {
      const messageTime = new Date(message.timestamp).getTime();
      const timeDiff = messageTime - lastTimestamp;
      
      // Agrupa mensagens do mesmo falante que estão próximas no tempo (< 30 segundos)
      if (message.role === lastSpeaker && timeDiff < 30000 && currentGroup.length > 0) {
        currentGroup.push(message);
      } else {
        if (currentGroup.length > 0) {
          groups.push({ messages: [...currentGroup], speaker: lastSpeaker });
        }
        currentGroup = [message];
        lastSpeaker = message.role;
      }
      
      lastTimestamp = messageTime;
    });
    
    if (currentGroup.length > 0) {
      groups.push({ messages: [...currentGroup], speaker: lastSpeaker });
    }
    
    return groups;
  };

  const progress = (timeElapsed / (config.maxDurationMinutes * 60)) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header com informações da sessão */}
      <Card className="bg-gray-800/50 border-gray-700 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Info da sessão */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatTime(timeElapsed)}</p>
                <p className="text-sm text-gray-400">de {formatTime(config.maxDurationMinutes * 60)}</p>
              </div>
              <div className="w-40">
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* Status da conexão */}
            <div className="flex items-center gap-4">
              <Badge className={
                callStatus === 'connected' ? 'bg-green-600' :
                callStatus === 'connecting' ? 'bg-yellow-600' :
                'bg-red-600'
              }>
                {callStatus === 'connected' && '🟢 Conectado'}
                {callStatus === 'connecting' && '🟡 Conectando'}
                {callStatus === 'error' && '🔴 Erro'}
              </Badge>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{config.level}</Badge>
                <Badge variant="outline">{config.domain}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-6">
        {/* Área principal da conversa */}
        <div className="flex-1 flex flex-col bg-gray-800/30 rounded-lg border border-gray-700">
          {/* Seção de avatares */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-b border-gray-700 p-6">
            <div className="flex items-center justify-center gap-16">
              <VoiceAvatar
                type="ai"
                name="Alex"
                isActive={isAISpeaking}
              />
              
              {/* Conexão visual entre avatares */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 opacity-50"></div>
                <MessageCircle className="w-6 h-6 text-gray-400 my-2" />
                <div className="w-16 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 opacity-50"></div>
              </div>
              
              <VoiceAvatar
                type="user"
                name={userProfile.name}
                isActive={isUserSpeaking}
              />
            </div>
          </div>

          {/* Área de mensagens */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 p-6 overflow-y-auto scroll-smooth"
            onScroll={handleScroll}
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Pronto para conversar</h3>
                <p className="text-gray-400 max-w-sm">
                  Comece a falar para iniciar sua prática de conversação. Suas mensagens aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {groupMessagesByTime(messages).map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1">
                    {group.messages.map((message, msgIdx) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isGrouped={msgIdx > 0}
                      />
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Botão voltar ao final */}
          {userScrolledUp && (
            <div className="absolute bottom-20 right-6">
              <Button
                onClick={() => {
                  setUserScrolledUp(false);
                  scrollToBottom();
                }}
                className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
                size="sm"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Painel de contexto (lateral direita) */}
        {showContextPanel && (
          <div className="w-80 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
            {/* Header do painel */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-medium text-white">Contexto da Sessão</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContextPanel(false)}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Objetivo da sessão */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-300">{config.objective}</p>
                </CardContent>
              </Card>

              {/* Estatísticas da sessão */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mensagens:</span>
                    <span className="text-white font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Correções:</span>
                    <span className="text-yellow-400 font-medium">
                      {messages.reduce((acc, msg) => acc + (msg.corrections?.length || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tempo falando:</span>
                    <span className="text-green-400 font-medium">~{Math.round(timeElapsed * 0.4)}s</span>
                  </div>
                </CardContent>
              </Card>

              {/* Controles rápidos */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  disabled
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Ajustar Velocidade
                </Button>
                <Button
                  onClick={handleEndCall}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white"
                  disabled={!isCallActive}
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  Encerrar Sessão
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Botão para mostrar/ocultar painel em mobile */}
      {!showContextPanel && (
        <div className="fixed bottom-20 right-4 lg:bottom-4 lg:right-4">
          <Button
            onClick={() => setShowContextPanel(true)}
            className="rounded-full w-12 h-12 bg-gray-700 hover:bg-gray-600 shadow-lg"
            size="sm"
          >
            <Eye className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

// CSS adicional para animações
const additionalStyles = `
@keyframes pulse {
  0% { height: 0.25rem; }
  100% { height: 0.75rem; }
}

.scroll-smooth {
  scroll-behavior: smooth;
}

/* Melhoria do scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(75, 85, 99, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
`;