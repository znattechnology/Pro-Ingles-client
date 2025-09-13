"use client";
// import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/globals.css";

import { Toaster } from "sonner";
import Providers from "./Provider";
import { Suspense } from "react";

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans"
});

// export const metadata: Metadata = {
//   title: "ProEnglish - Aprenda Inglês Online",
//   description: "Plataforma completa para aprendizado de inglês",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    <html lang="en" className="relative dark" suppressHydrationWarning>
      <body 
        className={`${dmSans.variable} font-sans antialiased bg-black`}
        suppressHydrationWarning
      >
        <Providers>
          <Suspense fallback={null}>
            {children}
          </Suspense>
          <Toaster 
            richColors 
            closeButton 
            toastOptions={{
              style: { background: '#1B1C22', color: '#fff', border: '1px solid #25262F' }
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
