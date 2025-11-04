import { cn } from "@/lib/utils";
import { Check, Target, Trophy, Play, Book, ArrowRight, Zap, Mic, Headphones, Globe, Briefcase, Code, Stethoscope, Scale, BookOpen, Fuel, Building2, Crown, Brain, Sparkles } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

type Props = {
    title: string;
    id: string;
    imageSrc: string;
    description?: string;
    level?: string;
    category?: string;
    template?: string;
    customColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
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

// Template configurations based on course category
const templateConfig = {
    'General': { 
        color: 'bg-blue-500', 
        lightColor: 'bg-blue-500/10', 
        borderColor: 'border-blue-500/30', 
        hoverColor: 'hover:border-blue-500/60', 
        textColor: 'text-blue-400',
        name: 'Inglês Geral',
        icon: Globe,
        gradient: 'from-blue-500 to-cyan-500',
        theme: 'ocean'
    },
    'Business': { 
        color: 'bg-green-500', 
        lightColor: 'bg-green-500/10', 
        borderColor: 'border-green-500/30', 
        hoverColor: 'hover:border-green-500/60', 
        textColor: 'text-green-400',
        name: 'Negócios',
        icon: Briefcase,
        gradient: 'from-green-500 to-emerald-500',
        theme: 'business'
    },
    'Technology': { 
        color: 'bg-purple-500', 
        lightColor: 'bg-purple-500/10', 
        borderColor: 'border-purple-500/30', 
        hoverColor: 'hover:border-purple-500/60', 
        textColor: 'text-purple-400',
        name: 'Tecnologia',
        icon: Code,
        gradient: 'from-purple-500 to-violet-500',
        theme: 'tech'
    },
    'Medicine': { 
        color: 'bg-red-500', 
        lightColor: 'bg-red-500/10', 
        borderColor: 'border-red-500/30', 
        hoverColor: 'hover:border-red-500/60', 
        textColor: 'text-red-400',
        name: 'Medicina',
        icon: Stethoscope,
        gradient: 'from-red-500 to-pink-500',
        theme: 'medical'
    },
    'Legal': { 
        color: 'bg-yellow-500', 
        lightColor: 'bg-yellow-500/10', 
        borderColor: 'border-yellow-500/30', 
        hoverColor: 'hover:border-yellow-500/60', 
        textColor: 'text-yellow-400',
        name: 'Jurídico',
        icon: Scale,
        gradient: 'from-yellow-500 to-orange-500',
        theme: 'legal'
    },
    'Oil & Gas': { 
        color: 'bg-orange-600', 
        lightColor: 'bg-orange-600/10', 
        borderColor: 'border-orange-600/30', 
        hoverColor: 'hover:border-orange-600/60', 
        textColor: 'text-orange-400',
        name: 'Petróleo & Gás',
        icon: Fuel,
        gradient: 'from-orange-600 to-red-600',
        theme: 'energy'
    },
    'Banking': { 
        color: 'bg-indigo-600', 
        lightColor: 'bg-indigo-600/10', 
        borderColor: 'border-indigo-600/30', 
        hoverColor: 'hover:border-indigo-600/60', 
        textColor: 'text-indigo-400',
        name: 'Setor Bancário',
        icon: Building2,
        gradient: 'from-indigo-600 to-blue-600',
        theme: 'finance'
    },
    'Executive': { 
        color: 'bg-slate-700', 
        lightColor: 'bg-slate-700/10', 
        borderColor: 'border-slate-700/30', 
        hoverColor: 'hover:border-slate-700/60', 
        textColor: 'text-slate-400',
        name: 'Executivo',
        icon: Crown,
        gradient: 'from-slate-700 to-gray-700',
        theme: 'executive'
    },
    'AI Enhanced': { 
        color: 'bg-pink-500', 
        lightColor: 'bg-pink-500/10', 
        borderColor: 'border-pink-500/30', 
        hoverColor: 'hover:border-pink-500/60', 
        textColor: 'text-pink-400',
        name: 'IA Personalizada',
        icon: Brain,
        gradient: 'from-pink-500 to-rose-500',
        theme: 'ai'
    }
};

const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'general': return Globe;
        case 'business': return Briefcase;
        case 'technology': return Code;
        case 'medicine': return Stethoscope;
        case 'legal': return Scale;
        case 'oil & gas': return Fuel;
        case 'banking': return Building2;
        case 'executive': return Crown;
        case 'ai enhanced': return Brain;
        default: return BookOpen;
    }
};

