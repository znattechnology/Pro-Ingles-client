"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import CourseWizard from "@/components/laboratory/CourseWizard";
import { createPracticeCourse } from "@/actions/practice-management";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Brain } from "lucide-react";

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
        level: courseData.level,
        template: courseData.template?.id || 'general'
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
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-violet-200/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white"
            >
              Criando seu curso...
            </motion.h3>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400"
            >
              Configurando estrutura e conteúdo
            </motion.p>
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center space-x-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-violet-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-8"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="ghost"
                onClick={handleBack}
                className="text-gray-400 hover:text-white hover:bg-violet-600/20 transition-all"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Voltar ao Laboratório
              </Button>
            </motion.div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-6 py-2 mb-6"
            >
              <Brain className="w-5 h-5 text-violet-400" />
              <span className="text-violet-300 font-medium">Wizard de Criação</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Criar <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Novo Curso</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Transforme seu conhecimento em uma experiência de aprendizado interativa e envolvente
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Course Wizard */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="px-6 pb-12"
      >
        <CourseWizard onComplete={handleCourseCreation} />
      </motion.div>
    </div>
  );
};

export default CreateCoursePage;