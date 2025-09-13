import EmailVerification from "@/components/EmailVerification";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="w-full bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 shadow-2xl relative rounded-lg">
      <div className="p-8 text-center">
        <div className="mb-4 w-24 h-24 bg-gray-800/50 rounded-2xl mx-auto animate-pulse" />
        <div className="space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailVerification />
    </Suspense>
  );
}

export const metadata = {
  title: "Verificar Email | ProEnglish",
  description: "Verifique seu email para ativar sua conta",
};