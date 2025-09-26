/**
 * Core Module - Foundation for modular architecture
 * 
 * This module provides shared utilities, types, and services
 * that are used across all other modules.
 */

// Export services
export * from './services';
export * from './types';

// Export utilities
export { serviceLayer, useUnifiedServices, useServiceHealth } from './services';

// Core configuration
export const MODULAR_CONFIG = {
  version: '1.0.0',
  modules: ['auth', 'learning', 'gamification', 'teacher', 'admin', 'core'],
  features: {
    unifiedServices: true,
    featureFlags: true,
    healthChecks: true,
    gradualMigration: true
  }
} as const;