"use client";

import { BookOpenCheck, Clock3, Layers3 } from "lucide-react";
import { motion } from "framer-motion";
import type { TutorialPageData } from "@/features/tutorial/services/tutorialService";
import { ProgressBar } from "@/features/tutorial/components/ProgressBar";

export interface TutorialHeroSectionProps {
  pageData: TutorialPageData;
}

export function TutorialHeroSection({ pageData }: TutorialHeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" overflow-hidden p-5`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">Tutorial workspace</span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Video Tutorials
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Learn with guided video lessons, chapter progress, and a compact
            dashboard built for focused study.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-[34rem]">
          <div className={"rounded-2xl border border-white/5 bg-white/5 shadow-sm" + " p-3"}>
            <Layers3 className="h-4 w-4 text-violet-300" />
            <p className="mt-2 text-xl font-semibold text-white">
              {pageData.chapters.length}
            </p>
            <p className="text-xs text-slate-500">Chapters</p>
          </div>
          <div className={"rounded-2xl border border-white/5 bg-white/5 shadow-sm" + " p-3"}>
            <BookOpenCheck className="h-4 w-4 text-violet-200" />
            <p className="mt-2 text-xl font-semibold text-white">
              {pageData.completedLessonCount}/{pageData.lessons.length}
            </p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className={"rounded-2xl border border-white/5 bg-white/5 shadow-sm" + " p-3"}>
            <Clock3 className="h-4 w-4 text-purple-200" />
            <p className="mt-2 text-xl font-semibold text-white">
              {pageData.totalDurationLabel}
            </p>
            <p className="text-xs text-slate-500">Runtime</p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar value={pageData.progressPercent} label="Overall progress" />
      </div>
    </motion.section>
  );
}
