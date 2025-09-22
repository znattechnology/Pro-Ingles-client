/**
 * Toast Provider and Hooks using Sonner
 * 
 * Modern toast notifications with dark theme support
 */

"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as any}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-customgreys-secondarybg group-[.toaster]:text-white group-[.toaster]:border-customgreys-darkerGrey group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-customgreys-dirtyGrey",
          actionButton: "group-[.toast]:bg-violet-600 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-customgreys-darkGrey group-[.toast]:text-customgreys-dirtyGrey",
          error: "group-[.toaster]:bg-red-500/10 group-[.toaster]:border-red-500/30 group-[.toaster]:text-red-400",
          success: "group-[.toaster]:bg-green-500/10 group-[.toaster]:border-green-500/30 group-[.toaster]:text-green-400",
          warning: "group-[.toaster]:bg-yellow-500/10 group-[.toaster]:border-yellow-500/30 group-[.toaster]:text-yellow-400",
          info: "group-[.toaster]:bg-blue-500/10 group-[.toaster]:border-blue-500/30 group-[.toaster]:text-blue-400",
        },
        style: {
          background: "rgb(30, 30, 35)",
          border: "1px solid rgb(45, 45, 55)",
          color: "white",
        },
      }}
    />
  );
}

// Export toast function for easy imports
export { toast } from "sonner";