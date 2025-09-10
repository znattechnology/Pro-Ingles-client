"use client";
// import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/globals.css";
import clsx from "clsx";

import { Toaster } from "sonner";
import Providers from "./Provider";
import { Suspense } from "react";

const dmSans = DM_Sans({ subsets: ["latin"] });

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
  );
}
