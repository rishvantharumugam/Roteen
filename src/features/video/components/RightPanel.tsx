"use client";

import { useState } from "react";


interface RightPanelProps {
  activeTab: "theory" | "discussion";
  onTabChange: (tab: "theory" | "discussion") => void;
  title: string;
  description: string;
}

export default function RightPanel({ activeTab, onTabChange }: RightPanelProps) {
  const [theoryViewEnabled, setTheoryViewEnabled] = useState(false);

  return (
    <aside className={`$"rounded-2xl border border-zinc-800/90 bg-[radial-gradient(circle_at_10%_7%,rgba(62,43,138,0.22),rgba(8,12,24,0.96)_42%),linear-gradient(160deg,#050915,#040710)] shadow-[0_18px_36px_rgba(0,0,0,0.42)]" $"w-[340px] shrink-0"`}>
      <div className="flex w-full items-center justify-between border-b border-zinc-800 p-4">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange("theory")}
            className={`pb-2 text-sm ${activeTab === "theory" ? "border-b-2 border-purple-500 text-purple-400" : "border-b-2 border-transparent text-zinc-300"}`}
          >
            Theory
          </button>
          <button
            type="button"
            onClick={() => onTabChange("discussion")}
            className={`pb-2 text-sm ${activeTab === "discussion" ? "border-b-2 border-purple-500 text-purple-400" : "border-b-2 border-transparent text-zinc-300"}`}
          >
            Discussion
          </button>
        </div>
        <button
          type="button"
          onClick={() => setTheoryViewEnabled((previous) => !previous)}
          className="flex items-center gap-2 whitespace-nowrap text-sm text-zinc-300 transition-all duration-300"
          aria-pressed={theoryViewEnabled}
          aria-label="Toggle Theory View"
        >
          <span>Theory View</span>
          <span
            className={`relative flex h-4 w-8 items-center rounded-full transition-all duration-300 ${theoryViewEnabled ? "bg-purple-500" : "bg-zinc-700"}`}
          >
            <span
              className={`h-3 w-3 rounded-full transition-all duration-300 ${theoryViewEnabled ? "translate-x-[16px] bg-white" : "translate-x-[2px] bg-zinc-900"}`}
            />
          </span>
        </button>
      </div>
      <div className="p-4" />
    </aside>
  );
}
