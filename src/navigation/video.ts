import type { Dispatch, SetStateAction } from "react";
import type { VideoState } from "@/service/video";
import { applyAction } from "@/controller/video";

export function handleTabChange(
  setState: Dispatch<SetStateAction<VideoState>>,
  type: "center-tab" | "right-tab",
  value: "notes" | "assistant" | "theory" | "discussion" | "quick_revision",
): void {
  setState((previous) => applyAction(previous, { type, payload: value as never }));
}

export function handleChapterSelect(
  setState: Dispatch<SetStateAction<VideoState>>,
  chapterId: string,
): void {
  setState((previous) => applyAction(previous, { type: "chapter", payload: chapterId }));
}

export function handleQuestionSelect(
  setState: Dispatch<SetStateAction<VideoState>>,
  questionId: string,
): void {
  setState((previous) => applyAction(previous, { type: "question-select", payload: questionId }));
}

export function handleMarkComplete(setState: Dispatch<SetStateAction<VideoState>>): void {
  setState((previous) => applyAction(previous, { type: "mark-complete" }));
}

export function handleLike(setState: Dispatch<SetStateAction<VideoState>>): void {
  setState((previous) => applyAction(previous, { type: "like" }));
}

export function handleDislike(setState: Dispatch<SetStateAction<VideoState>>): void {
  setState((previous) => applyAction(previous, { type: "toggle-dislike" }));
}

export function handleNotesChange(
  setState: Dispatch<SetStateAction<VideoState>>,
  value: string,
): void {
  setState((previous) => applyAction(previous, { type: "notes", payload: value }));
}
