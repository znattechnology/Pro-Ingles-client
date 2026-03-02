"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation
} from "@/src/domains/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { passwordResetSchema } from "@/lib/schemas";

type Step = 'request' | 'verify';

// Schema for email request step
const emailRequestSchema = z.object({
  email: z.string()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido"),
});

type EmailRequestFormData = z.infer<typeof emailRequestSchema>;
type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

const PasswordReset = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form for step 1: Email request
  const emailForm = useForm<EmailRequestFormData>({
    resolver: zodResolver(emailRequestSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  // Form for step 2: Password reset confirmation
  const resetForm = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [requestReset, { isLoading: isRequesting }] = useRequestPasswordResetMutation();
  const [confirmReset, { isLoading: isConfirming }] = useConfirmPasswordResetMutation();

  // Step 1: Request password reset
  const handleRequestReset = async (data: EmailRequestFormData) => {
    setApiError(null);

    try {
      const result = await requestReset({ email: data.email }).unwrap();
      toast.success(result.message || 'Código enviado com sucesso!');
      setEmail(data.email);
      setStep('verify');
    } catch (error: any) {
      console.error('Password reset request error:', error);

      const errorData = error?.data;
      let errorMessage = 'Erro ao solicitar reset de senha.';

      if (errorData) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData.error)) {
          errorMessage = errorData.error[0];
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.email) {
          const emailError = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
          emailForm.setError('email', { type: 'server', message: emailError });
          errorMessage = emailError;
        }
      }

      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Step 2: Confirm password reset with code
  const handleConfirmReset = async (data: PasswordResetFormData) => {
    setApiError(null);

    try {
      const result = await confirmReset({
        email,
        code: data.code,
        newPassword: data.newPassword
      }).unwrap();

      toast.success(result.message || 'Senha alterada com sucesso!');
      router.push('/signin');
    } catch (error: any) {
      console.error('Password reset confirm error:', error);

      const errorData = error?.data;
      let errorMessage = 'Erro ao alterar senha.';

      if (errorData) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData.error)) {
          errorMessage = errorData.error[0];
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fields = ['code', 'newPassword', 'confirmPassword'] as const;
          for (const field of fields) {
            if (errorData[field]) {
              const fieldError = Array.isArray(errorData[field])
                ? errorData[field][0]
                : errorData[field];
              resetForm.setError(field, { type: 'server', message: fieldError });
            }
          }
          // Use first field error as main message
          const firstFieldError = Object.values(errorData).find(v => v);
          if (firstFieldError) {
            errorMessage = Array.isArray(firstFieldError) ? firstFieldError[0] : String(firstFieldError);
          }
        }
      }

      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    resetForm.setValue('code', value, { shouldValidate: true });
  };

  const handleBackToEmail = () => {
    setStep('request');
    setApiError(null);
    resetForm.reset();
  };

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
            {step === 'request' ? (
              <Mail className="w-6 h-6 text-white" />
            ) : (
              <Lock className="w-6 h-6 text-white" />
            )}
          </div>

          <div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              {step === 'request' ? 'Recuperar Senha' : 'Nova Senha'}
            </CardTitle>

            <CardDescription className="text-gray-400">
              {step === 'request'
                ? 'Digite seu email para receber o código de verificação'
                : 'Digite o código enviado para seu email e sua nova senha'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* API Error Banner */}
          {apiError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{apiError}</p>
            </div>
          )}

          {step === 'request' ? (
            // Step 1: Request Reset Form
            <form onSubmit={emailForm.handleSubmit(handleRequestReset)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    {...emailForm.register("email")}
                    placeholder="seu@email.com"
                    className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 ${
                      emailForm.formState.errors.email ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    disabled={isRequesting}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-12 font-semibold shadow-lg hover:shadow-violet-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Código'
                )}
              </Button>
            </form>
          ) : (
            // Step 2: Confirm Reset Form
            <form onSubmit={resetForm.handleSubmit(handleConfirmReset)} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-400 text-sm">
                  Código enviado para: <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              {/* Verification Code */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-200 font-medium">
                  Código de Verificação
                </Label>
                <div className="relative">
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    value={resetForm.watch('code')}
                    onChange={handleCodeChange}
                    className={`text-center text-2xl tracking-widest bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 ${
                      resetForm.formState.errors.code ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    maxLength={6}
                    disabled={isConfirming}
                  />
                </div>
                {resetForm.formState.errors.code && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {resetForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-200 font-medium">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    {...resetForm.register("newPassword")}
                    placeholder="Mínimo 8 caracteres"
                    className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12 ${
                      resetForm.formState.errors.newPassword ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    disabled={isConfirming}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                    disabled={isConfirming}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...resetForm.register("confirmPassword")}
                    placeholder="Confirme sua nova senha"
                    className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12 ${
                      resetForm.formState.errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    disabled={isConfirming}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                    disabled={isConfirming}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-12 font-semibold shadow-lg hover:shadow-violet-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </form>
          )}

          {/* Back Links */}
          <div className="text-center space-y-4">
            {step === 'verify' && (
              <Button
                variant="outline"
                onClick={handleBackToEmail}
                className="w-full bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-violet-500/50 transition-all duration-200 h-12"
                disabled={isConfirming}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para email
              </Button>
            )}

            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <Link
                href="/signin"
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors duration-200 underline decoration-violet-400/30 hover:decoration-violet-400"
              >
                ← Voltar ao início de sessão
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default PasswordReset;
