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
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-b border-gray-700 p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-16">
        {/* AI Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar
              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transition-all duration-300 ${
                isAISpeaking ? 'ring-2 sm:ring-4 ring-blue-500 ring-opacity-75' : ''
              }`}
            >
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </AvatarFallback>
            </Avatar>
            {isAISpeaking && (
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                <span className="relative flex h-4 w-4 sm:h-5 sm:w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-blue-500 items-center justify-center">
                    <Activity className="w-2 h-2 sm:w-3 sm:h-3 text-white animate-pulse" />
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="mt-1.5 sm:mt-2 text-center">
            <p className="text-xs sm:text-sm font-medium text-white">Alex (IA)</p>
            <p
              className={`text-[10px] sm:text-xs transition-colors ${
                isAISpeaking ? 'text-blue-400 font-medium' : 'text-gray-400'
              }`}
            >
              {isAISpeaking ? 'Falando...' : 'Tutor'}
            </p>
          </div>
        </div>

        {/* Visual connection between avatars - hidden on smallest screens */}
        <div className="hidden xs:flex flex-col items-center">
          <div
            className={`w-8 sm:w-12 md:w-16 h-0.5 transition-all duration-300 ${
              isAISpeaking
                ? 'bg-gradient-to-r from-blue-500 to-gray-500'
                : isUserSpeaking
                ? 'bg-gradient-to-r from-gray-500 to-green-500'
                : 'bg-gradient-to-r from-blue-500 to-green-500 opacity-50'
            }`}
          ></div>
          <MessageCircle
            className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 my-1 sm:my-2 transition-colors ${
              isAISpeaking || isUserSpeaking ? 'text-white' : 'text-gray-400'
            }`}
          />
          <div
            className={`w-8 sm:w-12 md:w-16 h-0.5 transition-all duration-300 ${
              isUserSpeaking
                ? 'bg-gradient-to-r from-green-500 to-gray-500'
                : isAISpeaking
                ? 'bg-gradient-to-r from-gray-500 to-blue-500'
                : 'bg-gradient-to-r from-green-500 to-blue-500 opacity-50'
            }`}
          ></div>
        </div>

        {/* Mobile-only simple connector */}
        <div className="xs:hidden">
          <MessageCircle
            className={`w-5 h-5 transition-colors ${
              isAISpeaking || isUserSpeaking ? 'text-white' : 'text-gray-400'
            }`}
          />
        </div>

        {/* User Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar
              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transition-all duration-300 ${
                isUserSpeaking ? 'ring-2 sm:ring-4 ring-green-500 ring-opacity-75' : ''
              }`}
            >
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm sm:text-base md:text-lg font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isUserSpeaking && (
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                <span className="relative flex h-4 w-4 sm:h-5 sm:w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-green-500 items-center justify-center">
                    <Mic className="w-2 h-2 sm:w-3 sm:h-3 text-white animate-pulse" />
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="mt-1.5 sm:mt-2 text-center">
            <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">
              {userName}
            </p>
            <p
              className={`text-[10px] sm:text-xs transition-colors ${
                isUserSpeaking ? 'text-green-400 font-medium' : 'text-gray-400'
              }`}
            >
              {isUserSpeaking ? 'Falando...' : (
                <span className="hidden sm:inline">{level} - {domain}</span>
              )}
              {!isUserSpeaking && <span className="sm:hidden">{level}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpeakingIndicator;
