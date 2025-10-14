/**
 * Teacher Video Courses Utils
 * Utility functions specific to teacher video course management
 */

import { 
  TeacherVideoCourse, 
  VideoSection, 
  VideoChapter, 
  CourseAnalytics 
} from '../types';
import { formatDuration, formatPercentage, capitalizeFirst } from '../../../shared/utils';

// Course management utilities
export const calculateTotalDuration = (course: TeacherVideoCourse): number => {
  if (!course.sections) return 0;
  
  return course.sections.reduce((total, section) => {
    return total + (section.chapters?.reduce((sectionTotal, chapter) => {
      return sectionTotal + (chapter.duration || 0);
    }, 0) || 0);
  }, 0);
};

export const formatCourseDuration = (course: TeacherVideoCourse): string => {
  const totalMinutes = Math.ceil(calculateTotalDuration(course) / 60);
  return formatDuration(totalMinutes);
};

export const getCourseStatistics = (course: TeacherVideoCourse) => {
  const sections = course.sections || [];
  const totalSections = sections.length;
  const totalChapters = sections.reduce((sum, section) => 
    sum + (section.chapters?.length || 0), 0
  );
  const totalDuration = calculateTotalDuration(course);
  
  return {
    totalSections,
    totalChapters,
    totalDuration: Math.ceil(totalDuration / 60), // in minutes
    formattedDuration: formatDuration(Math.ceil(totalDuration / 60)),
    enrollments: course.enrollments || 0,
    rating: course.rating || 0,
    reviewCount: course.review_count || 0,
  };
};

export const getCourseProgressStatus = (course: TeacherVideoCourse) => {
  const stats = getCourseStatistics(course);
  const hasContent = stats.totalChapters > 0;
  const hasDescription = course.description && course.description.length > 50;
  const hasImage = course.image && course.image.length > 0;
  const hasPrice = course.price !== undefined && course.price >= 0;
  
  const completionChecks = [
    { name: 'Conteúdo', completed: hasContent, weight: 40 },
    { name: 'Descrição', completed: hasDescription, weight: 20 },
    { name: 'Imagem', completed: hasImage, weight: 20 },
    { name: 'Preço', completed: hasPrice, weight: 20 },
  ];
  
  const completionScore = completionChecks.reduce((score, check) => 
    score + (check.completed ? check.weight : 0), 0
  );
  
  return {
    completionScore,
    completionPercentage: completionScore,
    checks: completionChecks,
    canPublish: completionScore >= 80,
    missingRequirements: completionChecks
      .filter(check => !check.completed)
      .map(check => check.name),
  };
};

export const formatCoursePrice = (price: number, currency: string = 'USD'): string => {
  if (price === 0) return 'Gratuito';
  
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'BRL',
  });
  
  return formatter.format(price);
};

export const calculateEstimatedRevenue = (course: TeacherVideoCourse): number => {
  const enrollments = course.enrollments || 0;
  const price = course.price || 0;
  return enrollments * price;
};

// Section management utilities
export const validateSectionOrder = (sections: VideoSection[]): boolean => {
  const orders = sections.map(section => section.order).sort((a, b) => a - b);
  return orders.every((order, index) => order === index + 1);
};

export const reorderSections = (sections: VideoSection[]): VideoSection[] => {
  return sections
    .sort((a, b) => a.order - b.order)
    .map((section, index) => ({ ...section, order: index + 1 }));
};

export const getNextSectionOrder = (sections: VideoSection[]): number => {
  if (sections.length === 0) return 1;
  return Math.max(...sections.map(section => section.order)) + 1;
};

export const calculateSectionDuration = (section: VideoSection): number => {
  if (!section.chapters) return 0;
  return section.chapters.reduce((total, chapter) => total + (chapter.duration || 0), 0);
};

export const formatSectionSummary = (section: VideoSection): string => {
  const chapterCount = section.chapters?.length || 0;
  const duration = calculateSectionDuration(section);
  const formattedDuration = formatDuration(Math.ceil(duration / 60));
  
  return `${chapterCount} aula${chapterCount !== 1 ? 's' : ''} • ${formattedDuration}`;
};

// Chapter management utilities
export const validateChapterOrder = (chapters: VideoChapter[]): boolean => {
  const orders = chapters.map(chapter => chapter.order).sort((a, b) => a - b);
  return orders.every((order, index) => order === index + 1);
};

export const reorderChapters = (chapters: VideoChapter[]): VideoChapter[] => {
  return chapters
    .sort((a, b) => a.order - b.order)
    .map((chapter, index) => ({ ...chapter, order: index + 1 }));
};

export const getNextChapterOrder = (chapters: VideoChapter[]): number => {
  if (chapters.length === 0) return 1;
  return Math.max(...chapters.map(chapter => chapter.order)) + 1;
};

export const getChapterTypeIcon = (type: string): string => {
  const typeIcons = {
    'video': '🎥',
    'text': '📄',
    'quiz': '❓',
    'exercise': '✏️',
  };
  return typeIcons[type as keyof typeof typeIcons] || '📋';
};

export const getChapterTypeName = (type: string): string => {
  const typeNames = {
    'video': 'Vídeo',
    'text': 'Texto',
    'quiz': 'Quiz',
    'exercise': 'Exercício',
  };
  return typeNames[type as keyof typeof typeNames] || capitalizeFirst(type);
};

