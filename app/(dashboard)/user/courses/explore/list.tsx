"use client";

import { Card } from "./card";
import { useRouter } from "next/navigation";

// Define types for Django API responses
interface Course {
    id: string;
    title: string;
    description?: string;
    image?: string;
    category?: string;
    level?: string;
    template?: string;
}

type Props = {
    courses: Course[];
    activeCourseId?: string;
    viewMode?: 'grid' | 'list';
};

export const List = ({courses, activeCourseId, viewMode = 'grid'}: Props) => {
    const router = useRouter();

    const onClick = (id: string) => {
        // Navigate to course details page
        router.push(`/user/courses/${id}`);
    }
    return (
        <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
        }>
         {courses.map((course) =>(
            <Card
            key={course.id}
            id={course.id}
            title={course.title}
            imageSrc={course.image || '/laboratory/challenges/english-1.jpg'}
            template={course.template || 'general'}
            description={course.description}
            category={course.category}
            level={course.level}
            onClick={onClick}
            disabled={false}
            active={course.id === activeCourseId}
            viewMode={viewMode}
            />
         ))}
        </div>
    )
}