import DjangoSignUp from "@/components/DjangoSignUp";
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

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DjangoSignUp />
    </Suspense>
  );
}

export const metadata = {
  title: "Criar Conta | ProEnglish",
  description: "Crie sua conta ProEnglish e comece a aprender inglês",
};
