"use client";

import { motion } from "framer-motion";
import type { FeedbackStats } from "@/features/feedback/services/feedbackService";

export interface FeedbackHeroSectionProps {
  stats: FeedbackStats;
}

export function FeedbackHeroSection({
  stats,
}: FeedbackHeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl overflow-hidden p-5`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Product Feedback
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Share what feels fast, clear, confusing, or missing across the Roteen dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className={`rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl px-4 py-3`}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 whitespace-nowrap">
              Avg rating
            </p>
            <p className="mt-1 flex items-baseline gap-1 text-2xl font-semibold text-white">
              {stats.averageRating || "0.0"}
              <span className="text-sm font-medium text-slate-500">/ 5</span>
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
