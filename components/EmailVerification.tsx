"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/state/redux";
import { 
  useVerifyEmailMutation, 
  useResendVerificationCodeMutation 
} from "@/src/domains/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import Logo from "@/components/ui/Logo";

interface EmailVerificationProps {
  email?: string;
  isRegistration?: boolean;
  onSuccess?: (user: any) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email: propEmail,
  isRegistration = true,
  onSuccess
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pendingVerification } = useSelector((state: RootState) => state.auth);
  
  // Get email from props, Redux state, or URL params
  const email = propEmail || pendingVerification?.email || searchParams.get('email') || '';
  
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendCode, { isLoading: isResending }] = useResendVerificationCodeMutation();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email não encontrado. Por favor, tente novamente.');
      return;
    }

    if (code.length !== 6) {
      setError('Por favor, insira o código de 6 dígitos.');
      return;
    }

    try {
      const result = await verifyEmail({ email, code }).unwrap();
      
      toast.success(result.message || 'Email verificado com sucesso!');
      
      if (onSuccess) {
        onSuccess(result.user);
      } else {
        // Redirect based on user role and context
        const isCheckoutPage = searchParams.get("showSignUp") !== null;
        const courseId = searchParams.get("id");
        
        if (isCheckoutPage && courseId) {
          router.push(`/checkout?step=2&id=${courseId}`);
        } else {
          switch (result.user.role) {
            case 'teacher':
              router.push('/teacher/courses');
              break;
            case 'admin':
              router.push('/admin/dashboard');
              break;
            default:
              router.push('/user/courses');
          }
        }
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      const errorMessage = error?.data?.error || error?.message || 'Erro ao verificar email. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email não encontrado.');
      return;
    }

    try {
      const result = await resendCode({ email }).unwrap();
      toast.success(result.message || 'Novo código enviado!');
      setCountdown(60); // 60 seconds countdown
      setCode(''); // Clear the current code
      setError('');
    } catch (error: any) {
      console.error('Resend code error:', error);
      const errorMessage = error?.data?.error || error?.message || 'Erro ao reenviar código.';
      toast.error(errorMessage);
    }
  };

  const canResend = countdown === 0 && !isResending;

  return (
    <Card className="w-full bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 shadow-2xl relative animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center space-y-4">
          <div className="mb-2">
            <Logo 
              size="lg"
              variant="white"
              linkToHome={true}
              className="mx-auto"
            />
          </div>
          
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Verificar Email
            </CardTitle>
            
            <CardDescription className="text-gray-400 space-y-2">
              <p>
                {isRegistration 
                  ? 'Enviamos um código de verificação para:'
                  : 'Digite o código de verificação enviado para:'
                }
              </p>
              <div className="p-3 bg-violet-950/30 border border-violet-500/20 rounded-lg">
                <span className="text-white font-semibold">{email}</span>
              </div>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-900/30 border-red-500/30 backdrop-blur">
              <AlertDescription className="text-red-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  className="text-center text-3xl tracking-widest bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-16 font-mono"
                  maxLength={6}
                  disabled={isVerifying}
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 focus-within:from-violet-500/10 focus-within:via-transparent focus-within:to-violet-500/10 pointer-events-none transition-all duration-300" />
              </div>
              <p className="text-xs text-gray-400 text-center font-medium">
                Digite o código de 6 dígitos
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-12 font-semibold shadow-lg hover:shadow-violet-500/25 transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isVerifying || code.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Email'
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-gray-400 text-sm">
              Não recebeu o código?
            </p>
            
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={!canResend}
              className="w-full bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 h-12"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar em {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar Código
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <div className="p-3 bg-gray-800/20 rounded-lg border border-gray-700/30">
              <Button
                variant="link"
                onClick={() => router.push('/signin')}
                className="text-gray-400 hover:text-violet-400 text-sm font-medium transition-colors duration-200 h-auto p-0"
              >
                ← Voltar ao login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default EmailVerification;