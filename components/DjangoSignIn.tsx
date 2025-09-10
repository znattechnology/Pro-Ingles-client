"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/state/redux";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

const DjangoSignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, pendingVerification } = useSelector((state: RootState) => state.auth);
  
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
      
      // Handle specific errors
      if (error?.data?.error?.includes('Email não verificado')) {
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
      const errorMessage = error?.data?.error || error?.message || 'Credenciais inválidas. Tente novamente.';
      toast.error(errorMessage);
      setErrors({ email: 'Verifique seu email e senha' });
    }
  };

  const getRedirectUrl = (user: any) => {
    if (isCheckoutPage && courseId) {
      return `/checkout?step=2&id=${courseId}`;
    }

    switch (user.role) {
      case 'teacher':
        return '/teacher/courses';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/user/learn';
    }
  };

  const signUpUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true`
    : "/signup";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white mb-2">
            Entrar
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Faça login para acessar sua conta
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-normal">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500"
                disabled={isLoggingIn}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-normal">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500 pr-10"
                  disabled={isLoggingIn}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={isLoggingIn}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/forgot-password"
                className="text-sm text-gray-400 hover:text-white"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-violet-800 hover:bg-violet-900 text-white"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Social Login Placeholder */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">ou</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Login social será implementado em breve
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{" "}
              <Link 
                href={signUpUrl}
                className="text-white hover:text-violet-400 font-medium"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DjangoSignIn;