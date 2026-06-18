"use client";
 
import { Newspaper } from "lucide-react";
import { motion } from "framer-motion";

export function NewsHeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#101114] p-5 transition duration-300 hover:border-[#7C3AED]/30 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
      aria-label="News"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#101114] text-[#7C3AED]">
        <Newspaper
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-wide text-white">
          News
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Stay updated with the latest news and announcements.
        </p>
      </div>
    </motion.section>
  );
}
