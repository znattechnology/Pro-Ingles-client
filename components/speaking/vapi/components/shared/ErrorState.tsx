'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning';
  onRetry?: () => void;
  onBack?: () => void;
  retryLabel?: string;
  backLabel?: string;
}

export function ErrorState({
  title = 'Erro',
  message,
  variant = 'error',
  onRetry,
  onBack,
  retryLabel = 'Tentar Novamente',
  backLabel = 'Voltar',
}: ErrorStateProps) {
  const Icon = variant === 'warning' ? AlertTriangle : XCircle;
  const borderColor = variant === 'warning' ? 'border-yellow-900' : 'border-red-900';
  const bgColor = variant === 'warning' ? 'bg-yellow-900/30' : 'bg-red-900/30';
  const iconColor = variant === 'warning' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className={`bg-gray-800 ${borderColor} border-2 p-8 max-w-md`}>
        <CardContent className="text-center space-y-4">
          <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center mx-auto`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-4">{message}</p>
          </div>
          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {retryLabel}
              </Button>
            )}
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {backLabel}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorState;
