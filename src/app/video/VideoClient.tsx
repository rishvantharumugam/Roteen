"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveVideoPageHeading } from "@/features/video/actions/videoSubjectController";
import {
  hasActiveVideoSubjectFilter,
  parseVideoSubjectFilter,
} from "@/features/video/constants/videoSubjectNavigation";
import { prefetchSubjectPanelData, type VideoSubjectFilter } from "@/features/video/services/videoSubjectService";
import { getVideoResponse } from "@/features/video/actions/video";
import { RevisionController } from "@/features/revision/actions/revisionController";
import {
  handleChapterSelect,
  handleMarkComplete,
  handleNotesChange,
  handleQuestionSelect,
  handleTabChange,
  loadVideoDislikeCount,
  loadVideoQuestionNote,
  persistVideoQuestionNote,
  resolveQuestionTitle,
  toggleVideoDislikeCount,
  type VideoQuestionMeta,
} from "@/features/video/constants/video";
import {
  createPlaylistAndAddQuestion,
  getBookmarkStatus,
  loadUserBookmarkPlaylists,
  toggleQuestionInExistingPlaylist,
} from "@/features/video/constants/videoBookmarkNavigation";
import { type VideoState } from "@/features/video/services/video";
import dynamic from "next/dynamic";
import type { ChapterQuizPhase } from "@/features/video/components/ChapterQuizPanel";

const VideoPageUI = dynamic(() => import("@/features/video/components/video"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-zinc-500">
      Loading video player...
    </div>
  ),
});
import {
  fetchChapterQuiz,
  fetchQuizById,
  fetchQuizQuestions,
  saveQuizAnswers,
  fetchQuizProgress,
  fetchQuizAnswers,
  insertQuizProgress,
  updateQuizProgress,
  fetchChapterQuizzes,
  type ChapterQuizRecord,
  type QuizQuestionRecord,
  type QuizProgressRecord,
} from "@/features/video/services/videoQuizService";
import {
  getActiveChapterId,
  getNextChapterFirstQuestion,
  isLastQuestionInChapter,
} from "@/features/video/utils/chapterQuizNavigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  setSelectedVideoSubject,
  useSelectedVideoSubject,
  type SelectedVideoSubject,
} from "@/features/video/components/videoSubjectStore";
import { useVideoPlaylistContext } from "@/features/video/components/videoPlaylistStore";
import {
  fetchRemoteLearningState,
  persistRemoteLearningState,
  readLearningState,
  writeLearningState,
  type LearningLanguage,
  type LearningMode,
  type LearningState,
} from "@/features/video/components/learningStateStore";

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function isExpectedTransientError(error: unknown): boolean {
  const message = normalizeErrorMessage(error).toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("no authenticated user found") ||
    message.includes("failed to resolve authenticated user")
  );
}

function resolveEffectiveSubjectFilter(
  queryFilter: VideoSubjectFilter,
  cachedSubject: SelectedVideoSubject | null,
): VideoSubjectFilter {
  if (queryFilter.subjectId || queryFilter.subjectSlug || queryFilter.standard) {
    return queryFilter;
  }

  if (!cachedSubject) {
    return queryFilter;
  }

  return {
    subjectId: cachedSubject.id,
    subjectSlug: cachedSubject.slug,
    standard: cachedSubject.standard,
  };
}

