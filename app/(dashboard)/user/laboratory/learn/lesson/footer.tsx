import {useKey,useMedia} from "react-use";
import {CheckCircle, XCircle, ArrowRight, RotateCcw, Play, Sparkles} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";


type Props = {
    onCheck: () => void;
    status: "correct" | "wrong" | "none" | "completed";
    disabled?: boolean;
    lessonId?: string | number;
};

export const Footer = ({onCheck,status,disabled,lessonId}:Props) => {

    useKey("Enter",onCheck , {},[onCheck])
    const isMobile = useMedia("(max-width: 1024px)");
    
    return (
        <footer className={cn(
            "lg:h-[140px] h-[100px] border-t-2 mt-16 relative transition-all duration-500",
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
            
           <div className="relative max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">

                {/* Success Message */}
                {status === "correct" && (
                    <div className="group flex items-center space-x-4">
                        <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-2 lg:p-3 rounded-full shadow-lg animate-bounce">
                            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                        </div>
                        <div>
                            <div className="text-green-400 font-bold text-base lg:text-2xl flex items-center gap-2">
                                Perfeito!
                                <Sparkles className="h-5 w-5 text-yellow-400 animate-spin" />
                            </div>
                            <p className="text-green-300/70 text-xs lg:text-sm">Você acertou!</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {status === "wrong" && (
                    <div className="group flex items-center space-x-4">
                        <div className="relative bg-gradient-to-br from-rose-500 to-red-600 p-2 lg:p-3 rounded-full shadow-lg animate-pulse">
                            <XCircle className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce" />
                        </div>
                        <div>
                            <div className="text-rose-400 font-bold text-base lg:text-2xl">
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
                        className="group bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400/50 transition-all duration-300"
                    >
                        <RotateCcw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                        Praticar Novamente
                    </Button>
                )}

                {/* Main Action Button */}
                <Button
                    disabled={disabled}
                    className={cn(
                        "ml-auto group relative overflow-hidden transition-all duration-300 shadow-lg",
                        status === "wrong" && "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 shadow-rose-500/25",
                        status === "correct" && "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 shadow-green-500/25",
                        status === "none" && "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 shadow-violet-500/25",
                        status === "completed" && "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-blue-500/25",
                        disabled && "opacity-50 cursor-not-allowed grayscale"
                    )}
                    onClick={onCheck}
                    size={isMobile ? "sm" : "lg"}
                >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    <div className="relative flex items-center gap-2 font-semibold">
                        {status === "none" && (
                            <>
                                <span>Verificar</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </>
                        )}
                        {status === "correct" && (
                            <>
                                <span>Próxima</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </>
                        )}
                        {status === "wrong" && (
                            <>
                                <RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                                <span>Tentar Novamente</span>
                            </>
                        )}
                        {status === "completed" && (
                            <>
                                <span>Continuar</span>
                                <Play className="h-4 w-4 fill-current group-hover:translate-x-1 transition-transform duration-200" />
                            </>
                        )}
                    </div>
                </Button>
           </div>
        </footer>
    )
}