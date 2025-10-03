/**
 * Student Practice Courses Utils
 * Utility functions specific to student practice course learning
 */

import { 
  StudentPracticeCourse, 
  StudentUserProgress, 
  StudentAchievement,
  StudentAnalytics,
  ChallengeResult,
  StudyStreak 
} from '../types';
import { formatDuration, formatPercentage, formatPoints } from '../../../shared/utils';

// Progress tracking utilities
export const calculateOverallProgress = (progress: StudentUserProgress): number => {
  if (!progress.active_course) return 0;
  return progress.current_course_progress || 0;
};

export const formatProgressText = (percentage: number): string => {
  if (percentage === 0) return 'Não iniciado';
  if (percentage === 100) return 'Concluído';
  return `${Math.round(percentage)}% concluído`;
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600 bg-green-100';
  if (percentage >= 70) return 'text-blue-600 bg-blue-100';
  if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
  if (percentage > 0) return 'text-orange-600 bg-orange-100';
  return 'text-gray-600 bg-gray-100';
};

export const calculateNextLevelXP = (currentLevel: number): number => {
  // XP needed grows exponentially: level^2 * 100
  return Math.pow(currentLevel, 2) * 100;
};

export const getXPToNextLevel = (currentXP: number, currentLevel: number): number => {
  const totalXPForNextLevel = calculateNextLevelXP(currentLevel + 1);
  const totalXPForCurrentLevel = calculateNextLevelXP(currentLevel);
  return totalXPForNextLevel - currentXP;
};

export const calculateLevelFromXP = (totalXP: number): number => {
  // Reverse calculation: find level from total XP
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXP) {
    level++;
    xpNeeded = calculateNextLevelXP(level);
  }
  
  return level - 1;
};

// Hearts system utilities
export const getHeartColor = (hearts: number, maxHearts: number = 5): string => {
  const percentage = (hearts / maxHearts) * 100;
  if (percentage >= 80) return 'text-red-500';
  if (percentage >= 40) return 'text-orange-500';
  return 'text-gray-400';
};

