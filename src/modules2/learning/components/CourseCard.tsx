import Image from "next/image";
import { Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  id: string;
  imageSrc?: string;
  description?: string;
  category?: string;
  level?: string;
  onClick: (id: string) => void;
  disabled?: boolean;
  active?: boolean;
};

export const CourseCard = ({
  title,
  id,
  imageSrc,
  description,
  category,
  level,
  onClick,
  disabled,
  active
}: Props) => {
  return (
    <div 
      onClick={() => onClick(id)}
      className={cn(
        "h-full border-2 rounded-xl border-b-4 hover:bg-gray-50 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-4 pb-6 min-h-[280px] transition-all duration-200",
        "border-gray-200 hover:border-indigo-300",
        disabled && "pointer-events-none opacity-50",
        active && "border-green-400 bg-green-50 hover:bg-green-100"
      )}
    >
      {/* Active indicator */}
      <div className="min-h-[24px] w-full flex items-center justify-end">
        {active && (
          <div className="rounded-md bg-green-600 flex items-center justify-center p-1.5">
            <Check className="text-white stroke-[4] h-4 w-4" />
          </div>
        )}
      </div>

      {/* Course image */}
      <div className="relative w-20 h-20 mb-3">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="rounded-lg drop-shadow-md border object-cover"
          />
        ) : (
          <div className="w-full h-full bg-indigo-100 rounded-lg flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-indigo-600" />
          </div>
        )}
      </div>

      {/* Course info */}
      <div className="text-center space-y-2 flex-1 flex flex-col justify-center">
        <h3 className="font-bold text-gray-800 text-lg leading-tight">
          {title}
        </h3>
        
        {description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>
        )}

        {/* Level and category badges */}
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {level && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {level}
            </span>
          )}
          {category && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Action indicator */}
      <div className="mt-3 text-center">
        {active ? (
          <span className="text-green-600 font-medium text-sm">Continue Practice</span>
        ) : (
          <span className="text-indigo-600 font-medium text-sm">Start Learning</span>
        )}
      </div>
    </div>
  );
};