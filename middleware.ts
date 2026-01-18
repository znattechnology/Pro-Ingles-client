import { NextRequest, NextResponse } from "next/server";
import { djangoAuthMiddleware } from "@/lib/django-middleware";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ FIX P1: Limpar cookies APENAS em logout explícito
  // Não deletar cookies automaticamente na rota raiz (/)
  if (pathname === '/signin' || pathname === '/signup') {
    const isExplicitLogout = request.nextUrl.searchParams.get('logout') === 'true';

    if (isExplicitLogout) {
      console.log('[Middleware] Explicit logout detected, clearing cookies');
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('user_data');
      return response;
    }
  }

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