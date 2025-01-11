'use client';
// import ArrowRight from "@/public/arrow-right.svg";
import Logo from "@/public/logo/Logo_Branco.png";
// import MenuIcon from "@/public/menu.svg";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react";
// import { usePathname } from 'next/navigation';
// import { disablePageScroll, enablePageScroll } from "scroll-lock";
// import Login from "@/components/auth/Login";
// import SignUp from "@/components/auth/Sign-Up";
// import Verification from "@/components/auth/verification";
// import CustomModal from "@/utils/CustomModal";
import { Menu ,MoveRight } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { dark } from "@clerk/themes";




const Header = () => {



  // const pathname = usePathname();
  // const [openNavigation, setOpenNavigation] = useState(false);

  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const { user } = useUser();
  const userRole = user?.publicMetadata?.userType as "student" | "teacher";
  // const [route, setRoute] = useState("Login");
  // const toggleNavigation = () => {
  //   if (openNavigation) {
  //     setOpenNavigation(false);
  //     enablePageScroll();
  //   } else {
  //     setOpenNavigation(true);
  //     disablePageScroll();
  //   }
  // };

  // const handleClick = () => {
  //   if (!openNavigation) return;

  //   enablePageScroll();
  //   setOpenNavigation(false);
  // };
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
            <Image src={Logo} alt="Logo" height={100} width={100} />
            </Link>
            <Sheet >
              <SheetTrigger asChild>
               
                <Menu className="h-10 w-10 md:hidden cursor-pointer" size={24}  />
                {/* <MenuIcon className="h-5 w-5 md:hidden cursor-pointer" /> */}
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black">
              <div className="gradient-03  z-0" />
                <nav className="flex flex-col gap-6 mt-6 text-white/70">
                  <a href="#about">Sobre Nós</a>
                  <a href="#service">Serviços</a>
                  <a href="search">Cursos</a>
                  <a href="#plan">Planos</a>
                  <a href="#testimonial">Testemunhos</a>
                  <button onClick={() => setOpen(true)} className="bg-violet-800 text-white px-4 py-2 rounded-lg font-medium inline-flex justify-center">Login</button>
                </nav>
              </SheetContent>
            </Sheet>
            <nav className="hidden md:flex gap-6 items-center text-white/70">
              <a href="#about">Sobre Nós</a>
              <a href="#service">Serviços</a>
              <a href="search">Cursos</a>
              <a href="#plan">Planos</a>
              <a href="#testimonial">Testemunhos</a>
              {/* <button onClick={() => setOpen(true)} className="bg-violet-800 text-white px-4 py-2 rounded-lg font-medium inline-flex justify-center">Login</button> */}
            
              <SignedIn>
           
          <UserButton
          appearance={{
            baseTheme: dark,
            elements: {
              card: "bg-black w-full shadow-none", 
              userButtonOuterIdentifier: "text-white",
              userButtonBox: " text-white",
              userButtonTrigger: "border-white",
              userButtonPopoverCard: "bg-black border border-violet-900",
              userPreviewTextContainer: "text-white",
              userPreviewMainIdentifier: "text-white",
             
              userButtonPopoverFooter: "border-t border-white bg-black",
              userButtonPopoverActions: "text-white",
              footer: {
                background: "black",
                padding: "0rem 2.5rem",
                "& > div > div:nth-child(1)": {
                  background: "black",
                },
              },
            },
            
          }}
          showName={true}
          userProfileMode="navigation"
          userProfileUrl={
            userRole === "teacher" ? "/teacher/profile" : "/user/profile"
          }
        />
          </SignedIn>
          <SignedOut>
            <Link
              href="/signin"
              className="text-white  hover:text-white-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border-violet-500 border-[1px] text-sm sm:text-base"
              scroll={false}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-violet-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-violet-900 hover:text-white/70 text-sm sm:text-base"
              scroll={false}
            >
              Registrar
            </Link>
          </SignedOut>
            
            </nav>
          </div>
        </div>
      </div>
    </header>
    {/* {route === "Login" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Login}
            />
          )}
        </>
      )}
      {route === "SignUp" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={SignUp}
            />
          )}
        </>
      )}

      {route === "verification" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Verification}
            />
          )}
        </>
      )} */}
</>
 

  );
};

export default Header;
