"use client";
import React from "react";
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
import LogoTipo from "@/public/logo/Logo_Branco.png";

import {

  BookOpen,

  ChevronRight,

  LogOut,

  Briefcase,
  User,
  Settings,

} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Logo from "@/components/logo";
import Loading from "@/components/course/Loading";
import { useClerk, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";



const navLinks = {
  student: [

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
          title: "Pagamentos",
          url: "/user/profile",
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
          title: "Pagamentos",
          url: "/teacher/profile",
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


};

function AppSidebar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  if (!isLoaded) return <Loading />;
  if (!user) return <div>User not found</div>;

  const userType =
    (user.publicMetadata.role as "student" | "teacher") || "student";
  const currentNavLinks = navLinks[userType];

  console.log(user.publicMetadata.userType)




  return (
    <Sidebar collapsible="icon" className="border-r-[0.5px]  border-r-violet-900/30">
      <SidebarHeader>
      <Link href={"/"}>
            <Image src={LogoTipo} alt="Logo" height={100} width={100} />
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
                onClick={() => signOut()}
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
}

export default AppSidebar;
