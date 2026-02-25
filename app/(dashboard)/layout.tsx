"use client";

import Loading from "@/components/course/Loading";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ChaptersSidebar from "./user/courses/[courseId]/ChaptersSidebar";
import SidebarHeader from "@/components/dashboard/sidebar/sidebar-header";
import AppSidebar from "@/components/dashboard/sidebar/app-sidebar";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";

// Componente interno para usar o hook useSidebar
function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const { isAuthenticated, user } = useDjangoAuth();
  const { setOpen, open } = useSidebar();
  const previousOpenState = useRef<boolean | null>(null);

  // Only match chapter pages specifically, NOT course details pages
  // Only show ChaptersSidebar when we're in a specific chapter
  const isCoursePage = /^\/user\/courses\/[a-zA-Z0-9\-_]+\/chapters\/[a-zA-Z0-9\-_]+$/.test(pathname);

  // Note: Authentication redirect is handled by middleware (server-side)
  // This is just a fallback for edge cases
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthCheckComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isCoursePage) {
      const match = pathname.match(/\/user\/courses\/([^\/]+)/);
      setCourseId(match ? match[1] : null);

      // Auto-collapse sidebar na página de aulas (apenas uma vez)
      if (previousOpenState.current === null) {
        previousOpenState.current = open;
        setOpen(false);
      }
    } else {
      setCourseId(null);

      // Restaurar sidebar ao sair da página de aulas
      if (previousOpenState.current !== null) {
        setOpen(previousOpenState.current);
        previousOpenState.current = null;
      }
    }
  }, [isCoursePage, pathname, setOpen, open]);

  // Show loading while checking auth
  if (!isAuthenticated || !user) {
    // If auth check is complete and still not authenticated, show login prompt
    if (authCheckComplete) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-br from-customgreys-primarybg via-customgreys-darkGrey to-customgreys-primarybg flex items-center justify-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>

          {/* Decorative circles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10 text-center space-y-8 p-8 max-w-md mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {/* Logo/Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/25">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            {/* Text content */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white">
                Sessão Expirada
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                A sua sessão terminou ou não foi possível verificar a autenticação.
                Por favor, inicie sessão novamente para continuar.
              </p>
            </div>

            {/* Action button */}
            <a
              href="/signin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/30 hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Iniciar Sessão
            </a>

            {/* Help link */}
            <p className="text-xs text-gray-500">
              Problemas com o acesso?{' '}
              <a href="/help" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                Contacte o suporte
              </a>
            </p>
          </div>
        </div>
      );
    }

    // Loading state with matching design
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-customgreys-primarybg via-customgreys-darkGrey to-customgreys-primarybg flex items-center justify-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative z-10 text-center animate-in fade-in-0 duration-500">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-customgreys-primarybg via-customgreys-darkGrey to-customgreys-primarybg flex relative">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      <AppSidebar />
      
      <div className="flex flex-1 overflow-hidden relative">
        {courseId && (
          <div className="transition-all duration-300 ease-in-out">
            <ChaptersSidebar />
          </div>
        )}
        
        <div
          className={cn(
            "flex-grow min-h-screen transition-all duration-300 ease-in-out overflow-y-auto backdrop-blur-sm",
            isCoursePage 
              ? "bg-customgreys-primarybg/80" 
              : "bg-customgreys-secondarybg/80"
          )}
          style={{ height: "100vh" }}
        >
          <SidebarHeader isCoursePage={isCoursePage} />
          
          <main className="px-4 md:px-8 py-4 md:py-6 transition-all duration-300 ease-in-out">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <Breadcrumbs />
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
