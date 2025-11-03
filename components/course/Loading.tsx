import { Loader2, BookOpen, Sparkles, Brain, LucideIcon } from "lucide-react";
import React from "react";

interface LoadingProps {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  progress?: number;
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const Loading = ({ 
  title = "ProEnglish",
  subtitle = "Learning Platform",
  description = "Preparando sua experiência de aprendizado...",
  icon: IconComponent = Brain,
  progress = 60,
  theme = {
    primary: "violet",
    secondary: "purple", 
    accent: "yellow"
  },
  size = "md"
}: LoadingProps) => {
  const sizeClasses = {
    sm: { container: "space-y-4", icon: "h-6 w-6", spinner: "w-6 h-6", text: "text-base", progress: "w-48" },
    md: { container: "space-y-8", icon: "h-8 w-8", spinner: "w-8 h-8", text: "text-lg", progress: "w-64" },
    lg: { container: "space-y-12", icon: "h-10 w-10", spinner: "w-10 h-10", text: "text-xl", progress: "w-80" }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-customgreys-secondarybg via-violet-950/20 to-purple-950/30 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.06),transparent_70%)]" />
      
      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-violet-400/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main loading content */}
      <div className={`relative z-10 flex flex-col items-center ${currentSize.container}`}>
        
        {/* Logo/Brand section */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`relative bg-gradient-to-br from-${theme.primary}-500 to-${theme.secondary}-600 p-4 rounded-2xl shadow-2xl animate-pulse`}>
            <IconComponent className={`${currentSize.icon} text-white`} />
            <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${theme.accent}-400 rounded-full animate-ping`} />
          </div>
          <div className="text-center">
            <h1 className={`${currentSize.text} font-bold bg-gradient-to-r from-${theme.primary}-400 to-${theme.secondary}-400 bg-clip-text text-transparent`}>
              {title}
            </h1>
            <p className="text-customgreys-dirtyGrey text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Enhanced Loading Spinner */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme.primary}-500/20 to-${theme.secondary}-500/20 rounded-full blur-lg animate-pulse`} />
          <div className={`relative bg-gradient-to-br from-customgreys-primarybg to-customgreys-secondarybg p-6 rounded-full border border-${theme.primary}-500/20 shadow-2xl`}>
            <Loader2 className={`${currentSize.spinner} animate-spin text-${theme.primary}-400`} />
          </div>
          
          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <BookOpen className="h-4 w-4 text-emerald-400 animate-bounce" />
            </div>
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-100" />
            </div>
            <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-200" />
            </div>
          </div>
        </div>

        {/* Loading Text with Animation */}
        <div className="text-center space-y-3">
          <div className="flex items-center gap-3 justify-center">
            <span className={`${currentSize.text} font-semibold text-white animate-pulse`}>Carregando</span>
            <div className="flex space-x-1">
              <div className={`w-2 h-2 bg-${theme.primary}-400 rounded-full animate-bounce`} />
              <div className={`w-2 h-2 bg-${theme.primary}-400 rounded-full animate-bounce delay-100`} />
              <div className={`w-2 h-2 bg-${theme.primary}-400 rounded-full animate-bounce delay-200`} />
            </div>
          </div>
          
          {/* Loading progress bar */}
          <div className={`${currentSize.progress} bg-customgreys-darkGrey rounded-full h-2 overflow-hidden shadow-inner`}>
            <div className={`h-full bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-500 rounded-full animate-pulse`} 
                 style={{ 
                   width: `${progress}%`,
                   animation: 'loading-bar 2s ease-in-out infinite'
                 }} 
            />
          </div>
          
          <p className="text-customgreys-dirtyGrey text-sm animate-fade-in">
            {description}
          </p>
        </div>
      </div>

      {/* Custom loading animation styles */}
      <style jsx>{`
        @keyframes loading-bar {
          0%, 100% { width: 20%; }
          50% { width: 80%; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;
