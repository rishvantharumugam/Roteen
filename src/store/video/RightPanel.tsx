"use client";

import { useState } from "react";
import { videoStyles } from "@/styles/video";

interface RightPanelProps {
  activeTab: "theory" | "discussion";
  onTabChange: (tab: "theory" | "discussion") => void;
  title: string;
  description: string;
}

export default function RightPanel({ activeTab, onTabChange }: RightPanelProps) {
  const [theoryViewEnabled, setTheoryViewEnabled] = useState(false);

  return (
    <aside className={`${videoStyles.card} ${videoStyles.right}`}>
      <div className={videoStyles.style_1132c05f26f246}>
        <div className={videoStyles.style_14bebccf236e24}>
          <button
            type="button"
            onClick={() => onTabChange("theory")}
            className={`pb-2 text-sm ${activeTab === "theory" ? videoStyles.activeTab : videoStyles.inactiveTab}`}
          >
            Theory
          </button>
          <button
            type="button"
            onClick={() => onTabChange("discussion")}
            className={`pb-2 text-sm ${activeTab === "discussion" ? videoStyles.activeTab : videoStyles.inactiveTab}`}
          >
            Discussion
          </button>
        </div>
        <button
          type="button"
          onClick={() => setTheoryViewEnabled((previous) => !previous)}
          className={videoStyles.style_f59534a3c59b5}
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
      <div className={videoStyles.style_1efeaa36200bcf} />
    </aside>
  );
}
