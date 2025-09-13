import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-violet-950 relative overflow-hidden">
      {/* Static background to prevent flash */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-violet-950 -z-10" />
      
      {/* Enhanced background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-600/5 to-transparent rounded-full blur-3xl animate-pulse will-change-transform" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/5 to-transparent rounded-full blur-3xl animate-pulse will-change-transform" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl animate-bounce will-change-transform" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-bounce will-change-transform" style={{ animationDuration: '3s', animationDelay: '2s' }} />
      </div>
      
      {/* Animated grid pattern */}
      <div className="fixed inset-0 opacity-[0.02] z-0">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      
      {/* Main content with smooth transitions */}
      <main className="relative z-10 min-h-screen flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
        <div className="w-full max-w-md transform transition-all duration-300 ease-in-out">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
