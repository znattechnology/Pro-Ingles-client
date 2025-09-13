"use client";
import React from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, ChevronDown, LogOut, Search, Settings, HelpCircle } from "lucide-react";
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
    <div className={`flex h-16 items-center gap-2 md:gap-4 border-b px-4 md:px-6 ${isCoursePage ? 'bg-customgreys-primarybg' : 'bg-customgreys-primarybg'} border-b-violet-900/30 backdrop-blur-sm`}>
      <SidebarTrigger className="bg-violet-800/20 hover:bg-violet-800 text-white hover:text-white transition-all duration-200 rounded-lg p-2 lg:hidden" />
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Procurar cursos, lições..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-customgreys-darkGrey/50 border border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 rounded-lg h-10"
          />
        </div>
      </div>
      
      {/* Mobile search button */}
      <Button 
        variant="ghost" 
        size="icon"
        className="sm:hidden text-gray-400 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg"
      >
        <Search className="w-5 h-5" />
        <span className="sr-only">Procurar</span>
      </Button>
      {/* Action buttons */}
      <div className="flex items-center gap-1 md:gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="hidden md:flex text-gray-400 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="sr-only">Ajuda</span>
        </Button>
        
        <NotificationButton/>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="hidden md:flex text-gray-400 hover:text-white hover:bg-violet-800/20 transition-all duration-200 rounded-lg"
        >
          <Settings className="w-5 h-5" />
          <span className="sr-only">Configurações</span>
        </Button>
      </div>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-3 text-white hover:bg-violet-800/20 border border-violet-900/30 transition-all duration-200 rounded-lg p-3 h-12"
          >
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-customgreys-primarybg rounded-full"></div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-customgreys-darkGrey border border-violet-900/30 text-white shadow-xl rounded-lg p-2"
        >
          <div className="px-3 py-2 border-b border-violet-900/20 mb-2">
            <p className="font-medium text-white">{user?.name || 'Usuário'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
          
          <DropdownMenuItem 
            onClick={handleProfileClick}
            className="cursor-pointer hover:bg-violet-800/20 transition-colors duration-200 rounded-md flex items-center gap-2 p-3"
          >
            <User className="w-4 h-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-violet-800/20 transition-colors duration-200 rounded-md flex items-center gap-2 p-3"
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <div className="h-px bg-violet-900/20 my-2" />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer hover:bg-red-800/20 transition-colors duration-200 rounded-md flex items-center gap-2 p-3 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default SidebarHeader;

