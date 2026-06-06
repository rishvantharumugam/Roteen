"use client";

import { BookOpen, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import type { TutorialChapter } from "@/features/tutorial/services/tutorialService";
import { ProgressBar } from "@/features/tutorial/components/ProgressBar";

export interface ChapterItemProps {
  chapter: TutorialChapter;
  isActive: boolean;
  onSelect: (chapterId: string) => void;
}

export function ChapterItem({ chapter, isActive, onSelect }: ChapterItemProps) {
  const isComplete = chapter.progressPercent >= 100;

  return (
    <motion.button
      type="button"
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(chapter.id)}
      className={[
        "w-full rounded-2xl border p-3 text-left transition duration-300",
        isActive
          ? "border-violet-400/28 bg-violet-500/[0.08]"
          : "border-zinc-800 bg-[#141414]/80 hover:border-violet-400/22 hover:bg-[#18181B]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-200">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          ) : (
            <BookOpen className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{chapter.title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {chapter.lessons.length} lessons · {chapter.totalDurationLabel}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar value={chapter.progressPercent} compact />
      </div>
    </motion.button>
  );
}
