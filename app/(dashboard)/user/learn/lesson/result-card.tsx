import { cn } from "@/lib/utils";
import { Heart, Zap, Trophy, Star } from "lucide-react";

type Props = {
    value:number;
    variant : "points" | "hearts"
};

export const ResultCard = ({value, variant}:Props) => {
    return (
        <div className={cn(
            "rounded-2xl border-2 w-full relative overflow-hidden group transition-all duration-300 hover:scale-105 shadow-lg",
            variant === "points" && "bg-gradient-to-br from-orange-400 to-amber-500 border-orange-500/50 hover:shadow-orange-500/25",
            variant === "hearts" && "bg-gradient-to-br from-rose-500 to-pink-600 border-rose-500/50 hover:shadow-rose-500/25"
        )}>
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Header */}
            <div className={cn(
                "p-3 text-white rounded-t-xl font-bold text-center uppercase text-sm relative",
                variant === "hearts" && "bg-gradient-to-r from-rose-600 to-pink-700",
                variant === "points" && "bg-gradient-to-r from-orange-500 to-amber-600"
            )}>
                <div className="flex items-center justify-center gap-2">
                    {variant === "hearts" ? (
                        <>
                            <Heart className="h-4 w-4 fill-current animate-pulse" />
                            <span>Corações</span>
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4 fill-current animate-bounce" />
                            <span>Total XP</span>
                        </>
                    )}
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-1 right-2 w-2 h-2 bg-white/30 rounded-full animate-ping" />
                <div className="absolute bottom-1 left-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-100" />
            </div>
            
            {/* Value Display */}
            <div className={cn(
                "rounded-b-2xl bg-gradient-to-br from-customgreys-primarybg to-customgreys-secondarybg items-center flex flex-col justify-center p-8 relative backdrop-blur-sm",
                variant === "hearts" && "text-rose-400",
                variant === "points" && "text-orange-400"
            )}>
                {/* Main value */}
                <div className="flex items-center gap-2 mb-2">
                    {variant === "points" && <Trophy className="h-6 w-6 text-yellow-400 animate-bounce" />}
                    {variant === "hearts" && <Star className="h-6 w-6 text-pink-400 animate-spin-slow" />}
                    
                    <span className="text-4xl font-black bg-gradient-to-r from-current to-white bg-clip-text text-transparent">
                        {value}
                    </span>
                </div>
                
                {/* Achievement indicator */}
                <div className={cn(
                    "text-xs font-medium opacity-70 uppercase tracking-wider",
                    variant === "hearts" && "text-rose-300",
                    variant === "points" && "text-orange-300"
                )}>
                    {variant === "hearts" ? "Restantes" : "Pontos Ganhos"}
                </div>
                
                {/* Decorative sparkles */}
                <div className="absolute top-2 right-3 w-1 h-1 bg-current rounded-full animate-ping delay-75" />
                <div className="absolute bottom-3 left-2 w-1.5 h-1.5 bg-current rounded-full animate-pulse delay-200" />
                <div className="absolute top-1/2 right-1 w-1 h-1 bg-current rounded-full animate-bounce delay-300" />
            </div>
            
            {/* Glow effect */}
            <div className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                variant === "points" && "shadow-[0_0_30px_rgba(251,146,60,0.3)]",
                variant === "hearts" && "shadow-[0_0_30px_rgba(244,63,94,0.3)]"
            )} />
        </div>
    )
}