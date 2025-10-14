/**
 * Student Video Courses Utils
 * Utility functions specific to student video course learning
 */

import { 
  StudentVideoCourse, 
  CourseEnrollment, 
  StudentCourseProgress,
  ChapterQuiz,
  QuizAttempt,
  CourseReview 
} from '../types';
import { formatDuration, formatPercentage, getRelativeTime } from '../../../shared/utils';

// Course discovery utilities
export const formatCoursePrice = (price: number, currency: string = 'USD'): string => {
  if (price === 0) return 'Gratuito';
  
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'BRL',
  });
  
  return formatter.format(price);
};

export const formatCourseLevel = (level: string): string => {
  const levelMap = {
    'Beginner': 'Iniciante',
    'Intermediate': 'Intermediário',
    'Advanced': 'Avançado',
  };
  return levelMap[level as keyof typeof levelMap] || level;
};

export const getCourseRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-blue-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 3.0) return 'text-orange-600';
  return 'text-red-600';
};

export const formatCourseRating = (rating: number, reviewCount: number): string => {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  return `${stars} ${rating.toFixed(1)} (${reviewCount} avaliações)`;
};

export const calculateCourseDuration = (course: StudentVideoCourse): number => {
  if (!course.sections) return 0;
  
  return course.sections.reduce((total, section) => {
    return total + (section.chapters.reduce((sectionTotal, chapter) => {
      return sectionTotal + (chapter.duration || 0);
    }, 0));
  }, 0);
};

export const formatCourseDuration = (course: StudentVideoCourse): string => {
  const totalSeconds = calculateCourseDuration(course);
  const totalMinutes = Math.ceil(totalSeconds / 60);
  return formatDuration(totalMinutes);
};

export const getCourseCompletionBadge = (course: StudentVideoCourse) => {
  if (!course.progress) return null;
  
  const completion = course.progress.completion_percentage;
  
  if (completion === 100) {
    return { text: 'Concluído', color: 'bg-green-100 text-green-800', icon: '✅' };
  }
  if (completion >= 75) {
    return { text: 'Quase lá', color: 'bg-blue-100 text-blue-800', icon: '🎯' };
  }
  if (completion >= 25) {
    return { text: 'Em progresso', color: 'bg-yellow-100 text-yellow-800', icon: '📚' };
  }
  if (completion > 0) {
    return { text: 'Iniciado', color: 'bg-orange-100 text-orange-800', icon: '🚀' };
  }
  
  return { text: 'Não iniciado', color: 'bg-gray-100 text-gray-800', icon: '⭐' };
};

// Progress tracking utilities
export const calculateProgressPercentage = (progress: StudentCourseProgress): number => {
  return Math.round(progress.completion_percentage);
};

export const formatProgressText = (progress: StudentCourseProgress): string => {
  const percentage = calculateProgressPercentage(progress);
  const completedChapters = progress.completed_chapters;
  const totalChapters = progress.total_chapters;
  
  return `${percentage}% concluído (${completedChapters}/${totalChapters} aulas)`;
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600 bg-green-100';
  if (percentage >= 70) return 'text-blue-600 bg-blue-100';
  if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
  if (percentage > 0) return 'text-orange-600 bg-orange-100';
  return 'text-gray-600 bg-gray-100';
};

export const calculateTimeToComplete = (progress: StudentCourseProgress, course: StudentVideoCourse): string => {
  const remainingChapters = progress.total_chapters - progress.completed_chapters;
  const avgChapterDuration = calculateCourseDuration(course) / progress.total_chapters;
  const remainingMinutes = Math.ceil((remainingChapters * avgChapterDuration) / 60);
  
  if (remainingMinutes === 0) return 'Curso concluído';
  return `~${formatDuration(remainingMinutes)} restantes`;
};

export const getNextChapterRecommendation = (progress: StudentCourseProgress, course: StudentVideoCourse) => {
  if (!course.sections || progress.completion_percentage === 100) return null;
  
  for (const section of course.sections) {
    for (const chapter of section.chapters) {
      if (!chapter.completed) {
        return {
          sectionTitle: section.title,
          chapterTitle: chapter.title,
          chapterId: chapter.id,
          sectionId: section.id,
          estimatedTime: chapter.duration ? Math.ceil(chapter.duration / 60) : 15,
        };
      }
    }
  }
  
  return null;
};

