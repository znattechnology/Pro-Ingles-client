/**
 * Leaderboard Types
 * 
 * Interface definitions for leaderboard features including
 * rankings, leagues, competitions, and user stats.
 */

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar?: string;
  points: number;
  streak: number;
  league: 'bronze' | 'silver' | 'gold' | 'diamond';
  change: 'up' | 'down' | 'same' | 'new';
  changeAmount?: number;
  isCurrentUser?: boolean;
}

export interface League {
  id: string;
  name: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints?: number;
  participants: number;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  startDate: string;
  endDate: string;
  participants: number;
  currentPosition?: number;
  prize: string;
}

export interface GlobalLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUser?: LeaderboardEntry;
}

export interface UserPosition {
  rank: number;
  points: number;
  hearts: number;
  streak: number;
  league: {
    id: string;
    name: string;
    icon: string;
    min_points: number;
    max_points?: number;
  };
}