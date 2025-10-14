# Modular Architecture Documentation

## Overview

This directory contains the modular architecture implementation for the ProEnglish application. The architecture is designed to provide better organization, maintainability, and scalability while maintaining full backward compatibility.

## Architecture Principles

### 1. Domain-Driven Design
Each module represents a specific business domain:
- **auth**: Authentication and authorization
- **learning**: Courses, lessons, and learning management
- **gamification**: Achievements, leaderboards, and rewards
- **teacher**: Teacher-specific tools and management
- **admin**: Administrative functions and dashboards
- **core**: Shared utilities, types, and services

### 2. Self-Contained Modules
Each module follows a consistent structure:
```
module/
├── components/     # React components
├── hooks/         # Custom hooks
├── services/      # API services and business logic
├── types/         # TypeScript type definitions
└── index.ts       # Barrel export
```

### 3. Backward Compatibility
All existing imports continue to work through re-exports, ensuring zero breaking changes during migration.

## Module Details

### Core Module (`src/modules/core/`)

The foundation module that provides shared functionality across all other modules.

**Key Features:**
- Unified Service Layer
- Common type definitions
- Health check utilities
- Feature flag integration

**Usage:**
```typescript
import { serviceLayer, useUnifiedServices } from '@modules/core';

// Access all services through unified layer
const services = useUnifiedServices();
```

### Auth Module (`src/modules/auth/`)

Handles authentication and authorization functionality.

**Components:**
- `DjangoSignIn` - Sign in form component
- `DjangoSignUp` - Sign up form component (re-export)
- `EmailVerification` - Email verification component (re-export)
- `PasswordReset` - Password reset component (re-export)

**Services:**
- `authApi` - Authentication API endpoints
- Login, registration, logout mutations

**Usage:**
```typescript
import { DjangoSignIn, useLoginMutation } from '@modules/auth';
```

### Learning Module (`src/modules/learning/`)

Manages all learning-related functionality including courses, lessons, and progress tracking.

**Components:**
- `CourseCard` - Course display card
- `UserProgress` - Progress tracking component

**Services:**
- `coursesApiSlice` - Course management API
- `practiceApiSlice` - Practice and learning API

**Usage:**
```typescript
import { CourseCard, useGetCoursesQuery } from '@modules/learning';
```

### Gamification Module (`src/modules/gamification/`)

Handles achievements, leaderboards, and gamification features.

**Services:**
- `achievementsApi` - Achievement system API
- `leaderboardApi` - Leaderboard and competition API

**Usage:**
```typescript
import { useGetUserAchievementsQuery, useGetGlobalLeaderboardQuery } from '@modules/gamification';
```

### Teacher Module (`src/modules/teacher/`)

Contains teacher-specific tools and management interfaces.

**Services:**
- `teacherAchievementsApi` - Teacher achievement management

### Admin Module (`src/modules/admin/`)

Administrative functions and dashboards.

**Services:**
- Placeholder for admin-specific services

## Migration Strategy

The modular architecture implements a gradual migration strategy:

### Phase 1: Foundation ✅
- Created module structure
- Set up barrel exports
- Configured path mappings

### Phase 2: API Migration ✅
- Moved Redux API slices to appropriate modules
- Maintained backward compatibility through re-exports
- Verified compilation success

### Phase 3: Component Migration ✅
- Migrated key components to modules
- Updated barrel exports
- Maintained component functionality

### Phase 4: Unified Service Layer ✅
- Created core module with unified services
- Implemented health checking
- Added feature flag integration

### Phase 5: Import Optimization (Pending)
- Update imports to use modular paths
- Clean up legacy re-exports
- Remove deprecated code

## Usage Examples

### Basic Import (Backward Compatible)
```typescript
// These continue to work exactly as before
import { useLoginMutation } from '@/redux/features/auth/authApi';
import { CourseCard } from '@/components/laboratory/CourseCard';
```

### Modular Import (Recommended)
```typescript
// New modular approach
import { useLoginMutation } from '@modules/auth';
import { CourseCard } from '@modules/learning';
```

### Unified Service Layer
```typescript
import { serviceLayer, useServiceHealth } from '@modules/core';

// Access all services through unified interface
const healthStatus = useServiceHealth();
const authServices = serviceLayer.auth;
const learningServices = serviceLayer.learning;
```

### Feature Flag Integration
```typescript
import { useModularAuth, useModularLearning } from '@modules/core';

// Automatically uses modular or legacy services based on feature flags
const authServices = useModularAuth();
const learningServices = useModularLearning();
```

## Benefits

### 1. Better Organization
- Clear domain separation
- Consistent module structure
- Easy to locate functionality

### 2. Improved Maintainability
- Self-contained modules
- Clear dependencies
- Easier testing and debugging

### 3. Enhanced Scalability
- Modules can be developed independently
- Easy to add new features
- Better code reusability

### 4. Zero Breaking Changes
- Full backward compatibility
- Gradual migration path
- No disruption to existing code

### 5. Type Safety
- Shared type definitions
- Better IntelliSense support
- Compile-time error checking

## Development Guidelines

### Adding New Components
```typescript
// 1. Create component in appropriate module
src/modules/learning/components/NewComponent.tsx

// 2. Export from module index
export { NewComponent } from './NewComponent';

// 3. Add to main module index
export { NewComponent } from './components';
```

### Adding New Services
```typescript
// 1. Create service in module services directory
src/modules/learning/services/newService.ts

// 2. Export from services index
export { newService } from './newService';

// 3. Update unified service layer if needed
```

### Testing Modular Components
```typescript
// Test imports work correctly
import { ComponentName } from '@modules/moduleName';
import { serviceName } from '@modules/moduleName/services';

// Test backward compatibility
import { ComponentName } from '@/components/legacy/path';
```

## Troubleshooting

### Import Errors
- Ensure barrel exports are properly configured
- Check tsconfig.json path mappings
- Verify module structure follows conventions

### Type Errors
- Use shared types from core module
- Ensure proper re-exports for TypeScript
- Check module dependencies

### Build Issues
- Run `npm run build` to verify compilation
- Check for circular dependencies
- Ensure all modules export properly

## Future Improvements

1. **Lazy Loading**: Implement dynamic imports for modules
2. **Module Federation**: Support for micro-frontend architecture  
3. **Testing**: Comprehensive module testing strategy
4. **Documentation**: Auto-generated API documentation
5. **Performance**: Bundle optimization per module

## Contributing

When contributing to the modular architecture:

1. Follow the established module structure
2. Maintain backward compatibility
3. Update documentation
4. Add appropriate tests
5. Verify compilation success

For questions or suggestions, please refer to the main project documentation or create an issue.