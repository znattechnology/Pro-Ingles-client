import { cn } from "@/lib/utils";
import { Check, Globe, Briefcase, Code, Stethoscope, Scale, Clock, BookOpen, Play, Star, Users } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Props = {
    title: string;
    id: string;
    imageSrc: string;
    template: string;
    description?: string;
    category?: string;
    level?: string;
    instructor?: string;
    progress?: number;
    totalLessons?: number;
    completedLessons?: number;
    duration?: string;
    status?: string;
    rating?: number;
    nextLesson?: string;
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

const statusConfig = {
    'active': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: 'Em Andamento' },
    'completed': { color: 'bg-green-500/10 text-green-400 border-green-500/20', text: 'Concluído' }
};

export const EnrolledCard = ({title, id, imageSrc, template, description, category, level, instructor, progress = 0, totalLessons, completedLessons, duration, status = 'active', rating, onClick, disabled, viewMode = 'grid'}:Props) => {
    const config = templateConfig[template as keyof typeof templateConfig] || templateConfig.general;
    
    // Melhorar cálculo do progresso e status
    const progressPercentage = (() => {
        // Se temos dados específicos de lições, usar eles
        if (totalLessons && completedLessons !== undefined) {
            const calculated = (completedLessons / totalLessons) * 100;
            return Math.round(calculated); // Sem casas decimais
        }
        // Senão, usar o progresso fornecido e arredondar
        return Math.round(progress);
    })();
    
    // Verificar se curso está realmente completo
    const isCompleted = progressPercentage >= 100;
    const isEnrolled = true; // Always true for enrolled courses
    
    // List view layout
    if (viewMode === 'list') {
        return (
            <Card className="bg-customgreys-secondarybg/40 border-violet-900/30 hover:bg-customgreys-secondarybg/60 transition-all duration-300 group cursor-pointer" 
                  onClick={() => !disabled && onClick(id)}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        {/* Course Image */}
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                                src={imageSrc}
                                alt={title}
                                fill
                                className="object-cover"
                                priority
                            />
                            {isEnrolled && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                        
                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                        {description}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Avatar className="w-4 h-4">
                                                <AvatarImage alt={instructor} />
                                                <AvatarFallback className="bg-violet-600 text-white text-xs">
                                                    {instructor?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{instructor}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{category}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{duration || '2h 30min'}</span>
                                        </div>
                                    </div>

                                    {/* Progress bar for enrolled courses */}
                                    {isEnrolled && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                                <span>Progresso</span>
                                                <span>{progressPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div 
                                                    className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Action Button */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <Button
                                        className={cn(
                                            "px-4 py-2",
                                            isCompleted 
                                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                                : "bg-violet-600 hover:bg-violet-700 text-white"
                                        )}
                                        size="sm"
                                    >
                                        {isCompleted ? 'Concluído' : 'Continuar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Grid view (default) - Exact copy of StudentCourseCard design
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="h-full"
        >
            <Card 
                className="group relative flex flex-col h-full overflow-hidden bg-customgreys-secondarybg rounded-2xl border border-violet-500/20 hover:border-violet-400/40 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-violet-500/10 hover:scale-[1.02]" 
                onClick={() => !disabled && onClick(id)}
            >
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-violet-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative p-0 overflow-hidden">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                        <Image
                            src={imageSrc}
                            alt={title}
                            width={400}
                            height={200}
                            className="w-full h-[200px] object-cover transition-all duration-700 group-hover:scale-110"
                            priority
                        />
                        
                        {/* Floating Action on Hover */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                        >
                            <Button className="bg-violet-600/90 hover:bg-violet-500 text-white backdrop-blur-sm shadow-lg border border-violet-400/30 transform hover:scale-105 transition-all duration-200">
                                <Play className="w-5 h-5 mr-2" />
                                {isCompleted ? 'Revisar Curso' : 'Continuar Curso'}
                            </Button>
                        </motion.div>

                        {/* Modern Progress Bar */}
                        {!isCompleted && (typeof progressPercentage === 'number' && progressPercentage > 0) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-sm p-3 z-20">
                                <div className="flex items-center justify-between text-xs text-white mb-2">
                                    <span className="font-medium">Progresso</span>
                                    <span className="font-bold">{typeof progressPercentage === 'number' ? progressPercentage : 0}%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${typeof progressPercentage === 'number' ? progressPercentage : 0}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="bg-gradient-to-r from-violet-400 to-purple-400 h-2 rounded-full shadow-lg"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Modern Badges - Status no canto esquerdo */}
                        <div className="absolute top-4 left-4 z-20">
                            {isCompleted ? (
                                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none shadow-lg">
                                    <Check className="w-3 h-3 mr-1" />
                                    Concluído
                                </Badge>
                            ) : (
                                <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none shadow-lg">
                                    <Play className="w-3 h-3 mr-1" />
                                    Em Progresso
                                </Badge>
                            )}
                        </div>
                        
                        {/* Level Badge - Canto direito */}
                        {level && (
                            <div className="absolute top-4 right-4 z-20">
                                <Badge variant="outline" className="bg-black/60 text-white border-white/30 backdrop-blur-sm">
                                    {level}
                                </Badge>
                            </div>
                        )}

                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-6 relative z-10">
                    <div className="space-y-4">
                        {/* Course Title */}
                        <CardTitle className="text-lg font-bold line-clamp-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                            {title}
                        </CardTitle>

                        {/* Course Description */}
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                            {description}
                        </p>

                        {/* Teacher Info */}
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-violet-400/30">
                                <AvatarImage alt={instructor} />
                                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-sm font-semibold">
                                    {instructor?.[0] || 'P'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-violet-400">
                                    {instructor || 'Professor'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Instrutor
                                </p>
                            </div>
                        </div>

                        {/* Modern Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                                    <Users className="w-3 h-3" />
                                    <span className="text-xs font-bold">{totalLessons || 0}</span>
                                </div>
                                <div className="text-xs text-gray-500">Lições</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                                    <Star className="w-3 h-3" />
                                    <span className="text-xs font-bold">
                                        {rating ? Number(rating).toFixed(1) : '4.8'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">Avaliação</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs font-bold">{duration || '2h'}</span>
                                </div>
                                <div className="text-xs text-gray-500">Duração</div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 relative z-10">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/30 rounded-full px-3 py-1.5">
                                <span className="text-xs font-medium text-violet-300">
                                    {category || config.name}
                                </span>
                            </div>
                        </div>
                        
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-1 text-violet-400"
                        >
                            {isCompleted ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium">Concluído</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    <span className="text-sm font-medium">Continuar</span>
                                </>
                            )}
                        </motion.div>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    )
}