"use client";

import type { FeedbackItem } from "@/features/feedback/services/feedbackService";
import { FeedbackCard } from "@/features/feedback/components/FeedbackCard";

export interface UserReviewSectionProps {
  feedback?: FeedbackItem;
  onReviewClick: (feedback: FeedbackItem) => void;
}

export function UserReviewSection({
  feedback,
  onReviewClick,
}: UserReviewSectionProps) {
  return (
    <section className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" p-5`}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Featured review</h2>
        <p className="mt-1 text-sm text-slate-500">Most recent user signal</p>
      </div>
      {feedback ? (
        <FeedbackCard feedback={feedback} onReviewClick={onReviewClick} />
      ) : (
        <div className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" p-5 text-sm text-slate-400`}>
          The first submitted review will be featured here.
        </div>
      )}
    </section>
  );
}
