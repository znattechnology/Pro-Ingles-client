import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotebookText } from "lucide-react";
import { useState } from "react";

type Props = {
  title: string;
  description: string;
};

const DESC_MAX_LENGTH = 120;

export const UnitBanner = ({ title, description }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = description && description.length > DESC_MAX_LENGTH;
  const displayText = isLong && !expanded
    ? description.slice(0, DESC_MAX_LENGTH) + "..."
    : description;

  return (
    <div className="w-full rounded-xl bg-violet-900/90 p-5 text-white flex items-center justify-between">
      <div className="space-y-2.5 flex-1 min-w-0">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">
          {displayText}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 text-violet-300 hover:text-white text-sm font-medium transition-colors"
            >
              {expanded ? "Ver menos" : "Ver mais"}
            </button>
          )}
        </p>
      </div>
      <Link href="/user/laboratory/learn/lesson">
        <Button size="lg" variant="ghost" className="hidden xl:flex border border-b-2 active:border-b">
          <NotebookText className="mr-2" />
          Continue
        </Button>
      </Link>
    </div>
  );
};
