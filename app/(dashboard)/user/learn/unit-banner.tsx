import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotebookText } from "lucide-react";
type Props = {
  title: string;
  description: string;
};

export const UnitBanner = ({ title, description }: Props) => {
  return (
    <div className="w-full rounded-xl bg-violet-900/90 p-5  text-white flex items-center justify-between">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      <Link href="/user/learn/lesson">
        <Button size="lg" variant="ghost" className="hidden xl:flex border border-b-2 active:border-b">
          <NotebookText className="mr-2" />
          Continue
        </Button>
      </Link>
    </div>
  );
};
