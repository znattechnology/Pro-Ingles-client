/**
 * Custom React Hook for Django Authentication
 * Provides authentication state and utilities
 */

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/state/redux";
import { userLoggedIn, userLoggedOut, User } from "@/src/domains/auth";
import { getCurrentUser, isAuthenticated } from "@/lib/django-middleware";
import { djangoAuth } from "@/lib/django-auth";

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

  // Initialize authentication state on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const currentUser = getCurrentUser();
      
      if (token && refreshToken && currentUser) {
        // Restore authentication state from localStorage
        dispatch(userLoggedIn({
          accessToken: token,
          refreshToken: refreshToken,
          user: currentUser
        }));
        setClientIsAuthenticated(true);
        setClientUser(currentUser);
      } else {
        // Clear any invalid state
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        dispatch(userLoggedOut());
        setClientIsAuthenticated(false);
        setClientUser(null);
      }
    }
  }, [dispatch]);

  // Sync with Redux state changes
  useEffect(() => {
    if (authState) {
      setClientIsAuthenticated(authState.isAuthenticated);
      setClientUser(authState.user);
    }
  }, [authState?.isAuthenticated, authState?.user]);

  // Check authentication status
  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    
    const authenticated = isAuthenticated();
    const currentUser = getCurrentUser();
    
    if (authenticated && currentUser) {
      if (!authState?.isAuthenticated) {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (token && refreshToken) {
          dispatch(userLoggedIn({
            accessToken: token,
            refreshToken: refreshToken,
            user: currentUser
          }));
        }
      }
    } else {
      if (authState?.isAuthenticated) {
        dispatch(userLoggedOut());
      }
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
    isLoading: authState?.isLoading || false,
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
        : '/user/learn';
      
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

// Hook for redirect after login
export function useLoginRedirect() {
  const router = useRouter();

  return (user: User, searchParams?: URLSearchParams) => {
    // Check for redirect parameter
    const redirect = searchParams?.get('redirect');
    if (redirect) {
      router.push(redirect);
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