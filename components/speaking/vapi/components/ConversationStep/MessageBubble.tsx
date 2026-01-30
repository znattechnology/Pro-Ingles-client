'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Activity } from 'lucide-react';
import type { ConversationMessage } from '../../types';

interface MessageBubbleProps {
  message: ConversationMessage;
  userName: string;
}

export function MessageBubble({ message, userName }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={isUser ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}>
          {isUser ? userName.charAt(0).toUpperCase() : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-900 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-100 rounded-tr-md'
            : 'bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-900 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-100 rounded-tl-md'
        }`}
      >
        <p className="leading-relaxed">{message.content}</p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 dark:border-gray-700/30">
          <span className="text-xs opacity-60">
            {message.timestamp instanceof Date
              ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && (
            <span className="text-xs opacity-60 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Analise ao final
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
