"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ThumbsDown, Bug, Bookmark } from "lucide-react";
import type { VideoData, VideoState } from "@/service/video";
import type { VideoSubjectFilter } from "@/service/videoSubjectService";
import { videoStyles } from "@/styles/video";
import SubjectBar from "@/store/video/SubjectBar";
import PlaylistSidebar from "@/store/video/PlaylistSidebar";
import { HeaderSettingsMenu } from "@/store/shared/HeaderSettingsMenu";
import { supabase } from "@/lib/supabaseClient";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import dynamic from "next/dynamic";
const TheoryContent = dynamic(() => import("@/store/video/TheoryContent"), { ssr: false });
import DiscussionContent from "@/store/video/DiscussionContent";
import RichTextEditor from "@/store/video/RichTextEditor";
import BookmarkPlaylistModal from "@/store/video/BookmarkPlaylistModal";
import CustomVideoPlayer from "./CustomVideoPlayer";

interface VideoPageUIProps {
  data: VideoData;
  state: VideoState;
  subjectFilter?: VideoSubjectFilter;
  playlistQuestionIds?: string[] | null;
  playlistId?: string | null;
  playlistTitle?: string;
  isPlaylistMode?: boolean;
  selectedSubjectId?: string | null;
  isSubjectFiltered?: boolean;
  pageHeading?: string | null;
  onSubjectResolved?: (subject: { id: string; name: string; standard: string | null }) => void;
  theoryFullScreen: boolean;
  onChapterSelect: (chapterId: string) => void;
  onQuestionSelect: (questionId: string) => void;
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
  onAutoSaveEnabledChange: (enabled: boolean) => void;
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
}

function normalizeVideoUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getQuestionIdCandidates(questionId: string): Array<string | number> {
  const normalized = questionId.trim();
  if (!normalized) {
    return [];
  }

  if (/^\d+$/.test(normalized)) {
    return [normalized, Number(normalized)];
  }

  return [normalized];
}

type ResolvedVideo = {
  url: string | null;
  videoId: string | null;
};

