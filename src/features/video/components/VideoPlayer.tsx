import { ChevronLeft, ChevronRight, ThumbsDown } from "lucide-react";


interface VideoPlayerProps {
  dislikes: number;
  disliked: boolean;
  completed: boolean;
  onDislike: () => void;
  onComplete: () => void;
}

export default function VideoPlayer({ dislikes, disliked, completed, onDislike, onComplete }: VideoPlayerProps) {
  return (
    <section className="rounded-2xl border border-zinc-800/90 bg-[radial-gradient(circle_at_10%_7%,rgba(62,43,138,0.22),rgba(8,12,24,0.96)_42%),linear-gradient(160deg,#050915,#040710)] shadow-[0_18px_36px_rgba(0,0,0,0.42)]">
      <div className="m-3 flex h-90 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-500">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-base">?</div>
        <p className="text-base font-medium text-zinc-300">No video available</p>
        <p className="mt-2 text-sm text-zinc-500">Content will appear here when available</p>
      </div>

      <div className="flex w-full items-center justify-between px-2 py-2">
        <div>
          <button
            type="button"
            onClick={onDislike}
            className={`flex translate-x-1 items-center gap-1 transition hover:text-red-400 ${disliked ? "text-purple-500" : "text-zinc-400"}`}
          >
            <ThumbsDown className={`h-5 w-5 ${disliked ? "fill-purple-500 text-purple-500" : "fill-transparent text-zinc-400"}`} />
            <span className="text-sm font-medium">{dislikes}</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-sm text-white transition">
              {completed ? "Completed" : "Mark as Completed"}
            </span>
            <input
              type="checkbox"
              checked={completed}
              onChange={onComplete}
              className="h-4 w-4 accent-white"
            />
          </label>

          <span className="h-4 border-l border-zinc-700" />

          <button type="button" aria-label="Previous" className="rounded p-1 transition hover:bg-zinc-800">
            <ChevronLeft className="h-5 w-5 text-zinc-300" />
          </button>
          <button type="button" aria-label="Next" className="rounded p-1 transition hover:bg-zinc-800">
            <ChevronRight className="h-5 w-5 text-zinc-300" />
          </button>
        </div>
      </div>
    </section>
  );
}
