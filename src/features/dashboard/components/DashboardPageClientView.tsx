"use client";

import { useDashboardPageController } from "@/features/dashboard/actions/DashboardPageClientController";

import { type DashboardSubjectRecord, mapSubjectToExploreCard, type CourseProgressItem, toTitleCase } from "@/features/dashboard/services/DashboardPageService";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { ExploreCourseCard } from "@/features/dashboard/components/ExploreCourseCard";
import { OngoingVideoCard, type OngoingVideo } from "@/features/dashboard/components/OngoingVideoCard";
import { RevealBlock } from "@/features/dashboard/components/RevealBlock";
import { SearchIcon } from "@/features/dashboard/components/SearchIcon";
import { ChevronRight, ChevronDown, Atom, Code2, Database, LayoutTemplate, Box, Clock, Target, Hourglass, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { titleToSubjectSlug, prefetchSubjectPanelData } from "@/features/video/services/videoSubjectService";
import { setSelectedVideoSubject } from "@/features/video/components/videoSubjectStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { prefetchVideoSubjectRoute } from "@/features/video/constants/videoSubjectNavigation";
import { useStudyTimerStore } from "@/features/dashboard/store/studyTimerStore";

type DashboardPageClientViewProps = {
  initialExploreSubjects: DashboardSubjectRecord[];
  progressData?: CourseProgressItem[];
};

// Mock data removed. Ongoing courses are now dynamically fetched.

export function DashboardPageClientView({
  initialExploreSubjects,
  progressData = [],
}: DashboardPageClientViewProps) {
  const router = useRouter();
  const { exploreSubjects, isSearching, searchTerm, setSearchTerm } =
    useDashboardPageController(initialExploreSubjects);

  const videoScrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hydration guard — prevents SSR/client mismatch with Zustand persisted store
  const [isMounted, setIsMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [goalMinutesInput, setGoalMinutesInput] = useState("");

  const timeSpentSeconds = useStudyTimerStore((s) => s.timeSpentSeconds);
  const dailyGoalSeconds = useStudyTimerStore((s) => s.dailyGoalSeconds);
  const setDailyGoalMinutes = useStudyTimerStore((s) => s.setDailyGoalMinutes);

  useEffect(() => {
    setIsMounted(true);
    setGoalMinutesInput(String(Math.round(dailyGoalSeconds / 60)));

    const saved = localStorage.getItem("roteen_todays_learning_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(goalMinutesInput, 10);
    if (mins > 0) {
      setDailyGoalMinutes(mins);
      setIsEditModalOpen(false);
    }
  };

  // Use SSR-safe defaults until client hydrates
  const displayTimeSpent = isMounted ? timeSpentSeconds : 0;
  const displayGoal = isMounted ? dailyGoalSeconds : 3600;
  const remainingSeconds = Math.max(0, displayGoal - displayTimeSpent);
  const rawPercentage = displayGoal > 0 ? (displayTimeSpent / displayGoal) * 100 : 0;
  const percentage = Math.min(Math.floor(rawPercentage), 100);
  const isGoalAchieved = isMounted && displayTimeSpent >= displayGoal;

  const formatDuration = (totalSeconds: number) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  };

  useEffect(() => {
    router.prefetch("/video");

    exploreSubjects.forEach((subject) => {
      prefetchVideoSubjectRoute(router, {
        subjectId: subject.id,
        subjectTitle: subject.subject_name?.trim() || "Subject",
        subjectStandard: subject.standard,
      });
    });
  }, [exploreSubjects, router]);
  const exploreScrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  }, []);

  const handleResumeVideo = useCallback((video: OngoingVideo) => {
    if (!video.questionId || !video.subjectId || !video.subjectTitle) return;

    const subjectSlug = titleToSubjectSlug(video.subjectTitle);
    setSelectedVideoSubject({
      id: video.subjectId,
      slug: subjectSlug,
      name: video.subjectTitle,
      standard: video.subjectStandard ?? null,
    });

    prefetchSubjectPanelData({
      subjectId: video.subjectId,
      subjectSlug,
      standard: video.subjectStandard ?? null,
    });

    const params = new URLSearchParams();
    params.set("subject", subjectSlug);
    params.set("subjectId", video.subjectId);
    if (video.subjectStandard?.trim()) {
      params.set("standard", video.subjectStandard.trim());
    }
    params.set("questionId", video.questionId);

    router.push(`/video?${params.toString()}`);
  }, [router]);

  const ongoingVideos: OngoingVideo[] = progressData.map((item, index) => {
    const duration = item.video_duration && item.video_duration > 0 ? item.video_duration : 1800;
    const remainingSeconds = Math.max(0, duration - item.watched_seconds);
    const remainingMin = Math.max(1, Math.round(remainingSeconds / 60));
    const timeRemaining = `${remainingMin} min left`;
    const progressPercent = Math.min(100, Math.max(0, Math.round((item.watched_seconds / duration) * 100)));

    const ongoingGradients = [
      "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      "linear-gradient(135deg, #082f49 0%, #0f172a 100%)",
      "linear-gradient(135deg, #422006 0%, #0f172a 100%)",
      "linear-gradient(135deg, #3b0764 0%, #0f172a 100%)",
      "linear-gradient(135deg, #0c4a6e 0%, #0f172a 100%)"
    ];

    const ongoingIcons = [
      <Code2 size={120} key="1" />,
      <Atom size={120} key="2" />,
      <Box size={120} color="#FACC15" key="3" />,
      <LayoutTemplate size={120} color="#C084FC" key="4" />,
      <Database size={120} color="#38BDF8" key="5" />
    ];

    return {
      id: item.id,
      title: item.question_title,
      timeRemaining,
      progressPercent,
      icon: ongoingIcons[index % ongoingIcons.length],
      bgGradient: ongoingGradients[index % ongoingGradients.length],
      lastUpdated: toTitleCase(item.subject_name),
      questionId: item.question_id,
      subjectId: item.subject_id,
      subjectTitle: item.subject_name,
      subjectStandard: item.subject_standard,
    };
  });

  return (
    <main className={`bg-black text-zinc-200 min-h-screen dark h-screen overflow-y-auto overflow-x-hidden no-scrollbar  text-slate-100`}>
      <DashboardHeader activeLabel="Dashboard" />

      <div className="mx-auto max-w-[1560px] px-4 pt-3 pb-8 lg:px-6 lg:pt-4 lg:pb-10">
        {/* Ongoing Courses */}
        {ongoingVideos.length > 0 && (
          <RevealBlock delayMs={80}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-[22px] font-bold tracking-tight text-white sm:text-[24px]">Ongoing Courses</h2>
                <p className="text-[14px] font-medium text-gray-500">
                  Continue watching where you left off
                </p>
              </div>
            </div>

            <div className="group relative w-full mb-4">
              <div className="no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto overflow-y-hidden pt-4 pb-3 -mt-4 [&>*]:snap-start [&>*]:shrink-0 [&>*]:w-[85vw] sm:[&>*]:w-[280px] xl:[&>*]:w-[calc(20%-16px)]" ref={videoScrollRef}>
                {ongoingVideos.map((video) => (
                  <OngoingVideoCard 
                    key={video.id} 
                    video={video} 
                    onClick={() => handleResumeVideo(video)} 
                  />
                ))}
              </div>
              <button
                type="button"
                className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 shadow-xl backdrop-blur-md transition-colors hover:bg-black/60 group-hover:opacity-100"
                onClick={() => scrollRight(videoScrollRef)}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </RevealBlock>
        )}

        {/* Today's Learning Section */}
        <RevealBlock delayMs={120}>
          <div className="mb-5 rounded-[20px] border border-zinc-800 bg-[#121212] relative overflow-hidden">
            {/* Success ambient glow */}
            {isGoalAchieved && (
              <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5" />
            )}

            {/* ── Always-visible top row: title + badges + collapse toggle ── */}
            <div className="flex items-center justify-between gap-4 px-6 lg:px-8 pt-3 lg:pt-4 pb-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-[20px] font-bold text-white tracking-tight">Today's Learning</h2>
                {isGoalAchieved && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full tracking-wide"
                  >
                    ✅ Goal Achieved
                  </motion.span>
                )}
              </div>

              {/* Collapse / Expand arrow */}
              <button
                type="button"
                aria-label={isCollapsed ? "Expand Today's Learning" : "Minimize Today's Learning"}
                onClick={() => {
                  setIsCollapsed((prev) => {
                    const nextVal = !prev;
                    localStorage.setItem("roteen_todays_learning_collapsed", String(nextVal));
                    return nextVal;
                  });
                }}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-700/60 bg-zinc-800/50 hover:bg-zinc-700/60 hover:border-zinc-600 transition-all cursor-pointer active:scale-90"
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown size={16} className="text-zinc-400" />
                </motion.div>
              </button>
            </div>

            {/* ── Collapsible body ── */}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  key="learning-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-6 lg:px-8 pb-4 lg:pb-5 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-6">

                    {/* Left section */}
                    <div className="flex-1 flex flex-col gap-6">
                      {/* Subtitle */}
                      <p className="text-[13px] text-zinc-400 font-medium">
                        Stay consistent, keep learning every day. 🚀
                      </p>

                      {/* Progress and Stats Container */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                        {/* Circular Progress Gauge */}
                        <div className="relative flex items-center justify-center shrink-0 w-32 h-32 select-none">
                          <svg className="w-32 h-32" viewBox="0 0 128 128">
                            <g transform="rotate(-90 64 64)">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="transparent"
                                stroke={isGoalAchieved ? "#064e3b" : "#1E113C"}
                                strokeWidth="8"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="transparent"
                                stroke={isGoalAchieved ? "#10b981" : "#A855F7"}
                                strokeWidth="8"
                                strokeDasharray={351.86}
                                strokeDashoffset={351.86 * (1 - percentage / 100)}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 0.5s ease-out, stroke 0.8s ease" }}
                              />
                            </g>
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className={`text-[22px] font-bold tracking-tight leading-none ${
                              isGoalAchieved ? "text-emerald-400" : "text-white"
                            }`}>
                              {percentage}%
                            </span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1">COMPLETED</span>
                          </div>
                        </div>

                        {/* Stats & Horizontal Progress Bar */}
                        <div className="flex-1 flex flex-col gap-4">
                          {/* Stats Row */}
                          <div className="flex flex-wrap items-center gap-6 md:gap-8 text-zinc-400">
                            {/* Time Spent */}
                            <div className="flex flex-col gap-1.5 min-w-[100px]">
                              <div className="flex items-center gap-2 text-purple-300/90 text-[13px] font-semibold">
                                <Clock size={16} className="text-[#A855F7]" />
                                <span>Time Spent</span>
                              </div>
                              <span className="text-[22px] font-bold tracking-tight text-white leading-none tabular-nums">
                                {formatDuration(displayTimeSpent)}
                              </span>
                            </div>

                            <div className="hidden sm:block h-10 w-[1px] bg-zinc-800/80" />

                            {/* Today's Goal */}
                            <div className="flex flex-col gap-1.5 min-w-[100px]">
                              <div className="flex items-center gap-2 text-purple-300/90 text-[13px] font-semibold">
                                <Target size={16} className="text-[#A855F7]" />
                                <span>Today's Goal</span>
                              </div>
                              <span className="text-[22px] font-bold tracking-tight text-white leading-none tabular-nums">
                                {formatDuration(displayGoal)}
                              </span>
                            </div>

                            <div className="hidden sm:block h-10 w-[1px] bg-zinc-800/80" />

                            {/* Remaining Time */}
                            <div className="flex flex-col gap-1.5 min-w-[100px]">
                              <div className="flex items-center gap-2 text-purple-300/90 text-[13px] font-semibold">
                                <Hourglass size={16} className="text-[#A855F7]" />
                                <span>Remaining Time</span>
                              </div>
                              <span className={`text-[22px] font-bold tracking-tight leading-none tabular-nums ${
                                isGoalAchieved ? "text-emerald-400" : "text-[#A855F7]"
                              }`}>
                                {formatDuration(remainingSeconds)}
                              </span>
                            </div>
                          </div>

                          {/* Horizontal Progress Bar */}
                          <div className="w-full h-3 bg-zinc-800/80 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background: isGoalAchieved
                                  ? "linear-gradient(90deg, #059669, #10b981)"
                                  : "#A855F7",
                              }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>

                          {/* Status / Motivation text */}
                          <AnimatePresence mode="wait">
                            {isGoalAchieved ? (
                              <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col gap-1"
                              >
                                <p className="text-[14px] font-bold text-emerald-400">
                                  🎉 Congratulations!
                                </p>
                                <p className="text-[12px] text-zinc-400 leading-relaxed max-w-[500px]">
                                  Today's learning goal has been fulfilled. You have successfully completed your daily learning target.
                                  <span className="text-zinc-300 font-medium"> Increase your goal for better learning and deeper understanding.</span>
                                </p>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="progress"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.4 }}
                                className="text-[12px] font-medium text-zinc-400 flex items-center gap-1.5"
                              >
                                <span>Keep going! You're making great progress.</span>
                                <span className="text-[#FACC15]">✨</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Right section: Edit / Increase Goal Button */}
                    <div className="flex items-center self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setGoalMinutesInput(String(Math.round(displayGoal / 60)));
                          setIsEditModalOpen(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-lg border cursor-pointer transition-all active:scale-95 shadow-md ${
                          isGoalAchieved
                            ? "text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:text-white hover:bg-emerald-500/5"
                            : "text-zinc-300 border-purple-600/40 hover:border-[#A855F7] hover:text-white hover:bg-purple-600/5"
                        }`}
                      >
                        <Pencil size={14} className={isGoalAchieved ? "text-emerald-400" : "text-[#A855F7]"} />
                        <span>{isGoalAchieved ? "Increase Goal" : "Edit Goal"}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom padding when collapsed so card doesn't look clipped */}
            {isCollapsed && <div className="pb-2" />}
          </div>
        </RevealBlock>


        {/* Explore Courses */}
        <RevealBlock delayMs={160}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-[22px] font-bold tracking-tight text-white sm:text-[24px]">Explore Courses</h2>
              <p className="text-[14px] font-medium text-gray-500">
                Discover and continue learning
              </p>
            </div>

            <label className="relative flex items-center w-full max-w-[340px] sm:w-[340px]">
              <SearchIcon />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by subject..."
                className="w-full rounded-xl border border-zinc-800 bg-[#121212] py-2.5 pl-10 pr-4 text-[14px] text-white placeholder-gray-500 focus:border-violet-500/40 focus:outline-none"
              />
            </label>
          </div>

          <div className="group relative w-full">
            {exploreSubjects.length > 0 ? (
              <div className="no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto overflow-y-hidden pt-4 pb-3 -mt-4 [&>*]:snap-start [&>*]:shrink-0 [&>*]:w-[85vw] sm:[&>*]:w-[280px] xl:[&>*]:w-[calc(20%-16px)]" ref={exploreScrollRef}>
                {exploreSubjects.map((subject, index) => (
                  <ExploreCourseCard
                    key={`${subject.id}-${searchTerm || "all"}`}
                    card={mapSubjectToExploreCard(subject, index)}
                    animationDelayMs={index * 50}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-dashed border-zinc-800 bg-[#121212] px-6 py-10 text-center text-gray-500">
                {isSearching ? "Searching subjects..." : "No matching subjects found in Supabase."}
              </div>
            )}

            {exploreSubjects.length > 0 && (
              <button
                type="button"
                className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 shadow-xl backdrop-blur-md transition-colors hover:bg-black/60 group-hover:opacity-100"
                onClick={() => scrollRight(exploreScrollRef)}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </RevealBlock>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 bg-[#121212] border border-zinc-800/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4 text-zinc-100"
            >
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[18px] font-bold text-white tracking-tight">
                  {isGoalAchieved ? "🎯 Increase Daily Goal" : "Edit Daily Goal"}
                </h3>
                <p className="text-[13px] text-zinc-400">
                  {isGoalAchieved
                    ? "You've already hit today's target! Set a higher goal to keep pushing yourself."
                    : "Set your target study time per day (in minutes)."}
                </p>
              </div>

              <form onSubmit={handleSaveGoal} className="flex flex-col gap-4">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  required
                  value={goalMinutesInput}
                  onChange={(e) => setGoalMinutesInput(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/50 px-4 py-3 text-[14px] text-white focus:border-[#A855F7] focus:outline-none"
                  placeholder="Minutes (e.g. 60)"
                  autoFocus
                />

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-[13px] font-semibold text-zinc-400 rounded-lg hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-[13px] font-semibold text-white bg-[#7C3AED] rounded-lg hover:bg-violet-600 transition-colors shadow-lg cursor-pointer"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
