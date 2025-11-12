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
  const { isAuthenticated, user, isLoading } = useDjangoAuth();
  const { setOpen, open } = useSidebar();
  const previousOpenState = useRef<boolean | null>(null);
  
  // Only match chapter pages specifically, NOT course details pages
  // Only show ChaptersSidebar when we're in a specific chapter
  const isCoursePage = /^\/user\/courses\/[a-zA-Z0-9\-_]+\/chapters\/[a-zA-Z0-9\-_]+$/.test(pathname);

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

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
            <Loading/>
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
