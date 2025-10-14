"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  gradient = "from-violet-600 to-purple-600"
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  gradient?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition-all duration-200 shadow-input dark:shadow-none p-4 bg-customgreys-secondarybg/60 backdrop-blur-sm border border-violet-900/30 hover:border-violet-600/50 justify-between flex flex-col space-y-4",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white`}>
            {icon}
          </div>
          <div className="font-bold text-neutral-200 mb-2 mt-2">
            {title}
          </div>
        </div>
        <div className="font-normal text-neutral-400 text-sm">
          {description}
        </div>
      </div>
    </motion.div>
  );
};