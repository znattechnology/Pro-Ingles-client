import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Play, Clock, BookOpen, Star, Users, TrendingUp, Award, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { StudentVideoCourse } from '../types';

interface StudentCourseCardProps {
  course: StudentVideoCourse;
  onGoToCourse: (course: StudentVideoCourse) => void;
  viewMode?: 'grid' | 'list';
  showProgress?: boolean;
}

const StudentCourseCard = ({ 
  course, 
  onGoToCourse, 
  viewMode = 'grid',
  showProgress = false 
}: StudentCourseCardProps) => {
  const progress = course.progress || 0;
  const isEnrolled = course.is_enrolled;

  if (viewMode === 'list') {
    return (
      <Card className="bg-customgreys-secondarybg/40 border-violet-900/30 hover:bg-customgreys-secondarybg/60 transition-all duration-300 group cursor-pointer" 
            onClick={() => onGoToCourse(course)}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Course Image */}
            <div className="relative w-20 sm:w-24 h-14 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={course.image || "/placeholder.png"}
                alt={course.title}
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
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-1">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Avatar className="w-4 h-4">
                        <AvatarImage alt={course.teacherName} />
                        <AvatarFallback className="bg-violet-600 text-white text-xs">
                          {course.teacherName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{course.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || '2h 30min'}</span>
                    </div>
                  </div>

                  {/* Progress bar for enrolled courses */}
                  {isEnrolled && showProgress && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Button */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Button
                    className={cn(
                      "px-3 sm:px-4 py-2 text-xs sm:text-sm min-h-[36px]",
                      isEnrolled 
                        ? "bg-violet-600 hover:bg-violet-700 text-white" 
                        : "bg-green-600 hover:bg-green-700 text-white"
                    )}
                    size="sm"
                  >
                    {isEnrolled ? 'Continuar' : 'Ver Curso'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default) - Modern Design
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
        onClick={() => onGoToCourse(course)}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-violet-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative p-0 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            <Image
              src={course.image || "/placeholder.png"}
              alt={course.title}
              width={400}
              height={200}
              className="w-full h-[160px] sm:h-[200px] object-cover transition-all duration-700 group-hover:scale-110"
              priority
            />
            
            {/* Floating Action on Hover */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
            >
              <Button className="bg-violet-600/90 hover:bg-violet-500 text-white backdrop-blur-sm shadow-lg border border-violet-400/30 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base px-3 sm:px-4 py-2">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isEnrolled ? 'Continuar Curso' : 'Ver Curso'}</span>
                <span className="sm:hidden">{isEnrolled ? 'Continuar' : 'Ver'}</span>
              </Button>
            </motion.div>

            {/* Modern Progress Bar */}
            {isEnrolled && showProgress && (typeof progress === 'number' && progress > 0) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-sm p-3 z-20">
                <div className="flex items-center justify-between text-xs text-white mb-2">
                  <span className="font-medium">Progresso</span>
                  <span className="font-bold">{typeof progress === 'number' ? progress : 0}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${typeof progress === 'number' ? progress : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-violet-400 to-purple-400 h-2 rounded-full shadow-lg"
                  />
                </div>
              </div>
            )}

            {/* Modern Badges - Status no canto esquerdo */}
            {isEnrolled && (
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none shadow-lg">
                  <Award className="w-3 h-3 mr-1" />
                  Inscrito
                </Badge>
              </div>
            )}
            
            {/* Level Badge - Canto direito */}
            {course.level && (
              <div className="absolute top-4 right-4 z-20">
                <Badge variant="outline" className="bg-black/60 text-white border-white/30 backdrop-blur-sm">
                  {course.level}
                </Badge>
              </div>
            )}

          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 sm:p-6 relative z-10">
          <div className="space-y-4">
            {/* Course Title */}
            <CardTitle className="text-base sm:text-lg font-bold line-clamp-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
              {course.title}
            </CardTitle>

            {/* Course Description */}
            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {course.description}
            </p>

            {/* Teacher Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="w-6 h-6 sm:w-8 sm:h-8 border border-violet-400/30">
                <AvatarImage alt={(course as any).teacherName} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xs sm:text-sm font-semibold">
                  {(course as any).teacherName?.[0] || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs sm:text-sm font-medium text-violet-400">
                  {(course as any).teacherName || 'Professor'}
                </p>
                <p className="text-xs text-gray-500">
                  Instrutor
                </p>
              </div>
            </div>

            {/* Mobile-Optimized Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-blue-400 mb-1">
                  <Users className="w-3 h-3" />
                  <span className="text-xs font-bold">{(course as any).total_students || 0}</span>
                </div>
                <div className="text-xs text-gray-500">Alunos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-yellow-400 mb-1">
                  <Star className="w-3 h-3" />
                  <span className="text-xs font-bold">
                    {course.rating ? Number(course.rating).toFixed(1) : '4.8'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Avaliação</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-green-400 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-bold">{course.duration || '2h'}</span>
                </div>
                <div className="text-xs text-gray-500">Duração</div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-6 pt-0 relative z-10">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/30 rounded-full px-3 py-1.5">
                <span className="text-xs font-medium text-violet-300">
                  {course.category}
                </span>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 text-violet-400"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Ver Mais</span>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default StudentCourseCard;
export type { StudentCourseCardProps };