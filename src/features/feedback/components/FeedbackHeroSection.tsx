"use client";

import { MessageSquarePlus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { FeedbackStats } from "@/features/feedback/services/feedbackService";
import { FeedbackButton } from "@/features/feedback/components/FeedbackButton";

export interface FeedbackHeroSectionProps {
  stats: FeedbackStats;
  onGiveFeedbackClick: () => void;
}

export function FeedbackHeroSection({
  stats,
  onGiveFeedbackClick,
}: FeedbackHeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" overflow-hidden p-5`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            Feedback workspace
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Product Feedback
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Share what feels fast, clear, confusing, or missing across the Roteen dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" px-4 py-3`}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Avg rating
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {stats.averageRating || "0.0"}
              <span className="text-sm text-slate-500"> / 5</span>
            </p>
          </div>
          <FeedbackButton
            variant="primary"
            icon={<MessageSquarePlus className="h-4 w-4" />}
            onClick={onGiveFeedbackClick}
          >
            Give Feedback
          </FeedbackButton>
        </div>
      </div>
    </motion.section>
  );
}
