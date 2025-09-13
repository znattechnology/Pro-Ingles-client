
import { cn } from "@/lib/utils";
import { Check, Globe, Briefcase, Code, Stethoscope, Scale, Clock, BookOpen, Play, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type Props = {
    title: string;
    id: string;
    imageSrc: string;
    template: string;
    description?: string;
    category?: string;
    level?: string;
    onClick:(id: string) => void;
    disabled?: boolean;
    active?: boolean;
    viewMode?: 'grid' | 'list';
};

// Enhanced template configurations with detailed information
const templateConfig = {
    general: {
        icon: Globe,
        name: 'Inglês Geral',
        description: 'Curso abrangente para aprendizado geral do inglês',
        color: 'bg-blue-500',
        lightColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        hoverColor: 'hover:border-blue-500/60',
        textColor: 'text-blue-400',
        estimatedLessons: 30,
        estimatedTime: '6-8 semanas',
        features: ['Conversação básica', 'Gramática essencial', 'Vocabulário cotidiano']
    },
    business: {
        icon: Briefcase,
        name: 'Inglês para Negócios',
        description: 'Focado em comunicação empresarial e corporativa',
        color: 'bg-green-500',
        lightColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        hoverColor: 'hover:border-green-500/60',
        textColor: 'text-green-400',
        estimatedLessons: 25,
        estimatedTime: '5-6 semanas',
        features: ['Apresentações', 'Emails profissionais', 'Reuniões']
    },
    technology: {
        icon: Code,
        name: 'Inglês para Tecnologia',
        description: 'Vocabulário técnico e comunicação na área de TI',
        color: 'bg-purple-500',
        lightColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        hoverColor: 'hover:border-purple-500/60',
        textColor: 'text-purple-400',
        estimatedLessons: 20,
        estimatedTime: '4-5 semanas',
        features: ['Termos técnicos', 'Documentação', 'Code review']
    },
    medical: {
        icon: Stethoscope,
        name: 'Inglês Médico',
        description: 'Terminologia médica e comunicação em saúde',
        color: 'bg-red-500',
        lightColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        hoverColor: 'hover:border-red-500/60',
        textColor: 'text-red-400',
        estimatedLessons: 35,
        estimatedTime: '8-10 semanas',
        features: ['Anatomia', 'Procedimentos', 'Comunicação com pacientes']
    },
    legal: {
        icon: Scale,
        name: 'Inglês Jurídico',
        description: 'Terminologia jurídica e documentos legais',
        color: 'bg-yellow-500',
        lightColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        hoverColor: 'hover:border-yellow-500/60',
        textColor: 'text-yellow-400',
        estimatedLessons: 28,
        estimatedTime: '6-7 semanas',
        features: ['Contratos', 'Processos', 'Terminologia legal']
    }
};

const levelConfig = {
    'Beginner': { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: '🟢' },
    'Intermediate': { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: '🟡' },
    'Advanced': { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '🔴' }
};

export const Card = ({title, id, imageSrc, template, description, category, level, onClick, disabled, active, viewMode = 'grid'}:Props) => {
    const config = templateConfig[template as keyof typeof templateConfig] || templateConfig.general;
    const levelInfo = levelConfig[level as keyof typeof levelConfig] || levelConfig.Beginner;
    const IconComponent = config.icon;
    
    // List view layout
    if (viewMode === 'list') {
        return (
            <div 
                onClick={() => !disabled && onClick(id)}
                className={cn(
                    "group relative bg-customgreys-secondarybg rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl flex items-center p-6 gap-6",
                    config.borderColor,
                    config.hoverColor,
                    disabled && "pointer-events-none opacity-50 cursor-not-allowed",
                    active && "ring-2 ring-green-500 ring-offset-2 ring-offset-customgreys-primarybg shadow-lg"
                )}
            >
                {/* Background Gradient */}
                <div className={cn("absolute inset-0 opacity-5", config.color)} />
                
                {/* Course Image */}
                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-customgreys-darkGrey">
                    <Image
                        src={imageSrc}
                        alt={title}
                        width={128}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {active && (
                        <div className="absolute top-2 left-2">
                            <div className="bg-green-500/90 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
                                <Play className="h-2 w-2 text-white" />
                                <span className="text-xs font-medium text-white">Ativo</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div className={cn(
                            "inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border",
                            config.lightColor,
                            config.textColor,
                            config.borderColor
                        )}>
                            <IconComponent className="h-3 w-3" />
                            {config.name}
                        </div>
                        
                        {active && (
                            <div className="bg-green-500 rounded-full p-1 shadow-lg animate-pulse">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
                        {title}
                    </h3>
                    
                    {description && (
                        <p className="text-sm text-customgreys-dirtyGrey mb-3 line-clamp-2">
                            {description}
                        </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-customgreys-dirtyGrey">
                        <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{config.estimatedLessons} lições</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{config.estimatedTime}</span>
                        </div>
                        {level && (
                            <Badge variant="outline" className={cn("text-xs font-medium", levelInfo.color)}>
                                {levelInfo.icon} {level}
                            </Badge>
                        )}
                    </div>
                </div>
                
                {/* Action Button */}
                <div className="flex-shrink-0">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                        config.lightColor,
                        config.borderColor,
                        "group-hover:border-opacity-60"
                    )}>
                        <span className={cn("text-sm font-medium", config.textColor)}>
                            {active ? 'Continuar' : 'Inscrever-se'}
                        </span>
                        <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", config.textColor)} />
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
            onClick={() => !disabled && onClick(id)}
            className={cn(
                "group relative bg-customgreys-secondarybg rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl min-h-[380px] flex flex-col",
                config.borderColor,
                config.hoverColor,
                disabled && "pointer-events-none opacity-50 cursor-not-allowed",
                active && "ring-2 ring-green-500 ring-offset-2 ring-offset-customgreys-primarybg shadow-lg transform scale-[1.02]"
            )}
        >
            {/* Background Gradient */}
            <div className={cn("absolute inset-0 opacity-5", config.color)} />
            
            {/* Header Section */}
            <div className="relative p-5 pb-0">
                {/* Top Row - Template Badge and Active Indicator */}
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
                        config.lightColor,
                        config.textColor,
                        config.borderColor
                    )}>
                        <IconComponent className="h-3.5 w-3.5" />
                        {config.name}
                    </div>
                    
                    {active && (
                        <div className="bg-green-500 rounded-full p-1.5 shadow-lg animate-pulse">
                            <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                    )}
                </div>
                
                {/* Course Image with Overlay */}
                <div className="relative mb-4 rounded-xl overflow-hidden bg-customgreys-darkGrey">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                    <Image
                        src={imageSrc}
                        alt={title}
                        width={300}
                        height={160}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {active && (
                        <div className="absolute top-3 left-3 z-20">
                            <div className="bg-green-500/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                                <Play className="h-3 w-3 text-white" />
                                <span className="text-xs font-medium text-white">Ativo</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Content Section */}
            <div className="flex-1 px-5 pb-5 flex flex-col">
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
                    <div className="flex items-center gap-4 text-xs text-customgreys-dirtyGrey mb-3">
                        <div className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{config.estimatedLessons} lições</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{config.estimatedTime}</span>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Section */}
                <div className="space-y-3">
                    {/* Level and Category */}
                    <div className="flex items-center gap-2">
                        {level && (
                            <Badge variant="outline" className={cn("text-xs font-medium", levelInfo.color)}>
                                {levelInfo.icon} {level}
                            </Badge>
                        )}
                        {category && (
                            <Badge variant="outline" className="text-xs text-customgreys-dirtyGrey border-customgreys-darkerGrey">
                                {category}
                            </Badge>
                        )}
                    </div>
                    
                    {/* Action Button */}
                    <div className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        config.lightColor,
                        config.borderColor,
                        "group-hover:border-opacity-60"
                    )}>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium", config.textColor)}>
                                {active ? 'Continuar' : 'Inscrever-se'}
                            </span>
                        </div>
                        <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", config.textColor)} />
                    </div>
                </div>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    )
}