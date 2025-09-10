"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/state/redux";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

const DjangoSignUp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, pendingVerification } = useSelector((state: RootState) => state.auth);
  
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'student' as 'student' | 'teacher'
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

  const handleRoleChange = (value: 'student' | 'teacher') => {
    setFormData(prev => ({ ...prev, role: value }));
  };

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white mb-2">
            Criar Conta
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Preencha os dados abaixo para criar sua conta
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-normal">
                Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500"
                disabled={isRegistering}
              />
              {errors.name && (
                <p className="text-red-400 text-xs">{errors.name}</p>
              )}
            </div>

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
                disabled={isRegistering}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label className="text-white font-normal">
                Tipo de Conta
              </Label>
              <Select value={formData.role} onValueChange={handleRoleChange} disabled={isRegistering}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="student" className="text-white hover:bg-gray-700">
                    Estudante
                  </SelectItem>
                  <SelectItem value="teacher" className="text-white hover:bg-gray-700">
                    Professor
                  </SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Mínimo 8 caracteres"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500 pr-10"
                  disabled={isRegistering}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={isRegistering}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Password Confirmation Field */}
            <div className="space-y-2">
              <Label htmlFor="password_confirm" className="text-white font-normal">
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
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500 pr-10"
                  disabled={isRegistering}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={isRegistering}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="text-red-400 text-xs">{errors.password_confirm}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-violet-800 hover:bg-violet-900 text-white"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{" "}
              <Link 
                href={signInUrl}
                className="text-white hover:text-violet-400 font-medium"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DjangoSignUp;