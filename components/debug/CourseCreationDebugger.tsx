/**
 * Course Creation Debugger Component
 * 
 * Comprehensive debugging tool to track course creation and listing issues
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Bug, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Search,
  Clock,
  Server
} from 'lucide-react';
import { getPracticeCourses } from '@/actions/practice-management';

interface DebugStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'success' | 'error';
  details: string;
  data?: any;
  timestamp?: string;
}

export const CourseCreationDebugger = () => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [steps, setSteps] = useState<DebugStep[]>([]);
  const [fullReport, setFullReport] = useState<any>(null);

  const addStep = (step: Omit<DebugStep, 'timestamp'>) => {
    setSteps(prev => [...prev, { ...step, timestamp: new Date().toISOString() }]);
  };

  const updateStep = (id: string, updates: Partial<DebugStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates, timestamp: new Date().toISOString() } : step
    ));
  };

  const getStatusIcon = (status: DebugStep['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: DebugStep['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      case 'running': return 'bg-blue-500/20 text-blue-400';
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/20 text-red-400';
    }
  };

  const runFullDiagnostic = async () => {
    setIsDebugging(true);
    setSteps([]);
    setFullReport(null);

    const report: any = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: process.env.NEXT_PUBLIC_DJANGO_API_URL,
      },
      authentication: {},
      apiTests: {},
      courses: {},
      summary: {}
    };

    try {
      // Step 1: Check Authentication
      addStep({
        id: 'auth',
        title: 'Verificar Autenticação',
        status: 'running',
        details: 'Verificando token de acesso...'
      });

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        updateStep('auth', {
          status: 'error',
          details: 'Token de acesso não encontrado!'
        });
        report.authentication.hasToken = false;
        report.authentication.error = 'No access token found';
        return;
      }

      report.authentication.hasToken = true;
      report.authentication.tokenLength = token.length;
      report.authentication.tokenPreview = token.substring(0, 20) + '...';

      updateStep('auth', {
        status: 'success',
        details: `Token encontrado (${token.length} chars)`,
        data: { tokenLength: token.length }
      });

      // Step 2: Test API Connection
      addStep({
        id: 'api-connection',
        title: 'Testar Conexão API',
        status: 'running',
        details: 'Testando conectividade com Django backend...'
      });

      const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';
      
      try {
        const healthResponse = await fetch(`${apiUrl}/practice/courses/`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        report.apiTests.connectionStatus = healthResponse.status;
        report.apiTests.connectionOk = healthResponse.ok;

        if (healthResponse.ok) {
          updateStep('api-connection', {
            status: 'success',
            details: `API responde (status: ${healthResponse.status})`,
            data: { status: healthResponse.status }
          });
        } else {
          updateStep('api-connection', {
            status: 'error',
            details: `API retornou erro (status: ${healthResponse.status})`,
            data: { status: healthResponse.status }
          });
        }
      } catch (error) {
        updateStep('api-connection', {
          status: 'error',
          details: `Erro de conexão: ${error}`,
          data: { error: String(error) }
        });
        report.apiTests.connectionError = String(error);
      }

      // Step 3: Fetch All Courses (with different parameters)
      addStep({
        id: 'fetch-all',
        title: 'Buscar Todos os Cursos',
        status: 'running',
        details: 'Testando diferentes parâmetros de busca...'
      });

      const fetchVariations = [
        { name: 'Default', url: `${apiUrl}/practice/courses/` },
        { name: 'With Drafts', url: `${apiUrl}/practice/courses/?include_drafts=true` },
        { name: 'Practice Type', url: `${apiUrl}/practice/courses/?course_type=practice` },
        { name: 'Both Params', url: `${apiUrl}/practice/courses/?include_drafts=true&course_type=practice` },
      ];

      const fetchResults: any = {};

      for (const variation of fetchVariations) {
        try {
          console.log(`🔍 Testing: ${variation.name} - ${variation.url}`);
          
          const response = await fetch(variation.url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = response.ok ? await response.json() : null;
          
          fetchResults[variation.name] = {
            status: response.status,
            ok: response.ok,
            count: Array.isArray(data) ? data.length : 0,
            data: Array.isArray(data) ? data.map(course => ({
              id: course.id,
              title: course.title,
              status: course.status,
              course_type: course.course_type,
              created_at: course.created_at
            })) : data
          };

          console.log(`📊 ${variation.name} result:`, fetchResults[variation.name]);

        } catch (error) {
          fetchResults[variation.name] = {
            error: String(error)
          };
        }
      }

      report.apiTests.fetchVariations = fetchResults;

      // Find the variation with most courses
      const bestVariation = Object.entries(fetchResults)
        .filter(([_, result]: [string, any]) => result.ok && result.count > 0)
        .sort(([_, a]: [string, any], [__, b]: [string, any]) => (b.count || 0) - (a.count || 0))[0];

      if (bestVariation) {
        updateStep('fetch-all', {
          status: 'success',
          details: `Melhor resultado: ${bestVariation[0]} (${(bestVariation[1] as any).count} cursos)`,
          data: fetchResults
        });
      } else {
        updateStep('fetch-all', {
          status: 'error',
          details: 'Nenhuma variação retornou cursos',
          data: fetchResults
        });
      }

      // Step 4: Analyze Course Data
      addStep({
        id: 'analyze-courses',
        title: 'Analisar Dados dos Cursos',
        status: 'running',
        details: 'Analisando estrutura e conteúdo dos cursos...'
      });

      const allCourses: any[] = [];
      Object.values(fetchResults).forEach((result: any) => {
        if (result.data && Array.isArray(result.data)) {
          allCourses.push(...result.data);
        }
      });

      // Deduplicate by ID
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex(c => c.id === course.id)
      );

      const courseAnalysis = {
        totalUnique: uniqueCourses.length,
        byStatus: uniqueCourses.reduce((acc: any, course) => {
          acc[course.status || 'unknown'] = (acc[course.status || 'unknown'] || 0) + 1;
          return acc;
        }, {}),
        byCourseType: uniqueCourses.reduce((acc: any, course) => {
          acc[course.course_type || 'unknown'] = (acc[course.course_type || 'unknown'] || 0) + 1;
          return acc;
        }, {}),
        recent: uniqueCourses
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
      };

      report.courses = courseAnalysis;

      updateStep('analyze-courses', {
        status: 'success',
        details: `${uniqueCourses.length} cursos únicos encontrados`,
        data: courseAnalysis
      });

      // Step 5: Check for Recent Courses
      addStep({
        id: 'recent-courses',
        title: 'Verificar Cursos Recentes',
        status: 'running',
        details: 'Buscando cursos criados nas últimas 24 horas...'
      });

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentCourses = uniqueCourses.filter(course => {
        const createdAt = new Date(course.created_at);
        return createdAt > yesterday;
      });

      if (recentCourses.length > 0) {
        updateStep('recent-courses', {
          status: 'success',
          details: `${recentCourses.length} cursos criados nas últimas 24h`,
          data: recentCourses
        });
      } else {
        updateStep('recent-courses', {
          status: 'error',
          details: 'Nenhum curso criado recentemente',
          data: []
        });
      }

      // Final Summary
      report.summary = {
        hasAuthentication: !!token,
        apiConnected: report.apiTests.connectionOk,
        totalCoursesFound: uniqueCourses.length,
        recentCoursesFound: recentCourses.length,
        recommendedEndpoint: bestVariation ? bestVariation[0] : 'None working',
        issues: []
      };

      if (!token) report.summary.issues.push('No authentication token');
      if (!report.apiTests.connectionOk) report.summary.issues.push('API connection failed');
      if (uniqueCourses.length === 0) report.summary.issues.push('No courses found');
      if (recentCourses.length === 0) report.summary.issues.push('No recent courses');

      setFullReport(report);

    } catch (error) {
      console.error('Diagnostic error:', error);
      addStep({
        id: 'error',
        title: 'Erro no Diagnóstico',
        status: 'error',
        details: `Erro inesperado: ${error}`,
        data: { error: String(error) }
      });
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-2xl">
      <Card className="bg-customgreys-secondarybg border-violet-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Bug className="w-4 h-4 text-violet-400" />
            Course Creation Debugger 🔍
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={runFullDiagnostic}
              disabled={isDebugging}
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isDebugging ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Diagnosticando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Executar Diagnóstico
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setSteps([])}
              variant="outline"
              size="sm"
              className="border-customgreys-darkerGrey text-gray-400"
            >
              Limpar
            </Button>
          </div>

          {/* Debug Steps */}
          {steps.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h4 className="text-white text-xs font-semibold">Passos do Diagnóstico:</h4>
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 p-2 rounded bg-customgreys-primarybg/50"
                >
                  {getStatusIcon(step.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-xs font-medium">{step.title}</span>
                      <Badge className={`text-xs ${getStatusColor(step.status)}`}>
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-customgreys-dirtyGrey text-xs">{step.details}</p>
                    {step.timestamp && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Summary Report */}
          {fullReport && (
            <div className="space-y-3">
              <h4 className="text-white text-xs font-semibold">Relatório Resumido:</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-customgreys-primarybg/50 rounded">
                  <span className="text-customgreys-dirtyGrey">Total de Cursos:</span>
                  <div className="text-white font-bold">{fullReport.summary.totalCoursesFound}</div>
                </div>
                <div className="p-2 bg-customgreys-primarybg/50 rounded">
                  <span className="text-customgreys-dirtyGrey">Recentes (24h):</span>
                  <div className="text-white font-bold">{fullReport.summary.recentCoursesFound}</div>
                </div>
              </div>

              {fullReport.summary.issues.length > 0 && (
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-red-400 text-xs font-medium">Problemas Detectados:</span>
                  </div>
                  <ul className="text-red-300 text-xs space-y-1">
                    {fullReport.summary.issues.map((issue: string, index: number) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => console.log('Full Debug Report:', fullReport)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-customgreys-darkerGrey text-gray-400 text-xs"
                >
                  <Eye className="w-3 h-3 mr-2" />
                  Ver Relatório (Console)
                </Button>
                
                <Button
                  onClick={() => {
                    if ((window as any).debugCourses) {
                      (window as any).debugCourses.testAllEndpoints();
                    } else {
                      console.log('Debug utilities not loaded');
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-customgreys-darkerGrey text-gray-400 text-xs"
                >
                  <Search className="w-3 h-3 mr-2" />
                  Testar Endpoints
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};