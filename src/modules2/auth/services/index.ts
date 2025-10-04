/**
 * Auth Services
 * 
 * All authentication-related services and API calls
 */

// Re-export migrated auth API (maintaining compatibility)
export { authApi } from './authApi'
export * from './authApi'

// Re-export auth slice (maintaining compatibility)
export { default as authSlice } from './authSlice'
export * from './authSlice'

// New modular services will be added here
// export { authService } from './authService'
// export { tokenService } from './tokenService'
// export { sessionService } from './sessionService'