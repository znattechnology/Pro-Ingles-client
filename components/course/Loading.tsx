import { Loader2 } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex gap-2 items-center justify-center bg-black">
      <Loader2 className="w-6 h-6 animate-spin text-violet-800" />
      <span className="text-sm font-medium text-white">Loading...</span>
    </div>
  );
};

export default Loading;
