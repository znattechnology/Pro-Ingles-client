'use client';

import React from "react";
import Logo from "@/public/logo/logo.png";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, MoveRight, User, LogOut } from 'lucide-react';
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClientOnly from "@/components/ClientOnly";




const Header = () => {
  const { isAuthenticated, user, logout } = useDjangoAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileUrl = () => {
    if (!user) return '/signin';
    return user.role === 'teacher' ? '/teacher/profile' : '/user/profile';
  };

  return (
  
<>
<header className="fixed top-0 z-20 w-full backdrop-blur-md">
      {/* Banner */}
      <div className="flex justify-center items-center py-3 bg-black text-sm text-white/70">
        <div className="inline-flex gap-1 items-center">
          <p>Faça ja a sua inscrição</p>
          <MoveRight className="h-4 w-4 inline-flex justify-center items-center " size={24}/>

          {/* <ArrowRight className="h-4 w-4 inline-flex justify-center items-center" /> */}
        </div>
      </div>
  
      {/* Menu */}
      <div className="py-5">
        <div className="container">
          <div className="flex items-center justify-between text-violet-500">
            <Link href={"/"}>
            <Image 
              src={Logo} 
              alt="Logo" 
              height={100} 
              width={100} 
              priority 
              style={{ width: 'auto', height: 'auto' }}
            />
            </Link>
            <Sheet >
              <SheetTrigger asChild>
               
                <Menu className="h-10 w-10 md:hidden cursor-pointer" size={24}  />
                {/* <MenuIcon className="h-5 w-5 md:hidden cursor-pointer" /> */}
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black">
              <div className="gradient-03  z-0" />
                <nav className="flex flex-col gap-6 mt-6 text-white/70">
                  <Link href="/about" className="hover:text-white transition-colors">Sobre Nós</Link>
                  <button onClick={() => handleScrollToSection('practice-lab')} className="hover:text-white transition-colors text-left">Serviços</button>
                  <Link href="/search" className="hover:text-white transition-colors">Cursos</Link>
                  <button onClick={() => handleScrollToSection('pricing')} className="hover:text-white transition-colors text-left">Planos</button>
                  <button onClick={() => handleScrollToSection('testimonials')} className="hover:text-white transition-colors text-left">Testemunhos</button>
                  <ClientOnly>
                    {isAuthenticated && user ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-white text-sm">Olá, {user.name}</span>
                        <Link href={getProfileUrl()} className="text-violet-400 hover:text-violet-300">Perfil</Link>
                        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium inline-flex justify-center hover:bg-red-700">
                          Sair
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link href="/signin" className="bg-violet-800 text-white px-4 py-2 rounded-lg font-medium inline-flex justify-center hover:bg-violet-900">
                          Iniciar sessão
                        </Link>
                        <Link href="/signup" className="border border-violet-800 text-violet-400 px-4 py-2 rounded-lg font-medium inline-flex justify-center hover:bg-violet-800 hover:text-white">
                          Registar
                        </Link>
                      </div>
                    )}
                  </ClientOnly>
                </nav>
              </SheetContent>
            </Sheet>
            <nav className="hidden md:flex gap-6 items-center text-white/70">
              <Link href="/about" className="hover:text-white transition-colors">Sobre Nós</Link>
              <button onClick={() => handleScrollToSection('practice-lab')} className="hover:text-white transition-colors">Serviços</button>
              <Link href="/search" className="hover:text-white transition-colors">Cursos</Link>
              <button onClick={() => handleScrollToSection('pricing')} className="hover:text-white transition-colors">Planos</button>
              <button onClick={() => handleScrollToSection('testimonials')} className="hover:text-white transition-colors">Testemunhos</button>
              
              <ClientOnly>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="relative h-10 w-10 rounded-full bg-transparent hover:bg-violet-900/20 border-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-violet-800 text-white">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-black border-violet-900" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal text-white">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                          <p className="text-xs text-violet-400 capitalize">{user.role}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem asChild className="text-white hover:bg-violet-900">
                        <Link href={getProfileUrl()}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="text-white hover:bg-violet-900 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex gap-3 items-center">
                    <Link
                      href="/signin"
                      className="text-white hover:text-white-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border-violet-500 border-[1px] text-sm sm:text-base transition-colors"
                      scroll={false}
                    >
                      Iniciar sessão
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-violet-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-violet-900 hover:text-white/70 text-sm sm:text-base transition-colors"
                      scroll={false}
                    >
                      Registar
                    </Link>
                  </div>
                )}
              </ClientOnly>
            </nav>
          </div>
        </div>
      </div>
    </header>
</>
  );
};

export default Header;
