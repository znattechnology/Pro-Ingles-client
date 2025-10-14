/**
 * Student Module - Main Index
 * 
 * Central export point for all student-related functionality
 */

// Services
export * from './services';

// Types
export type {
  UserProgress,
  Course,
  UpdateUserProgressData,
  ReduceHeartsData,
  ReduceHeartsResponse,
  ReduceHeartsError,
} from './services/studentProgressApi';