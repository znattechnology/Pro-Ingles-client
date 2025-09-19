import CourseSpeakingPracticeHub from "@/components/speaking/CourseSpeakingPracticeHub";

interface CourseSpecSpeakingPageProps {
  params: {
    courseId: string;
  };
}

export default function CourseSpecSpeakingPage({ params }: CourseSpecSpeakingPageProps) {
  return <CourseSpeakingPracticeHub courseId={params.courseId} />;
}