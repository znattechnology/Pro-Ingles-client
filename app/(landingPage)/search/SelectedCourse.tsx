import AccordionSections from "@/components/course/AccordionSections";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import React from "react";

const SelectedCourse = ({ course, handleEnrollNow }: SelectedCourseProps) => {
  return (
    <div className="overflow-hidden py-9 px-9">
      <div>
        <h3 className="text-white-50 font-semibold text-3xl text-white">{course.title}</h3>
        <p className="text-gray-400 text-sm pt-3">
          Por {course.teacherName} |{" "}
          <span className="font-bold text-white/70">
            {course?.enrollments?.length}
          </span>
        </p>
      </div>

      <div className="mt-5">
        <p className="text-white/70 mb-4">{course.description}</p>

        <div className="mt-6">
          <h4 className="text-white-50/90 font-semibold mb-2">Conteúdo do curso</h4>
          <AccordionSections sections={course.sections} />
        </div>

        <div className="flex justify-between items-center mt-5">
          <span className="text-white font-semibold text-2xl">
            {formatPrice(course.price)}
          </span>
          <Button
            onClick={() => handleEnrollNow(course.courseId)}
            className="bg-violet-800 hover:bg-violet-700"
          >
           Inscreva-se já
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectedCourse;
