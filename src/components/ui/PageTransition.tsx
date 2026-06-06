"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface PageTransitionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  duration?: number;
}

export function PageTransition({
  children,
  duration = 0.3,
  ...props
}: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
