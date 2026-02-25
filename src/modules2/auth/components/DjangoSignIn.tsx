"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/state/redux";
import { useLoginMutation } from "../services/authApi";
import type { User } from "@/domains/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

const DjangoSignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pendingVerification } = useSelector((state: RootState) => state.auth);
  
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);

  // Limpeza automática quando o componente carrega
  useEffect(() => {
    // Limpar tudo do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Também limpar sessionStorage
      sessionStorage.clear();
    }
  }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  // If user has pending verification, redirect to email verification
  React.useEffect(() => {
    if (pendingVerification && !pendingVerification.isRegistration) {
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerification.email)}`);
    }
  }, [pendingVerification, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData).unwrap();
      
      console.log('Login successful:', result);
      console.log('User role:', result.user?.role);
      
      toast.success('Login realizado com sucesso!');
      
      // Redirect based on context and user role
      const redirectUrl = getRedirectUrl(result.user);
      console.log('Redirecting to:', redirectUrl);
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        router.push(redirectUrl);
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);

      // Extract error message safely (could be string, object, or array)
      const errorData = error?.data?.error;
      const errorString = typeof errorData === 'string'
        ? errorData
        : (Array.isArray(errorData) ? errorData[0] : null);

      // Handle specific errors
      if (errorString?.includes('Email não verificado')) {
        // User needs to verify email - Redux will handle the redirection
        toast.error('Por favor, verifique seu email antes de fazer login.');
        return;
      }

      // Handle field-specific errors
      if (error?.data && typeof error.data === 'object') {
        const apiErrors: Record<string, string> = {};

        Object.entries(error.data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            apiErrors[field] = messages[0];
          } else if (typeof messages === 'string') {
            apiErrors[field] = messages;
          }
        });

        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
          return;
        }
      }

      // Generic error handling
      const errorMessage = errorString || error?.data?.detail || error?.message || 'Credenciais inválidas. Tente novamente.';
      toast.error(errorMessage);
      setErrors({ email: 'Verifique seu email e senha' });
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

  return (
    <Card className="w-full bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 shadow-2xl relative animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center space-y-4">
          {/* ProEnglish Logo */}
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
              Entre com seus dados para acessar sua conta
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200 font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4"
                  disabled={isLoggingIn}
                  autoComplete="email"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 focus-within:from-violet-500/10 focus-within:via-transparent focus-within:to-violet-500/10 pointer-events-none transition-all duration-300" />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.email}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Introduza a sua palavra-passe"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12"
                  disabled={isLoggingIn}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                  disabled={isLoggingIn}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 focus-within:from-violet-500/10 focus-within:via-transparent focus-within:to-violet-500/10 pointer-events-none transition-all duration-300" />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/forgot-password"
                className="text-sm text-gray-400 hover:text-violet-400 transition-colors duration-200 font-medium"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-12 font-semibold shadow-lg hover:shadow-violet-500/25 transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar na conta'
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
                <span className="bg-gray-900/80 px-4 py-1 text-gray-400 rounded-full backdrop-blur">ou continue com</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 h-12"
                disabled
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 h-12"
                disabled
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
            
            <p className="text-gray-500 text-xs text-center mt-4">
              Login social será implementado em breve
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 text-sm">
              Ainda não tem uma conta?{" "}
              <Link 
                href={signUpUrl}
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors duration-200 underline decoration-violet-400/30 hover:decoration-violet-400"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
  );
};

export default DjangoSignIn;