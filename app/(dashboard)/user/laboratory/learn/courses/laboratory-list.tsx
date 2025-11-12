"use client";

import { LaboratoryCard } from "./laboratory-card";
import { useRouter } from "next/navigation";
import { useSelectActiveCourseMutation, useGetCourseUnitsWithProgressQuery } from '@/src/domains/student/practice-courses/api/studentPracticeApiSlice';
import { toast } from "sonner";
import { useMemo, memo, useCallback } from "react";

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
    
    // Redux mutation for updating active course
    const [selectActiveCourse, { isLoading: isUpdatingCourse }] = useSelectActiveCourseMutation();
    
    // Buscar progresso real para todos os cursos de uma vez (no componente pai)
    const courseProgressQueries = courses.map(course => 
        useGetCourseUnitsWithProgressQuery(course.id, {
            skip: !course.id,
            refetchOnMountOrArgChange: false,
            refetchOnReconnect: false,
        })
    );
    
    // Calcular progresso real para todos os cursos
    const coursesWithRealProgress = useMemo(() => {
        return courses.map((course, index) => {
            const progressQuery = courseProgressQueries[index];
            
            // Calcular progresso real se dados estão disponíveis
            let realProgressData = {
                realProgress: 0,
                completedLessons: 0,
                totalLessons: 0,
                completedUnits: 0,
                totalUnits: 0
            };
            
            if (progressQuery.data && progressQuery.data.units) {
                const units = progressQuery.data.units || [];
                
                const completedLessons = units.reduce((total: number, unit: any) => {
                    return total + (unit.lessons || []).filter((lesson: any) => lesson.completed).length;
                }, 0);
                
                const totalLessons = units.reduce((total: number, unit: any) => {
                    return total + (unit.lessons || []).length;
                }, 0);
                
                const completedUnits = units.filter((unit: any) => {
                    const unitLessons = unit.lessons || [];
                    return unitLessons.length > 0 && unitLessons.every((lesson: any) => lesson.completed);
                }).length;
                
                const totalUnits = units.length;
                
                const realProgress = totalLessons > 0 
                    ? Math.round((completedLessons / totalLessons) * 100) 
                    : 0;
                
                realProgressData = {
                    realProgress,
                    completedLessons,
                    totalLessons,
                    completedUnits,
                    totalUnits
                };
            }
            
            // Combine course data with real progress
            return {
                ...course,
                realProgressData
            };
        });
    }, [courses, courseProgressQueries]);

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

    // Memoize getCourseImage function to avoid recreating it
    const getCourseImageMemo = useCallback((course: Course) => {
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
    }, [categoryImages, defaultImages]);

    const onClick = useCallback((id: string) => {
        console.log('🔍 ONCLICK DEBUG: Function called with courseId:', id);
        console.log('🔍 ONCLICK DEBUG: updating course:', isUpdatingCourse);
        console.log('🔍 ONCLICK DEBUG: activeCourseId:', activeCourseId);
        console.log('🔍 ONCLICK DEBUG: is same course?', id === activeCourseId);
        
        if (isUpdatingCourse) {
            console.log('⏳ ONCLICK DEBUG: Blocked by updating state');
            return;
        }
        
        if (id === activeCourseId) {
            console.log('🏃 ONCLICK DEBUG: Same course, redirecting directly to learn page');
            return router.push("/user/laboratory/learn");
        }
        
        console.log('🚀 ONCLICK DEBUG: Using Redux mutation for course selection');
        selectActiveCourse(id)
            .unwrap()
            .then(() => {
                console.log('✅ ONCLICK DEBUG: Redux mutation successful, redirecting');
                router.push("/user/laboratory/learn");
            })
            .catch((error) => {
                console.error("❌ ONCLICK DEBUG: Redux mutation error:", error);
                toast.error("Erro ao selecionar curso");
            });
    }, [isUpdatingCourse, activeCourseId, router, selectActiveCourse]);

    // Componente que usa dados pré-calculados (sem hooks internos)
    const CourseCardWithProgress = memo(({ courseWithProgress }: { courseWithProgress: any }) => {
        const course = courseWithProgress;
        const realProgressData = course.realProgressData;
        
        // Use real progress data if available, fallback to API stats
        const stats = {
            totalUnits: realProgressData.totalUnits || (course as any).totalUnits || (course as any).units_count || (course.practice_units?.length || 0),
            totalLessons: realProgressData.totalLessons || (course as any).total_lessons || (course as any).lessons_count || 0,
            totalChallenges: (course as any).total_challenges || (course as any).challenges_count || 0,
            completedUnits: realProgressData.completedUnits || course.completed_units || 0,
            progress: realProgressData.realProgress || course.progress || 0
        };
        
        return (
            <LaboratoryCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                imageSrc={getCourseImageMemo(course)}
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
                disabled={isUpdatingCourse}
                active={course.id === activeCourseId}
                viewMode={viewMode}
            />
        );
    });
    
    // Add display name for debugging
    CourseCardWithProgress.displayName = 'CourseCardWithProgress';

    return (
        <div className={
            viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
                : "space-y-3 sm:space-y-4"
        }>
            {coursesWithRealProgress.map((courseWithProgress) => (
                <CourseCardWithProgress 
                    key={courseWithProgress.id}
                    courseWithProgress={courseWithProgress} 
                />
            ))}
        </div>
    )
}