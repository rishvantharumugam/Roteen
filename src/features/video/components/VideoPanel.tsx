import Tabs from "@/features/video/components/Tabs";
import Notes from "@/features/video/components/Notes";

import { ChevronLeft, ChevronRight, ThumbsDown } from "lucide-react";

interface VideoPanelProps {
  dislikes: number;
  disliked: boolean;
  completed: boolean;
  notes: string;
  activeTab: "notes" | "assistant";
  onDislike: () => void;
  onComplete: () => void;
  onTabChange: (tab: "notes" | "assistant") => void;
  onNotesChange: (value: string) => void;
}

export default function VideoPanel({
  dislikes,
  disliked,
  completed,
  notes,
  activeTab,
  onDislike,
  onComplete,
  onTabChange,
  onNotesChange,
}: VideoPanelProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-4 overflow-hidden pr-1">
      <div className={`rounded-2xl border border-zinc-800/90 bg-[radial-gradient(circle_at_10%_7%,rgba(62,43,138,0.22),rgba(8,12,24,0.96)_42%),linear-gradient(160deg,#050915,#040710)] shadow-[0_18px_36px_rgba(0,0,0,0.42)] h-[45%] shrink-0 overflow-hidden`}>
        <div className="m-3 flex h-[calc(100%-72px)] min-h-0 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-500">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-base">
            ?
          </div>
          <p className="text-base font-medium text-zinc-300">No video available</p>
          <p className="mt-2 text-sm text-zinc-500">Content will appear here when available</p>
        </div>
        <div className="flex items-center justify-between px-2 py-2">
          <div>
            <button
              type="button"
              onClick={onDislike}
              className={`flex translate-x-[4px] items-center gap-1 transition hover:text-red-400 ${disliked ? "text-purple-500" : "text-zinc-400"}`}
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
      </div>

      <div className={`rounded-2xl border border-zinc-800/90 bg-[radial-gradient(circle_at_10%_7%,rgba(62,43,138,0.22),rgba(8,12,24,0.96)_42%),linear-gradient(160deg,#050915,#040710)] shadow-[0_18px_36px_rgba(0,0,0,0.42)] h-[35%] min-h-0 shrink-0 overflow-hidden`}>
        <Tabs
          tabs={[
            { id: "notes", label: "Notes" },
            { id: "assistant", label: "AI Assistant" },
          ]}
          activeTab={activeTab}
          onChange={(tab) => onTabChange(tab as "notes" | "assistant")}
        />
        {activeTab === "notes" ? (
          <div className="h-[calc(100%-49px)] min-h-0 overflow-y-auto p-4">
            <Notes value={notes} onChange={onNotesChange} />
          </div>
        ) : (
          <div className="h-[calc(100%-49px)] min-h-0 overflow-y-auto p-8 text-zinc-400">
            AI Assistant panel placeholder.
          </div>
        )}
      </div>
    </section>
  );
}
