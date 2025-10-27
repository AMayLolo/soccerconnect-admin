// src/components/LoadingOverlay.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Global loading overlay that fades in whenever the route or data is updating.
 * Detects Next.js route transitions automatically.
 */
export default function LoadingOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const start = () => setIsVisible(true);
    const stop = () => setTimeout(() => setIsVisible(false), 250);

    // Listen to Next.js route events
    window.addEventListener("next-route-start", start);
    window.addEventListener("next-route-done", stop);

    return () => {
      window.removeEventListener("next-route-start", start);
      window.removeEventListener("next-route-done", stop);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg bg-white px-6 py-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm font-medium text-neutral-700">
                Loading, please wait...
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
