/**
 * Shared Module
 * 
 * This module contains all shared components, hooks, utils, and types
 * that are used across multiple modules.
 */

// UI Components
export * from './components/ui'

// Layout Components  
export * from './components/layout'

// Common Components
export * from './components/common'

// Hooks
export * from './hooks'

// Utils
export * from './utils'

// Types
export * from './types'

// Constants
export * from './constants'

// Re-export commonly used items
export { Button, Card, Input, Badge } from './components/ui'
export { Layout, Sidebar, Header } from './components/layout'
export { LoadingSpinner, ErrorBoundary } from './components/common'
export { useLocalStorage, useDebounce } from './hooks'
export { cn, formatDate, formatCurrency } from './utils'