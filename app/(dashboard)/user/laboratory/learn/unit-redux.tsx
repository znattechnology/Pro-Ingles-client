/**
 * Unit Component - Enhanced with Redux
 * 
 * 🔄 REDUX MIGRATION: Este componente agora suporta Redux com feature flags
 * para migração gradual mantendo compatibilidade com implementação legacy.
 */

import React from 'react';
import { UnitBanner } from './unit-banner';
import { LessonButton } from './lesson-button';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useUnitManagement, 
  useUnitManagementDebug,
  useUnitActions,
  type Lesson,
  type Unit as UnitType,
  type ActiveLesson
} from '@/redux/features/laboratory/hooks/useUnitManagement';
import { 
  useUnitProgression
} from '@/src/domains/student/practice-courses/hooks/useUnitManagement';

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
  courseId,
  useRedux = false,
}: Props) => {
  // Feature flags
  const useReduxUnits = useFeatureFlag('REDUX_UNIT_MANAGEMENT') && useRedux;
  
  // Redux hooks (only if enabled)
  const { 
    getUnitProgress: reduxGetUnitProgress, 
    getLessonProgress: reduxGetLessonProgress, 
    navigateToLesson: reduxNavigateToLesson 
  } = useUnitManagement(courseId ?? null);
  
  const { unlockNextUnit, markUnitComplete } = useUnitActions();
  
  // Debug information
  useUnitManagementDebug(courseId ?? null);
  
  // Domains-based hooks (fallback)
  const { getUnitProgress: domainsGetUnitProgress, getLessonProgress: domainsGetLessonProgress, navigateToLesson: domainsNavigateToLesson } = useUnitProgression(courseId ?? null);
  
  // Choose which implementation to use
  const getUnitProgress = useReduxUnits ? reduxGetUnitProgress : domainsGetUnitProgress;
  const getLessonProgress = useReduxUnits ? reduxGetLessonProgress : domainsGetLessonProgress;
  const navigateToLesson = useReduxUnits ? reduxNavigateToLesson : domainsNavigateToLesson;
  
  // Ensure lessons is always an array to prevent errors
  const safeLessons = Array.isArray(legacyLessons) ? legacyLessons : [];
  
  // Get unit progress using exact Redux logic
  const unitProgress = getUnitProgress(id);
  
  // Debug migration
  if (process.env.NODE_ENV === 'development') {
    console.log('📚 Unit Component Migration Status:', {
      useReduxUnits,
      useRedux,
      unitId: id,
      title,
      lessonsCount: safeLessons?.length || 0,
      implementation: useReduxUnits ? 'Redux' : 'Domains',
      unitProgress: unitProgress ? {
        isUnlocked: unitProgress.isUnlocked,
        isCompleted: unitProgress.isCompleted,
        progressPercentage: unitProgress.progressPercentage
      } : null,
      timestamp: new Date().toISOString()
    });
  }
  
  // Enhanced lesson button props - EXACT COPY of Redux logic
  const getLessonButtonProps = (lesson: Lesson, index: number) => {
    const lessonProgress = getLessonProgress(lesson.id, id);
    // Actual first unit (lowest order) is NEVER locked
    const lessonUnitLocked = !isFirstUnit && unitProgress ? !unitProgress.isUnlocked : false;
    
    // **EXACT REDUX LOGIC**: Proper unit and lesson unlock logic
    let isLessonLocked = lessonProgress.isLocked || lessonUnitLocked;
    if (index === 0 && isFirstUnit) {
      // First lesson of first unit is ALWAYS unlocked
      isLessonLocked = false;
    } else if (index === 0) {
      // First lesson of any unit is LOCKED if unit is LOCKED (i.e., previous unit not completed)
      isLessonLocked = lessonUnitLocked;
    } else {
      // Subsequent lessons: check if previous lesson is completed AND unit is unlocked
      const previousLesson = safeLessons[index - 1];
      const prevLessonProgress = getLessonProgress(previousLesson.id, id);
      isLessonLocked = !prevLessonProgress.isCompleted || lessonUnitLocked;
    }
    
    return {
      id: lesson.id,
      index,
      totalCount: safeLessons.length - 1,
      current: (lessonProgress.isCurrent || (index === 0 && isFirstUnit && !lessonProgress.isCompleted)) && !isLessonLocked,
      locked: isLessonLocked,
      percentage: lessonProgress.progressPercentage,
      // Redux-specific props
      isCompleted: lessonProgress.isCompleted,
      onClick: () => {
        if (!isLessonLocked) {
          navigateToLesson(lesson.id);
        }
      },
    };
  };

  // Check if unit is locked using exact Redux logic
  const numericOrder = Number(order);
  const isFirstUnit = numericOrder === 0;
  const isUnitLocked = !isFirstUnit && unitProgress ? !unitProgress.isUnlocked : false;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Unit "${title}" Debug (${useReduxUnits ? 'Redux' : 'Domains'}):`, {
      id,
      order,
      numericOrder,
      isFirstUnit,
      isUnitLocked,
      useReduxUnits,
      implementation: useReduxUnits ? 'Redux' : 'Domains',
      unitProgress: unitProgress ? {
        isUnlocked: unitProgress.isUnlocked,
        isCompleted: unitProgress.isCompleted,
        progressPercentage: unitProgress.progressPercentage,
        completedLessons: unitProgress.completedLessons,
        totalLessons: unitProgress.totalLessons
      } : null
    });
  }

  return (
    <>
      <UnitBanner 
        title={`${title} ${useReduxUnits ? '🔄' : '🎯'} ${(isUnitLocked && !isFirstUnit) ? '🔒' : ''}`} 
        description={description}
      />
      
      <div className='flex items-center flex-col relative'>
        {/* Unit Progress Indicator */}
        {unitProgress && (
          <div className="w-full max-w-md mb-4 p-3 sm:p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-violet-400 text-xs sm:text-sm font-medium">Progresso da Unidade {useReduxUnits ? '🔄' : '🎯'}</span>
              <span className="text-white text-xs sm:text-sm font-bold">
                {unitProgress.completedLessons}/{unitProgress.totalLessons}
              </span>
            </div>
            <div className="w-full bg-customgreys-darkGrey rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${unitProgress.progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-customgreys-dirtyGrey text-xs">
                {unitProgress.isCompleted ? 'Concluída' : 'Em progresso'}
              </span>
              <span className="text-violet-400 text-xs font-medium">
                {Math.round(unitProgress.progressPercentage)}%
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
                🎉 Unidade Concluída! {useReduxUnits ? '🔄' : '🎯'}
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
              {useReduxUnits ? '🔄' : '🎯'} Esta unidade ainda não possui lições
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