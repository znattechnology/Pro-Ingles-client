"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, Award } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const VerifyCertificatePage = () => {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim()) {
      setIsLoading(true);
      router.push(`/verify/${verificationCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="md" variant="white" />
          </Link>
          <Badge variant="outline" className="text-gray-400 border-gray-700">
            <Shield className="w-3 h-3 mr-1" />
            Verificação de Certificado
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-400" />
              </div>
              <CardTitle className="text-2xl text-white">Verificar Certificado</CardTitle>
              <CardDescription className="text-gray-400">
                Insira o código de verificação para confirmar a autenticidade do certificado
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                    Código de Verificação
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Ex: VER-A1B2C3D4"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    O código de verificação está localizado no canto inferior do certificado
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={!verificationCode.trim() || isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
                    <>Verificando...</>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Verificar Certificado
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400 text-center">
                  Os certificados emitidos pela ProEnglish possuem um código único que garante sua autenticidade.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Ao verificar um certificado, você confirma que o documento foi emitido pela plataforma ProEnglish.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-800 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ProEnglish Learning Platform. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default VerifyCertificatePage;
