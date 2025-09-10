"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import CourseBanner from "@/components/course/CourseBanner";
import CourseWizard from "@/components/laboratory/CourseWizard";
import { createPracticeCourse } from "@/actions/practice-management";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CreateCoursePage = () => {
  const router = useRouter();
  const { isAuthenticated } = useDjangoAuth();
  const [isCreating, setIsCreating] = useState(false);

  const handleCourseCreation = async (courseData: any) => {
    try {
      setIsCreating(true);
      
      console.log('Creating course with data:', courseData);
      
      // Prepare data for API
      const apiData = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level
      };

      console.log('API Data:', apiData);
      
      const createdCourse = await createPracticeCourse(apiData);
      
      console.log('Course created:', createdCourse);
      
      // Show success message
      alert(`Curso "${courseData.title}" criado com sucesso!`);
      
      // Redirect to course management page
      router.push('/teacher/laboratory/manage-courses');
      
    } catch (error) {
      console.error('Error creating course:', error);
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao criar curso: ${errorMessage}`);
      
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.push('/teacher/laboratory');
  };

  if (!isAuthenticated) {
    return <Loading />;
  }

  if (isCreating) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto"></div>
          <div>
            <h3 className="text-lg font-semibold text-white">Criando seu curso...</h3>
            <p className="text-gray-300">Isso pode levar alguns segundos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-6">
      <CourseBanner 
        title="Criar Novo Curso" 
        subtitle="Use nosso wizard inteligente para criar um curso completo passo a passo"
        rightElement={
          <Button 
            variant="outline"
            onClick={handleBack}
            className="border-customgreys-darkerGrey bg-customgreys-darkGrey text-gray-300 hover:bg-violet-600/10 hover:border-violet-500 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar ao Laboratório
          </Button>
        }
      />

      <CourseWizard onComplete={handleCourseCreation} />
    </div>
  );
};

export default CreateCoursePage;