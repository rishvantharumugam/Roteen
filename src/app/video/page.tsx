"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVideoResponse } from "@/controller/video";
import {
  handleChapterSelect,
  handleDislike,
  handleMarkComplete,
  handleNotesChange,
  handleQuestionSelect,
  handleTabChange,
} from "@/navigation/video";
import { type VideoState } from "@/service/video";
import VideoPageUI from "@/ui/video/video";

export default function Page() {
  const { data, state: initialState } = useMemo(() => getVideoResponse(), []);
  const [state, setState] = useState<VideoState>(initialState);
  const [theoryFullScreen, setTheoryFullScreen] = useState(false);
  const [orderedQuestions, setOrderedQuestions] = useState<{ chapterId: string; questionId: string }[]>([]);
  const onNotesChange = useCallback((value: string) => {
    handleNotesChange(setState, value);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("roteen_video_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => ({
          ...prev,
          activeChapterId: parsed.activeChapterId ?? prev.activeChapterId,
          selectedQuestionId: parsed.selectedQuestionId ?? prev.selectedQuestionId,
          completedQuestions: parsed.completedQuestions ?? prev.completedQuestions,
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "roteen_video_state",
      JSON.stringify({
        activeChapterId: state.activeChapterId,
        selectedQuestionId: state.selectedQuestionId,
        completedQuestions: state.completedQuestions,
      })
    );
  }, [state.activeChapterId, state.selectedQuestionId, state.completedQuestions]);
  const activeQuestionIndex = orderedQuestions.findIndex((item) => item.questionId === state.selectedQuestionId);

  const navigateQuestion = (direction: "prev" | "next") => {
    if (orderedQuestions.length === 0) return;

    let targetIndex: number;

    if (activeQuestionIndex < 0) {
      targetIndex = direction === "next" ? 0 : orderedQuestions.length - 1;
    } else {
      if (direction === "next") {
        targetIndex =
          activeQuestionIndex === orderedQuestions.length - 1
            ? 0
            : activeQuestionIndex + 1;
      } else {
        if (activeQuestionIndex === 0) return;
        targetIndex = activeQuestionIndex - 1;
      }
    }

    const target = orderedQuestions[targetIndex];

    if (!target) {
      return;
    }

    setState((previous) => ({
      ...previous,
      activeChapterId: target.chapterId,
      selectedQuestionId: target.questionId,
    }));
  };

  return (
    <VideoPageUI
      data={data}
      state={state}
      theoryFullScreen={theoryFullScreen}
      onChapterSelect={(id) => handleChapterSelect(setState, id)}
      onQuestionSelect={(id) => handleQuestionSelect(setState, id)}
      onDislike={() => handleDislike(setState)}
      onMarkComplete={() => handleMarkComplete(setState)}
      onCenterTabChange={(tab) => handleTabChange(setState, "center-tab", tab)}
      onNotesChange={onNotesChange}
      onRightTabChange={(tab) => handleTabChange(setState, "right-tab", tab)}
      onPreviousQuestion={() => navigateQuestion("prev")}
      onNextQuestion={() => navigateQuestion("next")}
      onQuestionsLoaded={setOrderedQuestions}
      onOpenTheoryView={() => setTheoryFullScreen(true)}
      onCloseTheoryView={() => setTheoryFullScreen(false)}
    />
  );
}
