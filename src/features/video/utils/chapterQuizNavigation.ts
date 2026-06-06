import type { VideoQuestionMeta } from "@/features/video/constants/video";

export function isLastQuestionInChapter(
  orderedQuestions: VideoQuestionMeta[],
  selectedQuestionId: string | null,
): boolean {
  if (!selectedQuestionId || orderedQuestions.length === 0) {
    return false;
  }

  const activeIndex = orderedQuestions.findIndex((item) => item.questionId === selectedQuestionId);
  if (activeIndex < 0) {
    return false;
  }

  const activeChapterId = orderedQuestions[activeIndex].chapterId;
  const chapterQuestions = orderedQuestions.filter((item) => item.chapterId === activeChapterId);
  if (chapterQuestions.length === 0) {
    return false;
  }

  const lastQuestionInChapter = chapterQuestions[chapterQuestions.length - 1];
  return lastQuestionInChapter.questionId === selectedQuestionId;
}

export function getActiveChapterId(
  orderedQuestions: VideoQuestionMeta[],
  selectedQuestionId: string | null,
  fallbackChapterId: string,
): string {
  if (!selectedQuestionId) {
    return fallbackChapterId;
  }

  const match = orderedQuestions.find((item) => item.questionId === selectedQuestionId);
  return match?.chapterId ?? fallbackChapterId;
}

export function getNextChapterFirstQuestion(
  orderedQuestions: VideoQuestionMeta[],
  currentChapterId: string,
): VideoQuestionMeta | null {
  const chapterOrder: string[] = [];
  orderedQuestions.forEach((item) => {
    if (!chapterOrder.includes(item.chapterId)) {
      chapterOrder.push(item.chapterId);
    }
  });

  const currentChapterIndex = chapterOrder.indexOf(currentChapterId);
  if (currentChapterIndex < 0 || currentChapterIndex >= chapterOrder.length - 1) {
    return null;
  }

  const nextChapterId = chapterOrder[currentChapterIndex + 1];
  return orderedQuestions.find((item) => item.chapterId === nextChapterId) ?? null;
}
