"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveVideoPageHeading } from "@/controller/videoSubjectController";
import {
  hasActiveVideoSubjectFilter,
  parseVideoSubjectFilter,
} from "@/navigation/videoSubjectNavigation";
import { prefetchSubjectPanelData, type VideoSubjectFilter } from "@/service/videoSubjectService";
import { getVideoResponse } from "@/controller/video";
import { RevisionController } from "@/controller/revisionController";
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
} from "@/navigation/video";
import {
  createPlaylistAndAddQuestion,
  getBookmarkStatus,
  loadUserBookmarkPlaylists,
  toggleQuestionInExistingPlaylist,
} from "@/navigation/videoBookmarkNavigation";
import { type VideoState } from "@/service/video";
import VideoPageUI from "@/ui/video/video";
import { useAuth } from "@/providers/AuthProvider";
import {
  setSelectedVideoSubject,
  useSelectedVideoSubject,
  type SelectedVideoSubject,
} from "@/store/video/videoSubjectStore";
import { useVideoPlaylistContext } from "@/store/video/videoPlaylistStore";

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

export default function Page() {
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
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
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
    try {
      const saved = localStorage.getItem(videoStateStorageKey);
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
  }, [videoStateStorageKey]);

  useEffect(() => {
    localStorage.setItem(
      videoStateStorageKey,
      JSON.stringify({
        activeChapterId: state.activeChapterId,
        selectedQuestionId: state.selectedQuestionId,
        completedQuestions: state.completedQuestions,
      })
    );
  }, [state.activeChapterId, state.selectedQuestionId, state.completedQuestions, videoStateStorageKey]);

  useEffect(() => {
    let cancelled = false;
    const selectedQuestionId = state.selectedQuestionId;

    if (isAuthLoading) {
      setIsNoteLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (!user || !selectedQuestionId) {
      onNotesChange("");
      lastLoadedNoteRef.current = { questionId: null, content: "" };
      setIsNoteLoading(false);
      return () => {
        cancelled = true;
      };
    }

    onNotesChange("");
    setIsNoteLoading(true);

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
      return;
    }

    const lastLoaded = lastLoadedNoteRef.current;
    if (lastLoaded.questionId === selectedQuestionId && lastLoaded.content === state.notes) {
      return;
    }

    const questionTitle =
      resolveQuestionTitle(orderedQuestions, selectedQuestionId) ?? `Question ${selectedQuestionId}`;

    const timeoutId = window.setTimeout(async () => {
      try {
        await persistVideoQuestionNote(selectedQuestionId, selectedSubjectId, questionTitle, state.notes);
        lastLoadedNoteRef.current = { questionId: selectedQuestionId, content: state.notes };
      } catch (error) {
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

    const firstQuestion = orderedQuestions[0];
    if (!firstQuestion) {
      return;
    }

    setState((previous) => ({
      ...previous,
      activeChapterId: firstQuestion.chapterId,
      selectedQuestionId: firstQuestion.questionId,
    }));
  }, [orderedQuestions, state.selectedQuestionId]);

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

  // Determine if user is in playlist mode or subject learning mode
  const isPlaylistMode = Boolean(playlistIdFromQuery);
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
      onChapterSelect={(id) => handleChapterSelect(setState, id)}
      onQuestionSelect={(id) => handleQuestionSelect(setState, id)}
      onDislike={handleDislikeClick}
      onMarkComplete={() => handleMarkComplete(setState)}
      onCenterTabChange={(tab) => handleTabChange(setState, "center-tab", tab)}
      onNotesChange={onNotesChange}
      onRightTabChange={(tab) => handleTabChange(setState, "right-tab", tab)}
      onPreviousQuestion={() => navigateQuestion("prev")}
      onNextQuestion={() => navigateQuestion("next")}
      onQuestionsLoaded={setOrderedQuestions}
      onOpenTheoryView={() => setTheoryFullScreen(true)}
      onCloseTheoryView={() => setTheoryFullScreen(false)}
      noteLoading={isNoteLoading}
      autoSaveEnabled={autoSaveEnabled}
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
