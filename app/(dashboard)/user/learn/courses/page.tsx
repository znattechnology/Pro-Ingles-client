"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LearnCoursesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the existing courses explore page
    router.replace("/user/courses/explore");
  }, [router]);

  return (
    <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
        <p className="text-white">Redirecionando para cursos...</p>
      </div>
    </div>
  );
}