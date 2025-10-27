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
import { cn } from "@/lib/utils";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

import {
  BookOpen,
  ChevronRight,
  LogOut,
  User,
  Settings,
  FlaskConical,
  Trophy,
  Target,
  Users,
  Award,
  Zap,
  BarChart3,
  PlusCircle,
  FolderOpen,
  Wrench,
  CreditCard,
  LayoutDashboard,
  Mic,
  MessageCircle,
  Volume2,
  TrendingUp,
  Headphones,
  PenTool,
  Crown,
  ArrowUp,
  Receipt,
  Globe,
  DollarSign
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
      icon: LayoutDashboard,
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
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Meus Cursos",
          url: "/user/courses",
        },
        {
          title: "Explorar Cursos",
          url: "/user/courses/explore",
        },
      ],
    },
    {
      title: "Assinatura",
      url: "/user/subscription",
      icon: Crown,
      isActive: true,
      items: [
        {
          title: "Meu Plano",
          url: "/user/subscription",
          icon: Crown
        },
        {
          title: "Fazer Upgrade",
          url: "/user/upgrade",
          icon: ArrowUp
        },
      ],
    },
    {
      title: "Pagamentos",
      url: "/user/billing",
      icon: CreditCard,
      isActive: true,
      items: [
        {
          title: "Faturas",
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
      title: "Aprendizado",
      url: "/user/laboratory/learn",
      icon: Target,
      isActive: true,
      items: [
        {
          title: "Praticar",
          url: "/user/laboratory/learn",
          icon: Target,
        },
        {
          title: "Classificações", 
          url: "/user/laboratory/leaderboard",
          icon: Trophy,
        },
        {
          title: "Conquistas",
          url: "/user/laboratory/achievements",
          icon: Award,
        },
        {
          title: "Loja",
          url: "/user/laboratory/learn/shop",
          icon: Zap,
        },
      ],
    },
    {
      title: "Speaking Practice",
      url: "/user/speaking",
      icon: Mic,
      isActive: true,
      items: [
        {
          title: "Praticar Conversação",
          url: "/user/speaking/practice",
          icon: MessageCircle,
        },
        {
          title: "Exercícios de Pronúncia", 
          url: "/user/speaking/pronunciation",
          icon: Volume2,
        },
        {
          title: "Meu Progresso",
          url: "/user/speaking/progress",
          icon: TrendingUp,
        },
        {
          title: "Conquistas",
          url: "/user/speaking/achievements", 
          icon: Award,
        },
      ],
    },
    {
      title: "Listening Practice",
      url: "/user/listening",
      icon: Headphones,
      isActive: true,
      items: [
        {
          title: "Compreensão Auditiva",
          url: "/user/listening/practice",
          icon: Headphones,
        },
        {
          title: "Ditado",
          url: "/user/listening/dictation",
          icon: PenTool,
        },
        {
          title: "Sotaques",
          url: "/user/listening/accents",
          icon: Globe,
        },
        {
          title: "Meu Progresso",
          url: "/user/listening/progress",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Laboratório",
      url: "/user/laboratory",
      icon: FlaskConical,
      isActive: true,
      items: [
        {
          title: "Exercícios",
          url: "/user/laboratory",
          icon: FlaskConical,
        },
      ],
    },
    {
      title: "Definições",
      url: "/user/settings",
      icon:  Settings,
      isActive: true,
      items: [
        {
          title: "Definições",
          url: "/user/settings",
        },
      ],
    },
   

  ],
  teacher: [
    {
      title: "Dashboard",
      url: "/teacher/courses",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Visão Geral",
          url: "/teacher/courses",
        },
      ],
    },
    {
      title: "Cursos",
      url: "/teacher/courses",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Meus Cursos",
          url: "/teacher/courses",
        },
      ],
    },
    {
      title: "Faturamento",
      url: "/teacher/billing",
      icon: CreditCard,
      isActive: true,
      items: [
        {
          title: "Receitas",
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
          title: "Painel",
          url: "/teacher/laboratory",
          icon: LayoutDashboard,
        },
        {
          title: "Criar Curso",
          url: "/teacher/laboratory/create-course",
          icon: PlusCircle,
        },
        {
          title: "Gerenciar Cursos",
          url: "/teacher/laboratory/manage-courses",
          icon: FolderOpen,
        },
        {
          title: "Construtor de Lições",
          url: "/teacher/laboratory/lesson-constructor",
          icon: Wrench,
        },
        {
          title: "Construtor de Desafios",
          url: "/teacher/laboratory/challenge-constructor",
          icon: Target,
        },
        {
          title: "Analytics",
          url: "/teacher/laboratory/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Definições",
      url: "/teacher/settings",
      icon:  Settings,
      isActive: true,
      items: [
        {
          title: "Definições",
          url: "/teacher/settings",
        },
      ],
    },
  ],
  admin: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Painel Geral",
          url: "/admin/dashboard",
        },
      ],
    },
    {
      title: "Utilizadores",
      url: "/admin/users",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Gerir Utilizadores",
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
          title: "Gerenciar Cursos",
          url: "/admin/courses",
        },
      ],
    },
    {
      title: "Assinaturas",
      url: "/admin/subscriptions",
      icon: Crown,
      isActive: true,
      items: [
        {
          title: "Planos",
          url: "/admin/subscriptions/plans",
          icon: Crown,
        },
        {
          title: "Utilizadores Assinantes",
          url: "/admin/subscriptions/users",
          icon: Users,
        },
        {
          title: "Relatórios",
          url: "/admin/subscriptions/reports",
          icon: BarChart3,
        },
        {
          title: "Códigos Promocionais",
          url: "/admin/subscriptions/promo-codes",
          icon: Receipt,
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
    <Sidebar collapsible="icon" className="border-r border-violet-900/20 bg-gradient-to-b from-customgreys-primarybg to-customgreys-darkGrey">
      <SidebarHeader className="border-b border-violet-900/20 p-4">
        <Link href={"/"} className="flex items-center justify-center group">
          <Logo 
            size="md"
            variant="white"
            className="transition-transform group-hover:scale-105 duration-200"
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
                    <SidebarMenuButton 
                      className="text-gray-300 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg mx-2 my-1" 
                      tooltip={item.title}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="font-medium">{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 w-4 h-4" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 border-l border-violet-900/20">
                      {item.items?.map((subItem) => {
                         const isActive = pathname.startsWith(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title} className="pl-4 py-1">
                              <SidebarMenuSubButton 
                                asChild 
                                className={cn(
                                  "w-full rounded-md transition-all duration-200 flex items-center gap-3 py-2 px-3",
                                  isActive 
                                    ? "bg-violet-800 text-white shadow-md" 
                                    : "text-gray-400 hover:text-white hover:bg-violet-800/10"
                                )}
                              >
                                <Link href={subItem.url} className="flex items-center gap-3 w-full">
                                  {(subItem as any).icon && React.createElement((subItem as any).icon, { className: "w-4 h-4" })}
                                  <span className="font-medium text-sm">{subItem.title}</span>
                                  {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full" />}
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
      <SidebarFooter className="border-t border-violet-900/20 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 text-gray-300 hover:text-white hover:bg-red-800/20 transition-all duration-200 rounded-lg p-3 group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Sair</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* User info */}
          <div className="mt-3 pt-3 border-t border-violet-900/20">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-violet-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
