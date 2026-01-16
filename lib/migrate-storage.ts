/**
 * Migration script to clean up legacy localStorage data
 * Run this once on app initialization to remove deprecated django_user cache
 */

export function migrateLocalStorage() {
  if (typeof window === 'undefined') return;

  try {
    // Check if migration has already run
    const migrationKey = 'storage_migration_v1_completed';
    const migrationCompleted = localStorage.getItem(migrationKey);

    if (migrationCompleted === 'true') {
      console.log('✅ Storage migration already completed');
      return;
    }

    console.log('🔄 Running storage migration...');

    // Remove deprecated django_user cache
    const djangoUser = localStorage.getItem('django_user');
    if (djangoUser) {
      localStorage.removeItem('django_user');
      console.log('🗑️ Removed legacy django_user cache from localStorage');
      console.log('   User data will now be fetched from backend for better security');
    }

    // Mark migration as completed
    localStorage.setItem(migrationKey, 'true');
    console.log('✅ Storage migration completed successfully');
  } catch (error) {
    console.error('❌ Storage migration failed:', error);
  }
}
