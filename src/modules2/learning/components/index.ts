/**
 * Learning Components
 * 
 * All learning-related components including courses, lessons, and progress
 */

// Re-export migrated components
export { CourseCard } from './CourseCard'
export * from './UserProgress'

// Re-export existing components (maintaining compatibility) - temporarily commented out
// export { LaboratoryCard } from '../../../app/(dashboard)/user/laboratory/learn/courses/laboratory-card'
// export { Card as LegacyCourseCard } from '../../../app/(dashboard)/user/laboratory/learn/courses/card'
// export { default as Loading } from '../../../components/course/Loading'

// Laboratory components - temporarily commented out
// export { default as FeedWrapper } from '../../../components/laboratory/FeedWrapper'
// export { default as Unit } from '../../../components/laboratory/Unit'
// export { default as UnitBanner } from '../../../components/laboratory/UnitBanner'
// export { default as LessonButton } from '../../../components/laboratory/LessonButton'
// export { default as UserProgress } from '../../../components/laboratory/UserProgress'

// Learn components - temporarily commented out
// export { FeedWrapper as LearnFeedWrapper } from '../../../components/learn/FeedWrapper'
// export { UserProgress as LearnUserProgress } from '../../../components/learn/UserProgress'
// export { UserProgressRedux } from '../../../components/learn/UserProgressRedux'
// export { ModernChallengeInterface } from '../../../components/learn/ModernChallengeInterface'

// New modular components will be added here
// export { CourseCatalog } from './courses/CourseCatalog'
// export { LessonViewer } from './lessons/LessonViewer'
// export { ProgressTracker } from './progress/ProgressTracker'