"use client";

import { CheckCircle2, Clock3, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { TutorialLesson } from "@/features/tutorial/services/tutorialService";

export interface TutorialCardProps {
  lesson: TutorialLesson;
  isActive?: boolean;
  onSelect: (lesson: TutorialLesson) => void;
}

export function TutorialCard({ lesson, isActive = false, onSelect }: TutorialCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(lesson)}
      className={[
        "group grid w-full grid-cols-[7.5rem_minmax(0,1fr)] gap-3 rounded-2xl border p-2.5 text-left transition duration-300",
        isActive
          ? "border-violet-400/35 bg-violet-500/[0.08] shadow-[0_16px_34px_-30px_rgba(168,85,247,0.65)]"
          : "border-zinc-800 bg-[#141414]/80 hover:border-violet-400/22 hover:bg-[#18181B]",
      ].join(" ")}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
        <div
          className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={
            lesson.thumbnailUrl
              ? { backgroundImage: `url(${lesson.thumbnailUrl})` }
              : { background: lesson.thumbnail }
          }
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
          <PlayCircle className="h-7 w-7 text-white" />
        </div>
        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white">
          {lesson.duration}
        </span>
      </div>

      <div className="min-w-0 py-0.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-xs font-bold text-violet-200">
            {lesson.sequence}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-white">
              {lesson.title}
            </h3>
            <p className="mt-1 truncate text-xs text-slate-400">{lesson.instructor}</p>
          </div>
          {lesson.isCompleted ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{lesson.duration}</span>
        </div>
      </div>
    </motion.button>
  );
}
