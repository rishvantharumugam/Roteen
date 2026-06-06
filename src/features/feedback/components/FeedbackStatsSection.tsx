"use client";

import { BarChart3, MessageSquareText, SmilePlus, TimerReset } from "lucide-react";
import { motion } from "framer-motion";
import type { FeedbackStats } from "@/features/feedback/services/feedbackService";

export interface FeedbackStatsSectionProps {
  stats: FeedbackStats;
}

const statItems = [
  {
    id: "totalReviews",
    label: "Reviews",
    icon: MessageSquareText,
    tone: "text-violet-300",
  },
  {
    id: "averageRating",
    label: "Average",
    icon: BarChart3,
    tone: "text-violet-300",
  },
  {
    id: "satisfactionPercent",
    label: "Positive",
    icon: SmilePlus,
    tone: "text-emerald-300",
  },
  {
    id: "latestReviewLabel",
    label: "Latest",
    icon: TimerReset,
    tone: "text-purple-300",
  },
] as const;

export function FeedbackStatsSection({ stats }: FeedbackStatsSectionProps) {
  function resolveValue(id: (typeof statItems)[number]["id"]) {
    if (id === "averageRating") {
      return stats.averageRating ? `${stats.averageRating}/5` : "0/5";
    }

    if (id === "satisfactionPercent") {
      return `${stats.satisfactionPercent}%`;
    }

    return String(stats[id]);
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.04 }}
            className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" p-4`}
          >
            <Icon className={`h-4 w-4 ${item.tone}`} />
            <p className="mt-3 text-xl font-semibold text-white">
              {resolveValue(item.id)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{item.label}</p>
          </motion.div>
        );
      })}
    </section>
  );
}
