import Link from "next/link";
import Image from "next/image";
import { ZapIcon, HeartIcon, InfinityIcon } from "lucide-react";
import type { StudentPracticeCourse } from '../types';

interface UserProgressProps {
  activeCourse: StudentPracticeCourse;
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
}

export const UserProgress = ({
  activeCourse,
  hasActiveSubscription,
  hearts,
  points,
}: UserProgressProps) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <Link href="/user/courses">
        {activeCourse.image ? (
          <Image
            src={activeCourse.image}
            alt={activeCourse.title}
            className="rounded-md border"
            width={120}
            height={120}
          />
        ) : (
          <div className="w-[120px] h-[120px] bg-gradient-to-br from-violet-500 to-purple-600 rounded-md border flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {activeCourse.title.charAt(0)}
            </span>
          </div>
        )}
      </Link>

      <Link href="/user/laboratory/shop">
        <div className="flex items-center justify-center gap-x-2">
          <ZapIcon className="h-5 w-5 stroke-2 text-orange-600" />
          <p className="text-neutral-700 font-bold">{points}</p>
        </div>
      </Link>
      
      <Link href="/user/laboratory/shop">
        <div className="flex items-center justify-center gap-x-2">
          <HeartIcon className="h-5 w-5 stroke-2 text-rose-500 fill-rose-500" />
          {hasActiveSubscription ? (
            <InfinityIcon className="h-4 w-4 stroke-[3] text-rose-500" />
          ) : (
            <p className="text-neutral-700 font-bold">{hearts}</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default UserProgress;
export type { UserProgressProps };