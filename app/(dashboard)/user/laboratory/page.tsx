"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/course/Loading';

/**
 * Laboratory Index Page - Redirects to main learning interface
 * 
 * This page handles cases where users access /user/laboratory directly
 * by redirecting them to the main learning interface at /user/laboratory/learn/courses
 */
const LaboratoryIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main learning interface
    router.replace('/user/laboratory/learn/courses');
  }, [router]);

  // Show loading while redirecting
  return <Loading />;
};

export default LaboratoryIndexPage;