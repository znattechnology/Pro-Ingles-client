import Image from "next/image";
import { Check, BookOpen, Star, Clock, Users, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudentPracticeCourse } from '../types';

interface PracticeCourseCardProps {
  course: StudentPracticeCourse;
  onClick: (course: StudentPracticeCourse) => void;
  disabled?: boolean;
  active?: boolean;
  showProgress?: boolean;
}

export const PracticeCourseCard = ({
  course,
  onClick,
  disabled,
  active,
  showProgress = true
}: PracticeCourseCardProps) => {
  const progress = course.progress || 0;
  const isCompleted = progress >= 100;
  const challengesCompleted = course.challenges_completed || 0;
  const totalChallenges = course.total_challenges || 0;

  return (
    <div 
      onClick={() => onClick(course)}
      className={cn(
        "h-full border-2 rounded-xl border-b-4 hover:bg-customgreys-secondarybg/30 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-4 pb-6 min-h-[320px] transition-all duration-200 bg-customgreys-primarybg",
        "border-violet-200/20 hover:border-violet-300/40",
        disabled && "pointer-events-none opacity-50",
        active && "border-violet-500 bg-violet-500/5 hover:bg-violet-500/10",
        isCompleted && "border-green-400 bg-green-500/5 hover:bg-green-500/10"
      )}
    >
      {/* Active/Completed indicator */}
      <div className="min-h-[24px] w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          {course.level && (
            <Badge variant="outline" className="text-xs text-violet-400 border-violet-500/30 bg-violet-500/10">
              {course.level}
            </Badge>
          )}
          {course.difficulty && (
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-500/30">
              {course.difficulty}
            </Badge>
          )}
        </div>
        
        {(active || isCompleted) && (
          <div className={cn(
            "rounded-md flex items-center justify-center p-1.5",
            isCompleted ? "bg-green-600" : "bg-violet-600"
          )}>
            {isCompleted ? (
              <Trophy className="text-white stroke-[4] h-4 w-4" />
            ) : (
              <Check className="text-white stroke-[4] h-4 w-4" />
            )}
          </div>
        )}
      </div>

      {/* Course image */}
      <div className="relative w-20 h-20 mb-3">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="rounded-lg drop-shadow-md border object-cover"
          />
        ) : (
          <div className="w-full h-full bg-violet-100/10 rounded-lg flex items-center justify-center border border-violet-500/20">
            <Target className="h-10 w-10 text-violet-400" />
          </div>
        )}
      </div>

      {/* Course info */}
      <div className="text-center space-y-2 flex-1 flex flex-col justify-center">
        <h3 className="font-bold text-white text-lg leading-tight">
          {course.title}
        </h3>
        
        {course.description && (
          <p className="text-gray-400 text-sm line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Course stats */}
        <div className="flex flex-wrap gap-3 justify-center mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{course.total_units || 0} unidades</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{totalChallenges} desafios</span>
          </div>
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{course.rating}</span>
            </div>
          )}
        </div>

        {/* Progress section */}
        {showProgress && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Progresso</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isCompleted ? "bg-green-500" : "bg-violet-500"
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
            {/* Challenge progress */}
            <div className="text-xs text-gray-400">
              <span>{challengesCompleted}/{totalChallenges} desafios concluídos</span>
            </div>
          </div>
        )}

        {/* Category and tags */}
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {course.category && (
            <span className="px-2 py-1 bg-purple-100/10 text-purple-300 text-xs rounded-full border border-purple-500/20">
              {course.category}
            </span>
          )}
        </div>
      </div>

      {/* Action indicator */}
      <div className="mt-3 text-center">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
            <Trophy className="w-4 h-4" />
            <span>Concluído</span>
          </div>
        ) : active ? (
          <div className="flex items-center gap-2 text-violet-400 font-medium text-sm">
            <Target className="w-4 h-4" />
            <span>Continuar Praticando</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Começar Curso</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeCourseCard;
export type { PracticeCourseCardProps };