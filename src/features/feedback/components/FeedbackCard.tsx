"use client";

import { MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";
import type { FeedbackItem } from "@/features/feedback/services/feedbackService";
import { FeedbackButton } from "@/features/feedback/components/FeedbackButton";
import { RatingStars } from "@/features/feedback/components/RatingStars";

export interface FeedbackCardProps {
  feedback: FeedbackItem;
  isHighlighted?: boolean;
  onReviewClick?: (feedback: FeedbackItem) => void;
}

export function FeedbackCard({
  feedback,
  isHighlighted = false,
  onReviewClick,
}: FeedbackCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={[
        "rounded-2xl border border-zinc-800 bg-[#0a0d18] shadow-sm",
        "p-4 transition duration-300",
        isHighlighted ? "border-violet-400/50 bg-violet-500/10" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">
              {feedback.name}
            </h3>
            <span className="rounded-full border border-zinc-800 bg-white/[0.05] px-2 py-0.5 text-xs text-slate-400">
              {feedback.category}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{feedback.createdAtLabel}</p>
        </div>
        <RatingStars value={feedback.rating} readOnly size="sm" />
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-300">{feedback.comment}</p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
        <span className="text-xs font-medium text-violet-200">{feedback.status}</span>
        {onReviewClick ? (
          <FeedbackButton
            className="h-9 px-3"
            icon={<MessageSquareText className="h-4 w-4" />}
            onClick={() => onReviewClick(feedback)}
          >
            Review
          </FeedbackButton>
        ) : null}
      </div>
    </motion.article>
  );
}
