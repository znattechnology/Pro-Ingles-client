import React from "react";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import Chatbot from "@/components/Chatbot";


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full bg-black">
       <Header/>
        {children}
        <Footer/>
        <Chatbot />
    </div>
  );
};

export default Layout;
