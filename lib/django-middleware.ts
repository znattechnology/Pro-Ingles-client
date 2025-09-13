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
    '/checkout' // May need auth for later steps
  ],

  // Student routes
  student: [
    '/user',
    '/user/courses',
    '/user/profile',
    '/user/settings',
    '/user/billing'
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

// Get user from JWT token stored in cookie or localStorage (for server-side)
function getUserFromToken(request: NextRequest): JWTPayload | null {
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
      return null;
    }

    // Additional validation: JWT should have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = jwtDecode<JWTPayload>(token);
    
    // Check if token is expired (with 30 second buffer)
    if (decoded.exp * 1000 <= Date.now() + 30000) {
      return null;
    }

    // Validate required fields
    if (!decoded.user_id || !decoded.email || !decoded.role) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
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
      return '/user/learn';
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

  const user = getUserFromToken(request);
  const requiredRole = getRequiredRole(pathname);

  // If route is public, allow access
  if (isPublicRoute(pathname)) {
    // Only redirect authenticated users from auth pages if they have a valid token
    if (user && ['/signin', '/signup'].includes(pathname)) {
      const token = request.cookies.get('access_token')?.value;
      // Double check token validity before redirecting
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
    }
    return NextResponse.next();
  }

  // If route requires authentication but user is not authenticated
  if (!user && requiredRole) {
    // Store the intended destination for redirect after login
    const loginUrl = new URL('/signin', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated but accessing wrong role route
  if (user && requiredRole && requiredRole !== 'authenticated') {
    if (user.role !== requiredRole) {
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
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Helper function to get current user (for client-side use)
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    if (decoded.exp * 1000 <= Date.now()) {
      return null; // Token expired
    }
    
    // Convert JWT payload to User interface
    return {
      id: decoded.user_id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      email_verified: true, // Assume verified if JWT exists
    };
  } catch {
    return null;
  }
}