// Enrollment utilities
export const getEnrollmentStatus = (enrollment: CourseEnrollment): string => {
  if (enrollment.completed_at) return 'Concluído';
  if (enrollment.completion_percentage >= 75) return 'Quase concluído';
  if (enrollment.completion_percentage > 0) return 'Em progresso';
  return 'Não iniciado';
};

export const getEnrollmentStatusColor = (enrollment: CourseEnrollment): string => {
  if (enrollment.completed_at) return 'text-green-600 bg-green-100';
  if (enrollment.completion_percentage >= 75) return 'text-blue-600 bg-blue-100';
  if (enrollment.completion_percentage > 0) return 'text-yellow-600 bg-yellow-100';
  return 'text-gray-600 bg-gray-100';
};

export const formatEnrollmentDate = (enrollment: CourseEnrollment): string => {
  return `Matriculado em ${getRelativeTime(enrollment.enrolled_at)}`;
};

export const isEnrollmentActive = (enrollment: CourseEnrollment): boolean => {
  if (!enrollment.access_expires_at) return true;
  return new Date(enrollment.access_expires_at) > new Date();
};

// Video chapter utilities
export const formatChapterDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes}min`;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getChapterIcon = (type: string): string => {
  const typeIcons = {
    'video': '🎥',
    'text': '📄',
    'quiz': '❓',
    'exercise': '✏️',
    'resource': '📎',
  };
  return typeIcons[type as keyof typeof typeIcons] || '📋';
};

export const getChapterStatusIcon = (chapter: any): string => {
  if (chapter.completed) return '✅';
  if (chapter.progress?.completion_percentage > 0) return '▶️';
  if (chapter.is_locked) return '🔒';
  return '⭕';
};

export const calculateVideoProgress = (watchedDuration: number, totalDuration: number): number => {
  if (totalDuration === 0) return 0;
  return Math.min((watchedDuration / totalDuration) * 100, 100);
};

export const formatVideoProgress = (watchedDuration: number, totalDuration: number): string => {
  const percentage = calculateVideoProgress(watchedDuration, totalDuration);
  return `${formatChapterDuration(watchedDuration)} / ${formatChapterDuration(totalDuration)} (${Math.round(percentage)}%)`;
};

// Quiz utilities
export const calculateQuizScore = (attempt: QuizAttempt): number => {
  return Math.round((attempt.score / attempt.total_points) * 100);
};

export const getQuizGrade = (score: number): { grade: string; color: string } => {
  if (score >= 90) return { grade: 'A', color: 'text-green-600 bg-green-100' };
  if (score >= 80) return { grade: 'B', color: 'text-blue-600 bg-blue-100' };
  if (score >= 70) return { grade: 'C', color: 'text-yellow-600 bg-yellow-100' };
  if (score >= 60) return { grade: 'D', color: 'text-orange-600 bg-orange-100' };
  return { grade: 'F', color: 'text-red-600 bg-red-100' };
};

export const formatQuizResult = (attempt: QuizAttempt, passingScore: number): string => {
  const score = calculateQuizScore(attempt);
  const passed = attempt.passed;
  
  if (passed) {
    return `Aprovado! ${score}% (${attempt.score}/${attempt.total_points} pontos)`;
  } else {
    return `Reprovado. ${score}% (necessário ${passingScore}%)`;
  }
};

export const getQuizAttemptsRemaining = (quiz: ChapterQuiz, userAttempts: QuizAttempt[]): number => {
  return Math.max(0, quiz.attempts_allowed - userAttempts.length);
};

export const canRetakeQuiz = (quiz: ChapterQuiz, userAttempts: QuizAttempt[]): boolean => {
  return getQuizAttemptsRemaining(quiz, userAttempts) > 0;
};

export const getBestQuizAttempt = (attempts: QuizAttempt[]): QuizAttempt | null => {
  if (attempts.length === 0) return null;
  return attempts.reduce((best, current) => 
    current.score > best.score ? current : best
  );
};

// Review utilities
export const formatReviewDate = (review: CourseReview): string => {
  return getRelativeTime(review.created_at);
};

export const getReviewHelpfulnessText = (helpfulCount: number): string => {
  if (helpfulCount === 0) return 'Nenhuma avaliação de utilidade';
  if (helpfulCount === 1) return '1 pessoa achou útil';
  return `${helpfulCount} pessoas acharam útil`;
};

export const formatReviewRating = (rating: number): string => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

export const groupReviewsByRating = (reviews: CourseReview[]) => {
  return reviews.reduce((groups, review) => {
    const rating = review.rating;
    return {
      ...groups,
      [rating]: [...(groups[rating] || []), review],
    };
  }, {} as Record<number, CourseReview[]>);
};

export const calculateAverageRating = (reviews: CourseReview[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
};

// Certificate utilities
export const formatCertificateDate = (issuedAt: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(issuedAt));
};

export const getCertificateValidityText = (isVerified: boolean): string => {
  return isVerified ? 'Certificado verificado' : 'Certificado não verificado';
};

export const generateCertificateShareText = (courseTitle: string, instructorName: string): string => {
  return `Acabei de concluir o curso "${courseTitle}" com ${instructorName}! 🎓 #educação #aprendizado`;
};

