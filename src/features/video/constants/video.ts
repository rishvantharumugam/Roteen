import type { Dispatch, SetStateAction } from "react";
import type { VideoState } from "@/features/video/services/video";
import { applyAction } from "@/features/video/actions/video";
import { NoteController } from "@/features/notes/actions/notesController";
import { supabase } from '@/lib/supabase/client';

export type VideoQuestionMeta = {
  chapterId: string;
  questionId: string;
  questionTitle: string;
};

type VideoTableName = "video" | "videos";
type VideoDislikeRow = { id: string | number | null; dislike_count: number | null };

let resolvedVideoTableName: VideoTableName | null = null;

async function resolveVideoTableName(): Promise<VideoTableName> {
  if (resolvedVideoTableName) {
    return resolvedVideoTableName;
  }

  const preferred = await supabase.from("video").select("id").limit(1);
  if (!preferred.error) {
    resolvedVideoTableName = "video";
    return resolvedVideoTableName;
  }

  if (preferred.error.code === "PGRST205") {
    const fallback = await supabase.from("videos").select("id").limit(1);
    if (!fallback.error) {
      resolvedVideoTableName = "videos";
      return resolvedVideoTableName;
    }
    throw fallback.error;
  }

  // If table exists but select failed for another reason, still prefer `video` as requested.
  resolvedVideoTableName = "video";
  return resolvedVideoTableName;
}

function isIgnorableNoteError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("no authenticated user found") ||
    message.includes("failed to resolve authenticated user") ||
    message.includes("failed to fetch")
  );
}

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

export async function loadVideoDislikeCount(questionId: string): Promise<number> {
  if (!questionId) {
    return 0;
  }

  try {
    const tableName = await resolveVideoTableName();
    const { data, error } = await supabase
      .from(tableName)
      .select("dislike_count")
      .eq("question_id", questionId)
      .limit(1);

    if (error) {
      throw error;
    }

    const rawCount = data?.[0]?.dislike_count;
    const parsed = Number(rawCount ?? 0);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export async function toggleVideoDislikeCount(
  questionId: string,
  currentlyDisliked: boolean,
): Promise<{ dislikeCount: number; disliked: boolean }> {
  const tableName = await resolveVideoTableName();

  const { data: rows, error: selectError } = await supabase
    .from(tableName)
    .select("id, dislike_count")
    .eq("question_id", questionId)
    .limit(1);

  if (selectError) {
    throw selectError;
  }

  const row = (rows?.[0] ?? null) as VideoDislikeRow | null;
  const currentCount = Number(row?.dislike_count ?? 0);
  const safeCurrentCount = Number.isFinite(currentCount) && currentCount >= 0 ? currentCount : 0;
  const nextDisliked = !currentlyDisliked;
  const nextCount = nextDisliked ? safeCurrentCount + 1 : Math.max(0, safeCurrentCount - 1);

  if (!row?.id) {
    if (!nextDisliked) {
      return { dislikeCount: 0, disliked: false };
    }

    const { error: insertError } = await supabase
      .from(tableName)
      .insert([{ question_id: questionId, dislike_count: nextCount }]);

    if (insertError) {
      throw insertError;
    }

    return { dislikeCount: nextCount, disliked: true };
  }

  const { error: updateError } = await supabase
    .from(tableName)
    .update({ dislike_count: nextCount })
    .eq("id", row.id);

  if (updateError) {
    throw updateError;
  }

  return { dislikeCount: nextCount, disliked: nextDisliked };
}

export function handleNotesChange(
  setState: Dispatch<SetStateAction<VideoState>>,
  value: string,
): void {
  setState((previous) => applyAction(previous, { type: "notes", payload: value }));
}

export function resolveQuestionTitle(
  questions: VideoQuestionMeta[],
  questionId: string | null,
): string | null {
  if (!questionId) return null;
  const question = questions.find((item) => item.questionId === questionId);
  return question?.questionTitle ?? null;
}

export async function loadVideoQuestionNote(
  questionId: string,
  subjectId: string | null,
): Promise<string> {
  try {
    const note = await NoteController.fetchQuestionNote(questionId, subjectId);
    return note?.content ?? "";
  } catch (error) {
    if (isIgnorableNoteError(error)) {
      return "";
    }
    throw error;
  }
}

export async function persistVideoQuestionNote(
  questionId: string,
  subjectId: string | null,
  questionTitle: string,
  content: string,
): Promise<void> {
  try {
    await NoteController.upsertQuestionNote({
      questionId,
      subjectId,
      title: questionTitle,
      content,
      pinned: false,
    });
  } catch (error) {
    if (isIgnorableNoteError(error)) {
      return;
    }
    throw error;
  }
}
