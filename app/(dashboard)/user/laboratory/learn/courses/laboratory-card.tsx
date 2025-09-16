import { cn } from "@/lib/utils";
import { Check, Target, Users, Trophy, Clock, Star, Play, Book, ArrowRight, Zap } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Props = {
    title: string;
    id: string;
    imageSrc: string;
    description?: string;
    level?: string;
    totalUnits?: number;
    completedUnits?: number;
    totalLessons?: number;
    totalChallenges?: number;
    progress?: number;
    onClick:(id: string) => void;
    disabled?: boolean;
    active?: boolean;
    viewMode?: 'grid' | 'list';
};

const levelConfig = {
    'Beginner': { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: '🟢', textColor: 'text-green-400' },
    'Intermediate': { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: '🟡', textColor: 'text-yellow-400' },
    'Advanced': { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '🔴', textColor: 'text-red-400' }
};

export const LaboratoryCard = ({title, id, imageSrc, description, level, totalUnits, completedUnits, totalLessons, totalChallenges, progress = 0, onClick, disabled, active, viewMode = 'grid'}:Props) => {
    const levelInfo = levelConfig[level as keyof typeof levelConfig] || levelConfig.Beginner;
    const isCompleted = progress >= 100;
    const progressPercentage = Math.round(progress);
    
    // List view layout
    if (viewMode === 'list') {
        return (
            <div 
                onClick={() => !disabled && onClick(id)}
                className={cn(
                    "group relative bg-customgreys-secondarybg rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl flex items-center p-6 gap-6 border-violet-900/30 hover:border-violet-500/50",
                    disabled && "pointer-events-none opacity-50 cursor-not-allowed",
                    active && "ring-2 ring-green-500 ring-offset-2 ring-offset-customgreys-primarybg shadow-lg border-green-500/50"
                )}
            >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Course Image */}
                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-customgreys-darkGrey border border-violet-900/20">
                    <Image
                        src={imageSrc}
                        alt={title}
                        width={128}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Active Badge */}
                    {active && (
                        <div className="absolute top-2 left-2">
                            <div className="bg-green-500 rounded-full p-1.5">
                                <Check className="text-white h-3 w-3" />
                            </div>
                        </div>
                    )}
                    
                    {/* Progress Overlay */}
                    {!isCompleted && progress > 0 && (
                        <div className="absolute bottom-2 left-2 right-2">
                            <Progress value={progressPercentage} className="h-1" />
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-violet-500/10 text-violet-400 border-violet-500/30">
                            <Target className="h-3 w-3" />
                            Practice Lab
                        </div>
                        
                        {level && (
                            <Badge variant="outline" className={cn("text-xs font-medium", levelInfo.color)}>
                                {levelInfo.icon} {level}
                            </Badge>
                        )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
                        {title}
                    </h3>
                    
                    {description && (
                        <p className="text-sm text-customgreys-dirtyGrey mb-3 line-clamp-1">
                            {description}
                        </p>
                    )}
                    
                    {/* Progress Info */}
                    {!isCompleted ? (
                        <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>Progresso</span>
                                <span>{progressPercentage}%</span>
                            </div>
                            {totalUnits && completedUnits !== undefined && (
                                <p className="text-xs text-gray-500">
                                    {completedUnits} de {totalUnits} unidades concluídas
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="mb-3">
                            <div className="flex items-center gap-2 text-sm text-green-400">
                                <Check className="h-4 w-4" />
                                <span>Curso Concluído!</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-customgreys-dirtyGrey">
                        {totalUnits && (
                            <div className="flex items-center gap-1">
                                <Book className="h-3 w-3" />
                                <span>{totalUnits} unidades</span>
                            </div>
                        )}
                        {totalLessons && (
                            <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span>{totalLessons} lições</span>
                            </div>
                        )}
                        {totalChallenges && (
                            <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                <span>{totalChallenges} desafios</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                            isCompleted 
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                        )}
                        size="sm"
                    >
                        <span className="text-sm font-medium">
                            {isCompleted ? 'Concluído' : 'Praticar'}
                        </span>
                        {isCompleted ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
        );
    }

    // Grid view layout (default)
    return (
        <div 
            onClick={() => !disabled && onClick(id)}
            className={cn(
                "group relative bg-customgreys-secondarybg rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl min-h-[420px] flex flex-col border-violet-900/30 hover:border-violet-500/50",
                disabled && "pointer-events-none opacity-50 cursor-not-allowed",
                active && "ring-2 ring-green-500 ring-offset-2 ring-offset-customgreys-primarybg shadow-lg transform scale-[1.02] border-green-500/50"
            )}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Header Section */}
            <div className="relative">
                {/* Course Image with Overlay */}
                <div className="relative mb-0 overflow-hidden bg-customgreys-darkGrey">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
                    <Image
                        src={imageSrc}
                        alt={title}
                        width={300}
                        height={160}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Top Overlays */}
                    <div className="absolute top-3 left-3 z-20">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-violet-500/20 text-violet-300 border-violet-500/30 backdrop-blur-sm">
                            <Target className="h-3 w-3" />
                            Practice Lab
                        </div>
                    </div>
                    
                    <div className="absolute top-3 right-3 z-20">
                        {active && (
                            <div className="bg-green-500 rounded-full p-1.5">
                                <Check className="text-white h-4 w-4" />
                            </div>
                        )}
                    </div>
                    
                    {level && (
                        <div className="absolute bottom-3 right-3 z-20">
                            <Badge variant="outline" className={cn("text-xs font-medium backdrop-blur-sm", levelInfo.color)}>
                                {levelInfo.icon} {level}
                            </Badge>
                        </div>
                    )}
                    
                    {/* Progress Bar for Active Courses */}
                    {!isCompleted && progress > 0 && (
                        <div className="absolute bottom-3 left-3 right-16 z-20">
                            <Progress value={progressPercentage} className="h-2" />
                            <p className="text-white text-xs mt-1">
                                {progressPercentage}% concluído
                            </p>
                        </div>
                    )}
                    
                    {/* Completion Badge for Completed Courses */}
                    {isCompleted && (
                        <div className="absolute bottom-3 left-3 right-3 z-20">
                            <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-2 text-center">
                                <div className="flex items-center justify-center gap-2 text-green-400">
                                    <Check className="h-4 w-4" />
                                    <span className="text-xs font-medium">Curso Concluído</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
                        <Button className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30">
                            {isCompleted ? (
                                <>
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Revisar Curso
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Começar Prática
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Content Section */}
            <div className="flex-1 px-5 py-4 flex flex-col">
                {/* Title and Description */}
                <div className="mb-4 flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-customgreys-dirtyGrey line-clamp-2 mb-3">
                            {description}
                        </p>
                    )}
                    
                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-customgreys-dirtyGrey mb-4">
                        {totalUnits && (
                            <div className="flex items-center gap-1">
                                <Book className="h-3.5 w-3.5 text-violet-400" />
                                <span>{totalUnits} unidades</span>
                            </div>
                        )}
                        {totalLessons && (
                            <div className="flex items-center gap-1">
                                <Target className="h-3.5 w-3.5 text-blue-400" />
                                <span>{totalLessons} lições</span>
                            </div>
                        )}
                        {totalChallenges && (
                            <div className="flex items-center gap-1">
                                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                                <span>{totalChallenges} desafios</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-green-400" />
                            <span>Interativo</span>
                        </div>
                    </div>
                </div>
                
                {/* Progress Section */}
                {totalUnits && completedUnits !== undefined && (
                    <div className="mb-4">
                        {!isCompleted ? (
                            <>
                                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                    <span>Progresso</span>
                                    <span>{progressPercentage}%</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    {completedUnits} de {totalUnits} unidades concluídas
                                </p>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                                    <Trophy className="h-5 w-5" />
                                    <span className="font-semibold">Curso Concluído!</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Todas as {totalUnits} unidades foram completadas
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Action Button */}
                <div className="space-y-3">
                    <Button
                        className={cn(
                            "w-full text-white transition-all duration-200",
                            isCompleted 
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                        )}
                        size="sm"
                    >
                        {isCompleted ? (
                            <>
                                <Trophy className="w-4 h-4 mr-2" />
                                Concluído
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Começar Prática
                            </>
                        )}
                        <ArrowRight className="w-4 h-4 ml-auto" />
                    </Button>
                </div>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    )
}