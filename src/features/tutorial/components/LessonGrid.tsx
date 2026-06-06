"use client";

import type { TutorialLesson } from "@/features/tutorial/services/tutorialService";
import { LessonCard } from "@/features/tutorial/components/LessonCard";

export interface LessonGridProps {
  lessons: TutorialLesson[];
  onLessonOpen: (lesson: TutorialLesson) => void;
}

export function LessonGrid({ lessons, onLessonOpen }: LessonGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} onOpen={onLessonOpen} />
      ))}
    </div>
  );
}

