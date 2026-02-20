import { NextRequest, NextResponse } from "next/server";
import { djangoAuthMiddleware } from "@/lib/django-middleware";

// Public routes that should always be accessible without authentication
const PUBLIC_AUTH_ROUTES = ['/signin', '/signup', '/verify-email', '/forgot-password', '/auth/google/callback'];

function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_AUTH_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow public auth routes to pass through immediately
  if (isPublicAuthRoute(pathname)) {
    // Handle explicit logout - clear cookies
    const isExplicitLogout = request.nextUrl.searchParams.get('logout') === 'true';
    if (isExplicitLogout) {
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('auth_state');
      return response;
    }
    return NextResponse.next();
  }

  // For all other routes, use the Django auth middleware
  return djangoAuthMiddleware(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};