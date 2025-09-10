import EmailVerification from "@/components/EmailVerification";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-4" />
        <p className="text-gray-400">Carregando...</p>
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