"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/state/redux";
import { useRegisterMutation } from "@/src/domains/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

const DjangoSignUp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pendingVerification } = useSelector((state: RootState) => state.auth);
  
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'student' as 'student'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  // If user has pending verification, redirect to email verification
  React.useEffect(() => {
    if (pendingVerification?.isRegistration) {
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerification.email)}`);
    }
  }, [pendingVerification, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    // Password confirmation validation
    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Senhas não coincidem';
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

  // Role is always student - no need for role change handler

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(formData).unwrap();
      
      toast.success(result.message || 'Registro realizado com sucesso!');
      
      // Redirect to email verification
      router.push(`/verify-email?email=${encodeURIComponent(result.email)}&registration=true`);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific field errors from Django
      if (error?.data && typeof error.data === 'object') {
        const apiErrors: Record<string, string> = {};
        
        Object.entries(error.data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            apiErrors[field] = messages[0];
          } else if (typeof messages === 'string') {
            apiErrors[field] = messages;
          }
        });
        
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.data?.error || error?.message || 'Erro ao registrar. Tente novamente.';
        toast.error(errorMessage);
      }
    }
  };

  const signInUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=false`
    : "/signin";

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
              Começar jornada
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Crie sua conta gratuita e comece a aprender inglês hoje
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200 font-medium">
                Nome Completo
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4"
                  disabled={isRegistering}
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 focus-within:from-violet-500/10 focus-within:via-transparent focus-within:to-violet-500/10 pointer-events-none transition-all duration-300" />
              </div>
              {errors.name && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.name}
                </p>
              )}
            </div>

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
                  disabled={isRegistering}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 8 caracteres"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12"
                  disabled={isRegistering}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                  disabled={isRegistering}
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

            {/* Password Confirmation Field */}
            <div className="space-y-2">
              <Label htmlFor="password_confirm" className="text-gray-200 font-medium">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="password_confirm"
                  name="password_confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  placeholder="Confirme sua senha"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12"
                  disabled={isRegistering}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                  disabled={isRegistering}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 focus-within:from-violet-500/10 focus-within:via-transparent focus-within:to-violet-500/10 pointer-events-none transition-all duration-300" />
              </div>
              {errors.password_confirm && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.password_confirm}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-12 font-semibold shadow-lg hover:shadow-violet-500/25 transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta gratuita'
              )}
            </Button>
          </form>

          {/* Terms and Sign In Link */}
          <div className="mt-6 space-y-4">
            <p className="text-xs text-gray-500 text-center">
              Ao criar uma conta, você concorda com nossos{" "}
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
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default DjangoSignUp;