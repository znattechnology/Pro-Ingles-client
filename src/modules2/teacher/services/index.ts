/**
 * Teacher Services
 * 
 * All teacher-related services
 */

// Re-export teacher APIs
export { teacherAchievementsApi } from './teacherAchievementsApi'
export * from './teacherAchievementsApi'

// Re-export teacher leaderboard API  
export * from './teacherLeaderboardApi'

// Re-export teacher practice API
export { teacherPracticeApi } from './teacherPracticeApi'
export * from './teacherPracticeApi'

// Re-export file upload utilities
export * from '../utils/fileUploads'

// Future teacher services
// export { courseManagementService } from './courseManagementService'
// export { studentProgressService } from './studentProgressService'