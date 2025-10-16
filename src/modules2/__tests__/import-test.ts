/**
 * Import Test
 * 
 * Test file to verify that all module imports are working correctly
 * Run with: npx tsc --noEmit src/modules/__tests__/import-test.ts
 */

// Test individual module imports
import { Auth } from '../auth'
import { Learning } from '../learning'  
import { Gamification } from '../gamification'
import { Teacher } from '../teacher'
import { Admin } from '../admin'

import * as LearningModule from '../learning'
import * as GamificationModule from '../gamification'


console.log('✅ All imports successful!')
console.log('📦 Modules loaded:', {
  auth: !!Auth,
  learning: !!Learning,
  gamification: !!Gamification,
  teacher: !!Teacher,
  admin: !!Admin
})

// Test specific exports (that exist)
console.log('🔧 Available services:', {
  practiceApi: !!LearningModule.practiceApiSlice,
  achievementsApi: !!GamificationModule.achievementsApi,
  leaderboardApi: !!GamificationModule.leaderboardApi
})

export {}; // Make this a module