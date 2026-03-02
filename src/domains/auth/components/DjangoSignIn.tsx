"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RootState } from "@/state/redux";
import { useLoginMutation, useLazyGetGoogleOAuthUrlQuery } from "../services/authApi";
import type { User } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { loginSchema, type LoginFormData } from "@/lib/schemas";

const DjangoSignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pendingVerification } = useSelector((state: RootState) => state.auth);

  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Real-time validation
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [getGoogleOAuthUrl] = useLazyGetGoogleOAuthUrlQuery();

  // Limpeza automática quando o componente carrega
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      sessionStorage.clear();
    }
  }, []);

  // If user has pending verification, redirect to email verification
  useEffect(() => {
    if (pendingVerification && !pendingVerification.isRegistration) {
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerification.email)}`);
    }
  }, [pendingVerification, router]);

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    clearErrors();

    try {
      const result = await login(data).unwrap();
      toast.success('Sessão iniciada com sucesso!');

      const redirectUrl = getRedirectUrl(result.user);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);

      // Extract error from API response
      const errorData = error?.data;
      let errorMessage = 'Credenciais inválidas. Tente novamente.';

      if (errorData) {
        // Handle different error formats from Django
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData.error)) {
          errorMessage = errorData.error[0];
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
        }
        // Handle field-specific errors
        else if (typeof errorData === 'object') {
          const fields = ['email', 'password'] as const;
          for (const field of fields) {
            if (errorData[field]) {
              const fieldError = Array.isArray(errorData[field])
                ? errorData[field][0]
                : errorData[field];
              setError(field, { type: 'server', message: fieldError });
            }
          }
          // Use first field error as main message
          const firstFieldError = Object.values(errorData).find(v => v);
          if (firstFieldError) {
            errorMessage = Array.isArray(firstFieldError) ? firstFieldError[0] : String(firstFieldError);
          }
        }
      }

      // Check for specific error types
      if (errorMessage.toLowerCase().includes('email não verificado') ||
          errorMessage.toLowerCase().includes('email not verified')) {
        toast.error('Por favor, verifique o seu email antes de iniciar sessão.');
        return;
      }

      // Set the API error to display in the form
      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const getRedirectUrl = (user: User) => {
    if (isCheckoutPage && courseId) {
      return `/checkout?step=2&id=${courseId}`;
    }

    switch (user.role) {
      case 'teacher':
        return '/teacher/courses';
      case 'admin':
        return '/admin/dashboard';
      case 'student':
      default:
        return '/user/courses/explore';
    }
  };

  const signUpUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true`
    : "/signup";

  const handleGoogleLogin = async () => {
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
      toast.error('Erro ao iniciar sessão com Google. Tente novamente.');
    }
  };

  const isLoading = isLoggingIn || isSubmitting;

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
            Bem-vindo de volta
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Introduza os seus dados para aceder à sua conta
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
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200 font-medium">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="seu@email.com"
                className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 ${
                  errors.email ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.email.message}
              </p>
            )}
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
                placeholder="Introduza a sua palavra-passe"
                className={`bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12 ${
                  errors.password ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={isLoading}
                autoComplete="current-password"
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

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-400 hover:text-violet-400 transition-colors duration-200 font-medium"
            >
              Esqueceu-se da sua palavra-passe?
            </Link>
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
                A iniciar sessão...
              </>
            ) : (
              'Iniciar sessão'
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
              <span className="bg-gray-900/80 px-4 py-1 text-gray-400 rounded-full backdrop-blur">ou continuar com</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 h-12"
              onClick={handleGoogleLogin}
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

        {/* Sign Up Link */}
        <div className="mt-8 text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <p className="text-gray-400 text-sm">
            Ainda não tem conta?{" "}
            <Link
              href={signUpUrl}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors duration-200 underline decoration-violet-400/30 hover:decoration-violet-400"
            >
              Criar conta grátis
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DjangoSignIn;
