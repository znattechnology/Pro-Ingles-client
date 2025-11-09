"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  PlayCircle,
  CheckCircle,
  Trophy,
  User,
  Calendar,
  Globe,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  Target,
  Brain
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';
import { toast } from 'sonner';

const CourseDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useDjangoAuth();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  // Template icons mapping
  const templateIcons = {
    general: Globe,
    business: Briefcase,
    technology: Code,
    medical: Stethoscope,
    legal: Scale
  };

  const templateColors = {
    general: 'from-blue-500 to-blue-600',
    business: 'from-green-500 to-green-600',
    technology: 'from-purple-500 to-purple-600',
    medical: 'from-red-500 to-red-600',
    legal: 'from-yellow-500 to-yellow-600'
  };

  // Check if user is enrolled by checking enrollment status
  const checkEnrollment = useCallback(async () => {
    console.log('🚀 checkEnrollment called - isAuthenticated:', isAuthenticated, 'user:', !!user, 'courseId:', courseId);
    
    if (!isAuthenticated || !user || !courseId) {
      console.log('⚠️ Skipping enrollment check - missing requirements');
      setIsEnrolled(false); // Ensure not enrolled state when not authenticated
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('⚠️ No access token found');
      setIsEnrolled(false); // Ensure not enrolled state when no token
      return;
    }
    
    console.log('🔑 Token found, proceeding with API call');

    try {
      setCheckingEnrollment(true);
      
      // Use the enrollment status endpoint directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/student/video-courses/${courseId}/enrollment-status/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Enrollment API response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Enrollment data:', data);
        const enrolled = data.data?.is_enrolled || false;
        console.log('✅ Setting isEnrolled to:', enrolled);
        setIsEnrolled(enrolled);
        console.log('🎯 State after setIsEnrolled:', enrolled);
      } else {
        console.log('❌ API error, response:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('❌ API error body:', errorText);
        setIsEnrolled(false);
      }
      
    } catch (err) {
      console.error('Error checking enrollment:', err);
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
  }, [isAuthenticated, user, courseId]);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId || courseId === 'undefined') {
        console.error('Invalid courseId:', courseId);
        setError('ID do curso inválido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/courses/${courseId}/`);
        
        if (!response.ok) {
          throw new Error('Curso não encontrado');
        }
        
        const data = await response.json();
        setCourse(data.data);
      } catch (err: any) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Erro ao carregar curso');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Check enrollment when user is authenticated 
  useEffect(() => {
    console.log('🔧 useEffect triggered - isAuthenticated:', isAuthenticated, 'user:', !!user, 'courseId:', courseId);
    console.log('🔧 User details:', user ? `${user.name} (${user.id})` : 'No user');
    checkEnrollment();
  }, [checkEnrollment]);

  const handleEnrollment = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Faça login para se inscrever no curso');
      return;
    }

    try {
      setIsEnrolling(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/courses/transactions/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          courseId: courseId,
          transactionId: `enrollment-${Date.now()}`,
          amount: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If already enrolled, update state
        if (response.status === 400 && errorData.error?.includes('already enrolled')) {
          await checkEnrollment();
          toast.info('Você já está inscrito neste curso!');
          return;
        }
        throw new Error(errorData.error || 'Erro ao se inscrever no curso');
      }
      
      toast.success('Inscrição realizada com sucesso!');
      // Re-check enrollment status after successful enrollment
      await checkEnrollment();
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast.error(error.message || 'Erro ao se inscrever no curso');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleAccessCourse = () => {
    // Navigate to the first section/chapter of the course using the correct route structure
    if (course?.sections && course.sections.length > 0) {
      const firstSection = course.sections[0];
      if (firstSection.chapters && firstSection.chapters.length > 0) {
        const firstChapter = firstSection.chapters[0];
        router.push(`/user/courses/${courseId}/chapters/${firstChapter.chapterId}`);
      } else {
        router.push(`/user/courses/${courseId}`);
      }
    } else {
      router.push(`/user/courses/${courseId}`);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getChapterIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="h-4 w-4 text-blue-400" />;
      case 'Quiz':
        return <Brain className="h-4 w-4 text-purple-400" />;
      case 'Exercise':
        return <Target className="h-4 w-4 text-emerald-400" />;
      case 'Text':
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-customgreys-secondarybg border-red-500/20">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Curso não encontrado</h2>
            <p className="text-customgreys-dirtyGrey mb-4">{error}</p>
            <Button onClick={() => router.back()} className="bg-red-500 hover:bg-red-600">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) return null;

  const TemplateIcon = templateIcons[course.template as keyof typeof templateIcons] || Globe;
  const templateColorClass = templateColors[course.template as keyof typeof templateColors] || 'from-blue-500 to-blue-600';

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
            <span className="text-gray-400 text-sm">Detalhes do Curso</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* Course Image */}
                <div className="relative w-full sm:w-32 h-32 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex-shrink-0">
                  {course.image ? (
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TemplateIcon className="h-8 w-8 text-violet-400" />
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-br ${templateColorClass} opacity-20`} />
                </div>

                {/* Course Details */}
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <Badge 
                      variant="outline" 
                      className={`bg-gradient-to-r ${templateColorClass} border-none text-white shadow-lg text-xs sm:text-sm`}
                    >
                      <TemplateIcon className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{course.template.charAt(0).toUpperCase() + course.template.slice(1)}</span>
                      <span className="sm:hidden">{course.template.charAt(0).toUpperCase()}</span>
                    </Badge>
                    <Badge variant="outline" className="border-violet-500/50 text-violet-300 text-xs sm:text-sm">
                      {course.level}
                    </Badge>
                    <Badge variant="outline" className="border-green-500/50 text-green-300 text-xs sm:text-sm">
                      {course.status}
                    </Badge>
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-3 leading-tight">
                    {course.title}
                  </h1>
                  
                  <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-4">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{course.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(course.created_at).toLocaleDateString('pt-PT')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <Card className="bg-customgreys-primarybg/60 backdrop-blur-sm border-violet-900/30 lg:sticky lg:top-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-white mb-2">
                      Gratuito
                    </div>
                    <p className="text-gray-400 text-sm">Acesso completo ao curso</p>
                  </div>

                  {(() => {
                    console.log('🎯 Button render - checkingEnrollment:', checkingEnrollment, 'isEnrolled:', isEnrolled);
                    
                    if (checkingEnrollment) {
                      return (
                        <Button
                          disabled
                          className="w-full bg-gray-600 text-white shadow-lg h-11 sm:h-12 text-sm sm:text-base lg:text-lg font-semibold"
                        >
                          <span className="hidden sm:inline">Verificando...</span>
                          <span className="sm:hidden">...</span>
                        </Button>
                      );
                    }
                    
                    if (isEnrolled) {
                      return (
                        <Button
                          onClick={handleAccessCourse}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-11 sm:h-12 text-sm sm:text-base lg:text-lg font-semibold"
                        >
                          <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="hidden sm:inline">Acessar Curso</span>
                          <span className="sm:hidden">Acessar</span>
                        </Button>
                      );
                    }
                    
                    return (
                      <Button
                        onClick={handleEnrollment}
                        disabled={isEnrolling}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg h-11 sm:h-12 text-sm sm:text-base lg:text-lg font-semibold"
                      >
                        <span className="hidden sm:inline">{isEnrolling ? 'Inscrevendo...' : 'Inscrever-se no Curso'}</span>
                        <span className="sm:hidden">{isEnrolling ? 'Inscrevendo...' : 'Inscrever-se'}</span>
                      </Button>
                    );
                  })()}

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Total de capítulos</span>
                      <span className="text-white font-medium">{course.total_chapters || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Seções</span>
                      <span className="text-white font-medium">{course.total_sections || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Estudantes inscritos</span>
                      <span className="text-white font-medium">{course.total_enrollments || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Nível</span>
                      <span className="text-white font-medium">{course.level}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Curriculum */}
            <Card className="bg-customgreys-secondarybg border-violet-900/30">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
                  Conteúdo do Curso
                </h2>

                {course.sections && course.sections.length > 0 ? (
                  <div className="space-y-4">
                    {course.sections.map((section: any, sectionIndex: number) => (
                      <Card key={section.sectionId} className="bg-customgreys-primarybg/50 border-violet-900/20">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleSection(section.sectionId)}
                            className="w-full p-3 sm:p-4 text-left hover:bg-violet-800/10 transition-colors duration-200 rounded-t-lg"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                {expandedSections.has(section.sectionId) ? 
                                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400 flex-shrink-0" /> : 
                                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400 flex-shrink-0" />
                                }
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                                    <span className="hidden sm:inline">Seção {sectionIndex + 1}: </span>
                                    <span className="sm:hidden">{sectionIndex + 1}. </span>
                                    {section.sectionTitle}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
                                    {section.sectionDescription}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="border-violet-500/50 text-violet-300 text-xs flex-shrink-0">
                                <span className="hidden sm:inline">{section.chapters?.length || 0} aulas</span>
                                <span className="sm:hidden">{section.chapters?.length || 0}</span>
                              </Badge>
                            </div>
                          </button>

                          {expandedSections.has(section.sectionId) && section.chapters && (
                            <div className="border-t border-violet-900/20">
                              {section.chapters.map((chapter: any, chapterIndex: number) => (
                                <div 
                                  key={chapter.chapterId}
                                  className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-violet-800/5 transition-colors duration-200"
                                >
                                  <div className="mt-0.5 flex-shrink-0">
                                    {getChapterIcon(chapter.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base text-white font-medium leading-tight">
                                      {chapterIndex + 1}. {chapter.title}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                                      {chapter.content}
                                    </p>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`
                                      text-xs flex-shrink-0 mt-0.5
                                      ${chapter.type === 'Video' ? 'border-blue-500/50 text-blue-300' : ''}
                                      ${chapter.type === 'Quiz' ? 'border-purple-500/50 text-purple-300' : ''}
                                      ${chapter.type === 'Exercise' ? 'border-emerald-500/50 text-emerald-300' : ''}
                                      ${chapter.type === 'Text' ? 'border-gray-500/50 text-gray-300' : ''}
                                    `}
                                  >
                                    <span className="hidden sm:inline">{chapter.type === 'Exercise' ? 'Practice Lab' : chapter.type}</span>
                                    <span className="sm:hidden">{chapter.type === 'Exercise' ? 'Lab' : chapter.type.charAt(0)}</span>
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-violet-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">Conteúdo em breve</h3>
                    <p className="text-gray-400">O conteúdo deste curso está sendo preparado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Features */}
            <Card className="bg-customgreys-secondarybg border-violet-900/30 mb-4 sm:mb-6">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">O que você aprenderá</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-xs sm:text-sm leading-relaxed">Conceitos fundamentais da área</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-xs sm:text-sm leading-relaxed">Aplicação prática dos conhecimentos</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-xs sm:text-sm leading-relaxed">Exercícios interativos</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-xs sm:text-sm leading-relaxed">Certificado de conclusão</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card className="bg-customgreys-secondarybg border-violet-900/30">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Instrutor</h3>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-white truncate">{course.teacherName}</h4>
                    <p className="text-xs sm:text-sm text-gray-400">Professor Especializado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;