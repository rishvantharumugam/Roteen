"use client";

import { CalendarDays, UserRound } from "lucide-react";
import type { TutorialLesson } from "@/features/tutorial/services/tutorialService";
import { VideoPlayer } from "@/features/tutorial/components/VideoPlayer";

export interface VideoSectionProps {
  lesson: TutorialLesson;
  onMarkComplete: (lesson: TutorialLesson) => void;
}

export function VideoSection({ lesson, onMarkComplete }: VideoSectionProps) {
  return (
    <section className="space-y-4">
      <VideoPlayer lesson={lesson} onMarkComplete={onMarkComplete} />

      <div className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-violet-200">
              Lesson {lesson.sequence}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-8 text-white sm:text-2xl">
              {lesson.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {lesson.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-zinc-800 bg-white/[0.045] px-3 py-1 text-xs font-medium text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-y border-zinc-800 py-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <UserRound className="h-4 w-4 text-violet-300" />
            <span>{lesson.instructor}</span>
          </div>
          <div className="text-sm text-slate-400">{lesson.role}</div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarDays className="h-4 w-4 text-violet-200" />
            <span>{lesson.postedDate}</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          {lesson.fullDescription}
        </p>
      </div>
    </section>
  );
}
