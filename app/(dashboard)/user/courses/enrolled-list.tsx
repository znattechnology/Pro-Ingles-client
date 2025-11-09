"use client";

import { EnrolledCard } from "./enrolled-card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Define types for enrolled courses
interface EnrolledCourse {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    instructor?: string;
    progress?: number;
    totalLessons?: number;
    completedLessons?: number;
    duration?: string;
    level?: string;
    category?: string;
    enrolledAt?: string;
    lastAccessed?: string;
    status?: string;
    rating?: number;
    nextLesson?: string;
    template?: string;
}

type Props = {
    courses: EnrolledCourse[];
    activeCourseId?: string;
    viewMode?: 'grid' | 'list';
};

export const EnrolledList = ({courses, activeCourseId, viewMode = 'grid'}: Props) => {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const onClick = async (id: string) => {
        if (pending) return;
        
        startTransition(async () => {
            try {
                // First, try to get the course data to find the first chapter
                const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/courses/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const courseData = await response.json();
                    const course = courseData.data;
                    
                    console.log('🔍 Course data structure:', {
                        courseId: id,
                        title: course.title,
                        sectionsCount: course.sections?.length,
                        sections: course.sections?.map((s: any, idx: number) => ({
                            index: idx,
                            id: s.sectionId,
                            title: s.sectionTitle,
                            chaptersCount: s.chapters?.length,
                            chapters: s.chapters?.map((c: any) => ({
                                id: c.chapterId,
                                title: c.title,
                                type: c.type
                            }))
                        }))
                    });
                    
                    // Find first section that has chapters and its first chapter
                    const firstSectionWithChapters = course.sections?.find((section: any) => 
                        section.chapters && section.chapters.length > 0
                    );
                    const firstChapter = firstSectionWithChapters?.chapters?.[0];
                    
                    console.log('🎯 First section with chapters:', firstSectionWithChapters);
                    console.log('🎯 First chapter:', firstChapter);
                    
                    if (firstChapter) {
                        console.log('✅ Navigating to:', `/user/courses/${id}/chapters/${firstChapter.chapterId}`);
                        router.push(`/user/courses/${id}/chapters/${firstChapter.chapterId}`);
                        return;
                    } else {
                        console.log('❌ No first chapter found');
                        console.log('❌ Course sections:', course.sections);
                    }
                }
                
                // Fallback: if we can't get course data, show error
                toast.error("Não foi possível encontrar o primeiro capítulo do curso");
                
            } catch (error) {
                console.error("Error accessing course:", error);
                toast.error("Alguma coisa não correu bem");
            }
        });
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
                ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6" 
                : "flex flex-col gap-4"
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
                <EnrolledCard
                id={course.id}
                title={course.title}
                imageSrc={course.thumbnail || '/laboratory/challenges/english-1.jpg'}
                template={course.template || 'general'}
                description={course.description}
                category={course.category}
                level={course.level}
                instructor={course.instructor}
                progress={course.progress}
                totalLessons={course.totalLessons}
                completedLessons={course.completedLessons}
                duration={course.duration}
                status={course.status}
                rating={course.rating}
                nextLesson={course.nextLesson}
                onClick={onClick}
                disabled={pending}
                active={course.id === activeCourseId}
                viewMode={viewMode}
                />
            </motion.div>
         ))}
        </motion.div>
    )
}