/**
 * Learning Services
 * 
 * For clear separation, import directly from specific course types:
 * 
 * Video Courses:
 *   import { useGetCoursesQuery } from '@modules/learning/video-courses'
 * 
 * Practice Courses:  
 *   import { useGetCoursesQuery } from '@modules/learning/practice-courses'
 */

// Re-export sub-modules for direct access
export * as videoCourses from './video-courses';
export * as practiceCourses from './practice-courses';

// Note: We intentionally don't re-export hooks directly to avoid confusion
// Use specific paths like '@modules/learning/video-courses' instead