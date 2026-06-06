"use client";

import { useDashboardPageController } from "@/features/dashboard/actions/DashboardPageClientController";

import { type DashboardSubjectRecord, mapSubjectToExploreCard } from "@/features/dashboard/services/DashboardPageService";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { ExploreCourseCard } from "@/features/dashboard/components/ExploreCourseCard";
import { OngoingVideoCard, OngoingVideo } from "@/features/dashboard/components/OngoingVideoCard";
import { RevealBlock } from "@/features/dashboard/components/RevealBlock";
import { SearchIcon } from "@/features/dashboard/components/SearchIcon";
import { Atom, ChevronRight, Code2, Database, LayoutTemplate, Box } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { prefetchVideoSubjectRoute } from "@/features/video/constants/videoSubjectNavigation";

type DashboardPageClientViewProps = {
  initialExploreSubjects: DashboardSubjectRecord[];
};

const MOCK_ONGOING_VIDEOS: OngoingVideo[] = [
  { id: "1", title: "Binary Search Masterclass", timeRemaining: "12 min left", progressPercent: 65, icon: <Code2 size={120} />, bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" },
  { id: "2", title: "React Interview Questions", timeRemaining: "28 min left", progressPercent: 30, icon: <Atom size={120} />, bgGradient: "linear-gradient(135deg, #082f49 0%, #0f172a 100%)" },
  { id: "3", title: "JavaScript ES6+ Features", timeRemaining: "8 min left", progressPercent: 80, icon: <Box size={120} color="#FACC15" />, bgGradient: "linear-gradient(135deg, #422006 0%, #0f172a 100%)" },
  { id: "4", title: "System Design Basics", timeRemaining: "18 min left", progressPercent: 45, icon: <LayoutTemplate size={120} color="#C084FC" />, bgGradient: "linear-gradient(135deg, #3b0764 0%, #0f172a 100%)" },
  { id: "5", title: "SQL for Interviews", timeRemaining: "35 min left", progressPercent: 20, icon: <Database size={120} color="#38BDF8" />, bgGradient: "linear-gradient(135deg, #0c4a6e 0%, #0f172a 100%)" },
];

export function DashboardPageClientView({
  initialExploreSubjects,
}: DashboardPageClientViewProps) {
  const router = useRouter();
  const { exploreSubjects, isSearching, searchTerm, setSearchTerm } =
    useDashboardPageController(initialExploreSubjects);

  const videoScrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <main className={`bg-black text-zinc-200 min-h-screen dark h-screen overflow-y-auto overflow-x-hidden no-scrollbar  text-slate-100`}>
      <DashboardHeader activeLabel="Dashboard" />

      <div className="mx-auto max-w-[1560px] px-4 py-8 lg:px-6 lg:py-10">
        {/* Ongoing Courses */}
        <RevealBlock delayMs={120}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-[22px] font-bold tracking-tight text-white sm:text-[24px]">Ongoing Courses</h2>
              <p className="text-[14px] font-medium text-gray-500">
                Continue watching where you left off
              </p>
            </div>
          </div>

          <div className="group relative w-full">
            <div className="no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto overflow-y-hidden pt-4 pb-6 -mt-4 [&>*]:snap-start [&>*]:shrink-0 [&>*]:w-[85vw] sm:[&>*]:w-[280px] xl:[&>*]:w-[calc(20%-16px)]" ref={videoScrollRef}>
              {MOCK_ONGOING_VIDEOS.map((video) => (
                <OngoingVideoCard key={video.id} video={video} />
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
              <div className="no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto overflow-y-hidden pt-4 pb-6 -mt-4 [&>*]:snap-start [&>*]:shrink-0 [&>*]:w-[85vw] sm:[&>*]:w-[280px] xl:[&>*]:w-[calc(20%-16px)]" ref={exploreScrollRef}>
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
    </main>
  );
}
