"use client";

import type { TutorialChapter, TutorialLesson } from "@/features/tutorial/services/tutorialService";
import { LessonGrid } from "@/features/tutorial/components/LessonGrid";

export interface ChapterSectionProps {
  chapter: TutorialChapter;
  onLessonOpen: (lesson: TutorialLesson) => void;
}

export function ChapterSection({ chapter, onLessonOpen }: ChapterSectionProps) {
  return (
    <section className={`rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl p-5`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">Chapter</span>
          <h2 className="mt-3 text-xl font-semibold text-white">{chapter.title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {chapter.lessons.length} lessons · {chapter.totalDurationLabel}
          </p>
        </div>
      </div>
      <LessonGrid lessons={chapter.lessons} onLessonOpen={onLessonOpen} />
    </section>
  );
}

