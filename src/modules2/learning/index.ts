/**
 * Learning Module
 * 
 * This module handles all learning-related functionality including
 * courses, lessons, units, progress tracking, and practice sessions.
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
export { useLaboratoryCourses, useMainLearnPage, useUserProgress } from './hooks'

// These will be added as we migrate components  
// export { CourseCard } from './components/CourseCard'
// export { LessonCard } from './components/LessonCard'
// export { ProgressTracker } from './components/ProgressTracker'
// export { useCourses } from './hooks/useCourses'
// export { useProgress } from './hooks/useProgress'
// export { useUnits } from './hooks/useUnits'
// export { coursesService } from './services/coursesService'
// export { progressService } from './services/progressService'