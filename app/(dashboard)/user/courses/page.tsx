"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CoursesRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new learning area
    router.replace("/user/learn");
  }, [router]);

  return (
    <div className="w-full h-full bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto"></div>
        <p className="mt-4 text-gray-400">Redirecionando para área de aprendizagem...</p>
      </div>
    </div>
  );
};

export default CoursesRedirect;