'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface LoadingOverlayProps {
  title?: string;
  description?: string;
}

export function LoadingOverlay({
  title = 'Processando sua sessao...',
  description = 'Estamos analisando sua conversa e gerando o feedback personalizado. Isso pode levar alguns segundos.',
}: LoadingOverlayProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="bg-gray-800 border-gray-700 p-8 max-w-md">
        <CardContent className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Activity className="w-8 h-8 text-violet-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoadingOverlay;