export const formatChapterDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes}min`;
  return `${minutes}min ${remainingSeconds}s`;
};

export const validateChapterContent = (chapter: VideoChapter): string[] => {
  const errors: string[] = [];
  
  if (!chapter.title.trim()) {
    errors.push('Capítulo deve ter um título');
  }
  
  if (chapter.type === 'video' && !chapter.videoUrl) {
    errors.push('Capítulo de vídeo deve ter uma URL de vídeo');
  }
  
  if (chapter.type === 'text' && !chapter.content) {
    errors.push('Capítulo de texto deve ter conteúdo');
  }
  
  if (chapter.type === 'quiz' && (!chapter.quiz_questions || chapter.quiz_questions.length === 0)) {
    errors.push('Capítulo de quiz deve ter pelo menos uma pergunta');
  }
  
  return errors;
};

// Analytics utilities
export const formatAnalyticsData = (analytics: CourseAnalytics) => {
  return {
    students: {
      total: analytics.totalStudents,
      active: analytics.activeStudents,
      activePercentage: analytics.totalStudents > 0 
        ? Math.round((analytics.activeStudents / analytics.totalStudents) * 100)
        : 0,
    },
    engagement: {
      completionRate: analytics.completionRate,
      formattedCompletion: formatPercentage(analytics.completionRate, 1),
      averageProgress: analytics.averageProgress,
      formattedProgress: formatPercentage(analytics.averageProgress, 1),
      sessionTime: analytics.averageSessionTime,
      formattedSessionTime: formatDuration(analytics.averageSessionTime),
    },
    revenue: {
      total: analytics.totalRevenue || 0,
      formatted: formatCoursePrice(analytics.totalRevenue || 0),
      perStudent: analytics.totalStudents > 0 
        ? (analytics.totalRevenue || 0) / analytics.totalStudents
        : 0,
    },
    rating: {
      average: analytics.averageRating || 0,
      formatted: (analytics.averageRating || 0).toFixed(1),
      color: (analytics.averageRating || 0) >= 4 ? 'text-green-600' :
             (analytics.averageRating || 0) >= 3 ? 'text-yellow-600' : 'text-red-600',
    },
  };
};

export const generateEngagementInsights = (analytics: CourseAnalytics): string[] => {
  const insights: string[] = [];
  
  if (analytics.completionRate < 30) {
    insights.push('Taxa de conclusão baixa. Considere revisar o conteúdo inicial.');
  }
  
  if (analytics.averageSessionTime < 10) {
    insights.push('Tempo de sessão baixo. Tente criar conteúdo mais envolvente.');
  }
  
  if (analytics.activeStudents / analytics.totalStudents < 0.5) {
    insights.push('Muitos estudantes inativos. Considere estratégias de reengajamento.');
  }
  
  if ((analytics.averageRating || 0) < 3.5) {
    insights.push('Avaliação baixa. Verifique o feedback dos estudantes.');
  }
  
  if (insights.length === 0) {
    insights.push('Seu curso está com boa performance! Continue assim.');
  }
  
  return insights;
};

// Course template utilities
export const generateCourseFromTemplate = (template: string, title: string, description: string): Partial<TeacherVideoCourse> => {
  const baseConfig = {
    title,
    description,
    type: 'video' as const,
    status: 'Draft' as const,
    level: 'Beginner' as const,
    price: 0,
  };
  
  switch (template) {
    case 'programming':
      return {
        ...baseConfig,
        category: 'programming',
        sections: [
          {
            id: 'temp-1',
            course: '',
            title: 'Introdução',
            description: 'Conceitos básicos e configuração do ambiente',
            order: 1,
            chapters: [
              {
                id: 'temp-ch-1',
                section: 'temp-1',
                title: 'Bem-vindo ao curso',
                type: 'video',
                order: 1,
                freePreview: true,
              }
            ],
          }
        ],
      };
      
    case 'language':
      return {
        ...baseConfig,
        category: 'language',
        sections: [
          {
            id: 'temp-1',
            course: '',
            title: 'Fundamentos',
            description: 'Primeiros passos no idioma',
            order: 1,
            chapters: [
              {
                id: 'temp-ch-1',
                section: 'temp-1',
                title: 'Alfabeto e pronúncia',
                type: 'video',
                order: 1,
                freePreview: true,
              }
            ],
          }
        ],
      };
      
    case 'business':
      return {
        ...baseConfig,
        category: 'business',
        level: 'Intermediate',
        sections: [
          {
            id: 'temp-1',
            course: '',
            title: 'Estratégias Básicas',
            description: 'Fundamentos para o sucesso empresarial',
            order: 1,
            chapters: [
              {
                id: 'temp-ch-1',
                section: 'temp-1',
                title: 'Visão geral do mercado',
                type: 'video',
                order: 1,
                freePreview: true,
              }
            ],
          }
        ],
      };
      
    default:
      return baseConfig;
  }
};

// Export utilities
export const generateCourseExport = (course: TeacherVideoCourse) => {
  const stats = getCourseStatistics(course);
  
  return {
    course: {
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      created_at: course.created_at,
    },
    statistics: stats,
    structure: course.sections?.map(section => ({
      title: section.title,
      duration: calculateSectionDuration(section),
      chapters: section.chapters?.map(chapter => ({
        title: chapter.title,
        type: chapter.type,
        duration: chapter.duration,
        freePreview: chapter.freePreview,
      })) || [],
    })) || [],
  };
};