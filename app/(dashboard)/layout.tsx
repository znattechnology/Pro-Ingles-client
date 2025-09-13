"use client";

import Loading from "@/components/course/Loading";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChaptersSidebar from "./user/courses/[courseId]/ChaptersSidebar";
import SidebarHeader from "@/components/dashboard/sidebar/sidebar-header";
import AppSidebar from "@/components/dashboard/sidebar/app-sidebar";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [courseId, setCourseId] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading } = useDjangoAuth();
  // Only match chapter pages specifically, NOT course details pages
  // Only show ChaptersSidebar when we're in a specific chapter
  const isCoursePage = /^\/user\/courses\/[a-zA-Z0-9\-_]+\/chapters\/[a-zA-Z0-9\-_]+$/.test(pathname);

  useEffect(() => {
    if (isCoursePage) {
      const match = pathname.match(/\/user\/courses\/([^\/]+)/);
      setCourseId(match ? match[1] : null);
    } else {
      setCourseId(null);
    }
  }, [isCoursePage, pathname]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
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
    </SidebarProvider>
  );
}
