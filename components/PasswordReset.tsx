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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-violet-900/20 rounded-full w-fit">
            {step === 'request' ? (
              <Mail className="w-8 h-8 text-violet-400" />
            ) : (
              <Lock className="w-8 h-8 text-violet-400" />
            )}
          </div>
          
          <CardTitle className="text-2xl text-white">
            {step === 'request' ? 'Recuperar Senha' : 'Nova Senha'}
          </CardTitle>
          
          <CardDescription className="text-gray-400">
            {step === 'request' 
              ? 'Digite seu email para receber o código de verificação'
              : 'Digite o código enviado para seu email e sua nova senha'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'request' ? (
            // Step 1: Request Reset Form
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-normal">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500"
                  disabled={isRequesting}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-violet-800 hover:bg-violet-900 text-white"
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                <Label htmlFor="code" className="text-white font-normal">
                  Código de Verificação
                </Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="000000"
                  value={formData.code}
                  onChange={handleCodeChange}
                  className="text-center text-2xl tracking-widest bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500"
                  maxLength={6}
                  disabled={isConfirming}
                />
                {errors.code && (
                  <p className="text-red-400 text-xs">{errors.code}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white font-normal">
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
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500 pr-10"
                    disabled={isConfirming}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    disabled={isConfirming}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-400 text-xs">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white font-normal">
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
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500 pr-10"
                    disabled={isConfirming}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    disabled={isConfirming}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-violet-800 hover:bg-violet-900 text-white"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </form>
          )}

          {/* Back Links */}
          <div className="text-center space-y-2">
            {step === 'verify' && (
              <Button
                variant="outline"
                onClick={() => setStep('request')}
                className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
                disabled={isConfirming}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            
            <Link 
              href="/signin"
              className="inline-flex items-center text-gray-400 hover:text-white text-sm"
            >
              ← Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;