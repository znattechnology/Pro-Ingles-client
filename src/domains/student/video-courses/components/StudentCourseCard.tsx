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
import { Play, Clock, BookOpen, Star, Users } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
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
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
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
                
                {/* Price and Action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {formatPrice(course.price)}
                  </span>
                  
                  <Button
                    className={cn(
                      "px-4 py-2",
                      isEnrolled 
                        ? "bg-violet-600 hover:bg-violet-700 text-white" 
                        : "bg-green-600 hover:bg-green-700 text-white"
                    )}
                    size="sm"
                  >
                    {isEnrolled ? 'Continuar' : 'Começar'}
                  </Button>
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
    <Card className="flex flex-col w-full h-[340px] xl:h-[380px] border-none bg-customgreys-primarybg overflow-hidden cursor-pointer hover:bg-white-100/10 transition duration-200 group" 
          onClick={() => onGoToCourse(course)}>
      <CardHeader className="course-card__header relative p-0">
        <div className="relative">
          <Image
            src={course.image || "/placeholder.png"}
            alt={course.title}
            width={400}
            height={200}
            className="w-full h-[180px] object-cover transition-transform group-hover:scale-105"
            priority
          />
          
          {/* Overlay for enrolled courses */}
          {isEnrolled && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                <Play className="w-5 h-5 mr-2" />
                Continuar Curso
              </Button>
            </div>
          )}

          {/* Progress bar overlay for enrolled courses */}
          {isEnrolled && showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <div className="flex items-center justify-between text-xs text-white mb-1">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1">
                <div 
                  className="bg-violet-400 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Level badge */}
          {course.level && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-black/50 text-white border-white/30 backdrop-blur-sm">
                {course.level}
              </Badge>
            </div>
          )}

          {/* Enrolled badge */}
          {isEnrolled && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-violet-600 text-white">
                Inscrito
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col justify-between w-full h-full p-6">
        <div className="space-y-3">
          <CardTitle className="text-md lg:text-lg font-semibold line-clamp-2 text-white group-hover:text-violet-300 transition-colors">
            {course.title}: {course.description}
          </CardTitle>

          {/* Teacher info */}
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarImage alt={course.teacherName} />
              <AvatarFallback className="bg-violet-600 text-white text-xs">
                {course.teacherName?.[0]}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-violet-400">
              {course.teacherName}
            </p>
          </div>

          {/* Course stats */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{course.total_students || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>{course.rating || 4.8}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{course.duration || '2h 30min'}</span>
            </div>
          </div>
        </div>

        <CardFooter className="p-0 flex justify-between items-center mt-4">
          <div className="text-sm bg-customgreys-secondarybg rounded-full px-3 py-2 text-gray-400">
            {course.category}
          </div>
          <span className="text-white font-bold text-lg">
            {formatPrice(course.price)}
          </span>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default StudentCourseCard;
export type { StudentCourseCardProps };