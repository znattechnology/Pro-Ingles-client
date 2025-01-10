import React from "react";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full bg-black">
        
       
        <Header/>
      <main className="w-full flex h-full justify-center items-center pt-32">
       
        {children}
        
        </main>
        <Footer/>
    </div>
  );
};

export default Layout;
