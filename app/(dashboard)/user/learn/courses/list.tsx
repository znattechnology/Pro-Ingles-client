"use client";

import { Card } from "./card";
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
}

type Props = {
    courses: Course[];
    activeCourseId?: string;
};

export const List = ({courses, activeCourseId}: Props) => {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const onClick = (id: string) => {
        if (pending) return;
        if (id === activeCourseId) {
            return router.push("/user/learn");
        }
        startTransition(async () => {
            try {
                await upsertUserProgress(id);
                router.push("/user/learn");
            } catch (error) {
                console.error("Error selecting course:", error);
                toast.error("Alguma coisa não correu bem");
            }
        });
    }
    return (
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
         {courses.map((course) =>(
            <Card
            key={course.id}
            id={course.id}
            title={course.title}
            imageSrc={course.image || '/laboratory/challenges/english-1.jpg'}
            onClick={onClick}
            disabled={pending}
            active={course.id === activeCourseId}
            />
         ))}
        </div>
    )
}