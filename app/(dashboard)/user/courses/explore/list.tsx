"use client";

import { StudentCourseCard } from "@/src/domains/student/video-courses/components";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { StudentVideoCourse } from "@/src/domains/student/video-courses/types";

type Props = {
    courses: StudentVideoCourse[];
    activeCourseId?: string;
    viewMode?: 'grid' | 'list';
};

export const List = ({courses, activeCourseId, viewMode = 'grid'}: Props) => {
    const router = useRouter();

    const onGoToCourse = (course: StudentVideoCourse) => {
        // Use courseId from API response (temporary fix until API/types are aligned)
        const courseId = (course as any).courseId || course.id;
        console.log('🔍 Navigating to course:', courseId);
        
        if (!courseId) {
            console.error('❌ Course ID is missing! Course object:', course);
            return;
        }
        
        // Navigate to course details page
        router.push(`/user/courses/${courseId}`);
    }
    
    // Animation variants for staggered entrance
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div 
            className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
                : "flex flex-col gap-3 sm:gap-4"
            }
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
         {courses.map((course, index) =>(
            <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
            >
                <StudentCourseCard
                    course={course}
                    onGoToCourse={onGoToCourse}
                    viewMode={viewMode}
                />
            </motion.div>
         ))}
        </motion.div>
    )
}