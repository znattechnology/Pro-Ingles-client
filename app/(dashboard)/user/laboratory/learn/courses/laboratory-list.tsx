"use client";

import { LaboratoryCard } from "./laboratory-card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUserProgress } from "@/actions/user-progress";
import { useUpdateActiveCourseMutation } from "@/redux/features/api/practiceApiSlice";
import { useFeatureFlag } from "@/lib/featureFlags";
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
    
    // Feature flag for Redux usage
    const useReduxMutation = useFeatureFlag('REDUX_USER_PROGRESS');
    
    // Redux mutation for updating active course
    const [updateActiveCourse, { isLoading: isUpdatingCourse }] = useUpdateActiveCourseMutation();

    // Category-specific images for enhanced visual experience
    const categoryImages = {
        'General': [
            '/service-1.jpg',
            '/service-2.jpg',
            '/course-general-1.jpg'
        ],
        'Business': [
            '/course-business-1.jpg',
            '/course-business-2.jpg',
            '/service-3.jpg'
        ],
        'Technology': [
            '/course-tech-1.jpg',
            '/course-tech-2.jpg',
            '/service-4.jpg'
        ],
        'Medicine': [
            '/course-medical-1.jpg',
            '/course-medical-2.jpg',
            '/service-5.jpg'
        ],
        'Legal': [
            '/course-legal-1.jpg',
            '/course-legal-2.jpg',
            '/service-6.jpg'
        ],
        'Oil & Gas': [
            '/course-energy-1.jpg',
            '/course-oilgas-1.jpg',
            '/course-energy-2.jpg'
        ],
        'Banking': [
            '/course-banking-1.jpg',
            '/course-finance-1.jpg',
            '/course-banking-2.jpg'
        ],
        'Executive': [
            '/course-executive-1.jpg',
            '/course-leadership-1.jpg',
            '/course-executive-2.jpg'
        ],
        'AI Enhanced': [
            '/course-ai-1.jpg',
            '/course-ai-2.jpg',
            '/course-ai-3.jpg'
        ]
    };

    // Fallback images for unknown categories
    const defaultImages = [
        '/service-1.jpg',
        '/service-2.jpg',
        '/service-3.jpg',
        '/service-4.jpg',
        '/service-5.jpg',
        '/service-6.jpg'
    ];

    // Enhanced function to get category-specific images
    const getCourseImage = (course: Course) => {
        // If course has a custom image, use it
        if (course.image) {
            return course.image;
        }
        
        // Get images for the course category
        const categoryImageList = categoryImages[course.category as keyof typeof categoryImages] || defaultImages;
        
        // Use a simple hash of the course ID to consistently assign the same image from the category
        const hash = course.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const imageIndex = Math.abs(hash) % categoryImageList.length;
        return categoryImageList[imageIndex];
    };

    const onClick = (id: string) => {
        console.log('🔍 ONCLICK DEBUG: Function called with courseId:', id);
        console.log('🔍 ONCLICK DEBUG: pending state:', pending, 'updating course:', isUpdatingCourse);
        console.log('🔍 ONCLICK DEBUG: activeCourseId:', activeCourseId);
        console.log('🔍 ONCLICK DEBUG: is same course?', id === activeCourseId);
        console.log('🔍 ONCLICK DEBUG: useReduxMutation:', useReduxMutation);
        
        if (pending || isUpdatingCourse) {
            console.log('⏳ ONCLICK DEBUG: Blocked by pending/updating state');
            return;
        }
        
        if (id === activeCourseId) {
            console.log('🏃 ONCLICK DEBUG: Same course, redirecting directly to learn page');
            return router.push("/user/laboratory/learn");
        }
        
        if (useReduxMutation) {
            console.log('🚀 ONCLICK DEBUG: Using Redux mutation for course selection');
            updateActiveCourse(id)
                .unwrap()
                .then(() => {
                    console.log('✅ ONCLICK DEBUG: Redux mutation successful, redirecting');
                    router.push("/user/laboratory/learn");
                })
                .catch((error) => {
                    console.error("❌ ONCLICK DEBUG: Redux mutation error:", error);
                    toast.error("Erro ao selecionar curso");
                });
        } else {
            console.log('🚀 ONCLICK DEBUG: Using legacy transition for course selection');
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
    }

    // Function to get course statistics (from Redux API with include_stats)
    const getCourseStats = (course: Course) => {
        // Use statistics directly from Redux API (backend calculated)
        const totalUnits = (course as any).totalUnits || (course as any).units_count || (course.practice_units?.length || 0);
        const totalLessons = (course as any).total_lessons || (course as any).lessons_count || 0;
        const totalChallenges = (course as any).total_challenges || (course as any).challenges_count || 0;

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
                        category={course.category}
                        template={(course as any).template}
                        customColors={(course as any).customColors}
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