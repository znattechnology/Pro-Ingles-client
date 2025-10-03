/**
 * Teacher Practice Courses Utils
 * Utility functions specific to teacher practice course management
 */

import { 
  TeacherPracticeCourse, 
  PracticeUnit, 
  PracticeLesson, 
  PracticeChallenge,
  PracticeAnalytics 
} from '../types';
import { formatDuration, formatPercentage, capitalizeFirst } from '../../../shared/utils';

// Course management utilities
export const calculateCourseProgress = (course: TeacherPracticeCourse): number => {
  if (!course.units || course.units.length === 0) return 0;
  
  const totalLessons = course.units.reduce((sum, unit) => 
    sum + (unit.lessons?.length || 0), 0
  );
  
  const completedLessons = course.units.reduce((sum, unit) => 
    sum + (unit.lessons?.filter(lesson => lesson.completed_challenges === lesson.challenges?.length).length || 0), 0
  );
  
  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
};

export const getCourseStatistics = (course: TeacherPracticeCourse) => {
  const units = course.units || [];
  const totalUnits = units.length;
  const totalLessons = units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);
  const totalChallenges = units.reduce((sum, unit) => 
    sum + (unit.lessons?.reduce((lessonSum, lesson) => 
      lessonSum + (lesson.challenges?.length || 0), 0) || 0), 0
  );
  
  return {
    totalUnits,
    totalLessons,
    totalChallenges,
    estimatedDuration: totalLessons * 15, // 15 minutes per lesson average
    completionRate: calculateCourseProgress(course),
  };
};

export const formatCourseLevel = (level: string): string => {
  const levelMap = {
    'Beginner': 'Iniciante',
    'Intermediate': 'Intermediário',
    'Advanced': 'Avançado',
  };
  return levelMap[level as keyof typeof levelMap] || capitalizeFirst(level);
};

