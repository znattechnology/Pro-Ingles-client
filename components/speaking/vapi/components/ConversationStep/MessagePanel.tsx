'use client';

import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, MessageCircle } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { ConversationMessage } from '../../types';

interface MessagePanelProps {
  messages: ConversationMessage[];
  userName: string;
  isAISpeaking: boolean;
}

export function MessagePanel({ messages, userName, isAISpeaking }: MessagePanelProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  return (
    <div
      className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto min-h-[200px] sm:min-h-[250px] md:min-h-[300px]"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center mb-3 sm:mb-4">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">Pronto para conversar</h3>
            <p className="text-gray-400 text-sm sm:text-base max-w-[280px] sm:max-w-sm px-4">
              Comece a falar para iniciar sua pratica de conversacao. Suas mensagens aparecerao aqui em tempo real.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} userName={userName} />
          ))
        )}

        {/* Typing indicator when AI is speaking */}
        {isAISpeaking && (
          <div className="flex gap-2 sm:gap-3">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
              <AvatarFallback className="bg-blue-600 text-white">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
              </AvatarFallback>
            </Avatar>

            <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-tl-md">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></span>
              </div>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default MessagePanel;
