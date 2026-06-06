"use client";

import { AlertCircle, ExternalLink, Play } from "lucide-react";
import type { TutorialLesson } from "@/features/tutorial/services/tutorialService";
import { TutorialButton } from "@/features/tutorial/components/TutorialButton";

export interface VideoPlayerProps {
  lesson: TutorialLesson;
  onMarkComplete: (lesson: TutorialLesson) => void;
}

function isEmbeddableUrl(value: string) {
  return /^https:\/\/(www\.)?(youtube\.com\/embed\/|player\.vimeo\.com\/video\/)/.test(
    value,
  );
}

export function VideoPlayer({ lesson, onMarkComplete }: VideoPlayerProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-[0_28px_90px_-62px_rgba(0,0,0,0.95)]">
      <div className="relative aspect-video">
        {lesson.videoUrl && isEmbeddableUrl(lesson.videoUrl) ? (
          <iframe
            className="h-full w-full"
            src={lesson.videoUrl}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : lesson.videoUrl ? (
          <div className="flex h-full items-center justify-center bg-slate-950 p-6 text-center">
            <div>
              <AlertCircle className="mx-auto h-9 w-9 text-amber-300" />
              <p className="mt-3 text-sm font-semibold text-white">
                This video opens outside the dashboard.
              </p>
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950"
              >
                Open video
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="group relative h-full overflow-hidden bg-slate-950">
            <div
              className="h-full w-full bg-cover bg-center opacity-90"
              style={
                lesson.thumbnailUrl
                  ? { backgroundImage: `url(${lesson.thumbnailUrl})` }
                  : { background: lesson.thumbnail }
              }
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-slate-950 shadow-2xl">
                <Play className="ml-1 h-9 w-9 fill-slate-950" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-[#141414] px-4 py-3">
        <div className="text-sm text-slate-400">
          <span className="font-semibold text-white">{lesson.duration}</span>
          <span className="mx-2 text-slate-600">/</span>
          {lesson.viewsLabel}
        </div>
        <TutorialButton
          variant={lesson.isCompleted ? "secondary" : "primary"}
          onClick={() => onMarkComplete(lesson)}
          disabled={lesson.isCompleted}
        >
          {lesson.isCompleted ? "Completed" : "Mark complete"}
        </TutorialButton>
      </div>
    </div>
  );
}
