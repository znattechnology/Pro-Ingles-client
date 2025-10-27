import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
};

export const LearnHeader = ({ title }: Props) => {
  return (
    <div className="sticky top-0 bg-customgreys-primarybg pb-3 px-4 sm:px-6 py-3 sm:py-4 lg:pt-[28px] flex items-center justify-between border-b-2 mb-4 sm:mb-5 text-white lg:z-50">
      <Link href="/user/laboratory/learn/courses">
        <Button variant="ghost" className="p-2 sm:p-3 hover:bg-customgreys-secondarybg">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 stroke-2 text-neutral-400"/>
        </Button>
      </Link>
      <h1 className="font-bold text-base sm:text-lg md:text-xl truncate px-2">
        {title}
      </h1>
      <div className="w-9 sm:w-12"/>
    </div>
  )

};
