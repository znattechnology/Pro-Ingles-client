import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
};

export const LearnHeader = ({ title }: Props) => {
  return (
    <div className="sticky top-0 bg-customgreys-primarybg pb-3 p-4 lg:pt-[28px]  flex items-center justify-between border-b-2 mb-5 text-white lg:z-50">
    <Link href="/user/laboratory/learn/courses">
        <Button variant="ghost">
            <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-400"/>
        </Button>
    </Link>
    <h1 className="font-bold text-lg">
        {title}
    </h1>
    <div/>
  </div>
  )

};
