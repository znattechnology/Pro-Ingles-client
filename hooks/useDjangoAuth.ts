/**
 * Custom React Hook for Django Authentication
 * Provides authentication state and utilities
 *
 * ✅ Enhanced with retry logic and TokenRefreshCoordinator integration
 */

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/state/redux";
import { userLoggedIn, userLoggedOut, User } from "@/src/domains/auth";
import { fetchUserFromBackend } from "@/lib/django-middleware";
import { djangoAuth } from "@/lib/django-auth";
import { migrateLocalStorage } from "@/lib/migrate-storage";
import { tokenRefreshCoordinator } from "@/lib/token-refresh-coordinator";

export interface AuthHookReturn {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  pendingVerification: {
    email: string;
    isRegistration: boolean;
  } | null;

  // Authentication actions
  logout: () => Promise<void>;
  checkAuth: () => void;
  
  // Route utilities
  redirectToRole: (user?: User) => void;
  getRedirectUrl: (user?: User, isCheckout?: boolean, courseId?: string) => string;
}

export function useDjangoAuth(): AuthHookReturn {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state: RootState) => state.auth) || {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    pendingVerification: null,
    accessToken: "",
    refreshToken: ""
  };
  
  const [clientIsAuthenticated, setClientIsAuthenticated] = useState(false);
  const [clientUser, setClientUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from HttpOnly cookies
  // Note: We can't read HttpOnly cookies directly, so we:
  // 1. Check for auth_state cookie (non-HttpOnly flag)
  // 2. Try to fetch user profile (backend reads HttpOnly cookies)
  // 3. Handle 401 errors by attempting refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Run storage migration to clean up legacy cache
      migrateLocalStorage();

      // Check if user appears to be authenticated
      const hasAuthState = tokenRefreshCoordinator.isAuthenticated();
      const userInfoStr = localStorage.getItem('user_info');

      if (hasAuthState || userInfoStr) {
        // Try to use cached user info first for immediate UI
        if (userInfoStr) {
          try {
            const cachedUser = JSON.parse(userInfoStr);
            setClientUser(cachedUser);
            setClientIsAuthenticated(true);
            dispatch(userLoggedIn({
              accessToken: '',
              refreshToken: '',
              user: cachedUser
            }));
          } catch {
            // Failed to parse cached user info - will verify with backend
          }
        }

        // Then verify with backend in background (non-blocking)
        fetchUserFromBackend()
          .then(currentUser => {
            if (currentUser) {
              dispatch(userLoggedIn({
                accessToken: '',
                refreshToken: '',
                user: currentUser
              }));
              setClientIsAuthenticated(true);
              setClientUser(currentUser);
            } else {
              // Backend says not authenticated - clear state
              tokenRefreshCoordinator.clearTokens();
              dispatch(userLoggedOut());
              setClientIsAuthenticated(false);
              setClientUser(null);
            }
          })
          .catch(() => {
            // On network error, keep cached state (don't logout on network issues)
          });
      } else {
        // No auth state - user is not logged in
        dispatch(userLoggedOut());
        setClientIsAuthenticated(false);
        setClientUser(null);
      }
      setIsInitialized(true);
    }
  }, [dispatch]);

  // Sync with Redux state changes
  useEffect(() => {
    if (authState) {
      setClientIsAuthenticated(authState.isAuthenticated);
      setClientUser(authState.user);
    }
  }, [authState?.isAuthenticated, authState?.user]);

  // Check authentication status by fetching user profile
  // Backend validates HttpOnly cookies automatically
  const checkAuth = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Fetch fresh user data from backend
      // Backend reads tokens from HttpOnly cookies
      const currentUser = await fetchUserFromBackend();

      if (currentUser) {
        if (!authState?.isAuthenticated) {
          dispatch(userLoggedIn({
            accessToken: '', // Tokens are in HttpOnly cookies
            refreshToken: '',
            user: currentUser
          }));
        }
        setClientIsAuthenticated(true);
        setClientUser(currentUser);
      } else {
        // Failed to fetch user - logout
        tokenRefreshCoordinator.clearTokens();
        dispatch(userLoggedOut());
        setClientIsAuthenticated(false);
        setClientUser(null);
      }
    } catch (error) {
      console.error('[useDjangoAuth] checkAuth failed:', error);
      // Keep existing state on network errors
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await djangoAuth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Use comprehensive auth data clearing
    const { forceLogoutAndRedirect } = await import('@/lib/clear-auth');
    forceLogoutAndRedirect();
  };

  // Get redirect URL based on user role and context
  const getRedirectUrl = (
    user?: User, 
    isCheckout: boolean = false, 
    courseId?: string
  ): string => {
    const targetUser = user || authState?.user;
    
    if (!targetUser) {
      return '/signin';
    }

    if (isCheckout && courseId) {
      return `/checkout?step=2&id=${courseId}`;
    }

    switch (targetUser.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/courses';
      case 'student':
      default:
        return '/user/courses/explore';
    }
  };

  // Redirect to role-appropriate page
  const redirectToRole = (user?: User) => {
    const url = getRedirectUrl(user);
    router.push(url);
  };

  return {
    isAuthenticated: clientIsAuthenticated,
    user: clientUser,
    isLoading: authState?.isLoading || !isInitialized,
    pendingVerification: authState?.pendingVerification || null,
    logout,
    checkAuth,
    redirectToRole,
    getRedirectUrl,
  };
}

