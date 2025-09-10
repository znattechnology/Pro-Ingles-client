"use client";

import React from "react";
import { motion } from "framer-motion";

import Image from "next/image";
import { useCarousel } from "@/hooks/useCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCoursesQuery } from "@/state/api";





const LoadingSkeleton = () => {
  return (
    <div className="w-3/4">
      <div className="flex justify-between items-center mt-12 h-[200px] rounded-lg bg-customgreys-secondarybg">
        <div className="basis-1/2 px-16 mx-auto">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-2" />
          <Skeleton className="h-4 w-72 mb-8" />
          <Skeleton className="w-40 h-10" />
        </div>
        <Skeleton className="basis-1/2 h-full rounded-r-lg" />
      </div>

      <div className="mx-auto py-12 mt-10">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl mb-8" />

        <div className="flex flex-wrap gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Skeleton key={index} className="w-24 h-6 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((_, index) => (
            <Skeleton key={index} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

const CourseBanner = ({ title, subtitle, rightElement }: HeaderProps) => {
    const now = new Date();

const time = now.toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' });
const date = (new Intl.DateTimeFormat('pt', { dateStyle: 'full' })).format(now);

  // const router = useRouter();
  const currentImage = useCarousel({ totalImages: 3 });
  const {  isLoading,  } = useGetCoursesQuery({});
  // const { data: courses, isLoading, isError } = useGetCoursesQuery({});

  // const handleCourseClick = (courseId: string) => {
  //   router.push(`/search?id=${courseId}`, {
  //     scroll: false,
  //   });
  // };

  if (isLoading) return <LoadingSkeleton />;

  return (
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
  className="w-full px-0"
>
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col md:flex-row justify-between items-center mt-4 mb-4 h-[250px] rounded-lg bg-customgreys-primarybg"
  >
    <div className="basis-full md:basis-1/2 px-6 md:px-16 text-center md:text-left">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{title}</h1>

      
      <p className="text-base md:text-lg text-white/70 mb-6 md:mb-8">
        {subtitle}
        <br />
       <span className="text-white"> {date}</span>
        <br />
       <span  className="text-white" > {time}</span>
      </p>
      <div className="w-fit mx-auto md:mx-0">
        {rightElement}
      </div>
    </div>
    <div className="basis-full md:basis-1/2 h-full relative overflow-hidden px-4 md:px-8 py-4 md:py-6 rounded-lg bg-customgreys-primarybg">
      {["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"].map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`Hero Banner ${index + 1}`}
          fill
          priority={index === currentImage}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`h-full object-contain ${
            index === currentImage ? "opacity-100" : "opacity-50"
          }`}
        />
      ))}
    </div>
  </motion.div>
</motion.div>


  );
};

export default CourseBanner;