export const formatHeartRefillTime = (refillTime: string): string => {
  const refillDate = new Date(refillTime);
  const now = new Date();
  const diffMinutes = Math.ceil((refillDate.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffMinutes <= 0) return 'Disponível agora';
  if (diffMinutes < 60) return `${diffMinutes} min`;
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes}min`;
};

export const canUseHeart = (hearts: number): boolean => {
  return hearts > 0;
};

export const getHeartWarningMessage = (hearts: number): string | null => {
  if (hearts === 0) return 'Sem corações! Aguarde ou compre mais para continuar.';
  if (hearts === 1) return 'Último coração! Cuidado com os erros.';
  return null;
};

// Achievement utilities
export const groupAchievementsByCategory = (achievements: StudentAchievement[]) => {
  return achievements.reduce((groups, achievement) => {
    const category = achievement.category;
    return {
      ...groups,
      [category]: [...(groups[category] || []), achievement],
    };
  }, {} as Record<string, StudentAchievement[]>);
};

export const getAchievementProgress = (achievement: StudentAchievement): number => {
  if (!achievement.progress) return achievement.earned_at ? 100 : 0;
  return Math.round((achievement.progress.current / achievement.progress.target) * 100);
};

export const getAchievementRarityColor = (rarity: string): string => {
  const rarityColors = {
    'common': 'bg-gray-100 text-gray-800 border-gray-300',
    'rare': 'bg-blue-100 text-blue-800 border-blue-300',
    'epic': 'bg-purple-100 text-purple-800 border-purple-300',
    'legendary': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };
  return rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common;
};

export const getAchievementCategoryIcon = (category: string): string => {
  const categoryIcons = {
    'learning': '📚',
    'streak': '🔥',
    'completion': '✅',
    'accuracy': '🎯',
    'speed': '⚡',
  };
  return categoryIcons[category as keyof typeof categoryIcons] || '🏆';
};

// Challenge utilities
export const formatChallengeResult = (result: ChallengeResult): string => {
  if (result.correct) {
    const bonus = result.streak_bonus ? ` (+${result.streak_bonus} bônus)` : '';
    return `Correto! +${result.pointsEarned} pontos${bonus}`;
  } else {
    return `Incorreto. -${result.heartsUsed} coração${result.heartsUsed !== 1 ? 'ões' : ''}`;
  }
};

export const getChallengeResultColor = (result: ChallengeResult): string => {
  return result.correct ? 'text-green-600' : 'text-red-600';
};

export const getPerformanceFeedback = (result: ChallengeResult): string => {
  if (!result.performance_feedback) return '';
  
  const { speed, accuracy } = result.performance_feedback;
  let feedback = '';
  
  if (speed === 'fast') feedback += 'Resposta rápida! ';
  if (speed === 'slow') feedback += 'Tente ser mais rápido. ';
  if (accuracy === 'high') feedback += 'Excelente precisão! ';
  if (accuracy === 'low') feedback += 'Pratique mais para melhorar. ';
  
  return feedback.trim();
};

// Study streak utilities
export const formatStreakText = (streak: StudyStreak): string => {
  if (streak.current_streak === 0) return 'Comece sua sequência hoje!';
  if (streak.current_streak === 1) return '1 dia de sequência';
  return `${streak.current_streak} dias de sequência`;
};

export const getStreakIcon = (currentStreak: number): string => {
  if (currentStreak === 0) return '💤';
  if (currentStreak < 7) return '🔥';
  if (currentStreak < 30) return '🚀';
  if (currentStreak < 100) return '⭐';
  return '👑';
};

export const getStreakColor = (currentStreak: number): string => {
  if (currentStreak === 0) return 'text-gray-500';
  if (currentStreak < 7) return 'text-orange-500';
  if (currentStreak < 30) return 'text-blue-500';
  if (currentStreak < 100) return 'text-purple-500';
  return 'text-yellow-500';
};

export const getStreakEncouragement = (currentStreak: number): string => {
  if (currentStreak === 0) return 'Comece estudando hoje!';
  if (currentStreak < 7) return 'Continue assim! Você está no caminho certo.';
  if (currentStreak < 30) return 'Impressionante! Mantenha o ritmo.';
  if (currentStreak < 100) return 'Você é dedicado! Continue brilhando.';
  return 'Lendário! Você é um verdadeiro campeão.';
};

// Analytics utilities
export const formatAnalyticsData = (analytics: StudentAnalytics) => {
  return {
    learningTime: {
      today: formatDuration(analytics.learning_time.today),
      thisWeek: formatDuration(analytics.learning_time.this_week),
      thisMonth: formatDuration(analytics.learning_time.this_month),
      averageDaily: formatDuration(analytics.learning_time.average_daily),
      totalAllTime: formatDuration(analytics.learning_time.total_all_time),
    },
    accuracy: {
      overall: formatPercentage(analytics.accuracy.overall, 1),
      trend: analytics.accuracy.trend,
      trendIcon: {
        'improving': '📈',
        'declining': '📉',
        'stable': '➡️',
      }[analytics.accuracy.trend] || '➡️',
      trendColor: {
        'improving': 'text-green-600',
        'declining': 'text-red-600',
        'stable': 'text-blue-600',
      }[analytics.accuracy.trend] || 'text-blue-600',
    },
    progress: {
      coursesCompleted: analytics.progress.courses_completed,
      lessonsCompleted: analytics.progress.lessons_completed,
      challengesCompleted: analytics.progress.challenges_completed,
      pointsEarned: formatPoints(analytics.progress.points_earned),
      currentLevel: analytics.progress.current_level,
      xpToNextLevel: analytics.progress.xp_to_next_level,
    },
    goals: {
      dailyCompletion: formatPercentage(analytics.goals.completion_rate, 0),
      weeklyTarget: analytics.goals.weekly_target,
      streakGoal: analytics.goals.streak_goal,
    },
  };
};

export const generateLearningInsights = (analytics: StudentAnalytics): string[] => {
  const insights: string[] = [];
  
  if (analytics.accuracy.overall >= 85) {
    insights.push('Excelente precisão! Você está dominando o conteúdo.');
  } else if (analytics.accuracy.overall < 60) {
    insights.push('Considere revisar o conteúdo básico para melhorar sua precisão.');
  }
  
  if (analytics.learning_time.average_daily < 15) {
    insights.push('Tente estudar um pouco mais diariamente para acelerar seu progresso.');
  } else if (analytics.learning_time.average_daily > 60) {
    insights.push('Ótima dedicação! Lembre-se de fazer pausas regulares.');
  }
  
  if (analytics.accuracy.trend === 'improving') {
    insights.push('Seu desempenho está melhorando constantemente. Continue assim!');
  } else if (analytics.accuracy.trend === 'declining') {
    insights.push('Seu desempenho está caindo. Considere revisar tópicos anteriores.');
  }
  
  if (analytics.goals.completion_rate >= 90) {
    insights.push('Parabéns! Você está cumprindo suas metas consistentemente.');
  } else if (analytics.goals.completion_rate < 50) {
    insights.push('Considere ajustar suas metas para torná-las mais alcançáveis.');
  }
  
  return insights;
};

// Course recommendation utilities
export const filterCoursesByLevel = (courses: StudentPracticeCourse[], userLevel: number): StudentPracticeCourse[] => {
  return courses.filter(course => {
    if (userLevel <= 5) return course.level === 'Beginner';
    if (userLevel <= 15) return course.level === 'Intermediate';
    return course.level === 'Advanced';
  });
};

export const sortCoursesByRecommendation = (courses: StudentPracticeCourse[], userProgress: StudentUserProgress): StudentPracticeCourse[] => {
  return courses.sort((a, b) => {
    // Prioritize courses with user progress
    const aHasProgress = a.user_progress && a.user_progress.percentage! > 0;
    const bHasProgress = b.user_progress && b.user_progress.percentage! > 0;
    
    if (aHasProgress && !bHasProgress) return -1;
    if (!aHasProgress && bHasProgress) return 1;
    
    // Then sort by difficulty rating
    const aDifficulty = a.difficulty_rating || 0;
    const bDifficulty = b.difficulty_rating || 0;
    
    return aDifficulty - bDifficulty;
  });
};

// Goal tracking utilities
export const calculateDailyGoalProgress = (timeStudiedToday: number, dailyGoal: number): number => {
  return Math.min((timeStudiedToday / dailyGoal) * 100, 100);
};

export const getGoalAchievementMessage = (progress: number): string => {
  if (progress >= 100) return 'Meta diária alcançada! Parabéns! 🎉';
  if (progress >= 75) return 'Quase lá! Continue estudando. 💪';
  if (progress >= 50) return 'Você está no meio do caminho! 📚';
  if (progress >= 25) return 'Bom começo! Continue assim. 🌟';
  return 'Comece a estudar para alcançar sua meta! 🚀';
};

export const getGoalStatusColor = (progress: number): string => {
  if (progress >= 100) return 'text-green-600 bg-green-100';
  if (progress >= 75) return 'text-blue-600 bg-blue-100';
  if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
  if (progress >= 25) return 'text-orange-600 bg-orange-100';
  return 'text-gray-600 bg-gray-100';
};