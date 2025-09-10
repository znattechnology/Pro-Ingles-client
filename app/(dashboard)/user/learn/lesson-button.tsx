"use client";
import Link from "next/link";
import { Check, Crown, Star, CheckIcon } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
type Props = {
  id: string;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
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
  const isCompleted = !current && !locked;

  const Icon = isCompleted ? CheckIcon : isLast ? Crown : Star;

  const href = isCompleted ? `/user/learn/lesson/${id}` : "/user/learn/lesson";

  return (
    <Link href={href} aria-disabled={locked} style={{pointerEvents:locked ? "none" : "auto"}}>
        <div className="relative" style={ {
            right:`${rigthPosition}px`,
            marginTop: isFirst && !isCompleted ? 60 : 24,
        }}>

            {current ? (
                <div className="h-[102px] w-[102px] relative">
                   <div className="absolute -top-6 left-2.5 px-3 py-2.5 border-2 font-bold
                   uppercase text-violet-800/90 bg-white rounded-xl animate-bounce -tracking-wide z-10
                   
                   ">
                    start 
                    <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2"/>
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
                    <Button size="rounded" variant={locked ? "locked" : "secondary"} className="h-[50px] w-[50px] border-b-8">
                        <Icon className={cn(
                            "h-20 w-20", locked ? 
                            "fill-neutral-400 text-neutral-400 stroke-neutral-400" : "fill-white text-white",
                            isCompleted && "fill-none stroke-[4]"
                        )}/>
                    </Button>

                   </CircularProgressbarWithChildren>
                </div>
            ):
            (
              <Button size="rounded" variant={locked ? "locked" : "secondary"} className="h-[50px] w-[50px] border-b-8">
              <Icon className={cn(
                  "h-20 w-20", locked ? 
                  "fill-neutral-400 text-neutral-400 stroke-neutral-400" : "fill-white text-white0",
                  isCompleted && "fill-none stroke-none"
              )}/>
          </Button>
            )}

        </div>
    
    </Link>
  );
};
