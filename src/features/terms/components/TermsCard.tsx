"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface TermsCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function TermsCard({
  children,
  className = "",
  delay = 0,
}: TermsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

