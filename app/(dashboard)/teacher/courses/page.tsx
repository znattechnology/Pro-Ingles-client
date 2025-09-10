"use client";


import Loading from "@/components/course/Loading";
import TeacherCourseCard from "@/components/course/TeacherCourseCard";
import Toolbar from "@/components/course/Toolbar";
import { Button } from "@/components/ui/button";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetAllCoursesQuery,
} from "@/redux/features/courses/coursesApi";
import { Course } from "@/redux/features/courses/coursesApi";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import CourseBanner from "@/components/course/CourseBanner";

const Courses = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useDjangoAuth();
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetAllCoursesQuery({ category: "all" });

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Debug logs
  console.log('Teacher Courses Page - User:', user);
  console.log('Teacher Courses Page - isAuthenticated:', isAuthenticated);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.id}`, {
      scroll: false,
    });
  };

  const handleDelete = async (course: Course) => {
    if (window.confirm("Tem a certeza de que pretende eliminar este curso?")) {
      await deleteCourse(course.id).unwrap();
    }
  };

  const handleCreateCourse = async () => {
    alert('Botão clicado! Verificando usuário...');
    console.log('handleCreateCourse called');
    console.log('User:', user);
    
    if (!user) {
      console.log('No user found, cannot create course');
      alert('Usuário não encontrado. Por favor, faça login novamente.');
      return;
    }

    try {
      console.log('Creating course with data:', {});
      
      const result = await createCourse({}).unwrap();
      
      console.log('Course created successfully:', result);
      console.log('Result ID:', result.id);
      console.log('Result courseId:', result.courseId);
      
      // Usar courseId ou id, dependendo do que estiver disponível
      const courseId = result.id || result.courseId;
      if (courseId) {
        router.push(`/teacher/courses/${courseId}`, {
          scroll: false,
        });
      } else {
        alert('Curso criado com sucesso! Redirecionando para a lista de cursos...');
        window.location.reload(); // Recarregar para ver o novo curso na lista
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Erro ao criar curso: ' + JSON.stringify(error));
    }
  };

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Erro ao carregar cursos.</div>;

  return (
    <div className="w-full h-full">
          <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
     
       <CourseBanner title="Cursos" subtitle="Navegue pelos seus cursos"  rightElement={
          <Button
            onClick={handleCreateCourse}
            className="bg-violet-800 hover:bg-violet-900 cursor-pointer z-10"
            type="button"
          >
            Criar curso
          </Button>
        }/>
      
     
  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-6 w-full">
        {filteredCourses.map((course) => (
          <TeacherCourseCard
            key={course.id}
            course={course}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner={course.teacherId === user?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
