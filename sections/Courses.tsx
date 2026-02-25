"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCarousel } from "@/hooks/useCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import CourseCardSearch from "@/components/course/CourseCardSearch";
// import CourseCardSearch from "@/components/CourseCardSearch";
// import { useUser } from "@clerk/nextjs";

const LoadingSkeleton = () => {
  return (
    <div className="landing-skeleton">
      <div className="landing-skeleton__hero">
        <div className="landing-skeleton__hero-content">
          <Skeleton className="landing-skeleton__title" />
          <Skeleton className="landing-skeleton__subtitle" />
          <Skeleton className="landing-skeleton__subtitle-secondary" />
          <Skeleton className="landing-skeleton__button" />
        </div>
        <Skeleton className="landing-skeleton__hero-image" />
      </div>

      <div className="landing-skeleton__featured">
        <Skeleton className="landing-skeleton__featured-title" />
        <Skeleton className="landing-skeleton__featured-description" />

        <div className="landing-skeleton__tags">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Skeleton key={index} className="landing-skeleton__tag" />
          ))}
        </div>

        <div className="landing-skeleton__courses">
          {[1, 2, 3, 4].map((_, index) => (
            <Skeleton key={index} className="landing-skeleton__course-card" />
          ))}
        </div>
      </div>
    </div>
  );
};

const Courses = () => {
  const router = useRouter();
  const currentImage = useCarousel({ totalImages: 3 });
  const { data: coursesData, isLoading, isError } = useGetCoursesQuery({});

  // Handle both paginated format and direct array format
  const courses = React.useMemo(() => {
    if (!coursesData) return [];
    const data = coursesData as any;

    // Paginated format: { results: [...] }
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }

    // Direct array format
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }, [coursesData]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/search?id=${courseId}`, {
      scroll: false,
    });
  };



  if (isLoading) return <LoadingSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center w-full mt-2"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.3, once: true }}
        className="w-3/4 mt-6 p-6 flex flex-col items-center"
      >
        <h2 className="text-2xl font-semibold mb-4 text-white text-center">
          Cursos em destaque
        </h2>
        <p className=" mb-8 text-center text-white/70">
          Os Cursos em Destaque da plataforma ProEnglish Academy representam o que há de melhor e mais procurado para aprimorar suas habilidades no idioma inglês. Curados por especialistas, esses cursos oferecem conteúdos de alta qualidade, metodologias práticas e recursos interativos que garantem uma experiência de aprendizado completa.
        </p>
  
        <div className="flex flex-wrap gap-4 mb-8 justify-center text-white">
          {[
            "web development",
            "enterprise IT",
            "react nextjs",
            "javascript",
            "backend development",
          ].map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-customgreys-secondarybg rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
          {courses.length > 0 &&
            courses.slice(0, 4).map((course: any, index: number) => (
              <motion.div
                key={course.courseId}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ amount: 0.4 }}
              >
                <CourseCardSearch
                  course={course}
                  onClick={() => handleCourseClick(course.courseId)}
                />
              </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
  
};

export default Courses;