export const getCourseStatusBadge = (status: string) => {
  switch (status) {
    case 'Draft':
      return { text: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: '📝' };
    case 'Published':
      return { text: 'Publicado', color: 'bg-green-100 text-green-800', icon: '✅' };
    case 'Archived':
      return { text: 'Arquivado', color: 'bg-red-100 text-red-800', icon: '📦' };
    default:
      return { text: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
  }
};

// Unit management utilities
export const validateUnitOrder = (units: PracticeUnit[]): boolean => {
  const orders = units.map(unit => unit.order).sort((a, b) => a - b);
  return orders.every((order, index) => order === index + 1);
};

export const reorderUnits = (units: PracticeUnit[]): PracticeUnit[] => {
  return units
    .sort((a, b) => a.order - b.order)
    .map((unit, index) => ({ ...unit, order: index + 1 }));
};

export const getNextUnitOrder = (units: PracticeUnit[]): number => {
  if (units.length === 0) return 1;
  return Math.max(...units.map(unit => unit.order)) + 1;
};

// Lesson management utilities
export const validateLessonOrder = (lessons: PracticeLesson[]): boolean => {
  const orders = lessons.map(lesson => lesson.order).sort((a, b) => a - b);
  return orders.every((order, index) => order === index + 1);
};

export const reorderLessons = (lessons: PracticeLesson[]): PracticeLesson[] => {
  return lessons
    .sort((a, b) => a.order - b.order)
    .map((lesson, index) => ({ ...lesson, order: index + 1 }));
};

export const getNextLessonOrder = (lessons: PracticeLesson[]): number => {
  if (lessons.length === 0) return 1;
  return Math.max(...lessons.map(lesson => lesson.order)) + 1;
};

export const calculateLessonDifficulty = (challenges: PracticeChallenge[]): 'easy' | 'medium' | 'hard' => {
  if (challenges.length === 0) return 'easy';
  
  const complexityScore = challenges.reduce((score, challenge) => {
    let challengeScore = 1;
    
    // Add complexity based on challenge type
    if (challenge.type === 'TRANSLATE') challengeScore += 2;
    if (challenge.type === 'ASSIST') challengeScore += 1;
    
    // Add complexity based on options count
    if (challenge.options && challenge.options.length > 4) challengeScore += 1;
    
    // Add complexity based on time limit
    if (challenge.time_limit && challenge.time_limit < 30) challengeScore += 1;
    
    return score + challengeScore;
  }, 0);
  
  const averageComplexity = complexityScore / challenges.length;
  
  if (averageComplexity <= 2) return 'easy';
  if (averageComplexity <= 4) return 'medium';
  return 'hard';
};

// Challenge management utilities
export const validateChallengeOptions = (challenge: PracticeChallenge): string[] => {
  const errors: string[] = [];
  
  if (!challenge.options || challenge.options.length < 2) {
    errors.push('Challenge deve ter pelo menos 2 opções');
  }
  
  if (challenge.options) {
    const correctOptions = challenge.options.filter(option => option.is_correct);
    if (correctOptions.length === 0) {
      errors.push('Challenge deve ter pelo menos uma opção correta');
    }
    
    if (challenge.type === 'SELECT' && correctOptions.length > 1) {
      errors.push('Challenge do tipo SELECT deve ter apenas uma opção correta');
    }
  }
  
  if (!challenge.question.trim()) {
    errors.push('Challenge deve ter uma pergunta');
  }
  
  return errors;
};

export const generateChallengePreview = (challenge: PracticeChallenge): string => {
  const typeLabel = {
    'SELECT': 'Seleção',
    'ASSIST': 'Assistência',
    'TRANSLATE': 'Tradução',
  }[challenge.type] || challenge.type;
  
  const optionsCount = challenge.options?.length || 0;
  return `${typeLabel} - ${challenge.question.slice(0, 50)}... (${optionsCount} opções)`;
};

// Analytics utilities
export const formatAnalyticsData = (analytics: PracticeAnalytics) => {
  return {
    students: {
      total: analytics.total_students,
      label: `${analytics.total_students} estudante${analytics.total_students !== 1 ? 's' : ''}`,
    },
    courses: {
      total: analytics.total_courses,
      label: `${analytics.total_courses} curso${analytics.total_courses !== 1 ? 's' : ''}`,
    },
    challenges: {
      total: analytics.total_challenges,
      label: `${analytics.total_challenges} desafio${analytics.total_challenges !== 1 ? 's' : ''}`,
    },
    completion: {
      rate: analytics.avg_completion_rate,
      formatted: formatPercentage(analytics.avg_completion_rate, 1),
      color: analytics.avg_completion_rate >= 70 ? 'text-green-600' : 
             analytics.avg_completion_rate >= 50 ? 'text-yellow-600' : 'text-red-600',
    },
  };
};

// Course template utilities
export const generateCourseFromTemplate = (template: string, title: string, description: string): Partial<TeacherPracticeCourse> => {
  const baseConfig = {
    title,
    description,
    course_type: 'practice' as const,
    status: 'Draft' as const,
    level: 'Beginner' as const,
  };
  
  switch (template) {
    case 'vocabulary':
      return {
        ...baseConfig,
        category: 'vocabulary',
        units: [
          {
            id: 'temp-1',
            course: '',
            title: 'Vocabulário Básico',
            description: 'Aprenda palavras essenciais do dia a dia',
            order: 1,
          }
        ],
      };
      
    case 'grammar':
      return {
        ...baseConfig,
        category: 'grammar',
        units: [
          {
            id: 'temp-1',
            course: '',
            title: 'Estruturas Básicas',
            description: 'Fundamentos da gramática inglesa',
            order: 1,
          }
        ],
      };
      
    case 'conversation':
      return {
        ...baseConfig,
        category: 'conversation',
        level: 'Intermediate',
        units: [
          {
            id: 'temp-1',
            course: '',
            title: 'Diálogos Cotidianos',
            description: 'Pratique conversas do dia a dia',
            order: 1,
          }
        ],
      };
      
    default:
      return baseConfig;
  }
};

// Export utilities
export const generateCourseExport = (course: TeacherPracticeCourse) => {
  return {
    course: {
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      created_at: course.created_at,
    },
    statistics: getCourseStatistics(course),
    structure: course.units?.map(unit => ({
      title: unit.title,
      lessons: unit.lessons?.map(lesson => ({
        title: lesson.title,
        challenges: lesson.challenges?.length || 0,
        difficulty: lesson.difficulty_level,
      })) || [],
    })) || [],
  };
};