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
      <div className="space-y-4 pr-1 lg:min-h-0 lg:overflow-y-auto">
        <ContinueLearningSection
          lesson={continueLesson}
          onContinue={onLessonSelect}
        />
        <VideoSection lesson={selectedLesson} onMarkComplete={onMarkComplete} />
        <ChapterSection chapter={activeChapter} onLessonOpen={onLessonSelect} />
      </div>

      <aside className="rounded-2xl border border-zinc-800 bg-[#121212] backdrop-blur-xl lg:min-h-0 lg:overflow-hidden flex flex-col">
        <div className="border-b border-zinc-800 p-4 shrink-0">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Course playlist
          </h2>
        </div>
        <div className="space-y-3 p-4 lg:min-h-0 lg:overflow-y-auto">
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

