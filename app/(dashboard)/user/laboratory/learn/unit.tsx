import React from 'react';
import { UnitBanner } from './unit-banner';
import { LessonButton } from './lesson-button';

// Django API types
interface Lesson {
    id: string;
    order: number;
    title: string;
    completed: boolean;
}

interface Unit {
    id: string;
    title: string;
    description: string;
    order: number;
}

interface ActiveLesson extends Lesson {
    unit: Unit;
}

type Props = {
    id: string;
    order: number;
    title: string;
    description: string;
    lessons: Lesson[];
    activeLesson: ActiveLesson | undefined;
    activeLessonPercentage: number;
};


export const Unit = ({
    id,
    order,
    title,
    description,
    lessons,
    activeLesson,
    activeLessonPercentage
}:Props) => {
  return (
    <>
      <UnitBanner title={title} description={description} />
      <div className='flex items-center flex-col relative'>
        {lessons.map((lesson, index) => {
            const isCurrent =  lesson.id === activeLesson?.id;
            const isLocked = !lesson.completed && !isCurrent;
            return (
                <LessonButton
                key={lesson.id}
                id={lesson.id}
                index={index}
                totalCount={lessons.length -1}
                current={isCurrent}
                locked={isLocked}
                percentage={activeLessonPercentage}
               
                
                
                
                
                />
            )
        })}
      </div>
    </>
  );
}

