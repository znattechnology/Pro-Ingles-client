"use client";


import CourseCard from "@/components/course/CourseCard";
import { useGetUserEnrolledCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";

import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import Loading from "@/components/course/Loading";

import Toolbar from "@/components/course/Toolbar";
import CourseBanner from "@/components/course/CourseBanner";
import { Button } from "@/components/ui/button";


const Courses = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: courses,
    isLoading,
    isError,
  } = useGetUserEnrolledCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
  });

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

  const handleGoToCourse = (course: Course) => {
    if (
      course.sections &&
      course.sections.length > 0 &&
      course.sections[0].chapters.length > 0
    ) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(
        `/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`,
        {
          scroll: false,
        }
      );
    } else {
      router.push(`/user/courses/${course.courseId}`, {
        scroll: false,
      });
    }
  };

  const handleCreateCourse = async () => {
   
    router.push("/search")
      
   
  };

  if (!isLoaded || isLoading) return <Loading />;
  if (!user) return <div>Faça login para visualizar os seus cursos.</div>;
  if (isError || !courses || courses.length === 0)
    return <div>Ainda não está matriculado em nenhum curso.</div>;

  return (
    <div className="w-full h-full text-white  ">
      
      <div className="mt-4">
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <CourseBanner title="Cursos" subtitle="Navegue pelos seus cursos"  rightElement={
          <Button
            onClick={handleCreateCourse}
            className="bg-violet-800 hover:bg-violet-900"
          >
            Outros cursos
          </Button>
      }/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-7 mt-6 w-ful">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
            onGoToCourse={handleGoToCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
