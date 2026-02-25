"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Award,
  Download,
  Calendar,
  BookOpen,
  Search,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Sparkles
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types
interface Certificate {
  id: string;
  certificate_number: string;
  verification_code: string;
  course: string; // course ID
  course_title: string;
  course_image: string | null;
  issued_at: string;
  final_grade: number;
  final_grade_letter: string;
  completion_percentage: number;
  certificate_url: string | null;
}

const CertificatesPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useDjangoAuth();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth state
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (authChecked && !isAuthenticated && !authLoading) {
      router.push('/signin?redirect=/user/certificates');
    }
  }, [authChecked, isAuthenticated, authLoading, router]);

  // Fetch all certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!authChecked) return;

      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await fetch(
          `http://localhost:8000/api/v1/student/video-courses/certificates/`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCertificates(data.data || []);
        } else if (response.status === 401) {
          router.push('/signin?redirect=/user/certificates');
          return;
        } else {
          toast.error('Erro ao carregar certificados');
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Erro ao carregar certificados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, [authChecked, isAuthenticated, router]);

  // Download certificate
  const handleDownload = async (certificateId: string) => {
    try {
      toast.loading('Preparando download...');
      const response = await fetch(
        `http://localhost:8000/api/v1/student/video-courses/certificates/${certificateId}/download/`,
        {
          credentials: 'include'
        }
      );

      toast.dismiss();
      if (response.ok) {
        const data = await response.json();
        if (data.download_url) {
          window.open(data.download_url, '_blank');
          toast.success('Certificado aberto para download');
        }
      } else {
        toast.error('Erro ao baixar certificado');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error downloading certificate:', error);
      toast.error('Erro ao baixar certificado');
    }
  };

  // Copy verification code
  const copyVerificationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
    if (letter.startsWith('A')) return 'text-emerald-400';
    if (letter.startsWith('B')) return 'text-blue-400';
    if (letter.startsWith('C')) return 'text-yellow-400';
    if (letter.startsWith('D')) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeBg = (letter: string) => {
    if (letter.startsWith('A')) return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30';
    if (letter.startsWith('B')) return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
    if (letter.startsWith('C')) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    if (letter.startsWith('D')) return 'from-orange-500/20 to-orange-600/10 border-orange-500/30';
    return 'from-red-500/20 to-red-600/10 border-red-500/30';
  };

  const getLetterBadgeColor = (letter: string) => {
    if (letter.startsWith('A')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (letter.startsWith('B')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (letter.startsWith('C')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (letter.startsWith('D')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  // Filter certificates by search
  const filteredCertificates = certificates.filter(cert =>
    cert.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificate_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate average grade
  const averageGrade = certificates.length > 0
    ? certificates.reduce((acc, c) => acc + (c.final_grade || 0), 0) / certificates.length
    : 0;

  const getAverageLetterGrade = (avg: number) => {
    if (avg >= 90) return 'A';
    if (avg >= 80) return 'B';
    if (avg >= 70) return 'C';
    if (avg >= 60) return 'D';
    return 'F';
  };

  // Show loading while checking auth or fetching data
  if (!authChecked || isLoading) {
    return <Loading />;
  }

  // If not authenticated after check, show loading (will redirect)
  if (!isAuthenticated) {
    return <Loading />;
  }

  // Empty state
  if (certificates.length === 0) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
          <Award className="relative h-16 w-16 text-yellow-400 mb-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Nenhum certificado ainda</h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          Complete seus cursos com a nota mínima para ganhar certificados de conclusão.
        </p>
        <Button
          onClick={() => router.push('/user/courses')}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Ver Meus Cursos
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-amber-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(234,179,8,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30">
                  <Award className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                    Meus Certificados
                  </h1>
                  <p className="text-gray-400 text-sm">Suas conquistas e certificações</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Average Grade */}
              <Card className={`bg-gradient-to-br ${getGradeBg(getAverageLetterGrade(averageGrade))} backdrop-blur-sm border`}>
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl font-bold ${getGradeColor(getAverageLetterGrade(averageGrade))}`}>
                    {getAverageLetterGrade(averageGrade)}
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {averageGrade.toFixed(1)}%
                  </div>
                  <p className="text-gray-400 text-xs">Média dos Certificados</p>
                </CardContent>
              </Card>

              {/* Total Certificates */}
              <Card className="bg-customgreys-secondarybg/50 border-yellow-900/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {certificates.length}
                  </div>
                  <p className="text-gray-400 text-xs">Certificados</p>
                </CardContent>
              </Card>

              {/* Verified Badge */}
              <Card className="bg-customgreys-secondarybg/50 border-emerald-900/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    <Shield className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-gray-400 text-xs">Verificáveis</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar certificados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-customgreys-secondarybg border-violet-900/30 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        {filteredCertificates.length === 0 ? (
          <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum certificado encontrado</h3>
              <p className="text-gray-400">Tente buscar por outro termo</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="bg-customgreys-secondarybg/50 border-violet-900/30 hover:border-yellow-500/50 transition-all duration-200 group overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Certificate Preview Header */}
                  <div className="relative h-36 bg-gradient-to-br from-violet-900/50 via-purple-900/50 to-indigo-900/50">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="h-full w-full bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,.1)_50%,transparent_55%)] bg-[size:20px_20px]" />
                    </div>

                    {/* Certificate Icon */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="p-3 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-2">
                        <Award className="h-8 w-8 text-yellow-400" />
                      </div>
                      <p className="text-xs text-gray-300 font-medium tracking-wider">CERTIFICADO</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">{certificate.certificate_number}</p>
                    </div>

                    {/* Grade Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-2.5 py-1 rounded-lg border backdrop-blur-sm ${getLetterBadgeColor(certificate.final_grade_letter)}`}>
                        <span className="text-sm font-bold">{certificate.final_grade_letter}</span>
                        <span className="text-xs ml-1">({certificate.final_grade?.toFixed(0)}%)</span>
                      </div>
                    </div>

                    {/* Sparkle decoration */}
                    <Sparkles className="absolute top-3 left-3 h-4 w-4 text-yellow-400/50" />
                  </div>

                  {/* Certificate Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                      {certificate.course_title}
                    </h3>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Emitido em {formatDate(certificate.issued_at)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(certificate.id)}
                        className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar PDF
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-customgreys-secondarybg border-violet-900/30">
                          <DialogHeader>
                            <DialogTitle className="text-white flex items-center gap-2">
                              <Shield className="h-5 w-5 text-emerald-400" />
                              Compartilhar Certificado
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Compartilhe seu certificado com o código de verificação.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="text-sm text-gray-400 mb-2 block">
                                Código de Verificação
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  value={certificate.verification_code}
                                  readOnly
                                  className="bg-customgreys-darkGrey border-violet-900/30 text-white font-mono"
                                />
                                <Button
                                  onClick={() => copyVerificationCode(certificate.verification_code)}
                                  variant="outline"
                                  className="border-violet-500/30 hover:bg-violet-500/20"
                                >
                                  {copiedCode === certificate.verification_code ? (
                                    <Check className="h-4 w-4 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm text-gray-400 mb-2 block">
                                Link de Verificação
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certificate.verification_code}`}
                                  readOnly
                                  className="bg-customgreys-darkGrey border-violet-900/30 text-white text-sm"
                                />
                                <Button
                                  onClick={() => window.open(`/verify/${certificate.verification_code}`, '_blank')}
                                  variant="outline"
                                  className="border-violet-500/30 hover:bg-violet-500/20"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-violet-900/30">
                              <p className="text-xs text-gray-500 flex items-center gap-2">
                                <Shield className="h-3 w-3 text-emerald-400" />
                                Qualquer pessoa pode verificar a autenticidade do certificado
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
