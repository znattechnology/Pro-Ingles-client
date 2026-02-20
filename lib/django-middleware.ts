/**
 * Django JWT Authentication Middleware
 * Handles route protection and user role-based access control
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  user_id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  exp: number;
  iat: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  email_verified: boolean;
}

// Define protected routes and their required roles
const ROUTE_CONFIG = {
  // Public routes (no authentication required)
  public: [
    '/',
    '/landing',
    '/search',
    '/signin',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/checkout', // May need auth for later steps
    '/auth/google/callback' // Google OAuth callback
  ],

  // Student routes
  student: [
    '/user',
    '/user/courses',
    '/user/profile',
    '/user/settings',
    '/user/billing',
    '/user/laboratory',
    '/user/speaking',
    '/user/listening',
    '/user/dashboard',
    '/user/subscription',
    '/user/upgrade'
  ],

  // Teacher routes  
  teacher: [
    '/teacher',
    '/teacher/courses',
    '/teacher/profile',
    '/teacher/settings',
    '/teacher/billing'
  ],

  // Admin routes
  admin: [
    '/admin*'  // All admin routes with wildcard
  ],

  // Routes accessible by authenticated users (any role)
  authenticated: [
    '/profile',
    '/settings'
  ]
};

// Check if user has a refresh token (for deciding whether to redirect)
function hasRefreshToken(request: NextRequest): boolean {
  const refreshToken = request.cookies.get('refresh_token')?.value;
  return !!refreshToken && refreshToken.trim() !== '';
}

// Check if user has auth_state cookie (set by frontend after successful login)
function hasAuthState(request: NextRequest): boolean {
  const authState = request.cookies.get('auth_state')?.value;
  return authState === 'authenticated';
}

// Get user from JWT token stored in cookie or localStorage (for server-side)
// Returns { user, needsRefresh } to indicate if token is expired but refresh is possible
function getUserFromToken(request: NextRequest): { user: JWTPayload | null; needsRefresh: boolean } {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    // If not in header, try cookies
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }

    // No token found or token is empty/whitespace
    if (!token || token.trim() === '') {
      // Check if refresh token exists - if so, allow page to load
      if (hasRefreshToken(request)) {
        return { user: null, needsRefresh: true };
      }
      return { user: null, needsRefresh: false };
    }

    // Additional validation: JWT should have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      if (hasRefreshToken(request)) {
        return { user: null, needsRefresh: true };
      }
      return { user: null, needsRefresh: false };
    }

    const decoded = jwtDecode<JWTPayload>(token);

    // Check if token is expired with 5 minute tolerance
    const EXPIRY_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes
    if (decoded.exp * 1000 + EXPIRY_TOLERANCE_MS <= Date.now()) {
      // Token expired but might have refresh token - allow page to load
      if (hasRefreshToken(request)) {
        // Return the decoded user info anyway for role checking
        // Client-side will handle the refresh
        return { user: decoded, needsRefresh: true };
      }
      return { user: null, needsRefresh: false };
    }

    // Validate required fields
    if (!decoded.user_id || !decoded.email || !decoded.role) {
      return { user: null, needsRefresh: false };
    }

    return { user: decoded, needsRefresh: false };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    // Check if refresh token exists as fallback
    if (hasRefreshToken(request)) {
      return { user: null, needsRefresh: true };
    }
    return { user: null, needsRefresh: false };
  }
}

// Check if route matches any of the patterns
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      // Wildcard matching
      const baseRoute = route.slice(0, -1);
      return pathname.startsWith(baseRoute);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

// Determine if a route is public
function isPublicRoute(pathname: string): boolean {
  return matchesRoute(pathname, ROUTE_CONFIG.public);
}

// Get required role for a route
function getRequiredRole(pathname: string): string | null {
  if (matchesRoute(pathname, ROUTE_CONFIG.student)) return 'student';
  if (matchesRoute(pathname, ROUTE_CONFIG.teacher)) return 'teacher';
  if (matchesRoute(pathname, ROUTE_CONFIG.admin)) return 'admin';
  if (matchesRoute(pathname, ROUTE_CONFIG.authenticated)) return 'authenticated';
  return null;
}

// Get default redirect URL based on user role
function getDefaultRedirect(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/teacher/courses';
    case 'student':
    default:
      return '/user/courses/explore';
  }
}

export function djangoAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  const { user, needsRefresh } = getUserFromToken(request);
  const requiredRole = getRequiredRole(pathname);

  // If route is public, allow access
  if (isPublicRoute(pathname)) {
    // Redirect authenticated users from auth pages
    if (['/signin', '/signup'].includes(pathname)) {
      // Check if user has valid token OR auth_state cookie
      if (user && !needsRefresh) {
        const token = request.cookies.get('access_token')?.value;
        if (token) {
          try {
            const decoded = jwtDecode<JWTPayload>(token);
            const isValid = decoded.exp * 1000 > Date.now();
            if (isValid) {
              return NextResponse.redirect(new URL(getDefaultRedirect(user.role), request.url));
            }
          } catch {
            // Token invalid, allow access to auth pages
          }
        }
      } else if (hasAuthState(request)) {
        // Has auth_state but no token - redirect based on user_role cookie
        const userRole = request.cookies.get('user_role')?.value || 'student';
        return NextResponse.redirect(new URL(getDefaultRedirect(userRole), request.url));
      }
    }
    return NextResponse.next();
  }

  // If route requires authentication but user is not authenticated
  // IMPORTANT: If needsRefresh is true, allow the page to load - client will handle refresh
  // Also check for auth_state cookie (set by frontend for cross-origin cookie scenarios)
  if (!user && !needsRefresh && requiredRole) {
    // Check for auth_state cookie as fallback (for HttpOnly cookie cross-origin scenarios)
    if (hasAuthState(request)) {
      // User has auth_state cookie - allow access, client-side will verify with backend
      return NextResponse.next();
    }

    // Store the intended destination for redirect after login
    const loginUrl = new URL('/signin', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token needs refresh but we have user info, allow access
  // The client-side will handle token refresh
  if (needsRefresh && user) {
    // Allow the request, client-side token refresh will handle it
    return NextResponse.next();
  }

  // If we have a refresh token but no user info, also allow access
  // This handles the case where access_token is completely expired/invalid
  // but refresh_token exists
  if (needsRefresh && !user) {
    // Allow the request, client-side will attempt refresh
    return NextResponse.next();
  }

  // If user is authenticated but accessing wrong role route
  if (user && requiredRole && requiredRole !== 'authenticated') {
    // Special case for routes accessible by both students and teachers
    if (requiredRole === 'studentAndTeacher') {
      if (user.role !== 'student' && user.role !== 'teacher') {
        return NextResponse.redirect(new URL(getDefaultRedirect(user.role), request.url));
      }
    } else if (user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      return NextResponse.redirect(new URL(getDefaultRedirect(user.role), request.url));
    }
  }

  // Special handling for checkout flow
  if (pathname.startsWith('/checkout')) {
    const step = request.nextUrl.searchParams.get('step');
    
    // If step 2+ but no user, redirect to step 1
    if (step && parseInt(step) > 1 && !user) {
      const redirectUrl = new URL('/checkout', request.url);
      redirectUrl.searchParams.set('step', '1');
      // Preserve other params
      request.nextUrl.searchParams.forEach((value, key) => {
        if (key !== 'step') {
          redirectUrl.searchParams.set(key, value);
        }
      });
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Allow access
  return NextResponse.next();
}

// Helper function to check authentication status (for client-side use)
/**
 * Quick check if user appears to be authenticated
 * Note: This is a UI hint only - actual auth is validated by backend via HttpOnly cookies
 * For authoritative check, use fetchUserFromBackend()
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for auth_state cookie (non-HttpOnly flag set on login)
  const hasAuthState = document.cookie.includes('auth_state=authenticated');

  // Also check for user_info in localStorage (set on login)
  const hasUserInfo = !!localStorage.getItem('user_info');

  return hasAuthState || hasUserInfo;
}

/**
 * Fetch user data from backend API
 * Uses HttpOnly cookies for authentication - backend middleware reads the token
 * @returns Promise with user data or null if failed/unauthenticated
 */
export async function fetchUserFromBackend(): Promise<User | null> {
  if (typeof window === 'undefined') return null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${apiUrl}/users/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send HttpOnly cookies automatically
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Not authenticated - this is expected for logged out users
        return null;
      }
      console.error('Failed to fetch user data from backend:', response.status);
      return null;
    }

    const userData = await response.json();

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      email_verified: userData.email_verified,
    };
  } catch (error) {
    console.error('Error fetching user from backend:', error);
    return null;
  }
}

/**
 * Get cached user info from localStorage
 * Note: This is for quick UI access, not authoritative
 * @deprecated Use fetchUserFromBackend() for authoritative user data
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const userInfo = localStorage.getItem('user_info');
    if (!userInfo) return null;

    const parsed = JSON.parse(userInfo);
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
      avatar: parsed.avatar,
      email_verified: true,
    };
  } catch {
    return null;
  }
}