export default function VideoClient() {
  const searchParams = useSearchParams();
  const playlistIdFromQuery = searchParams.get("playlistId");
  const playlistContext = useVideoPlaylistContext();
  const querySubjectFilter = useMemo(() => parseVideoSubjectFilter(searchParams), [searchParams]);
  const cachedSelectedSubject = useSelectedVideoSubject();
  const subjectFilter = useMemo(
    () => resolveEffectiveSubjectFilter(querySubjectFilter, cachedSelectedSubject),
    [cachedSelectedSubject, querySubjectFilter],
  );
  const isSubjectFiltered = hasActiveVideoSubjectFilter(subjectFilter);

  const { user, isLoading: isAuthLoading } = useAuth();
  const { data, state: initialState } = useMemo(() => getVideoResponse(), []);
  const [state, setState] = useState<VideoState>(initialState);
  const [resolvedSubject, setResolvedSubject] = useState<{
    id: string;
    name: string;
    standard: string | null;
  } | null>(null);
  const pageHeading = useMemo(
    () => resolveVideoPageHeading(resolvedSubject?.name ?? "Videos", isSubjectFiltered),
    [isSubjectFiltered, resolvedSubject?.name],
  );
  const [theoryFullScreen, setTheoryFullScreen] = useState(false);
  const [orderedQuestions, setOrderedQuestions] = useState<VideoQuestionMeta[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [noteSaveStatus, setNoteSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkPlaylists, setBookmarkPlaylists] = useState<{ id: string; title: string; pinned: boolean; containsCurrentQuestion?: boolean }[]>([]);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isBookmarkSubmitting, setIsBookmarkSubmitting] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [resolvedPlaylistQuestionIds, setResolvedPlaylistQuestionIds] = useState<string[] | null>(null);
  const [resolvedPlaylistTitle, setResolvedPlaylistTitle] = useState<string | null>(null);
  const lastLoadedNoteRef = useRef<{ questionId: string | null; content: string }>({
    questionId: null,
    content: "",
  });
  const chapterQuizCacheRef = useRef<Map<string, ChapterQuizRecord | null>>(new Map());
  const quizStateCacheRef = useRef<Map<string, {
    progress: QuizProgressRecord,
    questions: QuizQuestionRecord[],
    answers: Record<string, string>,
  }>>(new Map());
  const [chapterQuizPhase, setChapterQuizPhase] = useState<ChapterQuizPhase>("landing");
  const [chapterQuiz, setChapterQuiz] = useState<ChapterQuizRecord | null>(null);
  const [chapterQuizLoading, setChapterQuizLoading] = useState(false);
  const [chapterQuizNotFound, setChapterQuizNotFound] = useState(false);
  const [chapterQuizError, setChapterQuizError] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionRecord[]>([]);
  const [quizQuestionsLoading, setQuizQuestionsLoading] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizProgress, setQuizProgress] = useState<QuizProgressRecord | null>(null);
  const [quizProgressLoading, setQuizProgressLoading] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<string | null>(null);
  const [learningStateHydrated, setLearningStateHydrated] = useState(false);
  const [restoredLearningState, setRestoredLearningState] = useState<LearningState | null>(null);
  const [subjectMode, setSubjectMode] = useState<LearningMode>("Bookback");
  const [theoryLanguage, setTheoryLanguage] = useState<LearningLanguage>("English");
  const [sidebarScrollPosition, setSidebarScrollPosition] = useState(0);
  const [videoPosition, setVideoPosition] = useState(0);
  const [visitedQuizQuestions, setVisitedQuizQuestions] = useState<number[]>([0]);
  const [markedQuizQuestions, setMarkedQuizQuestions] = useState<number[]>([]);
  const selectedSubjectId = subjectFilter.subjectId ?? resolvedSubject?.id ?? null;
  const selectedSubjectStandard = subjectFilter.standard ?? resolvedSubject?.standard ?? null;
  const videoStateStorageKey = useMemo(() => {
    const subjectToken = selectedSubjectId ?? `slug:${subjectFilter.subjectSlug ?? "default"}`;
    const playlistToken = playlistIdFromQuery ? `playlist:${playlistIdFromQuery}` : "all";
    return `roteen_video_state_${subjectToken}_${playlistToken}`;
  }, [playlistIdFromQuery, selectedSubjectId, subjectFilter.subjectSlug]);

  const playlistQuestionIds = useMemo(() => {
    if (!playlistIdFromQuery) {
      return null;
    }
    if (!playlistContext || playlistContext.playlistId !== playlistIdFromQuery) {
      return resolvedPlaylistQuestionIds;
    }
    return playlistContext.questionIds;
  }, [playlistContext, playlistIdFromQuery, resolvedPlaylistQuestionIds]);

  useEffect(() => {
    let cancelled = false;

    if (!playlistIdFromQuery) {
      setResolvedPlaylistQuestionIds(null);
      setResolvedPlaylistTitle(null);
      return () => {
        cancelled = true;
      };
    }

    if (playlistContext && playlistContext.playlistId === playlistIdFromQuery) {
      setResolvedPlaylistQuestionIds(playlistContext.questionIds);
      setResolvedPlaylistTitle(playlistContext.playlistTitle);
      return () => {
        cancelled = true;
      };
    }

    const loadPlaylistContext = async () => {
      try {
        const context = await RevisionController.getPlaylistLaunchContext(playlistIdFromQuery);
        if (cancelled) return;
        setResolvedPlaylistQuestionIds(context.questionIds);
        setResolvedPlaylistTitle(context.playlistTitle);
      } catch (error) {
        if (cancelled) return;
        if (!isExpectedTransientError(error)) {
          console.error("Failed to load playlist context:", normalizeErrorMessage(error));
        }
        setResolvedPlaylistQuestionIds(null);
        setResolvedPlaylistTitle(null);
      }
    };

    void loadPlaylistContext();
    return () => {
      cancelled = true;
    };
  }, [playlistContext, playlistIdFromQuery]);

  useEffect(() => {
    const nextId = subjectFilter.subjectId ?? resolvedSubject?.id ?? null;
    if (!nextId) {
      return;
    }

    setSelectedVideoSubject({
      id: nextId,
      slug: subjectFilter.subjectSlug ?? null,
      name: resolvedSubject?.name ?? null,
      standard: selectedSubjectStandard ?? null,
    });
  }, [resolvedSubject?.id, resolvedSubject?.name, selectedSubjectStandard, subjectFilter.subjectId, subjectFilter.subjectSlug]);

  useEffect(() => {
    if (isSubjectFiltered) {
      prefetchSubjectPanelData(subjectFilter);
    }
  }, [isSubjectFiltered, subjectFilter]);

  const onNotesChange = useCallback((value: string) => {
    handleNotesChange(setState, value);
  }, []);

  const isPlaylistMode = Boolean(playlistIdFromQuery);

  const isChapterQuizView = useMemo(() => {
    if (isPlaylistMode) {
      return false;
    }
    return state.selectedQuizId !== null;
  }, [isPlaylistMode, state.selectedQuizId]);

  const activeChapterIdForQuiz = useMemo(
    () => getActiveChapterId(orderedQuestions, state.selectedQuestionId, state.activeChapterId),
    [orderedQuestions, state.selectedQuestionId, state.activeChapterId],
  );

  useEffect(() => {
    if (!learningStateHydrated) {
      return;
    }

    if (!isChapterQuizView) {
      setChapterQuizPhase("landing");
      setQuizQuestionIndex(0);
      setQuizAnswers({});
      setQuizScore({ correct: 0, total: 0 });
      setChapterQuizError(null);
    }
  }, [isChapterQuizView, learningStateHydrated]);

  useEffect(() => {
    if (!isChapterQuizView || !state.selectedQuizId) {
      return;
    }

    const cacheKey = state.selectedQuizId;
    const cachedQuiz = chapterQuizCacheRef.current.get(cacheKey);
    if (cachedQuiz !== undefined) {
      setChapterQuiz(cachedQuiz);
      setChapterQuizNotFound(cachedQuiz === null);
      setChapterQuizLoading(false);
      setChapterQuizError(null);
      return;
    }

    let cancelled = false;
    setChapterQuizLoading(true);
    setChapterQuizError(null);
    setChapterQuizNotFound(false);

    const loadChapterQuiz = async () => {
      try {
        const quiz = await fetchQuizById(state.selectedQuizId!);
        if (cancelled) {
          return;
        }
        chapterQuizCacheRef.current.set(cacheKey, quiz);
        setChapterQuiz(quiz);
        setChapterQuizNotFound(!quiz);
      } catch (error) {
        if (cancelled) {
          return;
        }
        chapterQuizCacheRef.current.set(cacheKey, null);
        setChapterQuiz(null);
        setChapterQuizNotFound(true);
        if (!isExpectedTransientError(error)) {
          setChapterQuizError(normalizeErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setChapterQuizLoading(false);
        }
      }
    };

    void loadChapterQuiz();

    return () => {
      cancelled = true;
    };
  }, [isChapterQuizView, state.selectedQuizId]);

  useEffect(() => {
    if (!learningStateHydrated || restoredLearningState?.quizId === state.selectedQuizId) {
      return;
    }

    if (state.selectedQuizId) {
      const cached = quizStateCacheRef.current.get(state.selectedQuizId);
      if (cached && cached.progress?.iscompleted === "Resolved") {
        return;
      }
    }
    setChapterQuizPhase("landing");
    setQuizQuestionIndex(0);
    setQuizAnswers({});
    setQuizScore({ correct: 0, total: 0 });
    setVisitedQuizQuestions([0]);
    setMarkedQuizQuestions([]);
  }, [activeChapterIdForQuiz, learningStateHydrated, restoredLearningState?.quizId, state.selectedQuestionId, state.selectedQuizId]);

  useEffect(() => {
    if (!chapterQuiz?.id || !user?.id || !state.selectedQuizId) {
      setQuizProgress(null);
      return;
    }

    let cancelled = false;
    const loadProgress = async () => {
      const cachedState = quizStateCacheRef.current.get(chapterQuiz.id);
      if (cachedState && cachedState.progress?.iscompleted === "Resolved") {
        setQuizProgress(cachedState.progress);
        setQuizQuestions(cachedState.questions);
        setQuizAnswers(cachedState.answers);
        setQuizScore({ correct: cachedState.progress.score, total: chapterQuiz.totalQuestions || cachedState.progress.score });
        setChapterQuizPhase("result");
        return;
      }

      setQuizProgressLoading(true);
      try {
        const progress = await fetchQuizProgress(user.id, chapterQuiz.id);
        if (!cancelled) {
          setQuizProgress(progress);
          if (progress?.iscompleted === "Resolved") {
            setQuizScore({ correct: progress.score, total: chapterQuiz.totalQuestions || progress.score });
            
            setQuizQuestionsLoading(true);
            try {
              const [questions, answers] = await Promise.all([
                fetchQuizQuestions(chapterQuiz.id),
                fetchQuizAnswers(user.id, chapterQuiz.id)
              ]);
              if (!cancelled) {
                setQuizQuestions(questions);
                setQuizAnswers(answers);
                setChapterQuizPhase("result");
                quizStateCacheRef.current.set(chapterQuiz.id, {
                  progress,
                  questions,
                  answers,
                });
              }
            } catch (err) {
              console.error("Failed to fetch overview data", err);
            } finally {
              if (!cancelled) setQuizQuestionsLoading(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch quiz progress", err);
      } finally {
        if (!cancelled) setQuizProgressLoading(false);
      }
    };
    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, [chapterQuiz?.id, user?.id, state.selectedQuizId]);

  useEffect(() => {
    if (!chapterQuiz?.id || !state.selectedQuizId || restoredLearningState?.quizId !== chapterQuiz.id) {
      return;
    }

    if (restoredLearningState.currentView === "topic" || quizQuestions.length > 0) {
      return;
    }

    let cancelled = false;
    setQuizQuestionsLoading(true);

    const restoreQuizQuestions = async () => {
      try {
        const questions = await fetchQuizQuestions(chapterQuiz.id);
        if (cancelled) {
          return;
        }

        setQuizQuestions(questions);
        setQuizQuestionIndex(Math.max(0, Math.min(questions.length - 1, restoredLearningState.questionIndex ?? 0)));
        setQuizAnswers(restoredLearningState.selectedAnswers ?? {});
        setVisitedQuizQuestions(
          restoredLearningState.visitedQuestions?.length
            ? restoredLearningState.visitedQuestions
            : [restoredLearningState.questionIndex ?? 0],
        );
        setChapterQuizPhase(restoredLearningState.currentView === "quiz_result" ? "result" : "questions");
      } catch (error) {
        if (!isExpectedTransientError(error)) {
          setChapterQuizError(normalizeErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setQuizQuestionsLoading(false);
        }
      }
    };

    void restoreQuizQuestions();

    return () => {
      cancelled = true;
    };
  }, [chapterQuiz?.id, quizQuestions.length, restoredLearningState, state.selectedQuizId]);

  const getCurrentQuestionMeta = useCallback(() => {
    const selectedQuestionId = state.selectedQuestionId;
    if (!selectedQuestionId) {
      return null;
    }

    const question = orderedQuestions.find((item) => item.questionId === selectedQuestionId);
    const questionTitle =
      resolveQuestionTitle(orderedQuestions, selectedQuestionId) ?? `Question ${selectedQuestionId}`;

    return {
      questionId: selectedQuestionId,
      questionTitle,
      chapterId: question?.chapterId ?? null,
    };
  }, [orderedQuestions, state.selectedQuestionId]);

  useEffect(() => {
    let cancelled = false;
    const localState = readLearningState();

    const applySavedState = (saved: LearningState | null) => {
      if (cancelled) {
        return;
      }

      if (!saved) {
        setLearningStateHydrated(true);
        return;
      }

      setRestoredLearningState(saved);
      setSubjectMode(saved.mode);
      setTheoryLanguage(saved.language ?? "English");
      setSidebarScrollPosition(saved.scrollPosition ?? 0);
      setVideoPosition(saved.videoPosition ?? 0);
      setQuizQuestionIndex(Math.max(0, saved.questionIndex ?? 0));
      setQuizAnswers(saved.selectedAnswers ?? {});
      setVisitedQuizQuestions(saved.visitedQuestions?.length ? saved.visitedQuestions : [saved.questionIndex ?? 0]);
      setMarkedQuizQuestions(saved.markedQuestions ?? []);
      setChapterQuizPhase(saved.currentView === "quiz_result" ? "result" : saved.currentView === "quiz" ? "questions" : "landing");

      setSelectedVideoSubject({
        id: saved.subjectId,
        slug: null,
        name: null,
        standard: selectedSubjectStandard ?? null,
      });

      setState((prev) => ({
        ...prev,
        activeChapterId: saved.chapterId || prev.activeChapterId,
        selectedQuestionId: saved.currentView === "topic" ? saved.topicId ?? prev.selectedQuestionId : null,
        selectedQuizId: saved.currentView === "quiz" || saved.currentView === "quiz_result" ? saved.quizId ?? null : null,
        activeCenterTab: (saved.notesTab as "notes" | "assistant") ?? prev.activeCenterTab,
        activeRightTab: (saved.activeTab as "theory" | "discussion" | "quick_revision") ?? prev.activeRightTab,
        completedQuestions: saved.completedQuestions ?? prev.completedQuestions,
      }));
      setLearningStateHydrated(true);
    };

    applySavedState(localState);

    if (user?.id) {
      void fetchRemoteLearningState(user.id).then((remoteState) => {
        if (!remoteState || cancelled) {
          return;
        }

        const remoteTime = new Date(remoteState.updatedAt ?? 0).getTime();
        const localTime = new Date(localState?.updatedAt ?? 0).getTime();
        if (remoteTime > localTime) {
          writeLearningState(remoteState);
          applySavedState(remoteState);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  // Hydrate once on entry; live changes are persisted by the effect below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!learningStateHydrated || !selectedSubjectId) {
      return;
    }

    const currentView =
      state.selectedQuizId && chapterQuizPhase === "result"
        ? "quiz_result"
        : state.selectedQuizId
          ? "quiz"
          : "topic";

    const nextLearningState: LearningState = {
      subjectId: selectedSubjectId,
      subjectType: subjectMode,
      mode: subjectMode,
      chapterId: state.activeChapterId,
      topicId: state.selectedQuestionId ?? undefined,
      quizId: state.selectedQuizId ?? undefined,
      questionIndex: quizQuestionIndex,
      currentQuestion: quizQuestionIndex,
      currentView,
      activeTab: state.activeRightTab,
      notesTab: state.activeCenterTab,
      language: theoryLanguage,
      theoryView: theoryFullScreen,
      scrollPosition: sidebarScrollPosition,
      videoPosition,
      selectedAnswers: quizAnswers,
      visitedQuestions: visitedQuizQuestions,
      markedQuestions: markedQuizQuestions,
      completedQuestions: state.completedQuestions,
    };

    writeLearningState(nextLearningState);
    localStorage.setItem(
      videoStateStorageKey,
      JSON.stringify({
        activeChapterId: state.activeChapterId,
        selectedQuestionId: state.selectedQuestionId,
        selectedQuizId: state.selectedQuizId,
        completedQuestions: state.completedQuestions,
      }),
    );

    const timeoutId = window.setTimeout(() => {
      if (user?.id) {
        void persistRemoteLearningState(user.id, nextLearningState);
      }
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [
    chapterQuizPhase,
    learningStateHydrated,
    markedQuizQuestions,
    quizAnswers,
    quizQuestionIndex,
    selectedSubjectId,
    sidebarScrollPosition,
    state.activeCenterTab,
    state.activeChapterId,
    state.activeRightTab,
    state.completedQuestions,
    state.selectedQuestionId,
    state.selectedQuizId,
    subjectMode,
    theoryFullScreen,
    theoryLanguage,
    user?.id,
    videoPosition,
    videoStateStorageKey,
    visitedQuizQuestions,
  ]);

  useEffect(() => {
    let cancelled = false;
    const selectedQuestionId = state.selectedQuestionId;

    if (isAuthLoading) {
      setIsNoteLoading(false);
      setNoteSaveStatus("idle");
      return () => {
        cancelled = true;
      };
    }

    if (!user || !selectedQuestionId) {
      onNotesChange("");
      lastLoadedNoteRef.current = { questionId: null, content: "" };
      setIsNoteLoading(false);
      setNoteSaveStatus("idle");
      return () => {
        cancelled = true;
      };
    }

    onNotesChange("");
    setIsNoteLoading(true);
    setNoteSaveStatus("idle");

    const load = async () => {
      try {
        const content = await loadVideoQuestionNote(selectedQuestionId, selectedSubjectId);
        if (cancelled) return;
        onNotesChange(content);
        lastLoadedNoteRef.current = { questionId: selectedQuestionId, content };
      } catch (error) {
        if (cancelled) return;
        if (!isExpectedTransientError(error)) {
          console.error("Failed to load video note:", normalizeErrorMessage(error));
        }
        onNotesChange("");
        lastLoadedNoteRef.current = { questionId: selectedQuestionId, content: "" };
      } finally {
        if (!cancelled) {
          setIsNoteLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, onNotesChange, selectedSubjectId, state.selectedQuestionId, user]);

  useEffect(() => {
    const selectedQuestionId = state.selectedQuestionId;
    if (isAuthLoading || !user || !selectedQuestionId || !autoSaveEnabled || isNoteLoading) {
      if (!autoSaveEnabled) {
        setNoteSaveStatus("idle");
      }
      return;
    }

    const lastLoaded = lastLoadedNoteRef.current;
    if (lastLoaded.questionId === selectedQuestionId && lastLoaded.content === state.notes) {
      setNoteSaveStatus("saved");
      return;
    }

    const questionTitle =
      resolveQuestionTitle(orderedQuestions, selectedQuestionId) ?? `Question ${selectedQuestionId}`;

    const timeoutId = window.setTimeout(async () => {
      try {
        setNoteSaveStatus("saving");
        await persistVideoQuestionNote(selectedQuestionId, selectedSubjectId, questionTitle, state.notes);
        lastLoadedNoteRef.current = { questionId: selectedQuestionId, content: state.notes };
        setNoteSaveStatus("saved");
      } catch (error) {
        setNoteSaveStatus("error");
        if (!isExpectedTransientError(error)) {
          console.error("Failed to persist video note:", normalizeErrorMessage(error));
        }
      }
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoSaveEnabled, isAuthLoading, isNoteLoading, orderedQuestions, selectedSubjectId, state.notes, state.selectedQuestionId, user]);

  useEffect(() => {
    if (!questionsLoaded || !learningStateHydrated) return;

    if (orderedQuestions.length === 0) {
      setState((previous) => {
        if (previous.selectedQuestionId === null && previous.activeChapterId === "") {
          return previous;
        }
        return {
          ...previous,
          activeChapterId: "",
          selectedQuestionId: null,
        };
      });
      return;
    }

    const selectedQuestionStillValid = state.selectedQuestionId
      ? orderedQuestions.some((item) => item.questionId === state.selectedQuestionId)
      : false;

    if (selectedQuestionStillValid) {
      return;
    }

    if (state.selectedQuizId && restoredLearningState?.quizId === state.selectedQuizId) {
      return;
    }

    const firstQuestion = orderedQuestions[0];
    if (!firstQuestion) {
      return;
    }

    setState((previous) => {
      if (previous.selectedQuizId) {
        return previous;
      }

      return {
        ...previous,
        activeChapterId: firstQuestion.chapterId,
        selectedQuestionId: firstQuestion.questionId,
      };
    });
  }, [learningStateHydrated, orderedQuestions, questionsLoaded, restoredLearningState?.quizId, state.selectedQuestionId, state.selectedQuizId]);

  useEffect(() => {
    let cancelled = false;
    const selectedQuestionId = state.selectedQuestionId;

    if (!selectedQuestionId) {
      setState((previous) => ({
        ...previous,
        dislikes: 0,
        disliked: false,
      }));
      return () => {
        cancelled = true;
      };
    }

    const loadDislikeCount = async () => {
      const dbCount = await loadVideoDislikeCount(selectedQuestionId);
      if (cancelled) return;
      setState((previous) => ({
        ...previous,
        dislikes: dbCount,
        disliked: false,
      }));
    };

    void loadDislikeCount();
    return () => {
      cancelled = true;
    };
  }, [state.selectedQuestionId]);

  useEffect(() => {
    let cancelled = false;
    const selectedQuestionId = state.selectedQuestionId;

    if (isAuthLoading || !user || !selectedQuestionId) {
      setIsBookmarked(false);
      return () => {
        cancelled = true;
      };
    }

    const checkBookmark = async () => {
      const status = await getBookmarkStatus(selectedQuestionId);
      if (!cancelled) {
        setIsBookmarked(status);
      }
    };

    void checkBookmark();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, state.selectedQuestionId, user]);

  const handleOpenBookmarkModal = useCallback(async () => {
    if (isAuthLoading || !user || !state.selectedQuestionId) {
      return;
    }

    setBookmarkError(null);
    setIsBookmarkModalOpen(true);
    setIsBookmarkLoading(true);

    try {
      const playlists = await loadUserBookmarkPlaylists(state.selectedQuestionId ?? undefined);
      setBookmarkPlaylists(playlists);
    } catch (error) {
      setBookmarkError(normalizeErrorMessage(error));
      setBookmarkPlaylists([]);
    } finally {
      setIsBookmarkLoading(false);
    }
  }, [isAuthLoading, state.selectedQuestionId, user]);

  const handleCloseBookmarkModal = useCallback(() => {
    setIsBookmarkModalOpen(false);
    setBookmarkError(null);
    setIsBookmarkSubmitting(false);
  }, []);

  const handleSelectExistingPlaylist = useCallback(
    async (playlistId: string) => {
      const context = getCurrentQuestionMeta();
      if (!context) return;

      setBookmarkError(null);
      setIsBookmarkSubmitting(true);
      try {
        await toggleQuestionInExistingPlaylist(playlistId, context);
        const refreshedPlaylists = await loadUserBookmarkPlaylists(state.selectedQuestionId ?? undefined);
        setBookmarkPlaylists(refreshedPlaylists);
        setIsBookmarked(refreshedPlaylists.some((playlist) => Boolean(playlist.containsCurrentQuestion)));
      } catch (error) {
        setBookmarkError(normalizeErrorMessage(error));
      } finally {
        setIsBookmarkSubmitting(false);
      }
    },
    [getCurrentQuestionMeta, state.selectedQuestionId],
  );

  const handleCreateAndAddToPlaylist = useCallback(async () => {
    const context = getCurrentQuestionMeta();
    if (!context) return;

    setBookmarkError(null);
    setIsBookmarkSubmitting(true);
    try {
      await createPlaylistAndAddQuestion(newPlaylistName, context);
      const refreshedPlaylists = await loadUserBookmarkPlaylists(state.selectedQuestionId ?? undefined);
      setBookmarkPlaylists(refreshedPlaylists);
      setIsBookmarked(true);
      setNewPlaylistName("");
      setIsBookmarkModalOpen(false);
    } catch (error) {
      setBookmarkError(normalizeErrorMessage(error));
    } finally {
      setIsBookmarkSubmitting(false);
    }
  }, [getCurrentQuestionMeta, newPlaylistName, state.selectedQuestionId]);

  const activeQuestionIndex = orderedQuestions.findIndex((item) => item.questionId === state.selectedQuestionId);

  const handleQuizSelect = useCallback((quizId: string) => {
    setRestoredLearningState(null);
    setState((prev) => ({
      ...prev,
      selectedQuizId: quizId,
      selectedQuestionId: null,
    }));
    setChapterQuizPhase("landing");
    setQuizQuestionIndex(0);
    setQuizAnswers({});
    setVisitedQuizQuestions([0]);
    setMarkedQuizQuestions([]);
  }, []);

  const handleQuestionSelectWithQuizReset = useCallback((questionId: string) => {
    setRestoredLearningState(null);
    setChapterQuizPhase("landing");
    setState((prev) => ({ ...prev, selectedQuizId: null }));
    handleQuestionSelect(setState, questionId);
  }, []);

  const handleStartChapterQuiz = useCallback(async () => {
    if (!chapterQuiz) {
      return;
    }

    setQuizQuestionsLoading(true);
    setChapterQuizError(null);

    try {
      const questions = await fetchQuizQuestions(chapterQuiz.id);
      setQuizQuestions(questions);
      const restoredIndex = restoredLearningState?.quizId === chapterQuiz.id ? restoredLearningState.questionIndex ?? 0 : 0;
      setQuizQuestionIndex(Math.max(0, Math.min(questions.length - 1, restoredIndex)));
      setQuizAnswers(restoredLearningState?.quizId === chapterQuiz.id ? restoredLearningState.selectedAnswers ?? {} : {});
      setVisitedQuizQuestions(
        restoredLearningState?.quizId === chapterQuiz.id && restoredLearningState.visitedQuestions?.length
          ? restoredLearningState.visitedQuestions
          : [0],
      );

      if (questions.length === 0) {
        setChapterQuizError("No quiz questions available.");
        return;
      }

      if (user?.id) {
        const startTime = new Date().toISOString();
        setQuizStartTime(startTime);
        insertQuizProgress(user.id, chapterQuiz.id, 0, "In_Progress", startTime)
          .then((progress) => setQuizProgress(progress))
          .catch((err) => console.error("Failed to set quiz to In_Progress", err));
      }

      setChapterQuizPhase("questions");
    } catch (error) {
      if (!isExpectedTransientError(error)) {
        setChapterQuizError(normalizeErrorMessage(error));
      }
    } finally {
      setQuizQuestionsLoading(false);
    }
  }, [chapterQuiz, restoredLearningState, user?.id]);

  const handleQuizSelectAnswer = useCallback((questionId: string, optionId: string) => {
    setQuizAnswers((previous) => ({
      ...previous,
      [questionId]: optionId,
    }));
  }, []);

  const handleQuizPreviousQuestion = useCallback(() => {
    setQuizQuestionIndex((previous) => Math.max(0, previous - 1));
  }, []);

  const handleQuizNextQuestion = useCallback(() => {
    setQuizQuestionIndex((previous) => Math.min(quizQuestions.length - 1, previous + 1));
  }, [quizQuestions.length]);

  const handleQuizJumpToQuestion = useCallback((index: number) => {
    setQuizQuestionIndex(Math.max(0, Math.min(quizQuestions.length - 1, index)));
  }, [quizQuestions.length]);

  const handleQuizSubmit = useCallback(async () => {
    let correct = 0;
    const answersToSave = quizQuestions.map((question) => {
      const selectedId = quizAnswers[question.id];
      const isCorrect = selectedId === question.correctOptionId;
      if (isCorrect) {
        correct += 1;
      }
      return {
        questionId: question.id,
        selectedOption: selectedId,
        isCorrect,
      };
    });

    if (user?.id && chapterQuiz?.id) {
      let finalProgress = null;
      const endTime = new Date().toISOString();

      try {
        if (quizProgress) {
          finalProgress = await updateQuizProgress(user.id, chapterQuiz.id, correct, "Resolved", quizStartTime ?? undefined, endTime);
        } else {
          finalProgress = await insertQuizProgress(user.id, chapterQuiz.id, correct, "Resolved", quizStartTime ?? undefined, endTime);
        }
        if (finalProgress) {
          setQuizProgress(finalProgress);
          quizStateCacheRef.current.set(chapterQuiz.id, {
            progress: finalProgress,
            questions: quizQuestions,
            answers: quizAnswers,
          });
        }
      } catch (err) {
        console.error("Failed to save quiz progress:", err);
      }

      try {
        await saveQuizAnswers(user.id, chapterQuiz.id, answersToSave);
      } catch (err) {
        console.error("Failed to save quiz answers:", err);
      }
    }

    setQuizScore({
      correct,
      total: quizQuestions.length,
    });
    setChapterQuizPhase("result");
  }, [quizAnswers, quizQuestions, user?.id, chapterQuiz?.id, quizProgress, quizStartTime]);

  const handleQuizRetry = useCallback(() => {
    setRestoredLearningState(null);
    setQuizQuestionIndex(0);
    setQuizAnswers({});
    setQuizScore({ correct: 0, total: 0 });
    setQuizStartTime(new Date().toISOString());
    setVisitedQuizQuestions([0]);
    setMarkedQuizQuestions([]);
    setChapterQuizPhase("questions");
  }, []);

  const handleQuizContinue = useCallback(() => {
    const nextQuestion = getNextChapterFirstQuestion(orderedQuestions, activeChapterIdForQuiz);
    if (nextQuestion) {
      setState((previous) => ({
        ...previous,
        activeChapterId: nextQuestion.chapterId,
        selectedQuestionId: nextQuestion.questionId,
        selectedQuizId: null,
      }));
      setChapterQuizPhase("landing");
      return;
    }

    setChapterQuizPhase("landing");
  }, [activeChapterIdForQuiz, orderedQuestions]);

  const navigateQuestion = async (direction: "prev" | "next") => {
    if (orderedQuestions.length === 0) return;

    if (isChapterQuizView) {
      if (direction === "next") {
        const nextQuestion = getNextChapterFirstQuestion(orderedQuestions, activeChapterIdForQuiz);
        if (nextQuestion) {
          setState((previous) => ({
            ...previous,
            activeChapterId: nextQuestion.chapterId,
            selectedQuestionId: nextQuestion.questionId,
            selectedQuizId: null,
          }));
          setChapterQuizPhase("landing");
        } else {
           const first = orderedQuestions[0];
           if (first) {
             setState((previous) => ({ ...previous, activeChapterId: first.chapterId, selectedQuestionId: first.questionId, selectedQuizId: null }));
             setChapterQuizPhase("landing");
           }
        }
      } else {
        const chapterQuestions = orderedQuestions.filter(q => q.chapterId === activeChapterIdForQuiz);
        if (chapterQuestions.length > 0) {
          const lastQ = chapterQuestions[chapterQuestions.length - 1];
          setState((previous) => ({
            ...previous,
            activeChapterId: lastQ.chapterId,
            selectedQuestionId: lastQ.questionId,
            selectedQuizId: null,
          }));
        }
      }
      return;
    }

    let targetIndex: number;

    if (activeQuestionIndex < 0) {
      targetIndex = direction === "next" ? 0 : orderedQuestions.length - 1;
    } else {
      if (direction === "next") {
        const isLast = isLastQuestionInChapter(orderedQuestions, state.selectedQuestionId);
        if (isLast && selectedSubjectId) {
          const quizzes = await fetchChapterQuizzes(selectedSubjectId, activeChapterIdForQuiz);
          if (quizzes.length > 0) {
            setState(prev => ({ ...prev, selectedQuizId: quizzes[0].id, selectedQuestionId: null }));
            return;
          }
        }
        targetIndex =
          activeQuestionIndex === orderedQuestions.length - 1
            ? 0
            : activeQuestionIndex + 1;
      } else {
        if (activeQuestionIndex === 0) return;
        
        const currentQ = orderedQuestions[activeQuestionIndex];
        const prevQ = orderedQuestions[activeQuestionIndex - 1];
        if (currentQ.chapterId !== prevQ.chapterId && selectedSubjectId) {
          const quizzes = await fetchChapterQuizzes(selectedSubjectId, prevQ.chapterId);
          if (quizzes.length > 0) {
            setState(prev => ({ ...prev, selectedQuizId: quizzes[0].id, selectedQuestionId: null, activeChapterId: prevQ.chapterId }));
            return;
          }
        }
        
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
      selectedQuizId: null,
    }));
  };

  const handleDislikeClick = useCallback(async () => {
    const selectedQuestionId = state.selectedQuestionId;
    if (!selectedQuestionId) {
      return;
    }

    const previousDisliked = state.disliked;
    const previousCount = state.dislikes;
    const optimisticDisliked = !previousDisliked;
    const optimisticCount = optimisticDisliked
      ? previousCount + 1
      : Math.max(0, previousCount - 1);

    setState((previous) => ({
      ...previous,
      disliked: optimisticDisliked,
      dislikes: optimisticCount,
    }));

    try {
      const result = await toggleVideoDislikeCount(selectedQuestionId, previousDisliked);
      setState((previous) => ({
        ...previous,
        disliked: result.disliked,
        dislikes: result.dislikeCount,
      }));
    } catch (error) {
      console.error("Failed to update dislike count:", normalizeErrorMessage(error));
      setState((previous) => ({
        ...previous,
        disliked: previousDisliked,
        dislikes: previousCount,
      }));
    }
  }, [state.disliked, state.dislikes, state.selectedQuestionId]);

  const handleQuestionsLoaded = useCallback((qs: VideoQuestionMeta[]) => {
    setOrderedQuestions(qs);
    setQuestionsLoaded(true);
  }, []);

  const playlistTitle = playlistContext?.playlistTitle ?? resolvedPlaylistTitle ?? undefined;

  return (
    <VideoPageUI
      data={data}
      state={state}
      subjectFilter={subjectFilter}
      playlistQuestionIds={playlistQuestionIds}
      playlistId={playlistIdFromQuery}
      playlistTitle={playlistTitle}
      isPlaylistMode={isPlaylistMode}
      selectedSubjectId={selectedSubjectId}
      isSubjectFiltered={isSubjectFiltered}
      pageHeading={pageHeading}
      onSubjectResolved={setResolvedSubject}
      theoryFullScreen={theoryFullScreen}
      onChapterSelect={(id: string) => handleChapterSelect(setState, id)}
      onQuestionSelect={handleQuestionSelectWithQuizReset}
      onQuizSelect={handleQuizSelect}
      isChapterQuizView={isChapterQuizView}
      chapterQuizPhase={chapterQuizPhase}
      chapterQuiz={chapterQuiz}
      chapterQuizLoading={chapterQuizLoading || quizProgressLoading}
      chapterQuizNotFound={chapterQuizNotFound}
      chapterQuizError={chapterQuizError}
      quizQuestions={quizQuestions}
      quizQuestionsLoading={quizQuestionsLoading}
      quizQuestionIndex={quizQuestionIndex}
      quizAnswers={quizAnswers}
      quizScore={quizScore}
      quizProgress={quizProgress}
      onStartChapterQuiz={handleStartChapterQuiz}
      onQuizSelectAnswer={handleQuizSelectAnswer}
      onQuizPreviousQuestion={handleQuizPreviousQuestion}
      onQuizNextQuestion={handleQuizNextQuestion}
      onQuizJumpToQuestion={handleQuizJumpToQuestion}
      onQuizSubmit={handleQuizSubmit}
      onQuizRetry={handleQuizRetry}
      onQuizContinue={handleQuizContinue}
      onDislike={handleDislikeClick}
      onMarkComplete={() => handleMarkComplete(setState)}
      onCenterTabChange={(tab: "notes" | "assistant") => handleTabChange(setState, "center-tab", tab)}
      onNotesChange={onNotesChange}
      onRightTabChange={(tab: "theory" | "discussion" | "quick_revision") => handleTabChange(setState, "right-tab", tab)}
      onPreviousQuestion={() => navigateQuestion("prev")}
      onNextQuestion={() => navigateQuestion("next")}
      onQuestionsLoaded={handleQuestionsLoaded}
      onOpenTheoryView={() => setTheoryFullScreen(true)}
      onCloseTheoryView={() => setTheoryFullScreen(false)}
      noteLoading={isNoteLoading}
      autoSaveEnabled={autoSaveEnabled}
      noteSaveStatus={noteSaveStatus}
      onAutoSaveEnabledChange={setAutoSaveEnabled}
      isBookmarked={isBookmarked}
      onBookmarkClick={handleOpenBookmarkModal}
      isBookmarkModalOpen={isBookmarkModalOpen}
      bookmarkPlaylists={bookmarkPlaylists}
      isBookmarkLoading={isBookmarkLoading}
      isBookmarkSubmitting={isBookmarkSubmitting}
      bookmarkError={bookmarkError}
      newPlaylistName={newPlaylistName}
      bookmarkQuestionTitle={getCurrentQuestionMeta()?.questionTitle ?? "Selected Question"}
      onBookmarkClose={handleCloseBookmarkModal}
      onNewPlaylistNameChange={setNewPlaylistName}
      onSelectExistingPlaylist={handleSelectExistingPlaylist}
      onCreateAndAddToPlaylist={handleCreateAndAddToPlaylist}
      currentUser={
        user
          ? {
              id: user.id,
              name:
                (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
                (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
                (user.email ? user.email.split("@")[0] : "You"),
            }
          : null
      }
    />
  );
}
