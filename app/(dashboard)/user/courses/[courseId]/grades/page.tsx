"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Trophy,
  BookOpen,
  Brain,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  TrendingUp,
  Clock,
  Target,
  ChevronRight,
  FileText,
  History,
  Sparkles,
  GraduationCap,
  BarChart3,
  Flame,
  Star
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';
import { toast } from 'sonner';
import type {
  CourseGrade,
  CertificateEligibility,
  GradeHistory,
  QuizDetail,
  PracticeDetail
} from '@/src/domains/student/video-courses/types';

const GradesPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useDjangoAuth();
  const courseId = params?.courseId as string;

  const [grades, setGrades] = useState<CourseGrade | null>(null);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [history, setHistory] = useState<GradeHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  // Fetch grades data
  useEffect(() => {
    const fetchGrades = async () => {
      if (!isAuthenticated || !courseId) return;

      try {
        setIsLoading(true);

        const [gradesRes, eligibilityRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/student/video-courses/${courseId}/grade/`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          fetch(`http://localhost:8000/api/v1/student/video-courses/${courseId}/certificate-eligibility/`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          setGrades(gradesData.data);
        }

        if (eligibilityRes.ok) {
          const eligibilityData = await eligibilityRes.json();
          setEligibility(eligibilityData.data);
        }

      } catch (error) {
        console.error('Error fetching grades:', error);
        toast.error('Erro ao carregar notas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, [isAuthenticated, courseId]);

  // Fetch history when tab changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (activeTab !== 'history' || history || !isAuthenticated || !courseId) return;

      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/student/video-courses/${courseId}/grade-history/`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHistory(data.data);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, [activeTab, history, isAuthenticated, courseId]);

  const handleGenerateCertificate = async () => {
    if (!eligibility?.can_generate_certificate) {
      toast.error('Você ainda não atende aos requisitos para o certificado');
      return;
    }

    try {
      setIsGeneratingCertificate(true);

      const response = await fetch(
        `http://localhost:8000/api/v1/student/video-courses/${courseId}/generate-certificate/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Certificado gerado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao gerar certificado');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Erro ao gerar certificado');
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeBg = (percentage: number) => {
    if (percentage >= 90) return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30';
    if (percentage >= 80) return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
    if (percentage >= 70) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    if (percentage >= 60) return 'from-orange-500/20 to-orange-600/10 border-orange-500/30';
    return 'from-red-500/20 to-red-600/10 border-red-500/30';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!grades) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
          <AlertCircle className="relative h-16 w-16 text-violet-400 mb-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Nenhuma nota encontrada</h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          Complete algumas atividades do curso para ver suas notas e acompanhar seu progresso.
        </p>
        <Button
          onClick={() => router.back()}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao curso
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="h-4 w-px bg-violet-900/30" />
            <span className="text-gray-400 text-sm">Minhas Notas</span>
          </div>

          {/* Header Content */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30">
                  <GraduationCap className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                    Minhas Notas
                  </h1>
                  <p className="text-gray-400 text-sm">{grades.course.title}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span>{grades.grades.quizzes.completed}/{grades.grades.quizzes.count} quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span>{grades.grades.practice.completed}/{grades.grades.practice.count} exercícios</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>Atualizado {new Date(grades.last_calculated_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Final Grade Card */}
            <div className="lg:col-span-1">
              <Card className={`bg-gradient-to-br ${getGradeBg(grades.final_grade.percentage)} backdrop-blur-sm border`}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-3">
                      <div className={`text-6xl font-bold ${getGradeColor(grades.final_grade.percentage)}`}>
                        {grades.final_grade.letter}
                      </div>
                      {grades.final_grade.percentage >= 90 && (
                        <Sparkles className="absolute -top-2 -right-4 h-6 w-6 text-yellow-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-3xl font-semibold text-white mb-1">
                      {grades.final_grade.percentage.toFixed(1)}%
                    </div>
                    <p className="text-gray-400 text-sm">Nota Final</p>

                    {/* Eligibility Status */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      {eligibility?.is_eligible ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2 text-emerald-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Elegível para Certificado</span>
                          </div>
                          <Button
                            onClick={handleGenerateCertificate}
                            disabled={isGeneratingCertificate}
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20"
                          >
                            <Award className="h-4 w-4 mr-2" />
                            {isGeneratingCertificate ? 'Gerando...' : 'Gerar Certificado'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-orange-400">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Requisitos pendentes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-customgreys-secondarybg/50 border border-violet-900/30 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Brain className="h-4 w-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="practice"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Target className="h-4 w-4 mr-2" />
              Práticas
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Weight Adjustment Banner */}
            {grades.weight_info?.weights_adjusted && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="p-1.5 rounded-full bg-blue-500/20 shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-200 mb-1">Avaliação Simplificada</h4>
                  <p className="text-sm text-blue-300/80">
                    {grades.weight_info.mode_explanation ||
                     `Este curso não possui todos os componentes de avaliação. A nota final é calculada com base nos componentes disponíveis: ${grades.weight_info.active_components?.join(', ') || 'nenhum'}.`}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    {grades.weight_info.active_components?.includes('quizzes') && (
                      <span className="flex items-center gap-1 text-purple-300">
                        <Brain className="h-3 w-3" />
                        Quizzes: {grades.weight_info.quiz_weight}%
                      </span>
                    )}
                    {grades.weight_info.active_components?.includes('practice') && (
                      <span className="flex items-center gap-1 text-blue-300">
                        <Target className="h-3 w-3" />
                        Prática: {grades.weight_info.practice_weight}%
                      </span>
                    )}
                    {grades.weight_info.active_components?.includes('conversation') && (
                      <span className="flex items-center gap-1 text-emerald-300">
                        <MessageCircle className="h-3 w-3" />
                        Conversação: {grades.weight_info.conversation_weight}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No Content Mode */}
            {grades.weight_info?.mode === 'no_content' && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <div className="p-1.5 rounded-full bg-orange-500/20 shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-medium text-orange-200 mb-1">Sem Componentes de Avaliação</h4>
                  <p className="text-sm text-orange-300/80">
                    Este curso ainda não possui quizzes, exercícios práticos ou sessões de conversação configurados.
                    Continue estudando o conteúdo do curso.
                  </p>
                </div>
              </div>
            )}

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quiz Score Card */}
              <Card className="bg-customgreys-secondarybg/50 border-violet-900/30 hover:border-purple-500/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                      <Brain className="h-6 w-6 text-purple-400" />
                    </div>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                      {grades.grades.quizzes.passed}/{grades.grades.quizzes.count}
                    </Badge>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Quizzes</h3>
                  <div className={`text-3xl font-bold mb-3 ${getGradeColor(grades.grades.quizzes.score)}`}>
                    {grades.grades.quizzes.score.toFixed(1)}%
                  </div>
                  <div className="h-2 bg-customgreys-primarybg rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(grades.grades.quizzes.score)} transition-all duration-500`}
                      style={{ width: `${grades.grades.quizzes.score}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {grades.grades.quizzes.completed} de {grades.grades.quizzes.count} completados
                  </p>
                </CardContent>
              </Card>

              {/* Practice Score Card */}
              <Card className="bg-customgreys-secondarybg/50 border-violet-900/30 hover:border-blue-500/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                      <Target className="h-6 w-6 text-blue-400" />
                    </div>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                      {grades.grades.practice.completed}/{grades.grades.practice.count}
                    </Badge>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Exercícios Práticos</h3>
                  <div className={`text-3xl font-bold mb-3 ${getGradeColor(grades.grades.practice.score)}`}>
                    {grades.grades.practice.score.toFixed(1)}%
                  </div>
                  <div className="h-2 bg-customgreys-primarybg rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(grades.grades.practice.score)} transition-all duration-500`}
                      style={{ width: `${grades.grades.practice.score}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {grades.grades.practice.completed} de {grades.grades.practice.count} completos
                  </p>
                </CardContent>
              </Card>

              {/* Conversation Score Card */}
              <Card className="bg-customgreys-secondarybg/50 border-violet-900/30 hover:border-emerald-500/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                      <MessageCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    {grades.grades.conversation.required && (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-300">
                        {grades.grades.conversation.sessions} sessões
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-1">Conversação</h3>
                  {grades.grades.conversation.required ? (
                    <>
                      <div className={`text-3xl font-bold mb-3 ${getGradeColor(grades.grades.conversation.score)}`}>
                        {grades.grades.conversation.score.toFixed(1)}%
                      </div>
                      <div className="h-2 bg-customgreys-primarybg rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(grades.grades.conversation.score)} transition-all duration-500`}
                          style={{ width: `${grades.grades.conversation.score}%` }}
                        />
                      </div>
                      <p className="text-gray-400 text-sm mt-2">
                        {grades.grades.conversation.minutes} minutos de prática
                      </p>
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Não é requisito para este curso
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Requirements Checklist */}
            {eligibility && (
              <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Requisitos para Certificado</CardTitle>
                      <CardDescription className="text-gray-400">
                        Complete todos os requisitos para obter seu certificado
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eligibility.requirements.map((req, index) => {
                      // Check if this is a skipped requirement based on the eligibility details
                      const detailKey = req.name.toLowerCase().includes('quiz') ? 'quiz_average' :
                                       req.name.toLowerCase().includes('prático') || req.name.toLowerCase().includes('exercício') ? 'practice_completion' :
                                       req.name.toLowerCase().includes('conversação') ? 'conversation_score' : null;
                      const detail = detailKey ? grades?.certificate_eligibility?.details?.[detailKey] : null;
                      const isSkipped = detail?.skipped;

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                            isSkipped
                              ? 'bg-gray-500/10 border-gray-500/30 hover:border-gray-500/50'
                              : req.met
                                ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                                : 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isSkipped ? (
                              <div className="p-1.5 rounded-full bg-gray-500/20">
                                <AlertCircle className="h-5 w-5 text-gray-400" />
                              </div>
                            ) : req.met ? (
                              <div className="p-1.5 rounded-full bg-emerald-500/20">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="p-1.5 rounded-full bg-orange-500/20">
                                <XCircle className="h-5 w-5 text-orange-400" />
                              </div>
                            )}
                            <div>
                              <span className={`font-medium ${isSkipped ? 'text-gray-400' : 'text-white'}`}>
                                {req.name}
                              </span>
                              {isSkipped && (
                                <p className="text-xs text-gray-500">Não disponível neste curso</p>
                              )}
                            </div>
                          </div>
                          {!isSkipped && (
                            <div className="text-sm">
                              <span className={req.met ? 'text-emerald-400' : 'text-orange-400'}>
                                {req.current_value}
                              </span>
                              <span className="text-gray-500"> / {req.required_value}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Brain className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Detalhes dos Quizzes</CardTitle>
                    <CardDescription className="text-gray-400">
                      Seu desempenho em cada quiz do curso
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {grades.grades.quizzes.details.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum quiz disponível neste curso</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grades.grades.quizzes.details.map((quiz: QuizDetail) => (
                      <div
                        key={quiz.quiz_id}
                        className="flex items-center justify-between p-4 rounded-xl bg-customgreys-primarybg/50 border border-violet-900/20 hover:border-violet-500/30 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white">{quiz.quiz_title}</h4>
                            {quiz.is_passed ? (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprovado
                              </Badge>
                            ) : quiz.attempts_used > 0 ? (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                <XCircle className="h-3 w-3 mr-1" />
                                Reprovado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-500/50 text-gray-400">
                                Pendente
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {quiz.section_title} → {quiz.chapter_title}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Tentativas: {quiz.attempts_used}/{quiz.max_attempts}</span>
                            <span>Mínimo: {quiz.passing_score}%</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-3xl font-bold ${getGradeColor(quiz.score)}`}>
                            {quiz.score.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice">
            <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Target className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Exercícios Práticos</CardTitle>
                    <CardDescription className="text-gray-400">
                      Seu progresso nos exercícios práticos de cada capítulo
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {grades.grades.practice.details.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum exercício prático disponível neste curso</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grades.grades.practice.details.map((practice: PracticeDetail) => (
                      <div
                        key={practice.chapter_id}
                        className="p-4 rounded-xl bg-customgreys-primarybg/50 border border-violet-900/20 hover:border-violet-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-white">{practice.chapter_title}</h4>
                            <p className="text-sm text-gray-400">{practice.section_title}</p>
                          </div>
                          <div className={`text-2xl font-bold ${getGradeColor(practice.completion_percentage)}`}>
                            {practice.completion_percentage.toFixed(0)}%
                          </div>
                        </div>
                        <div className="h-2 bg-customgreys-primarybg rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full ${getProgressColor(practice.completion_percentage)} transition-all duration-500`}
                            style={{ width: `${practice.completion_percentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          {practice.completed_challenges}/{practice.total_challenges} desafios completos
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-customgreys-secondarybg/50 border-violet-900/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <History className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Histórico de Notas</CardTitle>
                    <CardDescription className="text-gray-400">
                      Evolução das suas notas ao longo do tempo
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!history || history.history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum histórico de notas disponível</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-customgreys-primarybg/50 border border-violet-900/20 hover:border-violet-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`text-3xl font-bold ${getGradeColor(entry.final_grade_percentage)}`}>
                            {entry.final_grade_letter}
                          </div>
                          <div>
                            <p className="font-medium text-white">{entry.final_grade_percentage.toFixed(1)}%</p>
                            <p className="text-sm text-gray-400">
                              {new Date(entry.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-violet-500/50 text-violet-300 mb-2">
                            {entry.change_reason === 'quiz_completed' && 'Quiz Completado'}
                            {entry.change_reason === 'practice_completed' && 'Prática Completada'}
                            {entry.change_reason === 'conversation_session' && 'Sessão de Conversação'}
                            {entry.change_reason === 'recalculation' && 'Recálculo'}
                            {entry.change_reason === 'initial' && 'Inicial'}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            Q: {entry.quiz_score.toFixed(0)}% | P: {entry.practice_score.toFixed(0)}% | C: {entry.conversation_score.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GradesPage;
