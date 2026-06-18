"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ThumbsDown, Bug, Bookmark, Star, MoreHorizontal } from "lucide-react";
import type { VideoData, VideoState, QuestionMode } from "@/features/video/services/video";
import type { VideoSubjectFilter } from "@/features/video/services/videoSubjectService";

import SubjectBar from "@/features/video/components/SubjectBar";
import PlaylistSidebar from "@/features/video/components/PlaylistSidebar";
import { HeaderSettingsMenu } from "@/components/layout/HeaderSettingsMenu";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { supabase } from '@/lib/supabase/client';
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import dynamic from "next/dynamic";
const TheoryContent = dynamic(() => import("@/features/video/components/TheoryContent"), { ssr: false });
import DiscussionContent from "@/features/video/components/DiscussionContent";
import RichTextEditor from "@/features/video/components/RichTextEditor";
import BookmarkPlaylistModal from "@/features/video/components/BookmarkPlaylistModal";
import ChapterQuizPanel, { type ChapterQuizPhase } from "@/features/video/components/ChapterQuizPanel";
import type { ChapterQuizRecord, QuizQuestionRecord, QuizProgressRecord } from "@/features/video/services/videoQuizService";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { fetchQuestionLevel } from "@/features/video/services/videoProgressService";
import ResizableDivider from "@/features/video/components/ResizableDivider";

const MIN_THEORY_PANEL_WIDTH = 30;
const MAX_THEORY_PANEL_WIDTH = 70;
const DEFAULT_THEORY_PANEL_WIDTH = 55;
const OPEN_SUBJECT_THEORY_PANEL_WIDTH = 55;

function clampTheoryPanelWidth(width: number) {
  return Math.min(MAX_THEORY_PANEL_WIDTH, Math.max(MIN_THEORY_PANEL_WIDTH, width));
}

interface VideoPageUIProps {
  data: VideoData;
  state: VideoState;
  subjectFilter?: VideoSubjectFilter;
  initialVideoProgress?: number;
  onVideoProgressUpdate?: (seconds: number, videoId?: string | null) => void;
  playlistQuestionIds?: string[] | null;
  playlistId?: string | null;
  playlistTitle?: string;
  isPlaylistMode?: boolean;
  selectedSubjectId?: string | null;
  isSubjectFiltered?: boolean;
  pageHeading?: string | null;
  mode: QuestionMode;
  onModeChange: (mode: QuestionMode) => void;
  onSubjectResolved?: (subject: { id: string; name: string; standard: string | null }) => void;
  theoryFullScreen: boolean;
  onChapterSelect: (chapterId: string) => void;
  onQuestionSelect: (questionId: string) => void;
  onQuizSelect: (quizId: string) => void;
  onDislike: () => void;
  onMarkComplete: () => void;
  onCenterTabChange: (tab: "notes" | "assistant") => void;
  onNotesChange: (value: string) => void;
  onRightTabChange: (tab: "theory" | "discussion" | "quick_revision") => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onQuestionsLoaded: (questions: { chapterId: string; questionId: string; questionTitle: string }[]) => void;
  onOpenTheoryView: () => void;
  onCloseTheoryView: () => void;
  noteLoading: boolean;
  autoSaveEnabled: boolean;
  noteSaveStatus?: "idle" | "saving" | "saved" | "error";
  onAutoSaveEnabledChange: (enabled: boolean) => void;
  isChapterQuizView?: boolean;
  chapterQuizPhase?: ChapterQuizPhase;
  chapterQuiz?: ChapterQuizRecord | null;
  chapterQuizLoading?: boolean;
  chapterQuizNotFound?: boolean;
  chapterQuizError?: string | null;
  quizProgress?: QuizProgressRecord | null;
  quizQuestions: QuizQuestionRecord[];
  quizQuestionsLoading: boolean;
  quizQuestionIndex?: number;
  quizAnswers?: Record<string, string>;
  quizScore?: { correct: number; total: number };
  onStartChapterQuiz?: () => void;
  onQuizSelectAnswer?: (questionId: string, optionId: string) => void;
  onQuizPreviousQuestion?: () => void;
  onQuizNextQuestion?: () => void;
  onQuizJumpToQuestion?: (index: number) => void;
  onQuizSubmit?: () => void;
  onQuizRetry?: () => void;
  onQuizContinue?: () => void;
  isBookmarked: boolean;
  onBookmarkClick: () => void;
  isBookmarkModalOpen: boolean;
  bookmarkPlaylists: { id: string; title: string; pinned: boolean; containsCurrentQuestion?: boolean }[];
  isBookmarkLoading: boolean;
  isBookmarkSubmitting: boolean;
  bookmarkError: string | null;
  newPlaylistName: string;
  bookmarkQuestionTitle: string;
  onBookmarkClose: () => void;
  onNewPlaylistNameChange: (value: string) => void;
  onSelectExistingPlaylist: (playlistId: string) => void;
  onCreateAndAddToPlaylist: () => void;
  currentUser?: { id: string; name: string } | null;
  videoUrl?: string | null;
  videoId?: string | null;
  isVideoLoading?: boolean;
  onVideoPlay?: () => void;
  onVideoPause?: (seconds: number) => void;
  onVideoEnded?: (seconds: number) => void;
  onVideoSeeked?: (seconds: number) => void;
}

