"use client";
// import AppSidebar from "@/components/course/AppSidebar";
import Loading from "@/components/course/Loading";

import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChaptersSidebar from "./user/courses/[courseId]/ChaptersSidebar";
import SidebarHeader from "@/components/dashboard/sidebar/sidebar-header";
import AppSidebar from "@/components/dashboard/sidebar/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [courseId, setCourseId] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  const isCoursePage = /^\/user\/courses\/[^\/]+(?:\/chapters\/[^\/]+)?$/.test(
    pathname
  );

  useEffect(() => {
    if (isCoursePage) {
      const match = pathname.match(/\/user\/courses\/([^\/]+)/);
      setCourseId(match ? match[1] : null);
    } else {
      setCourseId(null);
    }
  }, [isCoursePage, pathname]);

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to access this page.</div>;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-customgreys-primarybg flex">
        <AppSidebar />
        
        <div className="flex flex-1 overflow-hidden">
          {courseId && <ChaptersSidebar />}
          <div
            className={cn(
              "flex-grow min-h-screen transition-all duration-500 ease-in-out overflow-y-auto bg-customgreys-secondarybg",
              isCoursePage && "bg-customgreys-primarybg"
            )}
            style={{ height: "100vh" }}
          >
            <SidebarHeader isCoursePage={isCoursePage} />
            <main className="px-8 py-4">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
