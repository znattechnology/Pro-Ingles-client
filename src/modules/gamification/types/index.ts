/**
 * Gamification Types
 * 
 * All gamification-related TypeScript types and interfaces
 */

// Re-export existing types from modular services
export type {
  Achievement,
  AchievementStats,
  AchievementCategory,
  AchievementNotification
} from '../services/achievementsApi'

export type {
  LeaderboardEntry,
  League,
  Competition,
  GlobalLeaderboardResponse,
  UserPosition
} from '../services/leaderboardApi'

// Extended gamification types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
}

export interface Reward {
  id: string;
  type: 'points' | 'hearts' | 'badge' | 'unlock';
  value: number | string;
  description: string;
  earned_at: string;
}

export interface CompetitionEntry {
  user_id: string;
  username: string;
  score: number;
  rank: number;
  change: 'up' | 'down' | 'same' | 'new';
}

export interface UserRanking {
  global_rank: number;
  league_rank: number;
  total_points: number;
  streak: number;
  achievements_count: number;
  league: League;
}

export interface GamificationStats {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  achievements_unlocked: number;
  achievements_available: number;
  league: League;
  global_rank: number;
  league_rank: number;
}