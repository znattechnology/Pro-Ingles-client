/**
 * Authentication Module
 * 
 * This module handles all authentication-related functionality
 * including login, logout, user session management, and auth guards.
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
// These will be added as we migrate components
// export { DjangoSignIn as SignIn } from './components/SignIn'
// export { DjangoSignUp as SignUp } from './components/SignUp'
// export { useAuth } from './hooks/useAuth'
// export { authService } from './services/authService'