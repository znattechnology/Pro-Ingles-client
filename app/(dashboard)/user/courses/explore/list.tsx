"use client";

import { StudentCourseCard } from "@/src/domains/student/video-courses/components";
import { useRouter } from "next/navigation";
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
    
    return (
        <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
        }>
         {courses.map((course) =>(
            <StudentCourseCard
                key={course.id}
                course={course}
                onGoToCourse={onGoToCourse}
                viewMode={viewMode}
            />
         ))}
        </div>
    )
}