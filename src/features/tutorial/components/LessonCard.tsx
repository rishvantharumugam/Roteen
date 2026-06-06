"use client";

import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { TutorialLesson } from "@/features/tutorial/services/tutorialService";
import { TutorialButton } from "@/features/tutorial/components/TutorialButton";

export interface LessonCardProps {
  lesson: TutorialLesson;
  onOpen: (lesson: TutorialLesson) => void;
}

export function LessonCard({ lesson, onOpen }: LessonCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.28 }}
      className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" overflow-hidden`}
    >
      <button
        type="button"
        onClick={() => onOpen(lesson)}
        className="group relative block aspect-video w-full overflow-hidden bg-slate-950 text-left"
      >
        <div
          className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={
            lesson.thumbnailUrl
              ? { backgroundImage: `url(${lesson.thumbnailUrl})` }
              : { background: lesson.thumbnail }
          }
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.55))]" />
        <span className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/45 text-white backdrop-blur">
          <Play className="h-4 w-4 fill-white" />
        </span>
        <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold text-white">
          {lesson.duration}
        </span>
      </button>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white">
              {lesson.title}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{lesson.instructor}</p>
          </div>
          {lesson.isCompleted ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          ) : null}
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
          {lesson.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {lesson.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-zinc-800 bg-[#121212] px-2 py-1 text-[0.68rem] font-medium text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <TutorialButton
            className="shrink-0 px-3"
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => onOpen(lesson)}
          >
            Open
          </TutorialButton>
        </div>
      </div>
    </motion.article>
  );
}
