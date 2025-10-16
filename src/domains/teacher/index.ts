/**
 * Teacher Domain - All teacher-related functionality
 */

// Re-export teacher video courses
export * from './video-courses';

// Re-export teacher practice courses with namespace to avoid conflicts
export * as PracticeCourses from './practice-courses';

// Re-export teacher utils
export * from './utils';