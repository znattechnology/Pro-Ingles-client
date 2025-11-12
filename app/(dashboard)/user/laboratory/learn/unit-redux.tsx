/**
 * Unit Component - Enhanced with Redux
 * 
 * 🔄 REDUX MIGRATION: Este componente agora suporta Redux com feature flags
 * para migração gradual mantendo compatibilidade com implementação legacy.
 */

import React from 'react';
import { UnitBanner } from './unit-banner';
import { LessonButton } from './lesson-button';
import { 
  useUnitProgression,
  useUnitManagement as useDomainsUnitManagement
} from '@/src/domains/student/practice-courses/hooks/useUnitManagement';
import { 
  type Lesson,
  type ActiveLesson
} from '@/redux/features/laboratory/hooks/useUnitManagement';

type Props = {
  id: string;
  order: number;
  title: string;
  description: string;
  lessons: Lesson[];
  activeLesson: ActiveLesson | undefined;
  activeLessonPercentage: number;
  // Redux mode indicators
  courseId?: string;
  useRedux?: boolean;
};

export const UnitRedux = ({
  id,
  order,
  title,
  description,
  lessons: legacyLessons,
  activeLesson: legacyActiveLesson,
  activeLessonPercentage,
  courseId
}: Props) => {
  // Use domains-based unit progression (no feature flags needed)
  const { isUnitUnlocked, isLessonUnlocked } = useUnitProgression(courseId || null);
  const { learningPath } = useDomainsUnitManagement(courseId || null);
  
  // Ensure lessons is always an array to prevent errors
  const safeLessons = Array.isArray(legacyLessons) ? legacyLessons : [];
  
  // Get unit progress from domains
  const unitProgress = learningPath.unitsProgress.find(u => u.id === id);
  
  // Debug migration
  if (process.env.NODE_ENV === 'development') {
    console.log('📚 Unit Component (Domains-based):', {
      unitId: id,
      title,
      lessonsCount: safeLessons?.length || 0,
      unitProgress: unitProgress ? {
        isUnlocked: unitProgress.isUnlocked,
        isCompleted: unitProgress.isCompleted,
        progress: unitProgress.progress
      } : null,
      timestamp: new Date().toISOString()
    });
  }
  
  // Enhanced lesson button props using domains logic
  const getLessonButtonProps = (lesson: Lesson, index: number) => {
    // Use domains-based unlock logic
    const isLocked = !isLessonUnlocked(lesson.id, id);
    const isCurrent = lesson.id === legacyActiveLesson?.id;
    
    // Find lesson in unit progress for completion status
    const lessonInProgress = unitProgress?.lessons.find(l => l.id === lesson.id);
    const isCompleted = lessonInProgress?.completed || lesson.completed || false;
    
    return {
      id: lesson.id,
      index,
      totalCount: safeLessons.length - 1,
      current: isCurrent || (index === 0 && isFirstUnit && !isCompleted && !isLocked),
      locked: isLocked,
      percentage: lessonInProgress?.progress || activeLessonPercentage || 0,
      isCompleted,
      onClick: () => {
        if (!isLocked) {
          // Navigate to lesson - you may need to implement this based on your routing
          window.location.href = `/user/laboratory/learn/lesson/${lesson.id}`;
        }
      },
    };
  };

  // Check if unit is locked using domains logic
  const numericOrder = Number(order);
  const isFirstUnit = numericOrder === 0;
  const isUnitLocked = !isFirstUnit && !isUnitUnlocked(id);
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Unit "${title}" Debug (Domains):`, {
      id,
      order,
      numericOrder,
      isFirstUnit,
      isUnitLocked,
      unitProgress: unitProgress ? {
        isUnlocked: unitProgress.isUnlocked,
        isCompleted: unitProgress.isCompleted,
        progress: unitProgress.progress,
        completedLessons: unitProgress.completedLessons,
        totalLessons: unitProgress.totalLessons
      } : null
    });
  }

  return (
    <>
      <UnitBanner 
        title={`${title} 🎯 ${(isUnitLocked && !isFirstUnit) ? '🔒' : ''}`} 
        description={description}
      />
      
      <div className='flex items-center flex-col relative'>
        {/* Unit Progress Indicator */}
        {unitProgress && (
          <div className="w-full max-w-md mb-4 p-3 sm:p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-violet-400 text-xs sm:text-sm font-medium">Progresso da Unidade 🎯</span>
              <span className="text-white text-xs sm:text-sm font-bold">
                {unitProgress.completedLessons}/{unitProgress.totalLessons}
              </span>
            </div>
            <div className="w-full bg-customgreys-darkGrey rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${unitProgress.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-customgreys-dirtyGrey text-xs">
                {unitProgress.isCompleted ? 'Concluída' : 'Em progresso'}
              </span>
              <span className="text-violet-400 text-xs font-medium">
                {Math.round(unitProgress.progress)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Unit Locked Message (NEVER show for first unit) */}
        {isUnitLocked && !isFirstUnit && (
          <div className="w-full max-w-md mb-6 p-4 sm:p-6 bg-gray-500/10 rounded-lg border border-gray-500/20">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">🔒</div>
              <h4 className="text-gray-400 font-semibold mb-2 text-sm sm:text-base">Unidade Bloqueada</h4>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Complete todas as lições da unidade anterior para desbloquear esta unidade.
              </p>
            </div>
          </div>
        )}
        
        {/* Lessons */}
        {safeLessons.map((lesson, index) => {
          const buttonProps = getLessonButtonProps(lesson, index);
          return (
            <LessonButton
              key={lesson.id}
              {...buttonProps}
            />
          );
        })}
        
        {/* Unit Actions */}
        {unitProgress?.isCompleted && (
          <div className="mt-4 p-3 sm:p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-center">
              <div className="text-green-400 text-xs sm:text-sm font-medium mb-2">
                🎉 Unidade Concluída! 🎯
              </div>
              <div className="text-green-300 text-xs">
                Próxima unidade será desbloqueada automaticamente
              </div>
            </div>
          </div>
        )}
        
        {/* Empty state for units with no lessons */}
        {safeLessons.length === 0 && (
          <div className="text-center py-6 sm:py-8 px-4">
            <div className="text-customgreys-dirtyGrey text-xs sm:text-sm mb-2">
              🎯 Esta unidade ainda não possui lições
            </div>
            <div className="text-customgreys-darkGrey text-xs leading-relaxed">
              Aguarde enquanto o conteúdo é preparado
            </div>
          </div>
        )}
      </div>
    </>
  );
};