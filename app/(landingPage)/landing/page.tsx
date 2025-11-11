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


const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row justify-between items-center mt-8 sm:mt-12 min-h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg bg-customgreys-secondarybg">
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:px-16">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-3 sm:mb-4" />
          <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-md mb-2" />
          <Skeleton className="h-3 sm:h-4 w-3/4 sm:w-72 mb-6 sm:mb-8" />
          <Skeleton className="w-32 sm:w-40 h-8 sm:h-10" />
        </div>
        <Skeleton className="w-full lg:w-1/2 h-48 lg:h-full lg:rounded-r-lg rounded-b-lg lg:rounded-b-none" />
      </div>

      <div className="py-8 sm:py-12 mt-6 sm:mt-10">
        <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 mb-3 sm:mb-4 mx-auto" />
        <Skeleton className="h-3 sm:h-4 w-full max-w-md sm:max-w-2xl mb-6 sm:mb-8 mx-auto" />

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Skeleton key={index} className="w-16 sm:w-24 h-5 sm:h-6 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((_, index) => (
            <Skeleton key={index} className="h-[250px] sm:h-[300px] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const router = useRouter();
  const currentImage = useCarousel({ totalImages: 3 });
  const { data: courses, isLoading,  } = useGetCoursesQuery({});

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
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row justify-between items-center mt-8 sm:mt-12 min-h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg bg-customgreys-secondarybg overflow-hidden"
      >
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:px-16 text-center lg:text-left order-2 lg:order-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Courses</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-6 sm:mb-8 leading-relaxed">
            This is the list of the courses you can enroll in.
            <br className="hidden sm:block" />
            Courses when you need them and want them.
          </p>
          <div className="flex justify-center lg:justify-start">
            <Link href="/search" scroll={false}>
              <div className="bg-primary-700 hover:bg-primary-600 px-4 sm:px-6 py-2 sm:py-3 rounded-md text-sm sm:text-base transition-colors duration-300 inline-block">Search for Courses</div>
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-full relative overflow-hidden order-1 lg:order-2 lg:rounded-r-lg rounded-t-lg lg:rounded-t-none">
          {["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"].map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`Hero Banner ${index + 1}`}
              fill
              priority={index === currentImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-1000 ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.3, once: true }}
        className="py-8 sm:py-12 mt-6 sm:mt-10"
      >
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">Featured Courses</h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
            From beginner to advanced, in all industries, we have the right
            courses just for you and preparing your entire journey for learning
            and making the most.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 px-4">
          {[
            "web development",
            "enterprise IT",
            "react nextjs",
            "javascript",
            "backend development",
          ].map((tag, index) => (
            <span key={index} className="bg-primary-700/20 border border-primary-500 text-primary-200 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-700/30 transition-colors duration-300">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {courses &&
            courses.slice(0, 4).map((course, index) => (
              <motion.div
                key={course.courseId}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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

export default Landing;
