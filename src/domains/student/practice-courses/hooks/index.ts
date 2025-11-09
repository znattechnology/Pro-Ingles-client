/**
 * Student Practice Courses Hooks
 * 
 * Modern, clean hooks that replace the complex Redux system.
 * All hooks use direct RTK Query APIs and provide simple, focused functionality.
 */

// Practice Session Hooks
export {
  usePracticeSession,
  useHeartsManagement,
  useLessonNavigation,
  useSessionPerformance,
  useFullPracticeSession,
} from './usePracticeSession';

// Unit Management Hooks  
export {
  useUnitManagement,
  useLessonNavigation as useUnitLessonNavigation,
  useCourseSelection,
  useUnitProgression,
  useCompleteUnitManagement,
} from './useUnitManagement';

// Main Learn Page Hooks
export {
  useMainLearnPage,
  useLearnPageNavigation, 
  useMainLearnPageQuickActions,
  useFullMainLearnPage,
} from './useMainLearnPage';

// Re-export API hooks for convenience
export {
  useGetStudentProgressQuery,
  useGetCourseUnitsWithProgressQuery,
  useGetLessonDetailQuery,
  useSubmitChallengeMutation,
  useMarkLessonCompletedMutation,
  useUseHeartMutation,
  useRefillHeartsMutation,
  useSelectActiveCourseMutation,
  useGetAvailableCoursesQuery,
  useGetCourseDetailQuery,
  useGetStudentAnalyticsQuery,
  useGetStudyStreakQuery,
  useGetStudentAchievementsQuery,
  useGetLeaderboardQuery,
} from '../api';

// Types (re-export for convenience)
export type {
  PracticeSessionStats,
  ChallengeSubmissionResult,
} from './usePracticeSession';

export type {
  LessonProgress,
  UnitProgress,
  LearningPath,
} from './useUnitManagement';

export type {
  MainLearnPageData,
  MainLearnPageActions,
} from './useMainLearnPage';