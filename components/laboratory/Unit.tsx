import React from 'react';
import { UnitBanner } from './UnitBanner';
import { LessonButton } from './LessonButton';

type Lesson = {
  id: string;
  title: string;
  order: number;
  completed: boolean;
};

type Props = {
  id: string;
  order: number;
  title: string;
  description: string;
  lessons: Lesson[];
};

export const Unit = ({
  id,
  order,
  title,
  description,
  lessons,
}: Props) => {
  return (
    <>
      <UnitBanner title={title} description={description} />
      <div className="flex items-center flex-col relative">
        {lessons.map((lesson, index) => {
          const isCurrent = index === 0; // For now, first lesson is always current
          const isLocked = !lesson.completed && !isCurrent;
          
          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={index}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={lesson.completed ? 100 : 0}
            />
          );
        })}
      </div>
    </>
  );
};