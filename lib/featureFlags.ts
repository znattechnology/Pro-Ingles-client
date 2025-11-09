/**
 * Feature Flags para Migração Redux
 * 
 * Sistema de feature flags para permitir migração gradual
 * sem quebrar funcionalidade existente.
 */

// Environment-based feature flags
export const FEATURE_FLAGS = {
  // Redux Migration Flags
  REDUX_COURSE_SELECTION: process.env.NEXT_PUBLIC_REDUX_COURSE_SELECTION === 'true',
  REDUX_PRACTICE_SESSION: process.env.NEXT_PUBLIC_REDUX_PRACTICE_SESSION === 'true',
  REDUX_TEACHER_MANAGEMENT: process.env.NEXT_PUBLIC_REDUX_TEACHER_MANAGEMENT === 'true',
  REDUX_USER_PROGRESS: process.env.NEXT_PUBLIC_REDUX_USER_PROGRESS === 'true',
  // REDUX_MAIN_LEARN_PAGE: process.env.NEXT_PUBLIC_REDUX_MAIN_LEARN_PAGE === 'true', // REMOVIDO - Migrado para src/domains
  REDUX_TEACHER_DASHBOARD: process.env.NEXT_PUBLIC_REDUX_TEACHER_DASHBOARD === 'true',
  REDUX_UNIT_MANAGEMENT: process.env.NEXT_PUBLIC_REDUX_UNIT_MANAGEMENT === 'true',
  
  // Advanced Features
  REAL_TIME_UPDATES: process.env.NEXT_PUBLIC_REAL_TIME_UPDATES === 'true',
  OFFLINE_PRACTICE: process.env.NEXT_PUBLIC_OFFLINE_PRACTICE === 'true',
  OPTIMISTIC_UPDATES: process.env.NEXT_PUBLIC_OPTIMISTIC_UPDATES === 'true',
  
  // Development & Testing
  DEBUG_REDUX: process.env.NEXT_PUBLIC_DEBUG_REDUX === 'true',
  MOCK_API_RESPONSES: process.env.NEXT_PUBLIC_MOCK_API_RESPONSES === 'true',
  PERFORMANCE_MONITORING: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true',
} as const;

// Type for feature flag keys
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

// Hook for using feature flags
export const useFeatureFlag = (flag: FeatureFlagKey): boolean => {
  return FEATURE_FLAGS[flag];
};

// Utility function for conditional execution
export const withFeatureFlag = <T>(
  flag: FeatureFlagKey,
  truthy: () => T,
  falsy: () => T
): T => {
  return FEATURE_FLAGS[flag] ? truthy() : falsy();
};

// Migration status tracking
export const MIGRATION_STATUS = {
  // Phase 1: Base Setup
  STORE_CONFIGURATION: '✅ Completed',
  LABORATORY_SLICE: '✅ Completed',
  API_SLICE_ENHANCED: '✅ Completed',
  FEATURE_FLAGS: '✅ Completed',
  
  // Phase 2: Student Dashboard
  COURSE_SELECTION: '🔄 In Progress',
  PRACTICE_INTERFACE: '📝 Planned',
  USER_PROGRESS: '📝 Planned',
  
  // Phase 3: Teacher Dashboard  
  COURSE_MANAGEMENT: '📝 Planned',
  CONTENT_CREATION: '📝 Planned',
  ANALYTICS: '📝 Planned',
  
  // Phase 4: Advanced Features
  REAL_TIME: '📝 Planned',
  OFFLINE: '📝 Planned',
  PERFORMANCE: '📝 Planned',
} as const;

// Helper function to check migration readiness
export const isMigrationReady = (feature: keyof typeof MIGRATION_STATUS): boolean => {
  const status = MIGRATION_STATUS[feature];
  return status.includes('✅') || status.includes('🔄');
};

// Debug utilities (only in development)
if (process.env.NODE_ENV === 'development') {
  // Global debug object
  (globalThis as any).__FEATURE_FLAGS__ = FEATURE_FLAGS;
  (globalThis as any).__MIGRATION_STATUS__ = MIGRATION_STATUS;
  
  // Console logging for active flags
  const activeFlags = Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([flag, _]) => flag);
    
  if (activeFlags.length > 0) {
    console.log('🚩 Active Feature Flags:', activeFlags);
  }
}