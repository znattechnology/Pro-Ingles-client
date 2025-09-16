"use client";

import { CustomFormField } from "@/components/course/CustomFormField";
import Header from "@/components/course/Header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { courseSchema } from "@/lib/schemas";
import {
  createCourseFormData,
  uploadAllVideos,
  uploadCourseImage,
} from "@/lib/utils";
import { openSectionModal, setSections } from "@/state";
import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useGetUploadVideoUrlMutation,
} from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DroppableComponent from "./Droppable";
import ChapterModal from "./ChapterModal";
import SectionModal from "./SectionModal";

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  const [getUploadVideoUrl] = useGetUploadVideoUrlMutation();

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);
  
  // State for image preview
  const [currentImage, setCurrentImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      courseStatus: false,
      courseImage: "",
    },
  });

  useEffect(() => {
    if (course) {
      methods.reset({
        courseTitle: course.title,
        courseDescription: course.description,
        courseCategory: course.category,
        courseStatus: course.status === "Published",
        courseImage: course.image || "",
      });
      dispatch(setSections(course.sections || []));
      setCurrentImage(course.image || "");
    }
  }, [course, methods]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: CourseFormData) => {
    try {
      const updatedSections = await uploadAllVideos(
        sections,
        id,
        getUploadVideoUrl
      );

      const formData = createCourseFormData(data, updatedSections);

      await updateCourse({
        courseId: id,
        formData,
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Enhanced Header Section */}
      <div className="relative bg-gradient-to-br from-customgreys-secondarybg via-customgreys-primarybg to-customgreys-secondarybg border-b border-violet-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                onClick={() => router.push("/teacher/courses", { scroll: false })}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Voltar aos cursos</span>
              </button>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <div className="text-white/70">
                <span className="text-sm font-medium">Editor de Curso</span>
              </div>
            </div>
            
            {/* Course Status Indicator */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-sm">
                <span className="text-emerald-300 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  Sistema Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {/* Modern Header Card */}
            <div className="bg-customgreys-primarybg/40 backdrop-blur-sm rounded-lg border border-violet-900/30 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                    Configuração do Curso
                  </h1>
                  <p className="text-lg text-white/70 font-medium">
                    Configure todos os detalhes e publique seu curso com excelência
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Status Toggle */}
                  <div className="flex items-center gap-4 px-6 py-4 bg-customgreys-darkGrey/50 backdrop-blur-sm border border-violet-900/30 rounded-lg">
                    <CustomFormField
                      name="courseStatus"
                      label={methods.watch("courseStatus") ? "🟢 Publicado" : "🟡 Rascunho"}
                      type="switch"
                      className="flex items-center space-x-3"
                      labelClassName={`text-base font-semibold transition-colors duration-300 ${
                        methods.watch("courseStatus")
                          ? "text-emerald-300"
                          : "text-amber-300"
                      }`}
                      inputClassName="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-customgreys-darkGrey border-2 data-[state=checked]:border-emerald-400 data-[state=unchecked]:border-violet-900"
                    />
                  </div>
                  
                  {/* Save Button */}
                  <Button
                    type="submit"
                    className="group px-8 py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-500 hover:via-violet-500 hover:to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 border border-purple-400/20"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>
                        {methods.watch("courseStatus")
                          ? "✨ Atualizar Curso Publicado"
                          : "💾 Guardar Rascunho"}
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Modern Two-Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Course Details Panel */}
              <div className="bg-customgreys-secondarybg border-customgreys-darkerGrey rounded-lg p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Detalhes do Curso</h3>
                    <p className="text-white/60 font-medium">Configure as informações principais</p>
                  </div>
                </div>
                
                <div className="space-y-6 text-white">
                  <div className="space-y-3">
                    <label className="text-white text-base font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Título do curso
                    </label>
                    <CustomFormField
                      name="courseTitle"
                      label=""
                      type="text"
                      placeholder="Ex: Curso Completo de JavaScript Moderno"
                      className="bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md"
                      initialValue={course?.title}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-white text-base font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      Descrição do curso
                    </label>
                    <CustomFormField
                      name="courseDescription"
                      label=""
                      type="textarea"
                      placeholder="Descreva o que os alunos vão aprender neste curso incrível..."
                      className="bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md min-h-[120px] resize-none"
                      initialValue={course?.description}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-white text-base font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      Categoria do curso
                    </label>
                    <CustomFormField
                      name="courseCategory"
                      label=""
                      type="select"
                      className="bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md"
                      placeholder="🎯 Selecione a categoria"
                      options={[
                        { value: "petroleo-gas", label: "🛢️ Inglês para Petróleo & Gás" },
                        { value: "bancario", label: "🏦 Inglês Bancário" },
                        { value: "ti-telecomunicacoes", label: "💻 Inglês para TI & Telecomunicações" },
                        { value: "executivo", label: "👔 Inglês Executivo" },
                        { value: "ai-personal-tutor", label: "🤖 Inglês com IA Personal Tutor" },
                      ]}
                      initialValue={course?.category}
                    />
                  </div>


                  {/* Image Upload Field */}
                  <div className="space-y-4">
                    <label className="text-white text-base font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                      Imagem do curso
                    </label>
                    
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && course?.courseId) {
                            setUploadingImage(true);
                            try {
                              const imageUrl = await uploadCourseImage(course.courseId, file);
                              setCurrentImage(imageUrl);
                              refetch();
                            } catch (error) {
                              console.error("Upload failed:", error);
                            } finally {
                              setUploadingImage(false);
                            }
                          }
                        }}
                        className="block w-full text-sm text-gray-300
                          file:mr-4 file:py-3 file:px-6
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-violet-600 file:text-white hover:file:bg-violet-700
                          file:cursor-pointer cursor-pointer file:transition-all file:duration-200
                          border border-violet-900/30 rounded-md bg-customgreys-darkGrey/50
                          hover:border-violet-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                      />
                      
                      {uploadingImage && (
                        <div className="mt-4 p-4 bg-violet-900/20 border border-violet-600/30 rounded-lg">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="w-6 h-6 border-3 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-violet-300 font-semibold">✨ Fazendo upload da imagem...</span>
                          </div>
                          <div className="mt-3 w-full bg-violet-900/30 rounded-full h-2">
                            <div className="bg-violet-400 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                          </div>
                        </div>
                      )}

                      {currentImage && !uploadingImage && (
                        <div className="mt-4 p-4 bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img
                              src={currentImage}
                              alt="Course preview"
                              className="w-20 h-20 object-cover rounded-lg border-2 border-violet-400/50 shadow-lg"
                            />
                            <div className="flex-1">
                              <p className="text-white font-semibold mb-1">🖼️ Imagem do curso</p>
                              <p className="text-gray-400 text-sm">Imagem carregada com sucesso!</p>
                            </div>
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Sections Panel */}
              <div className="bg-customgreys-secondarybg border-customgreys-darkerGrey rounded-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Seções do Curso</h3>
                      <p className="text-white/60 font-medium">Organize o conteúdo em módulos</p>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={() => dispatch(openSectionModal({ sectionIndex: null }))}
                    className="group px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-violet-500/30 transform hover:scale-105 transition-all duration-300 border border-violet-400/20"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Nova Seção</span>
                    </div>
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white/70 font-medium">✨ Carregando o conteúdo do curso...</p>
                  </div>
                ) : sections.length > 0 ? (
                  <DroppableComponent />
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                      <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h4 className="text-white font-bold text-xl mb-2">🎯 Nenhuma seção criada ainda</h4>
                    <p className="text-white/60 mb-8 max-w-md mx-auto">Comece organizando seu curso em seções para uma melhor experiência de aprendizado</p>
                    <Button
                      type="button"
                      onClick={() => dispatch(openSectionModal({ sectionIndex: null }))}
                      className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-violet-500/30 transform hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        <span>🚀 Criar primeira seção</span>
                      </div>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>

        <ChapterModal />
        <SectionModal />
      </div>
    </div>
  );
};

export default CourseEditor;
