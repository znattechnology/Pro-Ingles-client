"use client";
// import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/globals.css";
import clsx from "clsx";

import { Toaster } from "sonner";
import Providers from "./Provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Suspense } from "react";

import Footer from "@/sections/Footer";
import Header from "@/sections/Header";


const dmSans = DM_Sans({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Light Saas Landing Page",
//   description: "Template created by Frontend Tribe",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    <ClerkProvider
    localization={ptBR}
     
    
    
    >
          <html lang="en" className="relative">
      <body className={clsx(dmSans.className, "antialiased bg-black")}>
        <Providers>
        <Suspense fallback={null}>
          {children}
          </Suspense>
          
        
          <Toaster richColors closeButton />
        </Providers>
      </body>
    </html>
    </ClerkProvider>

  );
}
