"use client";
import React, { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import LogoTipo from "@/public/logo/logo.png";

import {

  BookOpen,

  ChevronRight,

  LogOut,

  Briefcase,
  User,
  Settings,
  FlaskConical,
  TrendingUp,

} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import Loading from "@/components/course/Loading";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { usePathname } from "next/navigation";



const navLinks = {
  student: [
    {
      title: "Dashboard",
      url: "/user/dashboard", 
      icon: TrendingUp,
      isActive: true,
      items: [
        {
          title: "Visão Geral",
          url: "/user/dashboard",
        },
      ],
    },
    {
      title: "Cursos",
      url: "/user/courses",
      icon:  BookOpen,
      isActive: true,
      items: [
        {
          title: "Ver todos",
          url: "/user/courses",
        },
      ],
    },
    {
      title: "Pagamentos",
      url: "/user/billing",
      icon:  Briefcase,
      isActive: true,
      items: [
        {
          title: "Pagamentos",
          url: "/user/billing",
        },
      ],
    },
    {
      title: "Perfil",
      url: "Perfil",
      icon:  User,
      isActive: true,
      items: [
        {
          title: "Perfil",
          url: "/user/profile",
        },
      ],
    },
    {
      title: "Laboratório",
      url: "/user/learn",
      icon: FlaskConical,
      isActive: true,
      items: [
        {
          title: "Aprender",
          url: "/user/learn/courses",
        },
        {
          title: "Praticar",
          url: "/user/learn",
        },
        {
          title: "Classificações", 
          url: "/user/leaderboard",
        },
        {
          title: "Conquistas",
          url: "/user/achievements",
        },
        {
          title: "Loja",
          url: "/user/learn/shop",
        },
      ],
    },
    {
      title: "Configurações",
      url: "/user/settings",
      icon:  Settings,
      isActive: true,
      items: [
        {
          title: "Configurações",
          url: "/user/settings",
        },
      ],
    },
   

  ],
  teacher: [
    {
      title: "Cursos",
      url: "/teacher/courses",
      icon:  BookOpen,
      isActive: true,
      items: [
        {
          title: "Ver todos",
          url: "/teacher/courses",
        },
      ],
    },
    {
      title: "Pagamentos",
      url: "/teacher/billing",
      icon:  Briefcase,
      isActive: true,
      items: [
        {
          title: "Pagamentos",
          url: "/teacher/billing",
        },
      ],
    },
    {
      title: "Perfil",
      url: "Perfil",
      icon:  User,
      isActive: true,
      items: [
        {
          title: "Perfil",
          url: "/teacher/profile",
        },
      ],
    },
    {
      title: "Laboratório",
      url: "/teacher/laboratory",
      icon: FlaskConical,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/teacher/laboratory",
        },
        {
          title: "Criar Curso",
          url: "/teacher/laboratory/create-course",
        },
        {
          title: "Gerenciar Cursos",
          url: "/teacher/laboratory/manage-courses",
        },
        {
          title: "Construtor de Lições",
          url: "/teacher/laboratory/lesson-constructor",
        },
        {
          title: "Construtor de Desafios",
          url: "/teacher/laboratory/challenge-constructor",
        },
        {
          title: "Analytics",
          url: "/teacher/laboratory/analytics",
        },
      ],
    },
    {
      title: "Configurações",
      url: "/teacher/settings",
      icon:  Settings,
      isActive: true,
      items: [
        {
          title: "Configurações",
          url: "/teacher/settings",
        },
      ],
    },
  ],
  admin: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        },
      ],
    },
    {
      title: "Usuários",
      url: "/admin/users",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Ver todos",
          url: "/admin/users",
        },
      ],
    },
    {
      title: "Cursos",
      url: "/admin/courses",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Ver todos",
          url: "/admin/courses",
        },
      ],
    },
  ],
};

const AppSidebar = React.memo(() => {
  const { user, isAuthenticated, isLoading, logout } = useDjangoAuth();
  const pathname = usePathname();

  // Compute userType and currentNavLinks before early returns to satisfy hooks rules
  const userType = user?.role as "student" | "teacher" | "admin";
  const currentNavLinks = useMemo(() => 
    userType && navLinks[userType] ? navLinks[userType] : navLinks.student, 
    [userType]
  );

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) return <div>User not found</div>;





  return (
    <Sidebar collapsible="icon" className="border-r-[0.5px]  border-r-violet-900/30">
      <SidebarHeader>
      <Link href={"/"}>
            <Image 
              src={LogoTipo} 
              alt="Logo" 
              height={100} 
              width={100} 
              priority
              style={{ height: 'auto', width: 'auto' }}
            />
            </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {currentNavLinks.map((item) => (
             
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-white hover:text-violet-800" tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span className="text-white hover:text-violet-800">{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-white" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="text-violet-800">
                      {item.items?.map((subItem) => {
                         const isActive = pathname.startsWith(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title} className="text-white">
                              <SidebarMenuSubButton asChild     className={cn(
                                                      "text-white",
                                                      isActive ? "text-white bg-violet-800 hover:bg-violet-900" : "text-gray-500"
                                                    )}>
                                <Link href={subItem.url} className="text-white ">
                                  <span  className={cn(
                                                      "text-white/55",
                                                      isActive ? "text-white " : "text-gray-500"
                                                    )}>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                      } )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
          <SidebarMenuButton asChild>
              <button
                onClick={() => logout()}
                className="text-white pl-8 hover:text-violet-800"
              >
                <LogOut className="mr-2 h-6 w-6" />
                <span>Sair</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
