"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function TestMotion() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Delay the animation start to ensure proper mounting
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  console.log("TestMotion rendering - mounted:", mounted, "show:", show);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-500 text-white p-8 rounded-lg text-2xl font-bold">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotate: [0, 360]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 2,
              rotate: { duration: 3, repeat: Infinity, repeatType: "loop" }
            }}
            className="bg-red-500 text-white p-8 rounded-lg text-2xl font-bold text-center"
          >
            ✅ FRAMER MOTION<br/>FUNCIONANDO!
            <div className="text-sm mt-4">
              Framer Motion v12.23.13
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}