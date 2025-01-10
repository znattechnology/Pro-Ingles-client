import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const CourseCardSearch = ({
  course,
  isSelected,
  onClick,
}: SearchCourseCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/30 overflow-hidden rounded-lg hover:bg-white-100/10 transition duration-200 flex flex-col cursor-pointer border h-full group ${
        isSelected
          ? "border-violet-800"
          : "border-transparent"
      }`}
    >
      <div className="relative w-auto pt-[56.25%]">
        <Image
          src={course.image || "/placeholder.png"}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform"
          priority
        />
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h2 className="font-semibold line-clamp-1 text-white">{course.title}</h2>
          <p className="text-sm mt-1 line-clamp-2 text-white/70">
            {course.description}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-customgreys-dirtyGrey text-smr text-white/70">Por {course.teacherName}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-white font-semibold">
              {formatPrice(course.price)}
            </span>
            <span className="text-white/70 text-sm">
              {course.enrollments?.length} Inscrito
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSearch;
