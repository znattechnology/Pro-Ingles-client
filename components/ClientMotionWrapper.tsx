"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ClientMotionWrapperProps {
  children: React.ReactNode;
  initial?: any;
  animate?: any;
  transition?: any;
  className?: string;
  style?: React.CSSProperties;
}

const ClientMotionWrapper: React.FC<ClientMotionWrapperProps> = ({
  children,
  initial = {},
  animate = {},
  transition = {},
  className = "",
  style = {},
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a static div during SSR to avoid hydration mismatch
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Return animated motion.div on client
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default ClientMotionWrapper;