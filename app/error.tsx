"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-customgreys-primarybg px-4">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white">
          Algo correu mal
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-400">
          Ocorreu um erro inesperado. Por favor, tente novamente ou contacte o suporte se o problema persistir.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-left">
            <p className="text-sm text-red-400 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Tentar Novamente
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 transition-all duration-200 text-center"
          >
            Voltar ao Início
          </a>
        </div>

        {/* Support link */}
        <p className="mt-8 text-sm text-gray-500">
          Precisa de ajuda?{" "}
          <a
            href="mailto:suporte@proenglish.com"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Contactar Suporte
          </a>
        </p>
      </div>
    </div>
  );
}
