"use client";

import type { FeedbackStats } from "@/features/feedback/services/feedbackService";

export interface RatingSectionProps {
  stats: FeedbackStats;
}

export function RatingSection({ stats }: RatingSectionProps) {
  return (
    <section className={`rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl p-5`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Rating spread</h2>
          <p className="mt-1 text-sm text-slate-500">{stats.totalReviews} total reviews</p>
        </div>
        <span className="text-2xl font-semibold text-white">
          {stats.averageRating || "0.0"}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {stats.ratingDistribution.map((item) => (
          <div key={item.rating} className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.5rem] items-center gap-3">
            <span className="text-sm font-medium text-slate-300">{item.rating} star</span>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7C3AED,#8B5CF6,#A855F7)]"
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <span className="text-right text-xs text-slate-500">{item.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
