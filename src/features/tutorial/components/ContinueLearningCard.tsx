"use client";

import { ArrowRight, PlayCircle } from "lucide-react";
import type { TutorialLesson } from "@/features/tutorial/services/tutorialService";
import { ProgressBar } from "@/features/tutorial/components/ProgressBar";
import { TutorialButton } from "@/features/tutorial/components/TutorialButton";

export interface ContinueLearningCardProps {
  lesson: TutorialLesson;
  onContinue: (lesson: TutorialLesson) => void;
}

export function ContinueLearningCard({
  lesson,
  onContinue,
}: ContinueLearningCardProps) {
  return (
    <section className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" p-4`}>
      <div className="flex items-start gap-4">
        <div className="relative hidden h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-slate-950 sm:block">
          <div
            className="h-full w-full bg-cover bg-center"
            style={
              lesson.thumbnailUrl
                ? { backgroundImage: `url(${lesson.thumbnailUrl})` }
                : { background: lesson.thumbnail }
            }
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/24">
            <PlayCircle className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">Continue learning</span>
          <h2 className="mt-3 truncate text-lg font-semibold text-white">
            {lesson.title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {lesson.instructor} · {lesson.duration}
          </p>
          <div className="mt-4 max-w-xl">
            <ProgressBar value={lesson.progressPercent} compact />
          </div>
        </div>

        <TutorialButton
          variant="primary"
          className="hidden shrink-0 sm:inline-flex"
          icon={<ArrowRight className="h-4 w-4" />}
          onClick={() => onContinue(lesson)}
        >
          Resume
        </TutorialButton>
      </div>
    </section>
  );
}
