import Tabs from "@/store/video/Tabs";
import Notes from "@/store/video/Notes";
import { videoStyles } from "@/styles/video";
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
    <section className={videoStyles.style_5f49a6e78ea6f}>
      <div className={`${videoStyles.card} h-[45%] shrink-0 overflow-hidden`}>
        <div className={videoStyles.style_3d39e4bf9caef}>
          <div className={videoStyles.style_132fe1ccbf2c8f}>
            ?
          </div>
          <p className={videoStyles.style_d4e2344665b44}>No video available</p>
          <p className={videoStyles.style_ca0b64ca60264}>Content will appear here when available</p>
        </div>
        <div className={videoStyles.style_d56f606dc1f0e}>
          <div>
            <button
              type="button"
              onClick={onDislike}
              className={`flex translate-x-[4px] items-center gap-1 transition hover:text-red-400 ${disliked ? "text-purple-500" : "text-zinc-400"}`}
            >
              <ThumbsDown className={`h-5 w-5 ${disliked ? "fill-purple-500 text-purple-500" : "fill-transparent text-zinc-400"}`} />
              <span className={videoStyles.style_19808e2d8b6019}>{dislikes}</span>
            </button>
          </div>
          <div className={videoStyles.style_1cea2ccf6d3c49}>
            <label className={videoStyles.style_96ebe9a0013e2}>
              <span className={videoStyles.style_1b4fcf44b942ce}>
                {completed ? "Completed" : "Mark as Completed"}
              </span>
              <input
                type="checkbox"
                checked={completed}
                onChange={onComplete}
                className={videoStyles.style_10fb89c5af56a2}
              />
            </label>

            <span className={videoStyles.style_111fbfd125d08} />

            <button type="button" aria-label="Previous" className={videoStyles.style_2d1300b88c1e6}>
              <ChevronLeft className={videoStyles.style_17ad9be452bfb5} />
            </button>
            <button type="button" aria-label="Next" className={videoStyles.style_2d1300b88c1e6}>
              <ChevronRight className={videoStyles.style_17ad9be452bfb5} />
            </button>
          </div>
        </div>
      </div>

      <div className={`${videoStyles.card} h-[35%] min-h-0 shrink-0 overflow-hidden`}>
        <Tabs
          tabs={[
            { id: "notes", label: "Notes" },
            { id: "assistant", label: "AI Assistant" },
          ]}
          activeTab={activeTab}
          onChange={(tab) => onTabChange(tab as "notes" | "assistant")}
        />
        {activeTab === "notes" ? (
          <div className={videoStyles.style_fa284cdf0cdbf}>
            <Notes value={notes} onChange={onNotesChange} />
          </div>
        ) : (
          <div className={videoStyles.style_6a63f9ada7ec6}>
            AI Assistant panel placeholder.
          </div>
        )}
      </div>
    </section>
  );
}
