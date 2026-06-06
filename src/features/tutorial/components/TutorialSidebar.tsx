"use client";

import type { TutorialChapter } from "@/features/tutorial/services/tutorialService";
import { ChapterItem } from "@/features/tutorial/components/ChapterItem";

export interface TutorialSidebarProps {
  chapters: TutorialChapter[];
  activeChapterId: string;
  onChapterSelect: (chapterId: string) => void;
}

export function TutorialSidebar({
  chapters,
  activeChapterId,
  onChapterSelect,
}: TutorialSidebarProps) {
  return (
    <aside className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" hidden min-h-0 overflow-hidden lg:flex lg:flex-col`}>
      <div className="border-b border-zinc-800 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
          Chapters
        </h2>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            isActive={chapter.id === activeChapterId}
            onSelect={onChapterSelect}
          />
        ))}
      </div>
    </aside>
  );
}