export const LaboratoryCard = ({title, id, imageSrc, description, level, category, template, customColors, totalUnits, completedUnits, totalLessons, totalChallenges, progress = 0, onClick, disabled, active, viewMode = 'grid'}:Props) => {
    const router = useRouter();
    const levelInfo = levelConfig[level as keyof typeof levelConfig] || levelConfig.Beginner;
    const isCompleted = progress >= 100;
    const progressPercentage = Math.round(progress);
    
    // Get base template configuration
    let config = templateConfig[category as keyof typeof templateConfig] || templateConfig.General;
    
    // Apply template override if specified
    if (template && templateConfig[template as keyof typeof templateConfig]) {
        config = templateConfig[template as keyof typeof templateConfig];
    }
    
    // Apply custom colors if provided by the teacher
    if (customColors) {
        config = {
            ...config,
            ...(customColors.primary && {
                color: `bg-[${customColors.primary}]`,
                lightColor: `bg-[${customColors.primary}]/10`,
                borderColor: `border-[${customColors.primary}]/30`,
                hoverColor: `hover:border-[${customColors.primary}]/60`,
                textColor: `text-[${customColors.primary}]`,
                gradient: `from-[${customColors.primary}] to-[${customColors.secondary || customColors.primary}]`
            })
        };
    }
    
    const CategoryIcon = getCategoryIcon(category || template || 'general');

    // Handler para navegar para speaking practice
    const handleSpeakingClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('🎤 SPEAKING DEBUG: Speaking clicked for course:', id);
        router.push(`/user/laboratory/learn/courses/${id}/speaking`);
    };

    // Handler para navegar para listening practice
    const handleListeningClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('🎧 LISTENING DEBUG: Listening clicked for course:', id);
        router.push(`/user/laboratory/learn/courses/${id}/listening`);
    };

    // Handler para botão principal
    const handleMainClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('🎯 CARD DEBUG: handleMainClick called');
        console.log('🎯 CARD DEBUG: courseId:', id);
        console.log('🎯 CARD DEBUG: disabled state:', disabled);
        console.log('🎯 CARD DEBUG: onClick function:', typeof onClick);
        
        if (!disabled) {
            console.log('🎯 CARD DEBUG: Not disabled, calling onClick function');
            onClick(id);
        } else {
            console.log('🎯 CARD DEBUG: Button is disabled, not calling onClick');
        }
    };
    
    // List view layout
    if (viewMode === 'list') {
        return (
            <div 
                className={cn(
                    `group relative bg-customgreys-secondarybg rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 gap-4 sm:gap-6 ${config.borderColor} ${config.hoverColor}`,
                    disabled && "pointer-events-none opacity-50 cursor-not-allowed",
                    active && "ring-2 ring-green-500 ring-offset-2 ring-offset-customgreys-primarybg shadow-lg border-green-500/50"
                )}
            >
                {/* Background Gradient */}
                <div className={`absolute inset-0 ${config.lightColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Course Image */}
                <div className="relative w-full sm:w-32 h-24 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-customgreys-darkGrey border border-violet-900/20">
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
                            <div className="bg-green-500 rounded-full p-1 sm:p-1.5">
                                <Check className="text-white h-3 w-3" />
                            </div>
                        </div>
                    )}
                    
                    {/* Progress Overlay */}
                    {!isCompleted && progress > 0 && (
                        <div className="absolute bottom-2 left-2 right-2">
                            <Progress value={progressPercentage} className="h-1 sm:h-1.5" />
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
                        <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-full text-xs font-medium border ${config.lightColor} ${config.textColor} ${config.borderColor}`}>
                            <CategoryIcon className="h-3 w-3" />
                            <span className="hidden sm:inline">{config.name}</span>
                            <span className="sm:hidden">{config.name.split(' ')[0]}</span>
                        </div>
                        
                        {level && (
                            <Badge variant="outline" className={cn("text-xs font-medium", levelInfo.color)}>
                                {levelInfo.icon} {level}
                            </Badge>
                        )}
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
                        {title}
                    </h3>
                    
                    {description && (
                        <p className="text-xs sm:text-sm text-customgreys-dirtyGrey mb-3 line-clamp-2 sm:line-clamp-1">
                            {description}
                        </p>
                    )}
                    
                    {/* Progress Info */}
                    {!isCompleted ? (
                        <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>Progresso</span>
                                <span className="font-semibold">{progressPercentage}%</span>
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
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">Curso Concluído!</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-customgreys-dirtyGrey">
                        {totalUnits && (
                            <div className="flex items-center gap-1">
                                <Book className="h-3 w-3" />
                                <span className="hidden sm:inline">{totalUnits} unidades</span>
                                <span className="sm:hidden">{totalUnits} un.</span>
                            </div>
                        )}
                        {totalLessons && (
                            <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span className="hidden sm:inline">{totalLessons} lições</span>
                                <span className="sm:hidden">{totalLessons} liç.</span>
                            </div>
                        )}
                        {totalChallenges && (
                            <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                <span className="hidden sm:inline">{totalChallenges} desafios</span>
                                <span className="sm:hidden">{totalChallenges} des.</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-shrink-0">
                    {/* Botão Principal - Laboratório */}
                    <Button
                        onClick={handleMainClick}
                        className={cn(
                            "flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors cursor-pointer w-full sm:w-auto min-h-[36px]",
                            isCompleted 
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                        )}
                        size="sm"
                    >
                        <span className="text-xs sm:text-sm font-medium">
                            {isCompleted ? 'Concluído' : 'Praticar'}
                        </span>
                        {isCompleted ? (
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                    </Button>
                    
                    {/* Botões Secundários - Speaking/Listening */}
                    <div className="flex gap-1 sm:gap-1 relative z-10">
                        <Button
                            onClick={handleSpeakingClick}
                            size="sm"
                            className="flex-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 hover:text-blue-300 transition-colors cursor-pointer min-h-[32px] px-2 sm:px-3"
                        >
                            <Mic className="h-3 w-3 mr-1" />
                            <span className="text-xs">Speaking</span>
                        </Button>
                        <Button
                            onClick={handleListeningClick}
                            size="sm"
                            className="flex-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 hover:border-orange-500/50 hover:text-orange-300 transition-colors cursor-pointer min-h-[32px] px-2 sm:px-3"
                        >
                            <Headphones className="h-3 w-3 mr-1" />
                            <span className="text-xs">Listening</span>
                        </Button>
                    </div>
                </div>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
        );
    }

    // Grid view layout (default)
    return (
        <div 
            className={cn(
                `group relative bg-customgreys-secondarybg rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl min-h-[380px] sm:min-h-[420px] flex flex-col ${config.borderColor} ${config.hoverColor}`,
                disabled && "pointer-events-none opacity-50 cursor-not-allowed",
                active && "ring-2 ring-green-500 ring-offset-2 ring-offset-customgreys-primarybg shadow-lg transform scale-[1.02] border-green-500/50"
            )}
        >
            {/* Background Gradient with Theme Animations */}
            <div className={`absolute inset-0 ${config.lightColor} opacity-0 group-hover:opacity-100 transition-all duration-300`} />
            
            {/* Theme-specific animated background effects */}
            {config.theme === 'ai' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 animate-pulse" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.3),transparent_70%)] animate-spin" style={{ animationDuration: '8s' }} />
                </div>
            )}
            
            {config.theme === 'energy' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/30 to-red-600/30" />
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(251,146,60,0.1)_50%,transparent_60%)] animate-pulse" />
                </div>
            )}
            
            {config.theme === 'tech' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 to-violet-500/20" />
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_40%,rgba(168,85,247,0.1)_50%,transparent_60%)]" />
                </div>
            )}
            
            {config.theme === 'finance' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-tl from-indigo-600/25 to-blue-600/25" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(79,70,229,0.05)_2px,rgba(79,70,229,0.05)_4px)]" />
                </div>
            )}
            
            {/* Header Section */}
            <div className="relative">
                {/* Course Image with Overlay */}
                <div className="relative mb-0 overflow-hidden bg-customgreys-darkGrey h-28 sm:h-32">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                    <div className={`absolute inset-0 ${config.lightColor}`} />
                    
                    {/* Top Overlays */}
                    <div className="absolute top-3 left-3 z-20">
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${config.lightColor} ${config.textColor} ${config.borderColor} backdrop-blur-sm`}>
                            <CategoryIcon className="h-3 w-3" />
                            {config.name}
                        </div>
                    </div>
                    
                    {/* Category Icon with Theme Animations */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className={`w-16 h-16 ${config.color} rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 ${
                            config.theme === 'ai' ? 'group-hover:animate-pulse group-hover:shadow-pink-500/50' :
                            config.theme === 'energy' ? 'group-hover:shadow-orange-500/50' :
                            config.theme === 'tech' ? 'group-hover:shadow-purple-500/50 group-hover:rotate-3' :
                            config.theme === 'finance' ? 'group-hover:shadow-indigo-500/50' :
                            config.theme === 'medical' ? 'group-hover:shadow-red-500/50' :
                            config.theme === 'business' ? 'group-hover:shadow-green-500/50' :
                            config.theme === 'executive' ? 'group-hover:shadow-slate-500/50 group-hover:-rotate-2' :
                            'group-hover:shadow-blue-500/50'
                        }`}>
                            <CategoryIcon className={`w-8 h-8 text-white transition-all duration-300 ${
                                config.theme === 'ai' ? 'group-hover:animate-bounce' :
                                config.theme === 'energy' ? 'group-hover:scale-125' :
                                config.theme === 'tech' ? 'group-hover:rotate-12' :
                                'group-hover:scale-110'
                            }`} />
                            
                            {/* Special effects for AI theme */}
                            {config.theme === 'ai' && (
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 animate-pulse" />
                                    <Sparkles className="absolute top-1 right-1 w-3 h-3 text-pink-300 animate-pulse" />
                                    <Sparkles className="absolute bottom-1 left-1 w-2 h-2 text-purple-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                                </div>
                            )}
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
            <div className="flex-1 px-4 sm:px-5 py-3 sm:py-4 flex flex-col">
                {/* Template Badge */}
                <div className="mb-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${config.lightColor} ${config.textColor} ${config.borderColor}`}>
                        <CategoryIcon className="h-3.5 w-3.5" />
                        {config.name}
                    </div>
                </div>
                
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
                    
                    {/* Enhanced Course Stats with Visual Indicators */}
                    <div className="space-y-3 mb-3">
                        {/* Progress Bar with Theme Colors */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-customgreys-dirtyGrey">Progresso Geral</span>
                                <span className={`font-bold ${config.textColor}`}>{progressPercentage}%</span>
                            </div>
                            <div className="relative w-full h-2 bg-customgreys-darkGrey rounded-full overflow-hidden">
                                <div 
                                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${config.gradient} transition-all duration-500 ease-out`}
                                    style={{ width: `${progressPercentage}%` }}
                                />
                                {/* Theme-specific progress effects */}
                                {config.theme === 'ai' && progressPercentage > 0 && (
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400/50 to-purple-400/50 animate-pulse"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                )}
                                {config.theme === 'energy' && progressPercentage > 0 && (
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400/30 to-red-400/30"
                                        style={{ width: `${progressPercentage}%`, animation: 'pulse 2s infinite' }}
                                    />
                                )}
                            </div>
                        </div>
                        
                        {/* Stats Grid with Icons */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className={`flex flex-col items-center p-2 rounded-lg ${config.lightColor} border ${config.borderColor}`}>
                                <Book className={`w-3.5 h-3.5 ${config.textColor} mb-1`} />
                                <span className={`font-bold ${config.textColor}`}>{totalUnits || 0}</span>
                                <span className="text-customgreys-dirtyGrey text-[10px]">Unidades</span>
                            </div>
                            <div className={`flex flex-col items-center p-2 rounded-lg ${config.lightColor} border ${config.borderColor}`}>
                                <Target className={`w-3.5 h-3.5 ${config.textColor} mb-1`} />
                                <span className={`font-bold ${config.textColor}`}>{totalLessons || 0}</span>
                                <span className="text-customgreys-dirtyGrey text-[10px]">Lições</span>
                            </div>
                            <div className={`flex flex-col items-center p-2 rounded-lg ${config.lightColor} border ${config.borderColor}`}>
                                <Zap className={`w-3.5 h-3.5 ${config.textColor} mb-1`} />
                                <span className={`font-bold ${config.textColor}`}>{totalChallenges || 0}</span>
                                <span className="text-customgreys-dirtyGrey text-[10px]">Desafios</span>
                            </div>
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
                
                {/* Action Buttons */}
                <div className="space-y-2 sm:space-y-3 relative z-20">
                    {/* Botão Principal - Laboratório */}
                    <Button
                        onClick={handleMainClick}
                        disabled={disabled}
                        className={cn(
                            "w-full text-white transition-all duration-200 cursor-pointer relative z-30",
                            "hover:transform hover:scale-[1.02] active:scale-[0.98]",
                            isCompleted 
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        size="sm"
                    >
                        {isCompleted ? (
                            <>
                                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                <span className="text-xs sm:text-sm">Concluído</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                <span className="text-xs sm:text-sm">Começar Prática</span>
                            </>
                        )}
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto" />
                    </Button>
                    
                    {/* Botões Secundários - Speaking/Listening */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 relative z-30">
                        <Button
                            onClick={handleSpeakingClick}
                            disabled={disabled}
                            size="sm"
                            className={cn(
                                "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 hover:text-blue-300 transition-colors cursor-pointer relative min-h-[32px]",
                                "hover:transform hover:scale-[1.02] active:scale-[0.98]",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Mic className="h-3 w-3 mr-1" />
                            <span className="text-xs font-medium">Speaking</span>
                        </Button>
                        <Button
                            onClick={handleListeningClick}
                            disabled={disabled}
                            size="sm"
                            className={cn(
                                "bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 hover:border-orange-500/50 hover:text-orange-300 transition-colors cursor-pointer relative min-h-[32px]",
                                "hover:transform hover:scale-[1.02] active:scale-[0.98]",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Headphones className="h-3 w-3 mr-1" />
                            <span className="text-xs font-medium">Listening</span>
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    )
}