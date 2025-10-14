import { X, HeartIcon, InfinityIcon, BookOpen, Trophy, Sparkles, Zap, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
    hearts:number;
    percentage:number;
    hasActiveSubscription:boolean;
};


export const Header = ({hearts,percentage,hasActiveSubscription}:Props) => {
    const {open} = useExitModal();
    
    return (
        <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-secondarybg to-violet-950/20 border-b border-customgreys-darkerGrey/50 shadow-2xl">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/8 via-purple-500/5 to-blue-500/8" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(124,58,237,0.1),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08),transparent_70%)]" />
            
            <div className="relative max-w-[1140px] mx-auto px-6 py-5">
                <div className="flex items-center justify-between mb-6">
                    {/* Enhanced Exit Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={open}
                        className="group text-customgreys-dirtyGrey hover:text-white hover:bg-customgreys-primarybg/80 transition-all duration-300 rounded-xl backdrop-blur-sm border border-transparent hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/10"
                    >
                        <X className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium">Sair</span>
                    </Button>
                    
                    {/* Enhanced Lesson Info */}
                    <div className="flex items-center gap-4 px-4 py-2 bg-violet-500/10 backdrop-blur-sm rounded-2xl border border-violet-500/20 shadow-lg">
                        <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-2 shadow-inner">
                            <BookOpen className="h-5 w-5 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-semibold text-sm">Lição em Progresso</p>
                                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs px-2 py-0.5">
                                    Ativo
                                </Badge>
                            </div>
                            <p className="text-customgreys-dirtyGrey text-xs flex items-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-400" />
                                {Math.round(percentage)}% concluído
                            </p>
                        </div>
                    </div>
                    
                    {/* Enhanced Hearts Display */}
                    <Card className={`bg-gradient-to-br from-red-500/15 to-pink-500/10 border-red-500/30 px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                        hearts <= 1 ? 'animate-pulse border-red-500/60 shadow-red-500/20' : 'hover:shadow-red-500/10'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className="relative bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-2 shadow-inner">
                                <HeartIcon className="h-5 w-5 text-white fill-current" />
                                {hearts <= 1 && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
                                )}
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                    {hasActiveSubscription ? (
                                        <div className="flex items-center gap-1">
                                            <InfinityIcon className="h-5 w-5 text-red-400 font-bold animate-pulse" />
                                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-white font-bold text-lg">{hearts}</span>
                                            <span className="text-customgreys-dirtyGrey text-sm">/5</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-red-400 text-xs font-medium">
                                    {hasActiveSubscription ? 'Pro Ilimitado' : 'Corações'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Enhanced Hearts Visual Indicator */}
                        {!hasActiveSubscription && (
                            <div className="flex gap-1 mt-2 justify-center">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 transform ${
                                            i < hearts 
                                                ? 'bg-gradient-to-r from-red-500 to-pink-500 scale-110 shadow-sm' 
                                                : 'bg-customgreys-darkGrey scale-90'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
                
                {/* Ultra Enhanced Progress Bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-400" />
                            <span className="text-white font-medium">Progresso da Lição</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-violet-500/10 border-violet-500/30 text-violet-300 text-xs">
                                {Math.round(percentage)}%
                            </Badge>
                        </div>
                    </div>
                    
                    <div className="relative bg-gradient-to-r from-customgreys-darkGrey to-customgreys-darkGrey/80 rounded-full h-4 overflow-hidden shadow-inner border border-customgreys-darkerGrey/50">
                        {/* Main Progress Bar */}
                        <div 
                            className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 h-full rounded-full transition-all duration-1000 ease-out relative shadow-lg"
                            style={{ width: `${percentage}%` }}
                        >
                            {/* Animated Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse" />
                            
                            {/* Progress Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-400/50 to-purple-400/50 rounded-full blur-sm animate-pulse" />
                            
                            {/* Sparkle at the end */}
                            {percentage > 0 && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <Sparkles className="h-3 w-3 text-white animate-spin-slow" />
                                </div>
                            )}
                        </div>
                        
                        {/* Enhanced Progress Milestones */}
                        {[25, 50, 75].map((milestone) => (
                            <div key={milestone} className="absolute top-0 h-full flex items-center" style={{ left: `${milestone}%` }}>
                                <div 
                                    className={`w-px h-full transition-all duration-300 ${
                                        percentage >= milestone 
                                            ? 'bg-gradient-to-b from-white/60 to-white/30 shadow-sm' 
                                            : 'bg-customgreys-dirtyGrey/30'
                                    }`}
                                />
                                {percentage >= milestone && (
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce shadow-sm" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Enhanced Progress Labels */}
                    <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1 text-customgreys-dirtyGrey">
                            <div className="w-2 h-2 bg-customgreys-dirtyGrey rounded-full" />
                            <span>Início</span>
                        </div>
                        <div className="flex items-center gap-1 text-customgreys-dirtyGrey">
                            <div className="w-2 h-2 bg-customgreys-dirtyGrey rounded-full" />
                            <span>Meio</span>
                        </div>
                        <div className="flex items-center gap-1 text-customgreys-dirtyGrey">
                            <div className="w-2 h-2 bg-customgreys-dirtyGrey rounded-full" />
                            <span>Fim</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}