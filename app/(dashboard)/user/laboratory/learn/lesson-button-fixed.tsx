"use client";
import Link from "next/link";
import { Crown, Star, CheckIcon } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
  isCompleted?: boolean;
  onClick?: () => void;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
  isCompleted,
  onClick,
}: Props) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;
  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }
  const rigthPosition = indentationLevel * 40;

  const isFirst = index === 0;
  const isLast = index === totalCount;
  // Use prop for isCompleted if provided, otherwise use old logic as fallback
  const completedState = isCompleted !== undefined ? isCompleted : (!current && !locked);

  const Icon = completedState ? CheckIcon : isLast ? Crown : Star;

  const href = `/user/laboratory/lesson/${id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (locked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Call custom onClick if provided (for Redux mode)
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link href={href} aria-disabled={locked} style={{pointerEvents:locked ? "none" : "auto"}} onClick={handleClick}>
        <div className="relative" style={ {
            right:`${rigthPosition}px`,
            marginTop: isFirst && !completedState ? 60 : 24,
        }}>

            {current ? (
                <div className="h-[102px] w-[102px] relative">
                   <div className="absolute -top-6 left-2.5 px-3 py-2.5 border-2 font-bold
                   uppercase text-white bg-violet-600 border-violet-800 rounded-xl animate-bounce -tracking-wide z-10
                   
                   ">
                    start 
                    <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-violet-600 transform -translate-x-1/2"/>
                   </div>
                   <CircularProgressbarWithChildren
                   value={Number.isNaN(percentage) ? 0 : percentage}
                   styles={{
                    path:{
                        stroke:"#2ECC71",
                        strokeWidth:6
                    },
                    trail:{
                        stroke:"#CACFD2",
                        strokeWidth:6,
                        
                    },
                    
                   }}
                   >
                    <div 
                      className="h-[50px] w-[50px] border-b-8 rounded-full flex items-center justify-center cursor-pointer"
                      style={{
                        background: locked ? '#64748b' : completedState ? '#10b981' : '#8b5cf6',
                        borderColor: locked ? '#475569' : completedState ? '#059669' : '#7c3aed'
                      }}
                    >
                        <Icon className={cn(
                            "h-6 w-6", locked ? 
                            "fill-neutral-400 text-neutral-400 stroke-neutral-400" : "fill-white text-white",
                            completedState && "fill-white stroke-[4] text-white"
                        )}/>
                    </div>

                   </CircularProgressbarWithChildren>
                </div>
            ):
            (
              <div 
                className="h-[50px] w-[50px] border-b-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{
                  background: locked ? '#64748b' : completedState ? '#10b981' : '#8b5cf6',
                  borderColor: locked ? '#475569' : completedState ? '#059669' : '#7c3aed'
                }}
              >
              <Icon className={cn(
                  "h-6 w-6", locked ? 
                  "fill-neutral-400 text-neutral-400 stroke-neutral-400" : "fill-white text-white",
                  completedState && "fill-white stroke-[4] text-white"
              )}/>
              </div>
            )}

        </div>
    
    </Link>
  );
};