function StarRating({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5 px-3 py-1 bg-zinc-900/80 rounded-full border border-zinc-800 shadow-inner" title="Priority level">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= level;
        return (
          <div
            key={star}
            className="p-1"
            aria-label={isFilled ? "Filled star" : "Empty star"}
          >
            <Star
              className={`h-4 w-4 ${isFilled
                ? "fill-[#FFB800] text-[#FFB800] drop-shadow-[0_0_8px_rgba(255,184,0,0.5)]"
                : "fill-transparent text-zinc-600"
                } transition-all duration-200`}
              strokeWidth={2}
            />
          </div>
        );
      })}
    </div>
  );
}



export default function VideoPageUI({
  data,
  state,
  subjectFilter,
  playlistQuestionIds = null,
  playlistId = null,
  playlistTitle,
  isPlaylistMode = false,
  selectedSubjectId = null,
  isSubjectFiltered = false,
  pageHeading = null,
  onSubjectResolved,
  onChapterSelect,
  onQuestionSelect,
  onQuizSelect,
  onDislike,
  onMarkComplete,
  onCenterTabChange,
  onNotesChange,
  onRightTabChange,
  onPreviousQuestion,
  onNextQuestion,
  onQuestionsLoaded,
  onOpenTheoryView,
  onCloseTheoryView,
  noteLoading,
  autoSaveEnabled,
  noteSaveStatus = "idle",
  onAutoSaveEnabledChange,
  isChapterQuizView = false,
  chapterQuizPhase = "landing",
  chapterQuiz = null,
  chapterQuizLoading = false,
  chapterQuizNotFound = false,
  chapterQuizError = null,
  quizQuestions = [],
  quizQuestionsLoading = false,
  quizQuestionIndex = 0,
  quizAnswers = {},
  quizScore = { correct: 0, total: 0 },
  quizProgress = null,
  onStartChapterQuiz = () => { },
  onQuizSelectAnswer = () => { },
  onQuizPreviousQuestion = () => { },
  onQuizNextQuestion = () => { },
  onQuizJumpToQuestion = () => { },
  onQuizSubmit = () => { },
  onQuizRetry = () => { },
  onQuizContinue = () => { },
  isBookmarked,
  onBookmarkClick,
  isBookmarkModalOpen,
  bookmarkPlaylists,
  isBookmarkLoading,
  isBookmarkSubmitting,
  bookmarkError,
  newPlaylistName,
  bookmarkQuestionTitle,
  onBookmarkClose,
  onNewPlaylistNameChange,
  onSelectExistingPlaylist,
  onCreateAndAddToPlaylist,
  currentUser = null,
  mode,
  onModeChange,
  initialVideoProgress = 0,
  onVideoProgressUpdate,
  videoUrl = null,
  videoId: selectedVideoId = null,
  isVideoLoading = false,
  onVideoPlay,
  onVideoPause,
  onVideoEnded,
  onVideoSeeked,
}: VideoPageUIProps) {
  const { theme, resolvedTheme } = useTheme();
  const [theoryViewEnabled, setTheoryViewEnabled] = useState(false);
  const [theoryLanguage, setTheoryLanguage] = useState<"English" | "Tamil">("English");
  const theoryScrollRef = useRef<HTMLDivElement>(null);
  const [questionLevel, setQuestionLevel] = useState<number>(0);
  const [activeMobileTab, setActiveMobileTab] = useState<"index" | "video" | "theory">("video");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubjectPanelCollapsed, setIsSubjectPanelCollapsed] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [theoryPanelWidth, setTheoryPanelWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_THEORY_PANEL_WIDTH;

    const savedWidth = window.localStorage.getItem("theoryPanelWidth_v2");
    const parsedWidth = Number(savedWidth);
    return Number.isFinite(parsedWidth) ? clampTheoryPanelWidth(parsedWidth) : DEFAULT_THEORY_PANEL_WIDTH;
  });
  const [isResizingTheoryPanel, setIsResizingTheoryPanel] = useState(false);

  const persistTheoryPanelWidth = useCallback((width: number) => {
    const nextWidth = clampTheoryPanelWidth(width);
    setTheoryPanelWidth(nextWidth);
    window.localStorage.setItem("theoryPanelWidth_v2", String(nextWidth));
  }, []);

  const updateTheoryPanelWidthFromPointer = useCallback((clientX: number) => {
    const container = splitContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;

    const rawWidth = ((rect.right - clientX) / rect.width) * 100;
    persistTheoryPanelWidth(rawWidth);
  }, [persistTheoryPanelWidth]);

  const handleQuestionSelect = (questionId: string) => {
    onQuestionSelect(questionId);
    setActiveMobileTab("video");
  };

  const handleQuizSelect = (quizId: string) => {
    onQuizSelect(quizId);
    setActiveMobileTab("video");
  };

  // Fetch only the question level for the selected question
  useEffect(() => {
    let isMounted = true;
    if (!state.selectedQuestionId) {
      setQuestionLevel(0);
      return;
    }
    setQuestionLevel(0);
    fetchQuestionLevel(state.selectedQuestionId)
      .then((level) => {
        if (isMounted) {
          setQuestionLevel(level);
        }
      })
      .catch((err) => {
        console.warn("Error fetching question level:", err);
        if (isMounted) {
          setQuestionLevel(0);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [state.selectedQuestionId]);

  useEffect(() => {
    if (theoryScrollRef.current) {
      theoryScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.selectedQuestionId, theoryLanguage]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isResizingTheoryPanel) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    const handlePointerMove = (event: PointerEvent) => {
      updateTheoryPanelWidthFromPointer(event.clientX);
    };

    const handlePointerUp = () => {
      setIsResizingTheoryPanel(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizingTheoryPanel, updateTheoryPanelWidthFromPointer]);

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme !== "light";

  const handleTheoryToggle = () => {
    const nextValue = !theoryViewEnabled;
    setTheoryViewEnabled(nextValue);
    if (nextValue) {
      onOpenTheoryView();
    } else {
      onCloseTheoryView();
    }
  };

  const handleTheoryResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizingTheoryPanel(true);
    updateTheoryPanelWidthFromPointer(event.clientX);
  };

  const resetTheoryPanelWidth = () => {
    persistTheoryPanelWidth(DEFAULT_THEORY_PANEL_WIDTH);
  };

  const activeTheoryPanelWidth = isSubjectPanelCollapsed ? theoryPanelWidth : OPEN_SUBJECT_THEORY_PANEL_WIDTH;
  const videoPanelWidth = 100 - activeTheoryPanelWidth;
  const splitPanelTransition = isResizingTheoryPanel ? "none" : "width 0.2s ease, flex-basis 0.2s ease";
  const splitContainerStyle = {
    "--video-panel-width": `${videoPanelWidth}%`,
    "--theory-panel-width": `${activeTheoryPanelWidth}%`,
  } as CSSProperties;
  const splitChildStyle = {
    transition: splitPanelTransition,
  };

  const selectedQuestionCompleted =
    state.selectedQuestionId !== null && state.completedQuestions.includes(state.selectedQuestionId);
  const canMarkSelectedQuestion = state.selectedQuestionId !== null;

  const navRouteMap: Record<string, string> = {
    home: "/",
    dashboard: "/dashboard",
    notes: "/notes",
    revision: "/revision",
    videos: "/video",
    news: "/news",
    "sessions-link": "/session",
  };

  return (
    <main className={`bg-black text-zinc-200 min-h-screen video-smooth dark box-border w-full max-w-[100vw] min-h-screen overflow-hidden  text-zinc-100 box-border flex h-screen flex-col overflow-hidden`}>
      <header className="sticky top-0 z-20 flex h-[72px] min-h-[72px] shrink-0 w-full items-center justify-between bg-black px-4 md:px-8 gap-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3 shrink-0 relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#7c3aed] to-[#a855f7] text-xl font-bold text-white shrink-0">R</div>
          <h1 className="text-lg font-semibold tracking-tight text-[#a855f7] hidden sm:block shrink-0">{data.brand}</h1>

          {/* Mobile three-dot menu trigger */}
          <div className="md:hidden relative" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] border border-zinc-800 text-[#A1A1AA] hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Navigation menu"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {isMobileMenuOpen && (
              <div className="absolute left-0 mt-2 z-[100] w-48 rounded-xl border border-zinc-800 bg-[#121212] py-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                {data.menu.filter((item) => item.label !== "Profile").map((item) => {
                  const targetHref = navRouteMap[item.id];
                  return targetHref ? (
                    <Link
                      key={item.id}
                      href={targetHref}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        applyRouteThemeClass(targetHref);
                      }}
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-zinc-800/30 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      key={item.id}
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-zinc-800/30 transition-colors"
                    >
                      {item.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 text-sm font-medium">
          {data.menu.filter((item) => item.label !== "Profile").map((item) => (
            navRouteMap[item.id] ? (
              <Link
                key={item.id}
                href={navRouteMap[item.id]}
                prefetch
                onClick={() => applyRouteThemeClass(navRouteMap[item.id])}
                className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.id} className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:text-zinc-100">
                {item.label}
              </span>
            )
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3.5 sm:gap-6 text-[#A1A1AA] shrink-0">
          <button
            suppressHydrationWarning
            type="button"
            aria-label="Toggle theme"
            onClick={() => { }} // Disabled function of light theme for now
            className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white"
          >
            {isDark ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <NotificationDropdown />

          <HeaderSettingsMenu />
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex border-b border-zinc-800 bg-[#0c0c0e] lg:hidden shrink-0">
        <button
          type="button"
          onClick={() => setActiveMobileTab("index")}
          className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider uppercase transition-colors ${activeMobileTab === "index"
            ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
            : "text-zinc-400 hover:text-zinc-200"
            }`}
        >
          Index
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("video")}
          className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider uppercase transition-colors ${activeMobileTab === "video"
            ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
            : "text-zinc-400 hover:text-zinc-200"
            }`}
        >
          Video & Notes
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("theory")}
          className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider uppercase transition-colors ${activeMobileTab === "theory"
            ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
            : "text-zinc-400 hover:text-zinc-200"
            }`}
        >
          Theory
        </button>
      </div>

      <motion.div className="box-border flex flex-col lg:flex-row flex-1 min-w-0 overflow-hidden px-4 pb-4 pt-4">
        {/* Subject Panel / Playlist Panel */}
        <div
          className={`transition-all duration-300 ease-in-out flex shrink-0 
            ${theoryViewEnabled
              ? "w-0 opacity-0 -translate-x-8 overflow-hidden pointer-events-none"
              : isSubjectPanelCollapsed
                ? "w-0 opacity-0 -translate-x-8 overflow-hidden pointer-events-none hidden lg:flex"
                : `w-full lg:w-[380px] lg:shrink-0 opacity-100 translate-x-0 lg:pr-4 ${activeMobileTab === "index" ? "flex" : "hidden lg:flex"}`
            }`}
        >
          {isPlaylistMode && playlistId ? (
            <PlaylistSidebar
              playlistId={playlistId}
              playlistTitle={playlistTitle}
              playlistQuestionIds={playlistQuestionIds}
              selectedQuestionId={state.selectedQuestionId}
              completedQuestions={state.completedQuestions}
              onQuestionSelect={handleQuestionSelect}
              onQuestionsLoaded={onQuestionsLoaded}
              onCollapse={() => setIsSubjectPanelCollapsed(true)}
            />
          ) : (
            <div className="w-full h-full min-w-[200px]">
              <SubjectBar
                subjectFilter={subjectFilter}
                playlistQuestionIds={playlistQuestionIds}
                isSubjectFiltered={isSubjectFiltered}
                isPlaylistMode={isPlaylistMode}
                activeChapterId={state.activeChapterId}
                selectedQuestionId={state.selectedQuestionId}
                selectedQuizId={state.selectedQuizId}
                completedQuestions={state.completedQuestions}
                mode={mode}
                onModeChange={onModeChange}
                onChapterSelect={onChapterSelect}
                onQuestionSelect={handleQuestionSelect}
                onQuizSelect={onQuizSelect}
                onQuestionsLoaded={onQuestionsLoaded}
                onSubjectResolved={onSubjectResolved}
                onCollapse={() => setIsSubjectPanelCollapsed(true)}
              />
            </div>
          )}
        </div>

        {isChapterQuizView ? (
          <div
            className={`relative transition-all duration-300 ease-in-out flex shrink-0 ${theoryViewEnabled
              ? "w-0 opacity-0 -translate-x-8 overflow-hidden pointer-events-none"
              : `flex-1 min-w-0 opacity-100 translate-x-0 ${activeMobileTab === "video" ? "flex" : "hidden lg:flex"}`
              }`}
          >
            {isSubjectPanelCollapsed && !theoryViewEnabled && (
              <button
                type="button"
                onClick={() => setIsSubjectPanelCollapsed(false)}
                className="hidden lg:flex absolute top-1/2 -left-2 -translate-y-1/2 z-10 items-center justify-center h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                title="Expand Subject Panel"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            <ChapterQuizPanel
              phase={chapterQuizPhase}
              quiz={chapterQuiz}
              chapterTitle={data.chapters.find((c) => c.id === state.activeChapterId)?.title}
              loading={chapterQuizLoading}
              notFound={chapterQuizNotFound}
              errorMessage={chapterQuizError}
              questions={quizQuestions}
              questionsLoading={quizQuestionsLoading}
              currentQuestionIndex={quizQuestionIndex}
              selectedAnswers={quizAnswers}
              score={quizScore}
              quizProgress={quizProgress}
              onStartQuiz={onStartChapterQuiz}
              onSelectAnswer={onQuizSelectAnswer}
              onPreviousQuestion={onQuizPreviousQuestion}
              onNextQuestion={onQuizNextQuestion}
              onJumpToQuestion={onQuizJumpToQuestion}
              onSubmitQuiz={onQuizSubmit}
              onRetryQuiz={onQuizRetry}
              onContinueAfterResult={onQuizContinue}
              onGlobalPrevious={onPreviousQuestion}
              onGlobalNext={onNextQuestion}
            />
          </div>
        ) : (
          <>
            <div
              ref={splitContainerRef}
              className={`relative min-w-0 flex-1 ${theoryViewEnabled
                ? "flex"
                : `flex-col md:flex-row ${activeMobileTab === "index" ? "hidden lg:flex" : "flex"}`
                } ${isResizingTheoryPanel ? "select-none" : ""}`}
              style={splitContainerStyle}
            >
              {/* Center Panel (Video/Notes) */}
              <div
                className={`relative flex min-w-0 shrink-0 transition-all duration-300 ease-in-out 
            ${theoryViewEnabled
                    ? "w-0 opacity-0 -translate-x-8 overflow-hidden pointer-events-none"
                    : `w-full md:w-[var(--video-panel-width)] md:basis-[var(--video-panel-width)] opacity-100 translate-x-0 md:pr-2 ${activeMobileTab === "video" ? "flex" : "hidden md:flex"}`
                  }`}
                style={splitChildStyle}
              >
                {isSubjectPanelCollapsed && !theoryViewEnabled && (
                  <button
                    type="button"
                    onClick={() => setIsSubjectPanelCollapsed(false)}
                    className="hidden lg:flex absolute top-1/2 -left-2 -translate-y-1/2 z-10 items-center justify-center h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    title="Expand Subject Panel"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
                <section className="animate-fade-in-up box-border flex h-full w-full min-w-[300px] shrink-0 flex-col overflow-hidden delay-[80ms]">
                  <div className="h-1/2 min-h-0 overflow-hidden pr-1">
                    <div className="rounded-2xl border border-zinc-800/90 bg-[#121212] shadow-[0_18px_36px_rgba(0,0,0,0.42)] flex h-full min-h-0 flex-col overflow-hidden">
                      <div className="m-3 flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-500 overflow-hidden">
                        {isVideoLoading ? null : videoUrl ? (
                          <CustomVideoPlayer
                            key={videoUrl}
                            url={videoUrl}
                            videoId={selectedVideoId}
                            initialProgress={initialVideoProgress}
                            onProgressUpdate={(seconds) => {
                              if (onVideoProgressUpdate) {
                                onVideoProgressUpdate(seconds, selectedVideoId);
                              }
                            }}
                            onPlay={onVideoPlay}
                            onPause={onVideoPause}
                            onEnded={onVideoEnded}
                            onSeeked={onVideoSeeked}
                          />
                        ) : (
                          <>
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-base">?</div>
                            <p className="text-base font-medium text-zinc-300">No video available</p>
                            <p className="mt-2 text-sm text-zinc-500">Content will appear here when available</p>
                          </>
                        )}
                      </div>
                      <div className="shrink-0">
                        <div className="flex items-center justify-between px-2 py-2 relative overflow-x-auto no-scrollbar flex-nowrap w-full">
                          <div className="flex items-center gap-3 sm:gap-4 justify-start shrink-0">
                            <button
                              type="button"
                              onClick={onDislike}
                              className={`flex items-center justify-center gap-1 transition hover:text-red-400 ${state.disliked ? "text-purple-500" : "text-zinc-400"}`}
                            >
                              <ThumbsDown className={`h-5 w-5 shrink-0 ${state.disliked ? "fill-purple-500 text-purple-500" : "fill-transparent text-zinc-400"}`} />
                              <span className="text-sm font-medium tabular-nums truncate">{state.dislikes}</span>
                            </button>
                            <span className="h-4 border-l border-zinc-700 shrink-0" />
                            <Link
                              href="/bug"
                              prefetch
                              onClick={() => applyRouteThemeClass("/bug")}
                              title="Report a bug"
                              aria-label="Report a bug"
                              className="flex translate-x-0 items-center justify-center text-zinc-400 transition hover:text-red-400 shrink-0"
                            >
                              <Bug className="h-4 w-4" />
                            </Link>
                            <span className="h-4 border-l border-zinc-700 shrink-0" />
                            <button
                              type="button"
                              title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                              onClick={onBookmarkClick}
                              className={`flex items-center justify-center transition shrink-0 ${isBookmarked ? "text-purple-400" : "text-zinc-400 hover:text-purple-400"
                                }`}
                            >
                              <Bookmark
                                className={`h-4 w-4 ${isBookmarked ? "fill-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.45)]" : "fill-transparent"
                                  }`}
                                strokeWidth={2}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-center shrink-0 px-2 sm:px-4">
                            <StarRating level={questionLevel} />
                          </div>

                          <div className="flex items-center gap-3 sm:gap-4 justify-end shrink-0">
                            <label className="flex cursor-pointer items-center justify-center shrink-0">
                              <input
                                type="checkbox"
                                title={selectedQuestionCompleted ? "Completed" : "Mark as Completed"}
                                aria-label={selectedQuestionCompleted ? "Completed" : "Mark as Completed"}
                                checked={selectedQuestionCompleted}
                                onChange={onMarkComplete}
                                disabled={!canMarkSelectedQuestion}
                                className="h-4 w-4 cursor-pointer accent-white disabled:cursor-not-allowed disabled:opacity-50"
                              />
                            </label>

                            <span className="h-4 border-l border-zinc-700 shrink-0" />

                            <button
                              type="button"
                              aria-label="Previous"
                              onClick={onPreviousQuestion}
                              className="rounded p-1 transition hover:bg-zinc-800 disabled:opacity-40 shrink-0"
                            >
                              <ChevronLeft className="h-5 w-5 text-zinc-300" />
                            </button>
                            <button
                              type="button"
                              aria-label="Next"
                              onClick={onNextQuestion}
                              className="rounded p-1 transition hover:bg-zinc-800 disabled:opacity-40 shrink-0"
                            >
                              <ChevronRight className="h-5 w-5 text-zinc-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-1/2 min-h-0 overflow-hidden pr-1 pt-4">
                    <div className="rounded-2xl border border-zinc-800/90 bg-[#121212] shadow-[0_18px_36px_rgba(0,0,0,0.42)] flex h-full min-h-0 flex-col overflow-hidden">
                      <div className="shrink-0">
                        <div className="flex items-center justify-between border-b border-zinc-800 px-4">
                          <div className="flex items-center gap-6">
                            <button
                              type="button"
                              onClick={() => onCenterTabChange("notes")}
                              className={`pb-2 pt-3 text-sm font-medium ${state.activeCenterTab === "notes" ? "border-b-2 border-purple-500 text-purple-400" : "border-b-2 border-transparent text-zinc-300"}`}
                            >
                              Notes
                            </button>
                            <button
                              type="button"
                              onClick={() => onCenterTabChange("assistant")}
                              className={`pb-2 pt-3 text-sm font-medium ${state.activeCenterTab === "assistant" ? "border-b-2 border-purple-500 text-purple-400" : "border-b-2 border-transparent text-zinc-300"}`}
                            >
                              AI Assistant
                            </button>
                          </div>
                          {state.activeCenterTab === "notes" && (
                            <button
                              type="button"
                              onClick={() => onAutoSaveEnabledChange(!autoSaveEnabled)}
                              className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${autoSaveEnabled ? "animate-pulse bg-emerald-500" : "bg-zinc-500"}`}></span>
                              <span className={`text-[10px] font-semibold uppercase tracking-wider ${autoSaveEnabled ? "text-emerald-500" : "text-zinc-500"}`}>
                                Auto Save
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {state.activeCenterTab === "notes" ? (
                        <div className="min-h-0 flex-1 flex flex-col overflow-hidden p-4 lg:p-6">
                          {noteLoading ? (
                            <div className="mb-2 text-xs text-zinc-500">Loading your note...</div>
                          ) : null}
                          <RichTextEditor value={state.notes} onChange={onNotesChange} />
                        </div>
                      ) : (
                        <div className="min-h-0 flex-1 flex flex-col items-center justify-center p-8 text-center">
                          <p className="text-sm font-medium text-zinc-300">Coming Soon</p>
                          <p className="mt-2 max-w-[250px] text-xs leading-relaxed text-zinc-500">
                            This feature is currently under development and will be enabled in an upcoming release.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {!theoryViewEnabled && isSubjectPanelCollapsed && (
                <ResizableDivider
                  isDragging={isResizingTheoryPanel}
                  onPointerDown={handleTheoryResizeStart}
                  onDoubleClick={resetTheoryPanelWidth}
                />
              )}

              {/* Right Panel (Theory) */}
              <div
                className={`transition-all duration-300 ease-in-out flex shrink-0 
            ${theoryViewEnabled
                    ? "w-full"
                    : `w-full md:w-[var(--theory-panel-width)] md:basis-[var(--theory-panel-width)] ${activeMobileTab === "theory" ? "flex" : "hidden md:flex"} lg:flex`
                  }`}
                style={splitChildStyle}
              >
                <aside
                  className={`rounded-2xl border border-zinc-800/90 bg-[#121212] shadow-[0_18px_36px_rgba(0,0,0,0.42)] animate-fade-in-right box-border h-full w-full min-w-0 flex shrink flex-col overflow-hidden transition-all duration-300`}
                  style={{ animationDelay: "160ms" }}
                >
                  <div className="flex w-full shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-4 overflow-x-auto no-scrollbar flex-nowrap gap-4">
                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        type="button"
                        onClick={() => onRightTabChange("theory")}
                        className={`pb-2 text-sm whitespace-nowrap shrink-0 ${state.activeRightTab === "theory" ? "border-b-2 border-purple-500 text-purple-400" : "border-b-2 border-transparent text-zinc-300"}`}
                      >
                        Theory
                      </button>
                      <button
                        type="button"
                        onClick={() => onRightTabChange("quick_revision")}
                        className={`pb-2 text-sm whitespace-nowrap shrink-0 ${state.activeRightTab === "quick_revision" ? "border-b-2 border-purple-500 text-purple-400" : "border-b-2 border-transparent text-zinc-300"}`}
                      >
                        Quick Revision
                      </button>
                      <button
                        type="button"
                        onClick={() => onRightTabChange("discussion")}
                        className={`pb-2 text-sm whitespace-nowrap shrink-0 ${state.activeRightTab === "discussion" ? "border-b-2 border-purple-500 text-purple-400" : "border-b-2 border-transparent text-zinc-300"}`}
                      >
                        Discussion
                      </button>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {(state.activeRightTab === "theory" || state.activeRightTab === "quick_revision") && (
                        <div className="relative flex rounded-full border border-zinc-700/50 bg-[#060810]/80 p-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] backdrop-blur-md">
                          {(["English", "Tamil"] as const).map((lang) => {
                            const isActive = theoryLanguage === lang;
                            return (
                              <motion.button
                                key={lang}
                                onClick={() => setTheoryLanguage(lang)}
                                className={`relative flex flex-1 items-center justify-center rounded-full px-3.5 py-1 text-[11px] font-semibold transition-colors duration-300 ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                  }`}
                                whileHover={!isActive ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" } : {}}
                                whileTap={{ scale: 0.95 }}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="languageToggleBg"
                                    className="absolute inset-0 z-0 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(124,58,237,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                                    initial={false}
                                    transition={{
                                      type: "spring",
                                      stiffness: 450,
                                      damping: 30,
                                      mass: 0.8,
                                    }}
                                  >
                                    <motion.div
                                      className="absolute bottom-0 left-0 top-0 w-[150%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                      animate={{ x: ["-100%", "150%"] }}
                                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                    />
                                  </motion.div>
                                )}
                                <motion.span
                                  className="relative z-10 tracking-wide"
                                  animate={{
                                    scale: isActive ? 1.05 : 1,
                                    textShadow: isActive ? "0px 0px 8px rgba(255,255,255,0.6)" : "0px 0px 0px rgba(255,255,255,0)",
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {lang}
                                </motion.span>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleTheoryToggle}
                        className="hidden md:flex items-center gap-1.5 whitespace-nowrap text-sm text-zinc-300 transition-all duration-300 mr-2"
                        aria-pressed={theoryViewEnabled}
                        aria-label="Toggle Theory View"
                      >
                        <span>Theory View</span>
                        <span
                          className={`relative flex h-4 w-8 items-center rounded-full transition-all duration-300 ${theoryViewEnabled ? "bg-purple-500" : "bg-zinc-700"}`}
                        >
                          <span
                            className={`h-3 w-3 rounded-full transition-all duration-300 ${theoryViewEnabled ? "translate-x-4 bg-white" : "translate-x-0.5 bg-zinc-900"}`}
                          />
                        </span>
                      </button>
                    </div>
                  </div>

                  <div ref={theoryScrollRef} className={`custom-scrollbar min-h-0 flex-1 overflow-y-scroll transition-all duration-300`}>
                    <div className={`transition-all duration-300 w-full max-w-none px-4 pt-2 pb-8 lg:px-6 min-h-full flex flex-col`}>
                      {state.activeRightTab === "theory" ? (
                        <TheoryContent key={`${selectedSubjectId}-${state.selectedQuestionId}-${theoryLanguage}-theory`} questionId={state.selectedQuestionId} subjectId={selectedSubjectId} language={theoryLanguage} fullScreen={theoryViewEnabled} type="theory" />
                      ) : state.activeRightTab === "quick_revision" ? (
                        <TheoryContent key={`${selectedSubjectId}-${state.selectedQuestionId}-${theoryLanguage}-qr`} questionId={state.selectedQuestionId} subjectId={selectedSubjectId} language={theoryLanguage} fullScreen={theoryViewEnabled} type="quick_revision" />
                      ) : (
                        <DiscussionContent
                          questionId={state.selectedQuestionId}
                          videoId={selectedVideoId}
                          subjectId={selectedSubjectId}
                          currentUser={currentUser ?? undefined}
                        />
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </>
        )}
      </motion.div>

      <BookmarkPlaylistModal
        isOpen={isBookmarkModalOpen}
        playlists={bookmarkPlaylists}
        isLoading={isBookmarkLoading}
        isSubmitting={isBookmarkSubmitting}
        errorMessage={bookmarkError}
        newPlaylistName={newPlaylistName}
        questionTitle={bookmarkQuestionTitle}
        onClose={onBookmarkClose}
        onNewPlaylistNameChange={onNewPlaylistNameChange}
        onSelectExistingPlaylist={onSelectExistingPlaylist}
        onCreateAndAdd={onCreateAndAddToPlaylist}
      />
    </main>
  );
}
