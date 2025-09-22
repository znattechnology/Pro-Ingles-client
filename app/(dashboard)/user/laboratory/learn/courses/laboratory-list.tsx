"use client";

import { LaboratoryCard } from "./laboratory-card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUserProgress } from "@/actions/user-progress";
import { toast } from "sonner";

// Define types for Django API responses
interface Course {
    id: string;
    title: string;
    description?: string;
    image?: string;
    category?: string;
    level?: string;
    practice_units?: any[];
    total_lessons?: number;
    total_challenges?: number;
    completed_units?: number;
    progress?: number;
}

type Props = {
    courses: Course[];
    activeCourseId?: string;
    viewMode?: 'grid' | 'list';
};

export const LaboratoryList = ({courses, activeCourseId, viewMode = 'grid'}: Props) => {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    // Array of default laboratory images using service images from landing page
    const defaultImages = [
        '/service-1.jpg',
        '/service-2.jpg',
        '/service-3.jpg',
        '/service-4.jpg',
        '/service-5.jpg',
        '/service-6.jpg'
    ];

    // Function to get a consistent image for a course based on its ID
    const getCourseImage = (course: Course) => {
        if (course.image) {
            return course.image;
        }
        
        // Use a simple hash of the course ID to consistently assign the same image
        const hash = course.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const imageIndex = Math.abs(hash) % defaultImages.length;
        return defaultImages[imageIndex];
    };

    const onClick = (id: string) => {
        console.log('🔍 ONCLICK DEBUG: Function called with courseId:', id);
        console.log('🔍 ONCLICK DEBUG: pending state:', pending);
        console.log('🔍 ONCLICK DEBUG: activeCourseId:', activeCourseId);
        console.log('🔍 ONCLICK DEBUG: is same course?', id === activeCourseId);
        
        if (pending) {
            console.log('⏳ ONCLICK DEBUG: Blocked by pending state');
            return;
        }
        
        if (id === activeCourseId) {
            console.log('🏃 ONCLICK DEBUG: Same course, redirecting directly to learn page');
            return router.push("/user/laboratory/learn");
        }
        
        console.log('🚀 ONCLICK DEBUG: Starting transition for new course selection');
        startTransition(async () => {
            try {
                console.log('📤 ONCLICK DEBUG: Calling upsertUserProgress with courseId:', id);
                await upsertUserProgress(id);
                console.log('✅ ONCLICK DEBUG: upsertUserProgress successful, redirecting');
                router.push("/user/laboratory/learn");
            } catch (error) {
                console.error("❌ ONCLICK DEBUG: Error selecting course:", error);
                toast.error("Alguma coisa não correu bem");
            }
        });
    }

    // Function to calculate course statistics
    const getCourseStats = (course: Course) => {
        const practiceUnits = course.practice_units || [];
        const totalUnits = practiceUnits.length;
        
        // Count total lessons and challenges
        let totalLessons = 0;
        let totalChallenges = 0;
        
        practiceUnits.forEach((unit: any) => {
            if (unit.practice_lessons) {
                totalLessons += unit.practice_lessons.length;
                unit.practice_lessons.forEach((lesson: any) => {
                    if (lesson.practice_challenges) {
                        totalChallenges += lesson.practice_challenges.length;
                    }
                });
            }
        });

        return {
            totalUnits,
            totalLessons,
            totalChallenges,
            completedUnits: course.completed_units || 0,
            progress: course.progress || 0
        };
    };

    return (
        <div className={
            viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
        }>
            {courses.map((course) => {
                const stats = getCourseStats(course);
                
                return (
                    <LaboratoryCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        imageSrc={getCourseImage(course)}
                        level={course.level}
                        totalUnits={stats.totalUnits}
                        completedUnits={stats.completedUnits}
                        totalLessons={stats.totalLessons}
                        totalChallenges={stats.totalChallenges}
                        progress={stats.progress}
                        onClick={onClick}
                        disabled={pending}
                        active={course.id === activeCourseId}
                        viewMode={viewMode}
                    />
                );
            })}
        </div>
    )
}