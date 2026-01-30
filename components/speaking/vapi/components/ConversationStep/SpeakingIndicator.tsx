'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, MessageCircle, Mic, Activity } from 'lucide-react';

interface SpeakingIndicatorProps {
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  userName: string;
  level: string;
  domain: string;
}

export function SpeakingIndicator({
  isUserSpeaking,
  isAISpeaking,
  userName,
  level,
  domain,
}: SpeakingIndicatorProps) {
  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-b border-gray-700 p-6">
      <div className="flex items-center justify-center gap-16">
        {/* AI Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar
              className={`w-16 h-16 transition-all duration-300 ${
                isAISpeaking ? 'ring-4 ring-blue-500 ring-opacity-75' : ''
              }`}
            >
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Bot className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            {isAISpeaking && (
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
                    <Activity className="w-3 h-3 text-white animate-pulse" />
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-white">Alex (IA)</p>
            <p
              className={`text-xs transition-colors ${
                isAISpeaking ? 'text-blue-400 font-medium' : 'text-gray-400'
              }`}
            >
              {isAISpeaking ? 'Falando...' : 'Assistant'}
            </p>
          </div>
        </div>

        {/* Visual connection between avatars */}
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-0.5 transition-all duration-300 ${
              isAISpeaking
                ? 'bg-gradient-to-r from-blue-500 to-gray-500'
                : isUserSpeaking
                ? 'bg-gradient-to-r from-gray-500 to-green-500'
                : 'bg-gradient-to-r from-blue-500 to-green-500 opacity-50'
            }`}
          ></div>
          <MessageCircle
            className={`w-6 h-6 my-2 transition-colors ${
              isAISpeaking || isUserSpeaking ? 'text-white' : 'text-gray-400'
            }`}
          />
          <div
            className={`w-16 h-0.5 transition-all duration-300 ${
              isUserSpeaking
                ? 'bg-gradient-to-r from-green-500 to-gray-500'
                : isAISpeaking
                ? 'bg-gradient-to-r from-gray-500 to-blue-500'
                : 'bg-gradient-to-r from-green-500 to-blue-500 opacity-50'
            }`}
          ></div>
        </div>

        {/* User Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar
              className={`w-16 h-16 transition-all duration-300 ${
                isUserSpeaking ? 'ring-4 ring-green-500 ring-opacity-75' : ''
              }`}
            >
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isUserSpeaking && (
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 items-center justify-center">
                    <Mic className="w-3 h-3 text-white animate-pulse" />
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-white">{userName}</p>
            <p
              className={`text-xs transition-colors ${
                isUserSpeaking ? 'text-green-400 font-medium' : 'text-gray-400'
              }`}
            >
              {isUserSpeaking ? 'Falando...' : `${level} - ${domain}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpeakingIndicator;
