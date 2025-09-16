import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  BookOpen,
  Star,
  Clock,
  Settings,
  Globe,
  Briefcase,
  Code,
  Stethoscope,
  Scale,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeacherCourseCardProps {
  course: any;
  onEdit: (course: any) => void;
  onDelete: (course: any) => void;
  onView?: (course: any) => void;
  isOwner: boolean;
  viewMode?: 'grid' | 'list';
}

const TeacherCourseCard = ({
  course,
  onEdit,
  onDelete,
  onView,
  isOwner,
  viewMode = 'grid',
}: TeacherCourseCardProps) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Template configurations similar to student cards
  const templateConfig = {
    general: {
      icon: Globe,
      name: 'Inglês Geral',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    business: {
      icon: Briefcase,
      name: 'Negócios',
      color: 'bg-green-500',
      lightColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
    },
    technology: {
      icon: Code,
      name: 'Tecnologia',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
    },
    medical: {
      icon: Stethoscope,
      name: 'Médico',
      color: 'bg-red-500',
      lightColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
    },
    legal: {
      icon: Scale,
      name: 'Jurídico',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
    }
  };

  const levelConfig = {
    'Beginner': { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: '🟢' },
    'Intermediate': { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: '🟡' },
    'Advanced': { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '🔴' }
  };

  const statusConfig = {
    'Published': { 
      color: 'bg-green-500/10 text-green-400 border-green-500/20', 
      text: 'Publicado',
      icon: CheckCircle
    },
    'Draft': { 
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', 
      text: 'Rascunho',
      icon: AlertCircle
    }
  };

  const config = templateConfig[course.template as keyof typeof templateConfig] || templateConfig.general;
  const levelInfo = levelConfig[course.level as keyof typeof levelConfig] || levelConfig.Beginner;
  const statusInfo = statusConfig[course.status as keyof typeof statusConfig] || statusConfig.Draft;
  const IconComponent = config.icon;
  const StatusIcon = statusInfo.icon;

  // Helper functions for status
  const getStatusColor = () => {
    return statusInfo.color;
  };

  const getStatusText = () => {
    return statusInfo.text;
  };

  if (viewMode === 'list') {
    return (
      <Card className="bg-customgreys-secondarybg/40 border-violet-900/30 hover:bg-customgreys-secondarybg/60 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Course Image */}
            <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={course.image || "/placeholder.png"}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {course.description || 'Sem descrição disponível'}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrollments?.length || 0} alunos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(course.created_at || new Date().toISOString())}</span>
                    </div>
                  </div>
                </div>
                
                {/* Status and Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium border",
                    getStatusColor()
                  )}>
                    {getStatusText()}
                  </span>
                  
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      {onView && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(course)}
                          className="text-gray-400 hover:text-white hover:bg-violet-800/20 p-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(course)}
                        className="text-gray-400 hover:text-white hover:bg-violet-800/20 p-2"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(course)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-800/20 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  // Grid view (default) - Similar to student card design
  return (
    <div 
      className={cn(
        "group relative bg-customgreys-secondarybg rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl min-h-[420px] flex flex-col",
        config.borderColor,
        "hover:border-opacity-60"
      )}
    >
      {/* Background Gradient */}
      <div className={cn("absolute inset-0 opacity-5", config.color)} />
      
      {/* Header Section */}
      <div className="relative">
        {/* Course Image with Overlay */}
        <div className="relative mb-0 overflow-hidden bg-customgreys-darkGrey">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <Image
            src={course.image || "/placeholder.png"}
            alt={course.title}
            width={300}
            height={160}
            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlays */}
          <div className="absolute top-3 left-3 z-20">
            <Badge className={statusInfo.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.text}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 z-20">
            {course.level && (
              <Badge variant="outline" className={cn("text-xs font-medium", levelInfo.color)}>
                {levelInfo.icon} {course.level}
              </Badge>
            )}
          </div>
          
          {/* Student Count Badge */}
          <div className="absolute bottom-3 left-3 z-20">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
              <Users className="w-3 h-3 mr-1" />
              {course.enrollments?.length || 0} alunos
            </Badge>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
            <div className="flex flex-wrap gap-2 justify-center">
              {onView && (
                <Button 
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(course);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
              )}
              {isOwner && (
                <>
                  <Button 
                    className="bg-violet-600/80 hover:bg-violet-700 text-white backdrop-blur-sm"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(course);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Gerenciar
                  </Button>
                  <Button 
                    className="bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-sm border border-red-500/30"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(course);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 px-5 py-4 flex flex-col">
        {/* Template Badge */}
        <div className="mb-3">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
            config.lightColor,
            config.textColor,
            config.borderColor
          )}>
            <IconComponent className="h-3.5 w-3.5" />
            {config.name}
          </div>
        </div>
        
        {/* Title and Description */}
        <div className="mb-4 flex-1">
          <CardTitle className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
            {course.title}
          </CardTitle>
          
          <p className="text-sm text-customgreys-dirtyGrey line-clamp-2 mb-3">
            {course.description || 'Sem descrição disponível'}
          </p>
          
          {/* Course Stats */}
          <div className="flex items-center gap-4 text-xs text-customgreys-dirtyGrey mb-3">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{course.total_chapters || 0} capítulos</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              <span>4.8</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(course.created_at || new Date().toISOString())}</span>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="space-y-3">
          {/* Category */}
          {course.category && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-customgreys-dirtyGrey border-customgreys-darkerGrey">
                {course.category}
              </Badge>
              {course.price && (
                <Badge variant="outline" className="text-xs text-green-400 border-green-500/30 bg-green-500/10">
                  {parseFloat(course.price) === 0 ? 'Gratuito' : `${course.price} AOA`}
                </Badge>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          {isOwner && (
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:text-white hover:bg-red-800/20 hover:border-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {!isOwner && (
            <div className="text-center py-2">
              <Badge variant="outline" className="text-xs text-gray-500 border-gray-600/30">
                Apenas visualização
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-customgreys-primarybg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default TeacherCourseCard;
export type { TeacherCourseCardProps };
