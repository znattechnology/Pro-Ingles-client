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
  Eye, 
  Users, 
  Calendar,
  BookOpen,
  Target,
  Clock,
  Settings,
  Brain,
  Trophy,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TeacherPracticeCourse } from '../types';
import { formatDate, calculateCourseProgress } from '../utils';

interface TeacherPracticeCourseCardProps {
  course: TeacherPracticeCourse;
  onEdit: (course: TeacherPracticeCourse) => void;
  onView?: (course: TeacherPracticeCourse) => void;
  onManageContent?: (course: TeacherPracticeCourse) => void;
  isOwner: boolean;
  viewMode?: 'grid' | 'list';
}

const TeacherPracticeCourseCard = ({
  course,
  onEdit,
  onView,
  onManageContent,
  isOwner,
  viewMode = 'grid',
}: TeacherPracticeCourseCardProps) => {
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

  const levelInfo = levelConfig[course.level as keyof typeof levelConfig] || levelConfig.Beginner;
  const statusInfo = statusConfig[course.status as keyof typeof statusConfig] || statusConfig.Draft;
  const StatusIcon = statusInfo.icon;
  
  const progress = calculateCourseProgress(course);
  const totalStudents = course.enrollments?.length || 0;
  const totalUnits = course.units_count || 0;
  const totalLessons = course.lessons_count || 0;
  const totalChallenges = course.challenges_count || 0;

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
              <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            
            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {course.description || 'Curso de prática interativa'}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{totalStudents} alunos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{totalChallenges} desafios</span>
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
                    statusInfo.color
                  )}>
                    {statusInfo.text}
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
                      {onManageContent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onManageContent(course)}
                          className="text-gray-400 hover:text-white hover:bg-violet-800/20 p-2"
                        >
                          <Brain className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(course)}
                        className="text-gray-400 hover:text-white hover:bg-violet-800/20 p-2"
                      >
                        <Settings className="w-4 h-4" />
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

  // Grid view (default)
  return (
    <div 
      className="group relative bg-customgreys-secondarybg rounded-2xl border border-violet-500/20 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl min-h-[420px] flex flex-col hover:border-violet-400/40"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-5 bg-violet-500" />
      
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
          
          {/* Practice Course Overlay */}
          <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
            <Target className="w-12 h-12 text-violet-400 opacity-60" />
          </div>
          
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
              {totalStudents} alunos
            </Badge>
          </div>
          
          {/* Course Type Badge */}
          <div className="absolute bottom-3 right-3 z-20">
            <Badge className="bg-violet-600/80 text-white border-violet-500/30 backdrop-blur-sm">
              <Target className="w-3 h-3 mr-1" />
              Prática
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
                  {onManageContent && (
                    <Button 
                      className="bg-violet-600/80 hover:bg-violet-700 text-white backdrop-blur-sm"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageContent(course);
                      }}
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      Gerenciar
                    </Button>
                  )}
                  <Button 
                    className="bg-blue-600/80 hover:bg-blue-700 text-white backdrop-blur-sm"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(course);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Configurar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 px-5 py-4 flex flex-col">
        {/* Practice Course Badge */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-violet-500/10 text-violet-400 border-violet-500/30">
            <Target className="h-3.5 w-3.5" />
            Curso Prático
          </div>
        </div>
        
        {/* Title and Description */}
        <div className="mb-4 flex-1">
          <CardTitle className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-violet-300">
            {course.title}
          </CardTitle>
          
          <p className="text-sm text-customgreys-dirtyGrey line-clamp-2 mb-3">
            {course.description || 'Curso de prática interativa com desafios gamificados'}
          </p>
          
          {/* Course Stats */}
          <div className="flex items-center gap-4 text-xs text-customgreys-dirtyGrey mb-3">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{totalUnits} unidades</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              <span>{totalChallenges} desafios</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              <span>{progress.toFixed(0)}% completo</span>
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
              <Badge variant="outline" className="text-xs text-violet-400 border-violet-500/30 bg-violet-500/10">
                Interativo
              </Badge>
            </div>
          )}
          
          {/* Action Buttons */}
          {isOwner && (
            <div className="flex gap-2">
              {onManageContent && (
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageContent(course);
                  }}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Conteúdo
                </Button>
              )}
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

export default TeacherPracticeCourseCard;
export type { TeacherPracticeCourseCardProps };