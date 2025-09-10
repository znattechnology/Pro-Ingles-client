"use client";

import { CustomFormField } from "@/components/course/CustomFormField";
import Header from "@/components/course/Header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { courseSchema } from "@/lib/schemas";
import {
  centsToDollars,
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
      coursePrice: "0",
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
        coursePrice: centsToDollars(course.price),
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
    <div>
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-violet-900 rounded-lg p-2 gap-2 cursor-pointer hover:bg-violet-800 hover:text-white-100 text-white"
          onClick={() => router.push("/teacher/courses", { scroll: false })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos cursos</span>
        </button>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Header
            title="Configuração do curso"
            subtitle="Preencha todos os campos e guarde o seu curso"
            rightElement={
              <div className="flex items-center space-x-4">
                <CustomFormField
                  name="courseStatus"
                  label={methods.watch("courseStatus") ? "Publicado" : "Não Publicado"}
                  type="switch"
                  className="flex items-center space-x-2"
                  labelClassName={`text-sm font-medium ${
                    methods.watch("courseStatus")
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                  inputClassName="data-[state=checked]:bg-green-500"
                />
                <Button
                  type="submit"
                  className="bg-violet-800 hover:bg-violet-900"
                >
                  {methods.watch("courseStatus")
                    ? "Atualizar curso publicado"
                    : "Guardar rascunho"}
                </Button>
              </div>
            }
          />

          <div className="flex justify-between md:flex-row flex-col gap-10 mt-5 font-dm-sans">
            <div className="basis-1/2">
              <div className="space-y-4 text-white">
                <CustomFormField
                  name="courseTitle"
                  label="Título do curso"
                  type="text"
                  placeholder="Escreva aqui o título do curso"
                  className="border-none"
                  initialValue={course?.title}
                />

                <CustomFormField
                  name="courseDescription"
                  label="Descrição do curso"
                  type="textarea"
                  placeholder="Escreva aqui a descrição do curso"
                  initialValue={course?.description}
                />

                <CustomFormField
                  name="courseCategory"
                  label="Categoria do curso"
                  type="select"
                  className="text-white"
                  placeholder="Selecione aqui a categoria"
                  options={[
                    { value: "technology", label: "Technology" },
                    { value: "science", label: "Science" },
                    { value: "mathematics", label: "Mathematics" },
                    {
                      value: "Artificial Intelligence",
                      label: "Artificial Intelligence",
                    },
                  ]}
                  initialValue={course?.category}
                />

                <CustomFormField
                  name="coursePrice"
                  label="Preço do curso"
                  type="number"
                  placeholder="0"
                  initialValue={course?.price}
                />

                {/* Image Upload Field */}
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Imagem do curso
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && course?.courseId) {
                        setUploadingImage(true);
                        try {
                          const imageUrl = await uploadCourseImage(course.courseId, file);
                          // Update local state immediately for preview
                          setCurrentImage(imageUrl);
                          // Trigger refetch to update the course data with new image
                          refetch();
                        } catch (error) {
                          console.error("Upload failed:", error);
                        } finally {
                          setUploadingImage(false);
                        }
                      }
                    }}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-violet-600 file:text-white
                      hover:file:bg-violet-700
                      file:cursor-pointer cursor-pointer
                      border border-gray-600 rounded-md bg-customgreys-darkGrey"
                  />
                  
                  {uploadingImage && (
                    <div className="mt-2 text-center">
                      <div className="inline-flex items-center px-4 py-2 text-sm text-gray-400">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Fazendo upload da imagem...
                      </div>
                    </div>
                  )}

                  {currentImage && (
                    <div className="mt-2">
                      <img
                        src={currentImage}
                        alt="Course preview"
                        className="w-32 h-20 object-cover rounded-md border border-gray-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">Imagem atual do curso</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-customgreys-darkGrey mt-4 md:mt-0 p-4 rounded-lg basis-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-white">
                Seções
                </h2>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    dispatch(openSectionModal({ sectionIndex: null }))
                  }
                  className="border-none text-violet-800 group"
                >
                  <Plus className="mr-1 h-4 w-4 text-violet-800 group-hover:white-100" />
                  <span className="text-violet-800 group-hover:white-100">
                  Adicionar secção
                  </span>
                </Button>
              </div>

              {isLoading ? (
                <p>Carregando o conteúdo do curso...</p>
              ) : sections.length > 0 ? (
                <DroppableComponent />
              ) : (
                <p className="text-white/70">Nenhuma secção disponívele</p>
              )}
            </div>
          </div>
        </form>
      </Form>

      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;
