import { NextRequest, NextResponse } from "next/server";
import { djangoAuthMiddleware } from "@/lib/django-middleware";

export default function middleware(request: NextRequest) {
  // Temporariamente desabilitar middleware para debug
  const { pathname } = request.nextUrl;
  
  // Forçar limpeza de tokens em rotas específicas
  if (pathname === '/signin' || pathname === '/signup' || pathname === '/') {
    const response = NextResponse.next();
    // Limpar todos os cookies de autenticação
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('user_data');
    return response;
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