async function fetchVideoUrlFromSupabase(
  questionId: string,
  subjectId: string | null,
): Promise<ResolvedVideo> {
  const candidates = getQuestionIdCandidates(questionId);
  if (candidates.length === 0) {
    return { url: null, videoId: null };
  }

  for (const candidate of candidates) {
    let query = supabase
      .from("videos")
      .select("id, video_url")
      .eq("question_id", candidate)
      .limit(1);

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    let { data, error } = await query;

    if (error && subjectId && (error.code === "PGRST204" || error.code === "42703")) {
      const fallbackResult = await supabase
        .from("videos")
        .select("id, video_url")
        .eq("question_id", candidate)
        .limit(1);
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.warn("Could not fetch video from videos table:", error);
    } else {
      const resolved = normalizeVideoUrl(data?.[0]?.video_url);
      if (resolved) {
        return { url: resolved, videoId: data?.[0]?.id ? String(data[0].id) : null };
      }
    }
  }

  // Fallback: some schemas keep the link directly in questions.video_url.
  for (const candidate of candidates) {
    let query = supabase
      .from("questions")
      .select("video_url")
      .eq("id", candidate)
      .limit(1);

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    let { data, error } = await query;

    if (error && subjectId && (error.code === "PGRST204" || error.code === "42703")) {
      const fallbackResult = await supabase
        .from("questions")
        .select("video_url")
        .eq("id", candidate)
        .limit(1);
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.warn("Could not fetch video from questions table:", error);
    } else {
      const resolved = normalizeVideoUrl(data?.[0]?.video_url);
      if (resolved) {
        return { url: resolved, videoId: null };
      }
    }
  }

  return { url: null, videoId: null };
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
  onAutoSaveEnabledChange,
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
}: VideoPageUIProps) {
  const { theme, resolvedTheme } = useTheme();
  const [theoryViewEnabled, setTheoryViewEnabled] = useState(false);
  const [theoryLanguage, setTheoryLanguage] = useState<"English" | "Tamil">("English");
  const theoryScrollRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Fetch video URL for the selected question
  useEffect(() => {
    let isMounted = true;
    const fetchVideo = async () => {
      if (!state.selectedQuestionId) {
        if (isMounted) {
          setVideoUrl(null);
          setSelectedVideoId(null);
          setIsVideoLoading(false);
        }
        return;
      }

      setIsVideoLoading(true);
      setVideoUrl(null);
      setSelectedVideoId(null);
      try {
        const resolvedVideo = await fetchVideoUrlFromSupabase(state.selectedQuestionId, selectedSubjectId);

        if (isMounted) {
          setVideoUrl(resolvedVideo.url);
          setSelectedVideoId(resolvedVideo.videoId);
        }
      } catch (err) {
        console.warn("Error fetching video:", err);
        if (isMounted) {
          setVideoUrl(null);
          setSelectedVideoId(null);
        }
      } finally {
        if (isMounted) setIsVideoLoading(false);
      }
    };

    fetchVideo();
    return () => { isMounted = false; };
  }, [selectedSubjectId, state.selectedQuestionId]);

  useEffect(() => {
    if (theoryScrollRef.current) {
      theoryScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.selectedQuestionId, theoryLanguage]);

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

  const selectedQuestionCompleted =
    state.selectedQuestionId !== null && state.completedQuestions.includes(state.selectedQuestionId);
  const canMarkSelectedQuestion = state.selectedQuestionId !== null;

  const navRouteMap: Record<string, string> = {
    home: "/landingpage",
    dashboard: "/dashboardpage",
    notes: "/notes",
    revision: "/notes/revision",
    videos: "/video",
    news: "/news",
  };
  const leftPanelWidthClass = "w-[20%]";

  return (
    <main className={`video-smooth dark ${videoStyles.container} box-border flex h-screen flex-col overflow-hidden`}>
      <header className={videoStyles.navbar}>
        <div className={videoStyles.style_1da7023612fe2}>
          <div className={videoStyles.style_108db2f6831414}>R</div>
          <h1 className={videoStyles.style_11c7ba220cd9f1}>{data.brand}</h1>
        </div>

        <nav className={videoStyles.navMenu}>
          {data.menu.filter((item) => item.label !== "Profile").map((item) => (
            navRouteMap[item.id] ? (
              <Link
                key={item.id}
                href={navRouteMap[item.id]}
                prefetch
                onClick={() => applyRouteThemeClass(navRouteMap[item.id])}
                className={videoStyles.navItem}
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.id} className={videoStyles.navItem}>
                {item.label}
              </span>
            )
          ))}
        </nav>

        <div className={videoStyles.style_1da7023612fe2}>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => {}} // Disabled function of light theme for now
            className={videoStyles.style_133113f7d3ca84}
          >
            {isDark ? (
              <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <button
            title="Notifications"
            aria-label="Notifications"
            className={videoStyles.style_bfa4d0a2442ef}
          >
            <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V11a5 5 0 1 1 10 0v3.2a2 2 0 0 0 .6 1.4L19 17h-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className={videoStyles.style_1a3a5a5399c328} />
          </button>

          <HeaderSettingsMenu />
        </div>
      </header>

      

      <motion.div className={videoStyles.style_cd75d51f47d37}>
        {/* Subject Panel / Playlist Panel */}
        <div className={`transition-all duration-300 ease-in-out flex shrink-0 ${theoryViewEnabled ? "w-0 opacity-0 -translate-x-8 overflow-hidden pointer-events-none" : `${leftPanelWidthClass} opacity-100 translate-x-0 pr-4`}`}>
          {isPlaylistMode && playlistId ? (
            <PlaylistSidebar
              playlistId={playlistId}
              playlistTitle={playlistTitle}
              playlistQuestionIds={playlistQuestionIds}
              selectedQuestionId={state.selectedQuestionId}
              completedQuestions={state.completedQuestions}
              onQuestionSelect={onQuestionSelect}
              onQuestionsLoaded={onQuestionsLoaded}
            />
          ) : (
            <div className={videoStyles.style_10bb6f80e7bd7e}>
              <SubjectBar
                subjectFilter={subjectFilter}
                playlistQuestionIds={playlistQuestionIds}
                isSubjectFiltered={isSubjectFiltered}
                isPlaylistMode={isPlaylistMode}
                activeChapterId={state.activeChapterId}
                selectedQuestionId={state.selectedQuestionId}
                completedQuestions={state.completedQuestions}
                onChapterSelect={onChapterSelect}
                onQuestionSelect={onQuestionSelect}
                onQuestionsLoaded={onQuestionsLoaded}
                onSubjectResolved={onSubjectResolved}
              />
            </div>
          )}
        </div>

        {/* Center Panel (Video/Notes) */}
        <div className={`transition-all duration-300 ease-in-out flex shrink-0 ${theoryViewEnabled ? "w-0 opacity-0 -translate-x-8 overflow-hidden pointer-events-none" : "w-[40%] opacity-100 translate-x-0 pr-4"}`}>
          <section className={videoStyles.style_11240612966694} style={{ animationDelay: "80ms" }}>
            <div className={videoStyles.style_12bfae5f915ea0}>
              <div className={`${videoStyles.card} flex h-full min-h-0 flex-col overflow-hidden`}>
                <div className={videoStyles.style_a3b7243be1069}>
                  {isVideoLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                  ) : videoUrl ? (
                    <CustomVideoPlayer key={videoUrl} url={videoUrl} />
                  ) : (
                    <>
                      <div className={videoStyles.style_132fe1ccbf2c8f}>?</div>
                      <p className={videoStyles.style_d4e2344665b44}>No video available</p>
                      <p className={videoStyles.style_ca0b64ca60264}>Content will appear here when available</p>
                    </>
                  )}
                </div>
                <div className={videoStyles.style_1ab00e6ac524d3}>
                  <div className={videoStyles.style_d56f606dc1f0e}>
                    <div className={videoStyles.style_1cea2ccf6d3c49}>
                      <button
                        type="button"
                        onClick={onDislike}
                        className={`flex items-center justify-center gap-1 transition hover:text-red-400 ${state.disliked ? "text-purple-500" : "text-zinc-400"}`}
                      >
                        <ThumbsDown className={`h-5 w-5 shrink-0 ${state.disliked ? "fill-purple-500 text-purple-500" : "fill-transparent text-zinc-400"}`} />
                        <span className={`${videoStyles.style_19808e2d8b6019} tabular-nums truncate`}>{state.dislikes}</span>
                      </button>
                      <span className={videoStyles.style_111fbfd125d08} />
                      <Link
                        href="/bug"
                        prefetch
                        onClick={() => applyRouteThemeClass("/bug")}
                        title="Report a bug"
                        aria-label="Report a bug"
                        className={`${videoStyles.style_182869673902cd} translate-x-0`}
                      >
                        <Bug className={videoStyles.style_a80622bed5fb7} />
                      </Link>
                      <span className={videoStyles.style_111fbfd125d08} />
                      <button
                        type="button"
                        title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                        onClick={onBookmarkClick}
                        className={`flex items-center justify-center transition ${
                          isBookmarked ? "text-purple-400" : "text-zinc-400 hover:text-purple-400"
                        }`}
                      >
                        <Bookmark
                          className={`${videoStyles.style_a80622bed5fb7} ${
                            isBookmarked ? "fill-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.45)]" : "fill-transparent"
                          }`}
                          strokeWidth={2}
                        />
                      </button>
                    </div>
                    <div className={videoStyles.style_1cea2ccf6d3c49}>
                      <label className={videoStyles.style_96ebe9a0013e2}>
                        <span className={`text-sm text-white transition ${canMarkSelectedQuestion ? "" : "opacity-50"}`}>
                          {selectedQuestionCompleted ? "Completed" : "Mark as Completed"}
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedQuestionCompleted}
                          onChange={onMarkComplete}
                          disabled={!canMarkSelectedQuestion}
                          className={videoStyles.style_17ea3393d68d77}
                        />
                      </label>

                      <span className={videoStyles.style_111fbfd125d08} />

                      <button
                        type="button"
                        aria-label="Previous"
                        onClick={onPreviousQuestion}
                        className={videoStyles.style_1ceb8d25937ee2}
                      >
                        <ChevronLeft className={videoStyles.style_17ad9be452bfb5} />
                      </button>
                      <button
                        type="button"
                        aria-label="Next"
                        onClick={onNextQuestion}
                        className={videoStyles.style_1ceb8d25937ee2}
                      >
                        <ChevronRight className={videoStyles.style_17ad9be452bfb5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={videoStyles.style_f7060e9c50ca1}>
              <div className={`${videoStyles.card} flex h-full min-h-0 flex-col overflow-hidden`}>
                <div className={videoStyles.style_1ab00e6ac524d3}>
                  <div className={videoStyles.style_1ac980ba0eebbe}>
                    <div className={videoStyles.style_14bebccf236e24}>
                      <button
                        type="button"
                        onClick={() => onCenterTabChange("notes")}
                        className={`pb-2 pt-3 text-sm font-medium ${state.activeCenterTab === "notes" ? videoStyles.activeTab : videoStyles.inactiveTab}`}
                      >
                        Notes
                      </button>
                      <button
                        type="button"
                        onClick={() => onCenterTabChange("assistant")}
                        className={`pb-2 pt-3 text-sm font-medium ${state.activeCenterTab === "assistant" ? videoStyles.activeTab : videoStyles.inactiveTab}`}
                      >
                        AI Assistant
                      </button>
                    </div>
                    {state.activeCenterTab === "notes" && (
                      <button
                        type="button"
                        onClick={() => onAutoSaveEnabledChange(!autoSaveEnabled)}
                        className={videoStyles.style_1341d866ba8c15}
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
                  <div className={videoStyles.style_13c2d6075b9e0c}>
                    {noteLoading ? (
                      <div className="mb-2 text-xs text-zinc-500">Loading your note...</div>
                    ) : null}
                    <RichTextEditor value={state.notes} onChange={onNotesChange} />
                  </div>
                ) : (
                  <div className={videoStyles.style_df496df2ec71}>
                    <p className={videoStyles.style_125557bb484e49}>Coming Soon</p>
                    <p className={videoStyles.style_541175dde49ee}>
                      This feature is currently under development and will be enabled in an upcoming release.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel (Theory) */}
        <div className={`transition-all duration-300 ease-in-out flex shrink-0 ${theoryViewEnabled ? "w-full" : "w-[40%]"}`}>
          <aside
            className={`${videoStyles.card} animate-fade-in-right box-border h-full w-full min-w-0 flex shrink flex-col overflow-hidden transition-all duration-300 ${
              theoryViewEnabled
                ? "border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.15)] bg-[#0b0f1a] brightness-105"
                : ""
            }`}
            style={{ animationDelay: "160ms" }}
          >
            <div className={videoStyles.style_cd8cd0b5d6516}>
              <div className={videoStyles.style_14bebccf236e24}>
                <button
                  type="button"
                  onClick={() => onRightTabChange("theory")}
                  className={`pb-2 text-sm ${state.activeRightTab === "theory" ? videoStyles.activeTab : videoStyles.inactiveTab}`}
                >
                  Theory
                </button>
                <button
                  type="button"
                  onClick={() => onRightTabChange("quick_revision")}
                  className={`pb-2 text-sm ${state.activeRightTab === "quick_revision" ? videoStyles.activeTab : videoStyles.inactiveTab}`}
                >
                  Quick Revision
                </button>
                <button
                  type="button"
                  onClick={() => onRightTabChange("discussion")}
                  className={`pb-2 text-sm ${state.activeRightTab === "discussion" ? videoStyles.activeTab : videoStyles.inactiveTab}`}
                >
                  Discussion
                </button>
              </div>
              <div className={videoStyles.style_1cea2ccf6d3c49}>
                {(state.activeRightTab === "theory" || state.activeRightTab === "quick_revision") && (
                  <div className="relative flex rounded-full border border-zinc-700/50 bg-[#060810]/80 p-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] backdrop-blur-md">
                    {(["English", "Tamil"] as const).map((lang) => {
                      const isActive = theoryLanguage === lang;
                      return (
                        <motion.button
                          key={lang}
                          onClick={() => setTheoryLanguage(lang)}
                          className={`relative flex flex-1 items-center justify-center rounded-full px-4 py-1 text-[11px] font-semibold transition-colors duration-300 ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                          whileHover={!isActive ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" } : {}}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="languageToggleBg"
                              className="absolute inset-0 z-0 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 shadow-[0_0_15px_rgba(124,58,237,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)]"
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
                  className={videoStyles.style_f59534a3c59b5}
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

            <div ref={theoryScrollRef} className={`custom-scrollbar min-h-0 flex-1 overflow-y-scroll transition-all duration-300 ${theoryViewEnabled ? "bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.05),transparent_50%)]" : ""}`}>
              <div className={`transition-all duration-300 w-full max-w-none px-4 pt-2 pb-8 lg:px-6`}>
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
