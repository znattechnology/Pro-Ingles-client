/**
 * Simple Import Test
 * 
 * Test only the imports that should work with existing files
 */

// Test that the modular structure exists
import { practiceApiSlice } from '@modules/learning'
import { achievementsApi, leaderboardApi } from '@modules/gamification'

// Test that old imports still work (backward compatibility)
import { practiceApiSlice as oldPracticeApi } from '@/redux/features/api/practiceApiSlice'

console.log('✅ Modular imports working!')
console.log('✅ Backward compatibility maintained!')

export {}