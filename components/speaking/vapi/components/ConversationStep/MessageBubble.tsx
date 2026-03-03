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
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
        <AvatarFallback className={`text-xs sm:text-sm ${isUser ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
          {isUser ? userName.charAt(0).toUpperCase() : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-900 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-100 rounded-tr-md'
            : 'bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-900 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-100 rounded-tl-md'
        }`}
      >
        <p className="leading-relaxed text-sm sm:text-base">{message.content}</p>

        <div className="flex items-center justify-between mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-white/20 dark:border-gray-700/30">
          <span className="text-[10px] sm:text-xs opacity-60">
            {message.timestamp instanceof Date
              ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && (
            <span className="text-[10px] sm:text-xs opacity-60 flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Analise ao final</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
