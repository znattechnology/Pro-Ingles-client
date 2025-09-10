"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateUserProgressMutation } from "@/redux/features/api/practiceApiSlice";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
};

export const LaboratoryHeader = ({ title }: Props) => {
  const router = useRouter();
  const [updateUserProgress] = useUpdateUserProgressMutation();

  const handleBackToCourses = async () => {
    try {
      // Clear active course when going back to course selection
      await updateUserProgress({ active_course: null }).unwrap();
      router.push("/user/laboratory/courses");
    } catch (error) {
      console.error("Failed to clear active course:", error);
      // Fallback - just navigate
      router.push("/user/laboratory/courses");
    }
  };

  return (
    <div className="sticky top-0 bg-white pb-3 lg:pt-[28px] lg:mt-[-28px] flex items-center justify-between border-b-2 mb-5 text-neutral-400 lg:z-50">
      <Button 
        variant="ghost" 
        size="sm"
        className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
        title="Voltar aos cursos"
        onClick={handleBackToCourses}
      >
        <ArrowLeft className="h-4 w-4 stroke-2" />
        <span className="ml-2 text-sm">Cursos</span>
      </Button>
      <h1 className="font-bold text-lg text-neutral-400">{title}</h1>
      <div />
    </div>
  );
};