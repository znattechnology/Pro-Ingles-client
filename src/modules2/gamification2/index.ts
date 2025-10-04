/**
 * Gamification Module
 * 
 * This module handles all gamification features including
 * achievements, leaderboards, competitions, badges, and rewards.
 */

// Components
export * from './components'

// Hooks
export * from './hooks'

// Services
export * from './services'

// Types
export * from './types'

// Re-export commonly used items with cleaner names
// Working exports from existing structure
export { achievementsApi, leaderboardApi } from './services'
export { 
  useGetUserAchievementsQuery, 
  useGetAchievementStatsQuery,
  useGetGlobalLeaderboardQuery,
  useGetLeaguesInfoQuery,
  useGetActiveCompetitionsQuery 
} from './hooks'

// These will be added as we migrate components
// export { AchievementCard } from './components/AchievementCard'
// export { LeaderboardTable } from './components/LeaderboardTable'
// export { BadgeDisplay } from './components/BadgeDisplay'
// export { useAchievements } from './hooks/useAchievements'
// export { useLeaderboard } from './hooks/useLeaderboard'
// export { achievementsService } from './services/achievementsService'
// export { leaderboardService } from './services/leaderboardService'