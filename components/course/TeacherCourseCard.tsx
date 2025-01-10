import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const TeacherCourseCard = ({
  course,
  onEdit,
  onDelete,
  isOwner,
}: TeacherCourseCardProps) => {
  return (
    <Card className="w-full h-[400px] p-0 bg-background border-none text-foreground bg-customgreys-primarybg overflow-hidden hover:bg-white-100/10 transition duration-200 flex flex-col group">
      <CardHeader className="p-0 h-[400px] overflow-hidden">
        <Image
          src={course.image || "/placeholder.png"}
          alt={course.title}
          width={370}
          height={150}
          className="rounded-t-lg w-[100%] h-[100%] object-cover transition-transform"
          priority
        />
      </CardHeader>

      <CardContent className="w-full pb-6 pt-4 flex-grow flex flex-col justify-between text-gray-400">
        <div className="flex flex-col">
          <CardTitle className="text-primary-50 text-md md:text-lg line-clamp-2 overflow-hidden">
            {course.title}
          </CardTitle>

          <CardDescription className="bg-customgreys-dirtyGrey/50 px-2 py-1 mt-3 mb-3 rounded-xl w-fit text-sm text-white">
            {course.category}
          </CardDescription>

          <p className="text-sm mb-2">
            Estado:{" "}
            <span
              className={cn(
                "font-semibold px-1 py-1 rounded",
                course.status === "Published"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {course.status === "Published" ? "Publicado" : "Não publicado"}
            </span>
          </p>
          {course.enrollments && (
            <p className="ml-1 mt-1 inline-block text-secondary bg-secondary/10 rounded-md text-sm px-2 font-normal">
              <span className="font-bold text-white-100">
                {course.enrollments.length}
              </span>{" "}
              Alunos{course.enrollments.length > 1 ? "s" : ""} inscrítos
            </p>
          )}
        </div>

        <div className="w-full xl:flex space-y-2 xl:space-y-0 gap-2 mt-3">
          {isOwner ? (
            <>
              <div>
                <Button
                  className="rounded w-full bg-violet-800 border-none hover:bg-violet-900 hover:text-customgreys-primarybg text-white-100 cursor-pointer text-white"
                  onClick={() => onEdit(course)}
                >
                  <Pencil className="w-4 h-4 mr-2 text-white" />
                  Editar
                </Button>
              </div>
              <div>
                <Button
                  className="rounded w-full bg-red-600 text-white-100 hover:bg-red-400 hover:text-customgreys-primarybg cursor-pointer text-white"
                  onClick={() => onDelete(course)}
                >
                  <Trash2 className="w-4 h-4 mr-2 text-white" />
                  Deletar
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Apenas de leitura</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCard;
