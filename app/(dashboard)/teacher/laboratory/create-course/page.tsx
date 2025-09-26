"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import CourseWizard from "@/components/laboratory/CourseWizard";
import { useCreatePracticeCourseMutation } from "@modules/teacher";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Brain } from "lucide-react";
import { courseToasts } from "@/components/ui/enhanced-toast";
import "@/utils/testCourseCreation"; // Load test utilities
import "@/utils/testApiDirect"; // Load direct API test utilities

const CreateCoursePage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useDjangoAuth();
  const [isCreating, setIsCreating] = useState(false);
  
  // Use Redux mutation hook
  const [createCourse] = useCreatePracticeCourseMutation();

  const handleCourseCreation = async (courseData: any) => {
    try {
      setIsCreating(true);
      
      // CRITICAL CHECK: Ensure user data is available  
      if (!user?.id) {
        console.error('❌ USER DATA NOT AVAILABLE:', user);
        courseToasts.error("criar curso", "Informações do professor não encontradas. Faça login novamente.");
        setIsCreating(false);
        return;
      }
      
      console.log('🎓 Creating course with complete data...');
      console.log('📝 Form Data from Wizard:', courseData);
      console.log('👨‍🏫 Available User Data:', user);
      
      // Prepare COMPLETE data for API - MERGE wizard data with teacher info
      const apiData = {
        // FROM WIZARD
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        template: courseData.template?.id || 'general',
        // LEARNING CONFIG FROM WIZARD
        learningObjectives: courseData.learningObjectives,
        targetAudience: courseData.targetAudience,
        hearts: courseData.hearts,
        pointsPerChallenge: courseData.pointsPerChallenge,
        passingScore: courseData.passingScore,
        // TEACHER INFORMATION - CRITICAL!
        teacher_id: user.id,
        teacher_email: user.email,
        teacher_name: user.name || user.email,
        // COURSE METADATA - EXPLICIT
        course_type: 'practice',
        status: 'draft',
        // ADDITIONAL METADATA
        created_by: user.id,
        language: 'pt-BR',
        difficulty_level: courseData.level,
      };

      console.log('🔍 DEEP INVESTIGATION - User Object:', user);
      console.log('🔍 DEEP INVESTIGATION - User Available?:', !!user);
      console.log('🔍 DEEP INVESTIGATION - User ID:', user?.id);
      console.log('🔍 DEEP INVESTIGATION - User Email:', user?.email);
      
      console.log('👨‍🏫 Teacher Info Built:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasAllFields: !!(user.id && user.email)
      });
      
      console.log('📡 BEFORE API CALL - Complete Data Being Sent:', apiData);
      console.log('📡 BEFORE API CALL - Data Keys:', Object.keys(apiData));
      console.log('📡 BEFORE API CALL - Teacher Fields Check:', {
        teacher_id: apiData.teacher_id,
        teacher_email: apiData.teacher_email,
        teacher_name: apiData.teacher_name,
        course_type: apiData.course_type,
        status: apiData.status
      });
      
      const createdCourse = await createCourse(apiData).unwrap();
      
      console.log('Course created:', createdCourse);
      
      // Show enhanced success toast
      courseToasts.created(courseData.title);
      
      // Wait a bit for the toast to show, then redirect with refresh
      setTimeout(() => {
        // Use replace to avoid back button issues and add a refresh param
        router.replace('/teacher/laboratory/manage-courses?refresh=true');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating course:', error);
      
      // Show enhanced error toast
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      courseToasts.error("criar curso", errorMessage);
      
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.push('/teacher/laboratory');
  };

  // Enhanced loading checks
  if (!isAuthenticated) {
    console.log('🔐 Not authenticated, showing loading...');
    return <Loading />;
  }
  
  if (!user) {
    console.log('👤 User data not loaded yet, showing loading...');
    return <Loading />;
  }
  
  console.log('✅ User data available for course creation:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

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