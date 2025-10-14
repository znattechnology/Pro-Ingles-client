/**
 * Modules Index - Main entry point for modular architecture
 * 
 * This is the primary entry point for accessing all modules in the application.
 * Each module is self-contained with its own components, services, hooks, and types.
 * 
 * Architecture:
 * - core: Shared utilities, types, and unified service layer
 * - auth: Authentication and authorization
 * - learning: Courses, lessons, and learning management
 * - gamification: Achievements, leaderboards, and rewards
 * - teacher: Teacher-specific tools and management
 * - admin: Administrative functions and dashboards
 */

// Export unified service layer from core
export { 
  serviceLayer, 
  useUnifiedServices, 
  useServiceHealth,
  useModularAuth,
  useModularLearning,
  useModularGamification 
} from './core/services'

// Export core types (avoiding conflicts)
export type { 
  ApiResponse,
  PaginatedResponse,
  BaseEntity,
  ModuleHealth,
  ServiceHealth,
  FeatureFlags,
  AppError,
  ValidationError,
  Progress,
  FilterParams,
  SearchResult
} from './core/types'

// Export modules individually to avoid conflicts
export * from './auth'
export * from './learning'
export * from './gamification'  
export * from './teacher'
export * from './admin'

// Module-specific namespaced exports for clarity
export * as Core from './core'
export * as Auth from './auth'
export * as Learning from './learning'
export * as Gamification from './gamification'
export * as Teacher from './teacher'
export * as Admin from './admin'