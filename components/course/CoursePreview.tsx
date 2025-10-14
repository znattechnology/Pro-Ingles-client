import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import AccordionSections from "./AccordionSections";

const CoursePreview = ({ course }: CoursePreviewProps) => {
  const price = formatPrice(course.price);
  return (
    <div className="space-y-10">
      <div className="w-full bg-slate-900/30 py-8 px-10 flex flex-col gap-5 rounded-lg">
        <div className="mb-2 bg-white-50">
          <Image
            src={course.image || "/placeholder.png"}
            alt="Course Preview"
            width={640}
            height={360}
            className="w-full"
          />
        </div>
        <div>
          <h2 className="text-white-50 text-3xl font-bold mb-2 text-white">{course.title}</h2>
          <p className="text-white/70 text-md mb-4">Por {course.teacherName}</p>
          <p className="text-sm text-white/70">
            {course.description}
          </p>
        </div>

        <div>
          <h4 className="text-white-50/90 font-semibold mb-2">
          Conteúdo do curso
          </h4>
          <AccordionSections sections={course.sections} />
        </div>
      </div>

      <div className="w-full bg-slate-900/30 py-8 px-10 flex flex-col gap-5 rounded-lg">
        <h3 className="text-xl mb-4 text-white">Detalhes do preço (1 item)</h3>
        <div className="flex justify-between mb-4 text-customgreys-dirtyGrey text-base">
          <span className="font-bold text-white/70">1x {course.title}</span>
          <span className="font-bold text-white/70">{price}</span>
        </div>
        <div className="flex justify-between border-t border-customgreys-dirtyGrey pt-4">
          <span className="font-bold text-lg text-white/70">Montante total</span>
          <span className="font-bold text-lg text-white/70">{price}</span>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
