/**
 * Achievements Types
 * 
 * Interface definitions for achievement features including
 * user achievements, progress tracking, and badge management.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
}

export interface AchievementStats {
  totalUnlocked: number;
  totalAvailable: number;
  totalPoints: number;
  rareAchievements: number;
  recentUnlocked: number;
}

export interface AchievementCategory {
  name: string;
  display_name: string;
  description: string;
  icon_class: string;
  color: string;
  order: number;
  achievement_count: number;
  unlocked_count: number;
}

export interface AchievementNotification {
  id: string;
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    points: number;
  };
  is_read: boolean;
  is_celebrated: boolean;
  created_at: string;
  time_ago: string;
}