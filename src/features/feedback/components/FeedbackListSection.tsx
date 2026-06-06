"use client";

import type { FeedbackItem } from "@/features/feedback/services/feedbackService";
import { FeedbackCard } from "@/features/feedback/components/FeedbackCard";

export interface FeedbackListSectionProps {
  feedback: FeedbackItem[];
  highlightedFeedbackId?: string;
  onReviewClick: (feedback: FeedbackItem) => void;
}

export function FeedbackListSection({
  feedback,
  highlightedFeedbackId,
  onReviewClick,
}: FeedbackListSectionProps) {
  return (
    <section className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" min-h-0 overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 p-5">
        <div>
          <h2 className="text-base font-semibold text-white">User comments</h2>
          <p className="mt-1 text-sm text-slate-500">{feedback.length} latest entries</p>
        </div>
      </div>

      <div className="grid max-h-[36rem] gap-3 overflow-y-auto p-5">
        {feedback.length ? (
          feedback.map((item) => (
            <FeedbackCard
              key={item.id}
              feedback={item}
              isHighlighted={item.id === highlightedFeedbackId}
              onReviewClick={onReviewClick}
            />
          ))
        ) : (
          <div className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" p-5 text-center`}>
            <p className="text-sm font-medium text-white">No comments yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Submitted feedback will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