// Learning analytics utilities
export const formatLearningStats = (watchTime: number, sessionCount: number): string => {
  const avgSessionTime = sessionCount > 0 ? watchTime / sessionCount : 0;
  return `${formatDuration(watchTime)} em ${sessionCount} sessões (média: ${formatDuration(avgSessionTime)}/sessão)`;
};

export const calculateLearningVelocity = (enrollmentDate: string, completion: number): string => {
  const daysSinceEnrollment = Math.floor(
    (Date.now() - new Date(enrollmentDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceEnrollment === 0) return 'Começou hoje';
  
  const progressPerDay = completion / daysSinceEnrollment;
  const daysToComplete = Math.ceil((100 - completion) / progressPerDay);
  
  if (completion === 100) return 'Curso concluído';
  if (daysToComplete <= 0) return 'Progresso irregular';
  
  return `${daysToComplete} dias estimados para conclusão`;
};

export const getLearningRecommendation = (progress: StudentCourseProgress): string => {
  const { completion_percentage, streak_days, total_watch_time } = progress;
  
  if (completion_percentage === 100) {
    return 'Parabéns! Considere deixar uma avaliação do curso.';
  }
  
  if (completion_percentage >= 80) {
    return 'Você está quase lá! Termine forte para obter seu certificado.';
  }
  
  if (streak_days >= 7) {
    return 'Excelente consistência! Continue com esse ritmo.';
  }
  
  if (total_watch_time < 60) {
    return 'Dedique pelo menos 1 hora por dia para acelerar seu progresso.';
  }
  
  if (completion_percentage < 20) {
    return 'Estabeleça uma rotina de estudos para manter o momentum.';
  }
  
  return 'Continue estudando consistentemente para alcançar seus objetivos.';
};

// Course filtering and search utilities
export const filterCoursesByLevel = (courses: StudentVideoCourse[], level: string): StudentVideoCourse[] => {
  if (level === 'all') return courses;
  return courses.filter(course => course.level === level);
};

export const filterCoursesByPrice = (courses: StudentVideoCourse[], priceRange: string): StudentVideoCourse[] => {
  switch (priceRange) {
    case 'free':
      return courses.filter(course => course.price === 0);
    case 'paid':
      return courses.filter(course => course.price > 0);
    case 'under-50':
      return courses.filter(course => course.price > 0 && course.price < 50);
    case 'under-100':
      return courses.filter(course => course.price > 0 && course.price < 100);
    default:
      return courses;
  }
};

export const sortCoursesByRelevance = (courses: StudentVideoCourse[], searchTerm: string): StudentVideoCourse[] => {
  if (!searchTerm) return courses;
  
  return courses.sort((a, b) => {
    const aScore = getRelevanceScore(a, searchTerm);
    const bScore = getRelevanceScore(b, searchTerm);
    return bScore - aScore;
  });
};

const getRelevanceScore = (course: StudentVideoCourse, searchTerm: string): number => {
  const term = searchTerm.toLowerCase();
  let score = 0;
  
  // Title match (highest weight)
  if (course.title.toLowerCase().includes(term)) score += 10;
  
  // Description match
  if (course.description?.toLowerCase().includes(term)) score += 5;
  
  // Category match
  if (course.category?.toLowerCase().includes(term)) score += 3;
  
  // Tags match
  if (course.tags?.some(tag => tag.toLowerCase().includes(term))) score += 2;
  
  // Instructor match
  if (course.instructor_name?.toLowerCase().includes(term)) score += 1;
  
  return score;
};