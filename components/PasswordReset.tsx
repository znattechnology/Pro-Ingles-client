"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  useRequestPasswordResetMutation, 
  useConfirmPasswordResetMutation 
} from "@/redux/features/auth/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

type Step = 'request' | 'verify';

const PasswordReset = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [requestReset, { isLoading: isRequesting }] = useRequestPasswordResetMutation();
  const [confirmReset, { isLoading: isConfirming }] = useConfirmPasswordResetMutation();

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrors({ email: 'Email é obrigatório' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: 'Email inválido' });
      return;
    }

    try {
      const result = await requestReset({ email }).unwrap();
      toast.success(result.message);
      setStep('verify');
      setErrors({});
    } catch (error: any) {
      console.error('Password reset request error:', error);
      const errorMessage = error?.data?.error || error?.message || 'Erro ao solicitar reset de senha.';
      toast.error(errorMessage);
      
      if (error?.data && typeof error.data === 'object') {
        setErrors(error.data);
      }
    }
  };

  // Step 2: Confirm password reset with code
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    // Validate code
    if (!formData.code || formData.code.length !== 6) {
      newErrors.code = 'Digite o código de 6 dígitos';
    }

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Senha deve ter pelo menos 8 caracteres';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await confirmReset({
        email,
        code: formData.code,
        newPassword: formData.newPassword
      }).unwrap();
      
      toast.success(result.message || 'Senha alterada com sucesso!');
      router.push('/signin');
    } catch (error: any) {
      console.error('Password reset confirm error:', error);
      const errorMessage = error?.data?.error || error?.message || 'Erro ao alterar senha.';
      toast.error(errorMessage);
      
      if (error?.data && typeof error.data === 'object') {
        setErrors(error.data);
      } else {
        setErrors({ code: errorMessage });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setEmail(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, code: value }));
    
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: '' }));
    }
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
          {step === 'request' ? (
            // Step 1: Request Reset Form
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4"
                    disabled={isRequesting}
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
            <form onSubmit={handleConfirmReset} className="space-y-4">
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
                    name="code"
                    type="text"
                    placeholder="000000"
                    value={formData.code}
                    onChange={handleCodeChange}
                    className="text-center text-2xl tracking-widest bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12"
                    maxLength={6}
                    disabled={isConfirming}
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 focus-within:from-violet-500/10 focus-within:via-transparent focus-within:to-violet-500/10 pointer-events-none transition-all duration-300" />
                </div>
                {errors.code && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {errors.code}
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
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Mínimo 8 caracteres"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12"
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
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 focus-within:from-violet-500/10 focus-within:via-transparent focus-within:to-violet-500/10 pointer-events-none transition-all duration-300" />
                </div>
                {errors.newPassword && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {errors.newPassword}
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
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme sua nova senha"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 h-12 pl-4 pr-12"
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
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/0 focus-within:from-violet-500/10 focus-within:via-transparent focus-within:to-violet-500/10 pointer-events-none transition-all duration-300" />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {errors.confirmPassword}
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
                onClick={() => setStep('request')}
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
                ← Voltar ao login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default PasswordReset;