/**
 * Speaking Practice API exports
 */

export { 
  default as studentSpeakingApiSlice,
  useGetSpeakingExercisesQuery,
  useGetSpeakingExerciseQuery,
  useGetCourseSpeakingExercisesQuery,
  useGetSpeakingSessionsQuery,
  useGetSpeakingSessionQuery,
  useCreateSpeakingSessionMutation,
  useCompleteSpeakingSessionMutation,
  useCreateSpeakingTurnMutation,
  useAnalyzeSpeechMutation,
  useGetSpeakingProgressQuery,
  useGetSpeakingStatsQuery,
  useGetCourseSpeakingProgressQuery,
  useGenerateTTSMutation,
} from './studentSpeakingApiSlice';