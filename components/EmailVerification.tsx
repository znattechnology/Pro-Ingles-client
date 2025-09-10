"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/state/redux";
import { 
  useVerifyEmailMutation, 
  useResendVerificationCodeMutation 
} from "@/redux/features/auth/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

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
  const { pendingVerification, isLoading } = useSelector((state: RootState) => state.auth);
  
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-violet-900/20 rounded-full w-fit">
            <Mail className="w-8 h-8 text-violet-400" />
          </div>
          <CardTitle className="text-2xl text-white">
            Verificar Email
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isRegistration 
              ? 'Enviamos um código de verificação para:'
              : 'Digite o código de verificação enviado para:'
            }
            <br />
            <span className="text-white font-medium">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-900/20 border-red-900/50">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={handleCodeChange}
                className="text-center text-2xl tracking-widest bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500"
                maxLength={6}
                disabled={isVerifying}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Digite o código de 6 dígitos
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-800 hover:bg-violet-900 text-white"
              disabled={isVerifying || code.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Email'
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">
              Não recebeu o código?
            </p>
            
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={!canResend}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
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
            <Button
              variant="link"
              onClick={() => router.push('/signin')}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Voltar ao login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;