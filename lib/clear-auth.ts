/**
 * Utility to completely clear authentication data
 */

export function clearAllAuthData() {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Clear all possible cookie variations
  const cookiesToClear = ['access_token', 'refresh_token'];
  const domains = [window.location.hostname, 'localhost', '127.0.0.1'];
  const paths = ['/', '/signin', '/signup', '/user', '/teacher', '/admin'];
  
  cookiesToClear.forEach(cookieName => {
    // Clear without domain/path specification
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
    // Clear with different domain/path combinations
    domains.forEach(domain => {
      paths.forEach(path => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
      });
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}`;
    });
    
    // Additional cleanup attempts
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; httponly`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; httponly`;
  });
  
  // Clear all cookies that might match our pattern
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name.includes('token') || name.includes('auth')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    }
  });
  
  console.log('🧹 All authentication data cleared');
}

export async function forceLogoutAndRedirect() {
  clearAllAuthData();
  
  // Additional aggressive cookie clearing
  const allCookies = document.cookie.split(';');
  allCookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    
    // Clear any auth-related cookies
    if (name.includes('token') || name.includes('auth') || name === 'access_token' || name === 'refresh_token') {
      // Multiple clearing attempts with different configurations
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;domain=${window.location.hostname};`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;domain=.${window.location.hostname};`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;secure;`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;secure;httponly;`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;samesite=strict;`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;samesite=lax;`;
      console.log(`🗑️ Attempting to clear cookie: ${name}`);
    }
  });
  
  // Also call server-side cookie clearing
  try {
    await fetch('/api/clear-cookies', { method: 'POST' });
    console.log('✅ Server-side cookies cleared');
  } catch (error) {
    console.error('❌ Failed to clear server-side cookies:', error);
  }
  
  // Wait a bit then redirect
  setTimeout(() => {
    // Force a hard redirect to clear any middleware state
    window.location.href = '/signin';
  }, 200);
}