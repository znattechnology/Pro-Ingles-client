"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "white" | "dark" | "color";
  withText?: boolean;
  linkToHome?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className,
  size = "md",
  variant = "white",
  withText = false,
  linkToHome = false
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  const logoSrc = withText 
    ? `/logo/Logo_${variant === "white" ? "Branco" : variant === "dark" ? "Preto" : "azul"}_com_assinatura.png`
    : `/logo/Logo_${variant === "white" ? "Branco" : variant === "dark" ? "Preto" : "azul"}.png`;

  const LogoImage = () => (
    <div className={cn(
      "relative flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      <Image
        src={logoSrc}
        alt="ProEnglish Logo"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-contain"
        priority
      />
    </div>
  );

  if (linkToHome) {
    return (
      <Link 
        href="/" 
        className="transition-transform hover:scale-105 duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg"
      >
        <LogoImage />
      </Link>
    );
  }

  return <LogoImage />;
};

export default Logo;