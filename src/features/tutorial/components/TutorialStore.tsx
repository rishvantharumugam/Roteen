"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestTutorialPage } from "@/features/tutorial/actions/tutorialController";
import {
  applyTutorialProgress,
  persistTutorialProgress,
  readTutorialProgress,
  type TutorialLesson,
  type TutorialPageData,
} from "@/features/tutorial/services/tutorialService";
import {
  navigateToTutorial,
  navigateToTutorialLesson,
  resolveTutorialLessonId,
} from "@/features/tutorial/constants/tutorialNavigation";
import { EmptyState } from "@/features/tutorial/components/EmptyState";
import { SkeletonLoader } from "@/features/tutorial/components/SkeletonLoader";
import { TutorialPage } from "@/features/tutorial/components/TutorialPage";

export function TutorialStore() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageData, setPageData] = useState<TutorialPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState("");

  useEffect(() => {
    let isSubscribed = true;

    async function loadTutorials() {
      setIsLoading(true);
      setError(null);

      const response = await requestTutorialPage();

      if (!isSubscribed) {
        return;
      }

      if (!response.ok) {
        setError(response.message);
        setIsLoading(false);
        return;
      }

      const completedLessonIds = readTutorialProgress(
        response.data.lessons.map((lesson) => lesson.id),
      );
      const nextPageData = applyTutorialProgress(response.data, completedLessonIds);

      const initialLessonId = resolveTutorialLessonId(
        new URLSearchParams(window.location.search),
        nextPageData.featuredLessonId,
      );
      const initialLesson =
        nextPageData.lessons.find((lesson) => lesson.id === initialLessonId) ??
        nextPageData.lessons[0];

      setPageData(nextPageData);
      setActiveChapterId(initialLesson?.chapterId ?? nextPageData.chapters[0]?.id ?? "");
      setIsLoading(false);
    }

    void loadTutorials();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const selectedLesson = useMemo(() => {
    if (!pageData) {
      return null;
    }

    const lessonId = resolveTutorialLessonId(
      searchParams,
      pageData.featuredLessonId,
    );

    return (
      pageData.lessons.find((lesson) => lesson.id === lessonId) ??
      pageData.lessons[0] ??
      null
    );
  }, [pageData, searchParams]);

  const activeChapter = useMemo(() => {
    if (!pageData) {
      return null;
    }

    return (
      pageData.chapters.find((chapter) => chapter.id === activeChapterId) ??
      pageData.chapters[0] ??
      null
    );
  }, [activeChapterId, pageData]);

  const continueLesson = useMemo(() => {
    if (!pageData) {
      return null;
    }

    return (
      pageData.lessons.find((lesson) => lesson.id === pageData.continueLessonId) ??
      pageData.lessons[0] ??
      null
    );
  }, [pageData]);

  function handleRetry() {
    navigateToTutorial(router, { replace: true });
    window.location.reload();
  }

  function handleLessonSelect(lesson: TutorialLesson) {
    navigateToTutorialLesson(router, lesson.id);
    setActiveChapterId(lesson.chapterId);
  }

  function handleMarkComplete(lesson: TutorialLesson) {
    if (!pageData) {
      return;
    }

    const completedLessonIds = readTutorialProgress(
      pageData.lessons.map((currentLesson) => currentLesson.id),
    );

    completedLessonIds.add(lesson.id);
    persistTutorialProgress(completedLessonIds);
    setPageData(applyTutorialProgress(pageData, completedLessonIds));
  }

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading tutorials"
        message={error}
        actionLabel="Retry"
        onAction={handleRetry}
      />
    );
  }

  if (!pageData || !selectedLesson || !continueLesson || !activeChapter) {
    return (
      <EmptyState
        title="No tutorials found"
        message="Add published records to the tutorial_videos table in Supabase."
      />
    );
  }

  return (
    <TutorialPage
      pageData={pageData}
      selectedLesson={selectedLesson}
      continueLesson={continueLesson}
      activeChapter={activeChapter}
      activeChapterId={activeChapterId}
      onChapterSelect={setActiveChapterId}
      onLessonSelect={handleLessonSelect}
      onMarkComplete={handleMarkComplete}
    />
  );
}
