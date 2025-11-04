"use client";

import React from 'react';
import { motion } from 'framer-motion';

const CourseCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: item * 0.1 }}
          className="bg-customgreys-secondarybg border border-violet-900/30 rounded-xl overflow-hidden"
        >
          {/* Image Skeleton */}
          <div className="w-full h-48 bg-gray-600/20 animate-pulse" />
          
          <div className="p-4 sm:p-6">
            {/* Title Skeleton */}
            <div className="w-3/4 h-6 bg-gray-600/30 rounded animate-pulse mb-3" />
            
            {/* Description Skeleton */}
            <div className="space-y-2 mb-4">
              <div className="w-full h-4 bg-gray-600/20 rounded animate-pulse" />
              <div className="w-2/3 h-4 bg-gray-600/20 rounded animate-pulse" />
            </div>
            
            {/* Progress Bar Skeleton */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="w-16 h-4 bg-gray-600/20 rounded animate-pulse" />
                <div className="w-12 h-4 bg-gray-600/20 rounded animate-pulse" />
              </div>
              <div className="w-full h-2 bg-gray-600/20 rounded-full animate-pulse" />
            </div>
            
            {/* Tags Skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="w-16 h-6 bg-violet-500/20 rounded-full animate-pulse" />
              <div className="w-20 h-6 bg-blue-500/20 rounded-full animate-pulse" />
            </div>
            
            {/* Button Skeleton */}
            <div className="w-full h-10 bg-violet-600/30 rounded-lg animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CourseCardsSkeleton;