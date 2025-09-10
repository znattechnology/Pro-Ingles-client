"use client";

import React, { useState, useEffect } from 'react';
import { getCourses, getUserProgress } from '@/db/django-queries';
import { List } from './list';
import Loading from '@/components/course/Loading';

const LearnCourse = () => {
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [coursesData, userProgressData] = await Promise.all([
          getCourses(),
          getUserProgress()
        ]);
        
        setCourses(coursesData);
        setUserProgress(userProgressData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className='h-full max-w-[912px] px-3 mx-auto'>
        <div className='text-center py-12'>
          <h2 className='text-xl font-semibold text-red-500 mb-2'>Erro</h2>
          <p className='text-white'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full max-w-[912px] px-3 mx-auto'>
        <h1 className='text-2xl font-bold text-white'>
            Language Course
        </h1>
        <List
          courses={courses}
          activeCourseId={(userProgress as any)?.active_course?.id}
        />
    </div>
  )
}

export default LearnCourse;