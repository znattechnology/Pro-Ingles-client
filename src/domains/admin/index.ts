/**
 * Admin Domain exports
 * 
 * Main entry point for the admin domain, providing centralized access
 * to all admin-related functionality including API, components, hooks, and types
 */

// API exports
export * from './api';

// Component exports
export * from './components';

// Hook exports
export * from './hooks';

// Type exports
export * from './types';

// Re-export commonly used items for convenience
export { adminApiSlice } from './api/adminApiSlice';
export { useAdminDashboard } from './hooks/useAdminDashboard';
export { AdminStatsCard } from './components/AdminStatsCard';