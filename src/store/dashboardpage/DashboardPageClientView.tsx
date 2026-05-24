"use client";

import { useDashboardPageController } from "@/controller/DashboardPageClientController";
import { dashboardPageStyles } from "@/styles/DashboardPageStyles";
import { type DashboardSubjectRecord, mapSubjectToExploreCard } from "@/service/DashboardPageService";
import { DashboardHeader } from "@/store/dashboardpage/DashboardHeader";
import { ExploreCourseCard } from "@/store/dashboardpage/ExploreCourseCard";
import { OngoingVideoCard, OngoingVideo } from "@/store/dashboardpage/OngoingVideoCard";
import { RevealBlock } from "@/store/dashboardpage/RevealBlock";
import { SearchIcon } from "@/store/dashboardpage/SearchIcon";
import { Atom, ChevronRight, Code2, Database, LayoutTemplate, Box } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { prefetchVideoSubjectRoute } from "@/navigation/videoSubjectNavigation";

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
    <main className={dashboardPageStyles.page}>
      <DashboardHeader activeLabel="Dashboard" />

      <div className={dashboardPageStyles.container}>
        {/* Ongoing Courses */}
        <RevealBlock delayMs={120}>
          <div className={dashboardPageStyles.sectionHeader}>
            <div className={dashboardPageStyles.sectionTitleWrap}>
              <h2 className={dashboardPageStyles.sectionTitle}>Ongoing Courses</h2>
              <p className={dashboardPageStyles.sectionSubtitle}>
                Continue watching where you left off
              </p>
            </div>
            <Link href="/video" prefetch className={dashboardPageStyles.sectionLink}>
              View all courses →
            </Link>
          </div>

          <div className={dashboardPageStyles.carouselWrap}>
            <div className={dashboardPageStyles.carouselScroll} ref={videoScrollRef}>
              {MOCK_ONGOING_VIDEOS.map((video) => (
                <OngoingVideoCard key={video.id} video={video} />
              ))}
              <div className="pointer-events-none sticky right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#0B0B15] to-transparent" />
            </div>
            <button
              type="button"
              className={dashboardPageStyles.navButtonRight}
              onClick={() => scrollRight(videoScrollRef)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </RevealBlock>

        {/* Explore Courses */}
        <RevealBlock delayMs={160}>
          <div className={dashboardPageStyles.sectionHeader}>
            <div className={dashboardPageStyles.sectionTitleWrap}>
              <h2 className={dashboardPageStyles.sectionTitle}>Explore Courses</h2>
              <p className={dashboardPageStyles.sectionSubtitle}>
                Discover and continue learning
              </p>
            </div>

            <label className={dashboardPageStyles.searchInputWrap}>
              <SearchIcon />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by subject..."
                className={dashboardPageStyles.searchInput}
              />
            </label>
          </div>

          <div className={dashboardPageStyles.carouselWrap}>
            {exploreSubjects.length > 0 ? (
              <div className={dashboardPageStyles.carouselScroll} ref={exploreScrollRef}>
                {exploreSubjects.map((subject, index) => (
                  <ExploreCourseCard
                    key={`${subject.id}-${searchTerm || "all"}`}
                    card={mapSubjectToExploreCard(subject, index)}
                    animationDelayMs={index * 50}
                  />
                ))}
                <div className="pointer-events-none sticky right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#0B0B15] to-transparent" />
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-dashed border-white/10 bg-[#121221] px-6 py-10 text-center text-gray-500">
                {isSearching ? "Searching subjects..." : "No matching subjects found in Supabase."}
              </div>
            )}

            {exploreSubjects.length > 0 && (
              <button
                type="button"
                className={dashboardPageStyles.navButtonRight}
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
