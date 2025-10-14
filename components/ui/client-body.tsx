"use client";

import { useEffect } from "react";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"] });

export function ClientBody({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply body classes after hydration to prevent mismatch
    document.body.className = `${dmSans.className} antialiased bg-black`;
  }, []);

  return <>{children}</>;
}