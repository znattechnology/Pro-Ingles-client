"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RootState } from "@/state/redux";
import { useRegisterMutation, useLazyGetGoogleOAuthUrlQuery } from "@/src/domains/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { signupSchema, type SignupFormData } from "@/lib/schemas";

const DjangoSignUp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pendingVerification } = useSelector((state: RootState) => state.auth);

  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");
  const selectedPlan = searchParams.get("plan");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  });

  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [getGoogleOAuthUrl] = useLazyGetGoogleOAuthUrlQuery();

  // Redirect if pending verification
  useEffect(() => {
    if (pendingVerification?.isRegistration) {
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerification.email)}`);
    }
  }, [pendingVerification, router]);

  const onSubmit = async (data: SignupFormData) => {
    setApiError(null);
    clearErrors();

    try {
      const result = await registerMutation({
        ...data,
        role: 'student' as const,
      }).unwrap();

      toast.success(result.message || 'Registo realizado com sucesso!');

      const verifyUrl = `/verify-email?email=${encodeURIComponent(result.email)}&registration=true${selectedPlan ? `&plan=${selectedPlan}` : ''}`;
      router.push(verifyUrl);
    } catch (error: any) {
      console.error('Registration error:', error);

      const errorData = error?.data;
      let errorMessage = 'Erro ao registar. Tente novamente.';

      if (errorData) {
        // Handle structured error format
        const details = errorData.details || errorData;

        if (typeof details === 'object') {
          const fields = ['name', 'email', 'password', 'password_confirm'] as const;
          for (const field of fields) {
            if (details[field]) {
              const fieldError = Array.isArray(details[field])
                ? details[field][0]
                : details[field];
              setError(field, { type: 'server', message: fieldError });

              // Set first error as main message
              if (errorMessage === 'Erro ao registar. Tente novamente.') {
                errorMessage = fieldError;
              }
            }
          }

          // Check for email already exists
          if (details.email) {
            const emailError = Array.isArray(details.email) ? details.email[0] : details.email;
            if (emailError.toLowerCase().includes('already') || emailError.toLowerCase().includes('já existe')) {
              errorMessage = 'Este email já está registado. Tente iniciar sessão ou use outro email.';
            }
          }
        }

        // Handle simple error formats
        if (errorData.error) {
          errorMessage = Array.isArray(errorData.error) ? errorData.error[0] : errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }

      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const signInUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=false`
    : "/signin";

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await getGoogleOAuthUrl().unwrap();
      if (result.auth_url) {
        window.location.href = result.auth_url;
      } else {
        setIsGoogleLoading(false);
        toast.error('URL de autenticação não recebida do servidor.');
      }
    } catch (error: any) {
      setIsGoogleLoading(false);
      console.error('Google OAuth error:', error);
      toast.error('Erro ao iniciar registo com Google. Tente novamente.');
    }
  };

  const isLoading = isRegistering || isSubmitting;

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

        <div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Começar jornada
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Cria a tua conta gratuita e começa a aprender inglês hoje
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* API Error Banner */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200 font-medium">
              Nome Completo
            </Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              placeholder="O teu nome completo"
              className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 ${
                errors.name ? 'border-red-500 focus:border-red-500' : ''
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="seu@email.com"
              className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 ${
                errors.email ? 'border-red-500 focus:border-red-500' : ''
              }`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Student Account Info */}
          <div className="bg-violet-950/30 border border-violet-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium">Conta de Estudante</h4>
                <p className="text-gray-400 text-sm">Acesso completo a cursos e laboratório de prática</p>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200 font-medium">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Mínimo 8 caracteres"
                className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12 ${
                  errors.password ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Password Confirmation Field */}
          <div className="space-y-2">
            <Label htmlFor="password_confirm" className="text-gray-200 font-medium">
              Confirmar Senha
            </Label>
            <div className="relative">
              <Input
                id="password_confirm"
                type={showConfirmPassword ? "text" : "password"}
                {...register("password_confirm")}
                placeholder="Confirma a tua palavra-passe"
                className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12 ${
                  errors.password_confirm ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password_confirm && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.password_confirm.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-12 font-semibold shadow-lg hover:shadow-violet-500/25 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                A criar conta...
              </>
            ) : (
              'Criar conta gratuita'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900/80 px-4 py-1 text-gray-400 rounded-full backdrop-blur">ou registar com</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 h-12"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continuar com Google
            </Button>
          </div>
        </div>

        {/* Terms and Sign In Link */}
        <div className="mt-6 space-y-4">
          <p className="text-xs text-gray-500 text-center">
            Ao criar uma conta, concordas com os nossos{" "}
            <a href="#" className="text-violet-400 hover:text-violet-300 underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-violet-400 hover:text-violet-300 underline">
              Política de Privacidade
            </a>
          </p>

          <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{" "}
              <Link
                href={signInUrl}
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors duration-200 underline decoration-violet-400/30 hover:decoration-violet-400"
              >
                Iniciar sessão
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DjangoSignUp;
