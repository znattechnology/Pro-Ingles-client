/**
 * Core Module
 * 
 * This module contains the core functionality of the application including
 * API configuration, Redux store setup, and global configurations.
 */

// API
export * from './api'

// Store
export * from './store'

// Config
export * from './config'

// Types
export * from './types'

// Re-export commonly used items
export { apiClient } from './api/client'
export { store, type RootState } from './store'
export { config } from './config'