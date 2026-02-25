"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Shield,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

interface CertificateVerification {
  valid: boolean;
  message: string;
  data?: {
    certificate_number: string;
    student_name: string;
    course_title: string;
    issued_at: string;
    final_grade: {
      percentage: number;
      letter: string;
    };
    completion_percentage: number;
  };
  error?: string;
}

const VerifyCertificatePage = () => {
  const params = useParams();
  const verificationCode = params.code as string;

  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyCertificate = async () => {
      if (!verificationCode) return;

      try {
        setIsLoading(true);

        const response = await fetch(
          `http://localhost:8000/api/v1/certificates/verify/${verificationCode}/`
        );

        const data = await response.json();
        setVerification(data);
      } catch (error) {
        console.error('Error verifying certificate:', error);
        setVerification({
          valid: false,
          message: 'Erro ao verificar certificado',
          error: 'Não foi possível conectar ao servidor'
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyCertificate();
  }, [verificationCode]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get grade color
  const getGradeColor = (letter: string) => {
    if (letter.startsWith('A')) return 'bg-emerald-500';
    if (letter.startsWith('B')) return 'bg-blue-500';
    if (letter.startsWith('C')) return 'bg-yellow-500';
    if (letter.startsWith('D')) return 'bg-orange-500';
    return 'bg-red-500';
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
        <div className="w-full max-w-2xl">
          {isLoading ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-12 flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-400">Verificando certificado...</p>
              </CardContent>
            </Card>
          ) : verification?.valid ? (
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
              {/* Valid Certificate Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Certificado Verificado</h1>
                    <p className="text-emerald-100">Este certificado é autêntico e válido</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Certificate Details */}
                <div className="space-y-6">
                  {/* Certificate Number */}
                  <div className="text-center pb-6 border-b border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Número do Certificado</p>
                    <p className="text-lg font-mono text-white">{verification.data?.certificate_number}</p>
                  </div>

                  {/* Student Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Estudante</p>
                      <p className="text-lg font-semibold text-white">{verification.data?.student_name}</p>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Curso Concluído</p>
                      <p className="text-lg font-semibold text-white">{verification.data?.course_title}</p>
                    </div>
                  </div>

                  {/* Grade and Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-gray-400">Nota Final</p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-white">
                          {verification.data?.final_grade.percentage.toFixed(1)}%
                        </span>
                        <Badge className={`${getGradeColor(verification.data?.final_grade.letter || 'F')} text-white`}>
                          {verification.data?.final_grade.letter}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-500" />
                        <p className="text-sm text-gray-400">Data de Emissão</p>
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {verification.data?.issued_at ? formatDate(verification.data.issued_at) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Code */}
                  <div className="text-center pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Código de Verificação: <span className="font-mono">{verificationCode}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
              {/* Invalid Certificate Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Certificado Não Encontrado</h1>
                    <p className="text-red-100">{verification?.message || 'Este código de verificação não é válido'}</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 text-center">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">
                  O código de verificação fornecido não corresponde a nenhum certificado em nosso sistema.
                  Por favor, verifique se o código está correto.
                </p>
                <p className="text-sm text-gray-500">
                  Código verificado: <span className="font-mono text-gray-400">{verificationCode}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Footer info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              A verificação de certificados confirma a autenticidade dos certificados emitidos pela plataforma ProEnglish.
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
