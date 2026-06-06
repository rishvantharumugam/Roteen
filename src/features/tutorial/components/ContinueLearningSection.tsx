"use client";

import type { TutorialLesson } from "@/features/tutorial/services/tutorialService";
import { ContinueLearningCard } from "@/features/tutorial/components/ContinueLearningCard";

export interface ContinueLearningSectionProps {
  lesson: TutorialLesson;
  onContinue: (lesson: TutorialLesson) => void;
}

export function ContinueLearningSection({
  lesson,
  onContinue,
}: ContinueLearningSectionProps) {
  return <ContinueLearningCard lesson={lesson} onContinue={onContinue} />;
}

