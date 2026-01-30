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
    <div className="flex-1 p-6 overflow-y-auto max-h-[400px]" style={{ scrollBehavior: 'smooth' }}>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Pronto para conversar</h3>
            <p className="text-gray-400 max-w-sm">
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
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-blue-600 text-white">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>

            <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-tl-md">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
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
