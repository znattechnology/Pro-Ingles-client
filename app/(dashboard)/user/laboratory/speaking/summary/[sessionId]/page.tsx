"use client";

import { Suspense } from 'react';
import SessionSummaryPage from '@/components/speaking/SessionSummaryPage';

interface PageProps {
  params: {
    sessionId: string;
  };
}

export default function SummaryPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-white">Carregando resumo da sessão...</p>
            </div>
          </div>
        }
      >
        <SessionSummaryPage sessionId={params.sessionId} />
      </Suspense>
    </div>
  );
}