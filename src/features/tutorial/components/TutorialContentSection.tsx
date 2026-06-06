"use client";

import type {
  TutorialChapter,
  TutorialLesson,
  TutorialPageData,
} from "@/features/tutorial/services/tutorialService";
import { ContinueLearningSection } from "@/features/tutorial/components/ContinueLearningSection";
import { ProgressSection } from "@/features/tutorial/components/ProgressSection";
import { VideoSection } from "@/features/tutorial/components/VideoSection";
import { ChapterSection } from "@/features/tutorial/components/ChapterSection";
import { TutorialCard } from "@/features/tutorial/components/TutorialCard";

export interface TutorialContentSectionProps {
  pageData: TutorialPageData;
  selectedLesson: TutorialLesson;
  continueLesson: TutorialLesson;
  activeChapter: TutorialChapter;
  onLessonSelect: (lesson: TutorialLesson) => void;
  onMarkComplete: (lesson: TutorialLesson) => void;
}

export function TutorialContentSection({
  pageData,
  selectedLesson,
  continueLesson,
  activeChapter,
  onLessonSelect,
  onMarkComplete,
}: TutorialContentSectionProps) {
  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <ContinueLearningSection
          lesson={continueLesson}
          onContinue={onLessonSelect}
        />
        <VideoSection lesson={selectedLesson} onMarkComplete={onMarkComplete} />
        <ChapterSection chapter={activeChapter} onLessonOpen={onLessonSelect} />
      </div>

      <aside className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" min-h-0 overflow-hidden`}>
        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Course playlist
          </h2>
        </div>
        <div className="min-h-0 space-y-3 overflow-y-auto p-4">
          <ProgressSection pageData={pageData} />
          {pageData.lessons.map((lesson) => (
            <TutorialCard
              key={lesson.id}
              lesson={lesson}
              isActive={lesson.id === selectedLesson.id}
              onSelect={onLessonSelect}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

