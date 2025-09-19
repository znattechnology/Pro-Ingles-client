import CourseListeningPracticeHub from "@/components/listening/CourseListeningPracticeHub";

interface CourseSpecListeningPageProps {
  params: {
    courseId: string;
  };
}

export default function CourseSpecListeningPage({ params }: CourseSpecListeningPageProps) {
  return <CourseListeningPracticeHub courseId={params.courseId} />;
}