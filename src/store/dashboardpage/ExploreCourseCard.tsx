import { memo } from "react";
import type { ExploreSubjectCard } from "@/service/DashboardPageService";

export const ExploreCourseCard = memo(function ExploreCourseCard({
  card,
  animationDelayMs = 0,
}: {
  card: ExploreSubjectCard;
  animationDelayMs?: number;
}) {
  const stats = [
    { label: "Chapters", value: card.chapterCount },
    { label: "Questions", value: card.totalQuestions },
    { label: "Quizzes", value: card.totalQuizzes },
  ];

  return (
    <article
      className="relative aspect-square overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition-colors dark:border-[#2f2f2f] dark:bg-[#161616] dark:shadow-none"
      style={{
        animation: `fadeLift 560ms cubic-bezier(0.16, 1, 0.3, 1) ${animationDelayMs}ms both`,
      }}
    >
      <div className="grid h-full grid-rows-[1fr_auto] gap-3">
        <div className="relative overflow-hidden rounded-[1rem] border border-white/15 bg-slate-950 p-4 text-white">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(43,83,62,0.96) 0%, rgba(14,34,25,0.94) 46%, rgba(0,0,0,0.98) 100%)",
            }}
          />
          <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full opacity-25 blur-2xl" style={{ background: card.accent }} />
          <div className="absolute inset-y-0 left-[58%] w-px rotate-12 bg-white/16" />
          <div className="relative">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-400">{card.badge}</p>
              <h3 className="mt-2 line-clamp-2 font-heading text-2xl font-semibold leading-8">{card.title}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex aspect-square flex-col justify-between rounded-[0.85rem] border border-slate-200 bg-slate-50 p-3 dark:border-[#303030] dark:bg-[#202020]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="font-heading text-2xl font-semibold text-slate-950 dark:text-slate-100">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
});
