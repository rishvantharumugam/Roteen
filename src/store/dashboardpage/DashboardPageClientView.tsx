"use client";

import { useDashboardPageController } from "@/controller/DashboardPageClientController";
import { dashboardPageStyles } from "@/styles/DashboardPageStyles";
import { type DashboardSubjectCard, type DashboardSubjectRecord, mapSubjectToExploreCard } from "@/service/DashboardPageService";
import { DashboardHeader } from "@/store/dashboardpage/DashboardHeader";
import { ExploreCourseCard } from "@/store/dashboardpage/ExploreCourseCard";
import { RevealBlock } from "@/store/dashboardpage/RevealBlock";
import { SearchIcon } from "@/store/dashboardpage/SearchIcon";

type DashboardPageClientViewProps = {
  ongoingCourses: DashboardSubjectCard[];
  initialExploreSubjects: DashboardSubjectRecord[];
};

export function DashboardPageClientView({
  initialExploreSubjects,
}: DashboardPageClientViewProps) {
  const { exploreSubjects, isSearching, searchTerm, setSearchTerm } =
    useDashboardPageController(initialExploreSubjects);

  return (
    <main className={dashboardPageStyles.page}>
      <DashboardHeader activeLabel="Dashboard" />

      <div className={dashboardPageStyles.container}>
        <RevealBlock>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl dark:text-slate-100">
                Ongoing Courses
              </h1>
              <p className="mt-1.5 text-lg text-slate-600 md:text-xl dark:text-slate-400">Pick up where you left off</p>
            </div>
          </div>
        </RevealBlock>

        <RevealBlock
          className="mt-8 rounded-[1.5rem] border border-blue-100 bg-[#eaf2ff] px-5 py-5 shadow-[0_10px_24px_rgba(148,163,184,0.12)] transition-colors md:px-6 md:py-6 dark:border-[#333] dark:bg-[#1a1a1a] dark:shadow-none"
          delayMs={120}
        >
          <div className="grid gap-6 xl:grid-cols-[1.5fr_180px] xl:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-blue-700 dark:text-orange-500">
                <span className="text-lg">[]</span>
                <h2 className="font-heading text-2xl font-semibold md:text-3xl">Today&apos;s Learning Progress</h2>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-lg font-semibold text-slate-700 md:text-xl dark:text-slate-300">Daily Goal Reached</p>
                <div className="flex items-center gap-4 text-sm font-semibold text-blue-700 md:text-base dark:text-orange-500">
                  <span>46min / 60min</span>
                  <a href="#" className="transition hover:text-blue-800">
                    View Activity &gt;
                  </a>
                </div>
              </div>

              <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-[#333]">
                <div className="h-full w-[76%] rounded-full bg-blue-700 dark:bg-orange-500" />
              </div>
            </div>

            <div className="border-l border-blue-100 pl-6 text-center dark:border-[#333]">
              <p className="font-heading text-4xl font-semibold text-blue-700 md:text-5xl dark:text-orange-500">14</p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.24em] text-slate-700 dark:text-slate-400">Mins to Goal</p>
            </div>
          </div>
        </RevealBlock>

        <RevealBlock className="mt-8" delayMs={180}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl dark:text-slate-100">
              Explore Courses
            </h2>

            <label className="flex w-full max-w-md items-center gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(148,163,184,0.1)] transition-colors dark:border-[#333] dark:bg-[#1a1a1a] dark:shadow-none">
              <SearchIcon />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by subject..."
                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:text-base dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {exploreSubjects.length > 0 ? (
              exploreSubjects.map((subject, index) => (
                <ExploreCourseCard
                  key={`${subject.id}-${searchTerm || "all"}`}
                  card={mapSubjectToExploreCard(subject, index)}
                  animationDelayMs={index * 90}
                />
              ))
            ) : (
              <div className="md:col-span-2 rounded-[1.25rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-slate-400 xl:col-span-4">
                {isSearching ? "Searching subjects..." : "No matching subjects found in Supabase."}
              </div>
            )}
          </div>
        </RevealBlock>
      </div>
    </main>
  );
}
