/**
 * Core Services - Unified Service Layer
 * 
 * This module provides a unified API for all application services,
 * with feature flags for gradual migration and testing.
 */

import { useFeatureFlag } from '@/lib/featureFlags';

// Import all module services
import * as AuthServices from '../../auth/services';
import * as LearningServices from '../../learning/services';
import * as GamificationServices from '../../gamification/services';
import * as TeacherServices from '../../teacher/services';
import * as AdminServices from '../../admin/services';

// Unified service layer with feature flags
export class UnifiedServiceLayer {
  private static instance: UnifiedServiceLayer;
  
  private constructor() {}
  
  static getInstance(): UnifiedServiceLayer {
    if (!UnifiedServiceLayer.instance) {
      UnifiedServiceLayer.instance = new UnifiedServiceLayer();
    }
    return UnifiedServiceLayer.instance;
  }

  // Auth services
  get auth() {
    return AuthServices;
  }

  // Learning services
  get learning() {
    return LearningServices;
  }

  // Gamification services
  get gamification() {
    return GamificationServices;
  }

  // Teacher services
  get teacher() {
    return TeacherServices;
  }

  // Admin services
  get admin() {
    return AdminServices;
  }

  // Utility methods
  getAllApiSlices() {
    return {
      authApi: this.auth.authApi,
      coursesApi: this.learning.coursesApiSlice,
      practiceApi: this.learning.practiceApiSlice,
      achievementsApi: this.gamification.achievementsApi,
      leaderboardApi: this.gamification.leaderboardApi,
      teacherAchievementsApi: this.teacher.teacherAchievementsApi,
    };
  }

  // Service health check
  checkServicesHealth() {
    const services = this.getAllApiSlices();
    const healthStatus = Object.keys(services).map(serviceName => ({
      name: serviceName,
      status: services[serviceName as keyof typeof services] ? 'available' : 'unavailable'
    }));
    
    return {
      timestamp: new Date().toISOString(),
      services: healthStatus,
      allHealthy: healthStatus.every(service => service.status === 'available')
    };
  }
}

// Export singleton instance
export const serviceLayer = UnifiedServiceLayer.getInstance();

// Export all services for direct access (backward compatibility)
export * from '../../auth/services';
export * from '../../learning/services';
export * from '../../gamification/services';
export * from '../../teacher/services';
export * from '../../admin/services';

// Convenience exports
export const useUnifiedServices = () => serviceLayer;
export const useServiceHealth = () => serviceLayer.checkServicesHealth();

// Feature flag aware hooks
export const useModularAuth = () => {
  const useModularServices = useFeatureFlag('useModularServices');
  return useModularServices ? serviceLayer.auth : AuthServices;
};

export const useModularLearning = () => {
  const useModularServices = useFeatureFlag('useModularServices');
  return useModularServices ? serviceLayer.learning : LearningServices;
};

export const useModularGamification = () => {
  const useModularServices = useFeatureFlag('useModularServices');
  return useModularServices ? serviceLayer.gamification : GamificationServices;
};