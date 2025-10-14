/**
 * Gamification Hooks
 * 
 * All gamification-related hooks for achievements, leaderboards, and competitions
 */

// Re-export existing hooks from achievement and leaderboard APIs
export {
  useGetUserAchievementsQuery,
  useGetAchievementStatsQuery
} from '../services/achievementsApi'

export {
  useGetGlobalLeaderboardQuery,
  useGetLeaguesInfoQuery,
  useGetActiveCompetitionsQuery
} from '../services/leaderboardApi'

// New modular hooks will be added here
// export { useAchievements } from './useAchievements'
// export { useLeaderboard } from './useLeaderboard'
// export { useCompetitions } from './useCompetitions'
// export { useBadges } from './useBadges'
// export { useRanking } from './useRanking'