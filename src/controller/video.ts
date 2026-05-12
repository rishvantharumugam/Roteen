import {
  createInitialState,
  fetchSubjectChaptersQuestionsByMode,
  getVideoData,
  markVideoCompleted,
  reduceVideoState,
  setNotesValue,
} from "@/service/video";
import type { Chapter, QuestionMode, VideoAction, VideoData, VideoState } from "@/service/video";

export interface SubjectPanelData {
  subject: string;
  totalQuestions: number;
  chapters: Chapter[];
}

export function getVideoResponse(): { data: VideoData; state: VideoState } {
  const data = getVideoData();
  const state = createInitialState(data);
  return { data, state };
}

export function getVideoDataResponse(): VideoData {
  return getVideoData();
}

export async function getSubjectPanelData(mode: QuestionMode = "Bookback"): Promise<SubjectPanelData> {
  const groupedData = await fetchSubjectChaptersQuestionsByMode(mode);
  if (!groupedData) {
    return {
      subject: "Math",
      totalQuestions: 0,
      chapters: [],
    };
  }

  const chapters: Chapter[] = groupedData.chapters.map((chapter) => ({
    id: chapter.chapter_id,
    label: `Chapter ${chapter.chapter_no}`,
    title: chapter.chapter_name,
    completion: 0,
    topics: chapter.questions.map((question) => ({
      id: question.id,
      title: question.question_name,
    })),
  }));
  const totalQuestions = chapters.reduce((count, chapter) => count + chapter.topics.length, 0);

  return {
    subject: groupedData.subject_name,
    totalQuestions,
    chapters,
  };
}

export function markCompleted(state: VideoState): VideoState {
  return markVideoCompleted(state);
}

export function notesResponse(state: VideoState, value: string): VideoState {
  return setNotesValue(state, value);
}

export function applyAction(state: VideoState, action: VideoAction): VideoState {
  return reduceVideoState(state, action);
}
