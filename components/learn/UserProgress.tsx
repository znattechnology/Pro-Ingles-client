import Link from "next/link";
import React from "react";

import Image from "next/image";
import { ZapIcon, HeartIcon, InfinityIcon } from "lucide-react";
// Django API types
interface Course {
  id: string;
  title: string;
  imageSrc: string | null;
}

type Props = {
  activeCourse: Course;
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const UserProgress = ({
  activeCourse,
  hasActiveSubscription,
  hearts,
  points,
}: Props) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <Link href="/user/learn/courses">
        <Image
          src={activeCourse.imageSrc || "/placeholder.png"}
          alt={activeCourse.title}
          className="rounded-md border"
          width={120}
          height={120}
        />
      </Link>

      <Link href="/user/learn/shop">
       <div className="flex items-center justify-center gap-x-2 ">
       <ZapIcon className="h-5 w-5 stroke-2 text-orange-600" />
       <p className="text-white">{points}</p>
       </div>
      </Link>
      <Link href="/user/learn/shop">
  <div className="flex items-center justify-center gap-x-2 ">
  <HeartIcon className="h-5 w-5 stroke-2 text-rose-800" />
        {hasActiveSubscription ? (
          <InfinityIcon className="h-4 w-4 stroke-[3] text-rose-700" />
        ) : (
          <p className="text-white">{hearts}</p>
        )}
  </div>
      </Link>
    </div>
  );
};
