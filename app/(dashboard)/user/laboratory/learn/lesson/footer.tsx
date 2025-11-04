import {useKey,useMedia} from "react-use";
import {CheckCircle, XCircle, ArrowRight, RotateCcw, Play, Sparkles, Loader2} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";


type Props = {
    onCheck: () => void;
    status: "correct" | "wrong" | "none" | "completed";
    disabled?: boolean;
    lessonId?: string | number;
    pending?: boolean;
};

export const Footer = ({onCheck,status,disabled,lessonId,pending}:Props) => {

    useKey("Enter",onCheck , {},[onCheck])
    const isMobile = useMedia("(max-width: 1024px)");
    
    return (
        <footer className={cn(
            "lg:h-[140px] h-[90px] sm:h-[100px] border-t-2 mt-8 sm:mt-16 relative transition-all duration-500",
            status === "correct" && "border-transparent bg-gradient-to-r from-green-700/20 via-emerald-600/15 to-green-700/20 shadow-lg shadow-green-500/10",
            status === "wrong" && "border-transparent bg-gradient-to-r from-rose-700/20 via-red-600/15 to-rose-700/20 shadow-lg shadow-rose-500/10",
            status === "none" && "border-customgreys-darkerGrey/50 bg-customgreys-secondarybg",
            status === "completed" && "border-transparent bg-gradient-to-r from-violet-700/20 via-purple-600/15 to-violet-700/20 shadow-lg shadow-violet-500/10"
        )}>
            {/* Background effects for success/error states */}
            {status === "correct" && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] animate-pulse" />
            )}
            {status === "wrong" && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.1),transparent_70%)] animate-pulse" />
            )}
            
           <div className="relative max-w-[1140px] h-full mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-0 gap-3 sm:gap-0">

                {/* Success Message */}
                {status === "correct" && (
                    <div className="group flex items-center space-x-3 sm:space-x-4">
                        <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 sm:p-2 lg:p-3 rounded-full shadow-lg animate-bounce">
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-ping" />
                        </div>
                        <div>
                            <div className="text-green-400 font-bold text-sm sm:text-base lg:text-2xl flex items-center gap-1 sm:gap-2">
                                Perfeito!
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 animate-spin" />
                            </div>
                            <p className="text-green-300/70 text-xs lg:text-sm">Você acertou!</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {status === "wrong" && (
                    <div className="group flex items-center space-x-3 sm:space-x-4">
                        <div className="relative bg-gradient-to-br from-rose-500 to-red-600 p-1.5 sm:p-2 lg:p-3 rounded-full shadow-lg animate-pulse">
                            <XCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full animate-bounce" />
                        </div>
                        <div>
                            <div className="text-rose-400 font-bold text-sm sm:text-base lg:text-2xl">
                                Tente novamente!
                            </div>
                            <p className="text-rose-300/70 text-xs lg:text-sm">Não desista, você consegue!</p>
                        </div>
                    </div>
                )}

                {/* Completed State - Practice Again Button */}
                {status === "completed" && (
                    <Button 
                        variant="outline" 
                        size={isMobile ? "sm":"lg"} 
                        onClick={() => window.location.href=`/user/laboratory/learn/lesson/${lessonId}`}
                        className="group bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400/50 transition-all duration-300 w-full sm:w-auto min-h-[44px] order-last sm:order-first"
                    >
                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                        <span className="text-sm sm:text-base">Praticar Novamente</span>
                    </Button>
                )}

                {/* Main Action Button */}
                <Button
                    disabled={disabled || pending}
                    className={cn(
                        "sm:ml-auto group relative overflow-hidden transition-all duration-300 shadow-lg w-full sm:w-auto min-h-[44px] order-first sm:order-last",
                        status === "wrong" && "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 shadow-rose-500/25",
                        status === "correct" && "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 shadow-green-500/25",
                        status === "none" && "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 shadow-violet-500/25",
                        status === "completed" && "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-blue-500/25",
                        (disabled || pending) && "opacity-50 cursor-not-allowed grayscale",
                        pending && "animate-pulse border-2 border-white/10"
                    )}
                    onClick={onCheck}
                    size={isMobile ? "sm" : "lg"}
                >
                    {/* Button glow effect */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700",
                        pending && "translate-x-[-100%] animate-pulse"
                    )} />
                    
                    {/* Loading shimmer effect */}
                    {pending && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse opacity-50" />
                    )}
                    
                    <div className="relative flex items-center justify-center gap-1 sm:gap-2 font-semibold">
                        {pending ? (
                            <>
                                <div className="relative">
                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-white/90" />
                                    <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                                </div>
                                <span className="text-sm sm:text-base text-white/90 animate-pulse">Verificando...</span>
                                <div className="absolute inset-0 rounded-lg border border-white/10 animate-pulse" />
                            </>
                        ) : (
                            <>
                                {status === "none" && (
                                    <>
                                        <span className="text-sm sm:text-base">Verificar</span>
                                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                    </>
                                )}
                                {status === "correct" && (
                                    <>
                                        <span className="text-sm sm:text-base">Próxima</span>
                                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                    </>
                                )}
                                {status === "wrong" && (
                                    <>
                                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-180 transition-transform duration-300" />
                                        <span className="text-sm sm:text-base">Tentar Novamente</span>
                                    </>
                                )}
                                {status === "completed" && (
                                    <>
                                        <span className="text-sm sm:text-base">Continuar</span>
                                        <Play className="h-3 w-3 sm:h-4 sm:w-4 fill-current group-hover:translate-x-1 transition-transform duration-200" />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </Button>
           </div>
        </footer>
    )
}