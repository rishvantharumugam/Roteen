"use client";

import { Award, Target } from "lucide-react";
import type { TutorialPageData } from "@/features/tutorial/services/tutorialService";
import { ProgressBar } from "@/features/tutorial/components/ProgressBar";

export interface ProgressSectionProps {
  pageData: TutorialPageData;
}

export function ProgressSection({ pageData }: ProgressSectionProps) {
  return (
    <section className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" p-4`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/16 bg-violet-500/[0.08] text-violet-200">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">Learning progress</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {pageData.completedLessonCount} of {pageData.lessons.length} lessons complete
            </p>
          </div>
        </div>
        <Award className="hidden h-6 w-6 text-violet-300 sm:block" />
      </div>
      <div className="mt-4">
        <ProgressBar value={pageData.progressPercent} />
      </div>
    </section>
  );
}
