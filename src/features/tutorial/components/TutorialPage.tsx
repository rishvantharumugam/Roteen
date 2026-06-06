"use client";

import type {
  TutorialChapter,
  TutorialLesson,
  TutorialPageData,
} from "@/features/tutorial/services/tutorialService";
import { TutorialContentSection } from "@/features/tutorial/components/TutorialContentSection";
import { TutorialHeroSection } from "@/features/tutorial/components/TutorialHeroSection";
import { TutorialSidebar } from "@/features/tutorial/components/TutorialSidebar";
import { TutorialHeaderStore } from "@/features/tutorial/components/TutorialHeaderStore";

export interface TutorialPageProps {
  pageData: TutorialPageData;
  selectedLesson: TutorialLesson;
  continueLesson: TutorialLesson;
  activeChapter: TutorialChapter;
  activeChapterId: string;
  onChapterSelect: (chapterId: string) => void;
  onLessonSelect: (lesson: TutorialLesson) => void;
  onMarkComplete: (lesson: TutorialLesson) => void;
}

export function TutorialPage({
  pageData,
  selectedLesson,
  continueLesson,
  activeChapter,
  activeChapterId,
  onChapterSelect,
  onLessonSelect,
  onMarkComplete,
}: TutorialPageProps) {
  return (
    <div className={`bg-black text-zinc-200 min-h-screen relative flex h-screen flex-col overflow-hidden   text-slate-100`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:4px_4px]" />
      <TutorialHeaderStore />
      <main className="relative min-h-0 flex-1 min-w-0 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid h-full w-full max-w-[1540px] grid-rows-[auto_minmax(0,1fr)] gap-4">
          <TutorialHeroSection pageData={pageData} />
          <div className="grid min-h-0 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <TutorialSidebar
              chapters={pageData.chapters}
              activeChapterId={activeChapterId}
              onChapterSelect={onChapterSelect}
            />
            <TutorialContentSection
              pageData={pageData}
              selectedLesson={selectedLesson}
              continueLesson={continueLesson}
              activeChapter={activeChapter}
              onLessonSelect={onLessonSelect}
              onMarkComplete={onMarkComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
