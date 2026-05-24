"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DashboardPageClientView } from "@/store/dashboardpage/DashboardPageClientView";
import {
  processDashboardMetrics,
  type DashboardSubjectRecord,
  withQuestionCounts,
} from "@/service/DashboardPageService";

async function fetchDashboardClientData() {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, standard, subject_name, chapters(id, name)")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const subjects = await withQuestionCounts(supabase, (data as DashboardSubjectRecord[]) ?? []);
  return {
    ongoingCourses: processDashboardMetrics(subjects),
    initialExploreSubjects: subjects,
  };
}

function DashboardPageSkeleton() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#111827_0%,#020617_52%,#01030a_100%)] p-6">
      <div className="mx-auto max-w-[1400px] animate-pulse space-y-6">
        <div className="h-16 rounded-2xl bg-white/10" />
        <div className="h-28 rounded-3xl bg-white/10" />
        <div className="h-10 w-72 rounded-xl bg-white/10" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="aspect-square rounded-3xl bg-white/10" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function DashboardPageUI() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-bootstrap"],
    queryFn: fetchDashboardClientData,
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
  });

  if (!data && isLoading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <DashboardPageClientView
      initialExploreSubjects={data?.initialExploreSubjects ?? []}
    />
  );
}

