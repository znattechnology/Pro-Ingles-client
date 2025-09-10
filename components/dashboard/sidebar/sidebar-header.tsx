"use client";
import React from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, ChevronDown, LogOut } from "lucide-react";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationButton from "@/components/notification-button";
import { useRouter } from "next/navigation";


function SidebarHeader({ isCoursePage }: { isCoursePage: boolean }) {
  const { user, logout } = useDjangoAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleProfileClick = () => {
    const profileUrl = user?.role === "teacher" ? "/teacher/profile" : 
                      user?.role === "admin" ? "/admin/profile" : 
                      "/user/profile";
    router.push(profileUrl);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className={`flex h-16 items-center gap-4 border-b px-4 ${isCoursePage ? 'bg-customgreys-primarybg' : 'bg-customgreys-primarybg'} border-b-violet-900/30`}>
      <SidebarTrigger className="bg-violet-800 hover:bg-violet-900 text-white hover:text-white" />
      <div className="flex-1">
        <Input
          placeholder="Procurar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm bg-customgreys-primarybg border border-violet-900/30 text-white/70 placeholder:text-white/70"
        />
      </div>
      {/* <Button variant="outline" size="icon">
      <span className="sr-only">Toggle theme</span>
      <Sun className="h-5 w-5" />
    </Button> */}
      {/* <Button variant="ghost" className="border border-violet-500" size="icon">
        <Plus className="h-5 w-5 text-violet-800" />
        <span className="sr-only ">Add new</span>
      </Button> */}

      <NotificationButton/>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-white hover:bg-violet-800 border border-violet-900/30"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-violet-800 rounded-full">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden md:block">{user?.name || 'Usuário'}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-black border border-violet-900 text-white"
        >
          <DropdownMenuItem 
            onClick={handleProfileClick}
            className="cursor-pointer hover:bg-violet-800"
          >
            <User className="w-4 h-4 mr-2" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer hover:bg-violet-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default SidebarHeader;