// Hook for protecting components/pages
export function useAuthGuard(requiredRole?: 'student' | 'teacher' | 'admin') {
  const { isAuthenticated, user, isLoading } = useDjangoAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      // Redirect to appropriate dashboard
      const redirectUrl = user?.role === 'teacher' 
        ? '/teacher/courses' 
        : user?.role === 'admin'
        ? '/admin/dashboard'
        : '/user/laboratory/learn';
      
      router.push(redirectUrl);
      return;
    }

    setIsAuthorized(true);
  }, [isAuthenticated, user, requiredRole, router, isLoading]);

  return {
    isAuthorized,
    isLoading: isLoading || !isAuthorized,
    user
  };
}

/**
 * Validate redirect URL to prevent Open Redirect attacks
 * Only allows relative paths within the same origin
 *
 * @param url - The URL to validate
 * @returns The validated URL or null if invalid
 */
function validateRedirectUrl(url: string | null): string | null {
  if (!url) return null;

  // Must start with / (relative path)
  if (!url.startsWith('/')) return null;

  // Must not start with // (protocol-relative URL)
  if (url.startsWith('//')) return null;

  // Must not contain protocol
  if (url.includes('://')) return null;

  // Must not contain newlines or null bytes (header injection)
  if (/[\r\n\0]/.test(url)) return null;

  // Must not start with /\ (Windows path injection)
  if (url.startsWith('/\\')) return null;

  // Decode and re-check (prevent double encoding attacks)
  try {
    const decoded = decodeURIComponent(url);
    if (decoded !== url) {
      // URL was encoded, validate the decoded version
      if (decoded.includes('://') || decoded.startsWith('//')) return null;
    }
  } catch {
    // Invalid encoding
    return null;
  }

  return url;
}

// Hook for redirect after login
export function useLoginRedirect() {
  const router = useRouter();

  return (user: User, searchParams?: URLSearchParams) => {
    // Check for redirect parameter with validation
    const redirectParam = searchParams?.get('redirect') ?? null;
    const validatedRedirect = validateRedirectUrl(redirectParam);

    if (validatedRedirect) {
      router.push(validatedRedirect);
      return;
    }

    // Check for checkout context
    const isCheckout = searchParams?.get('showSignUp') !== null;
    const courseId = searchParams?.get('id');

    if (isCheckout && courseId) {
      router.push(`/checkout?step=2&id=${courseId}`);
      return;
    }

    // Default role-based redirect
    switch (user.role) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'teacher':
        router.push('/teacher/courses');
        break;
      case 'student':
      default:
        router.push('/user/courses/explore');
        break;
    }
  };
}