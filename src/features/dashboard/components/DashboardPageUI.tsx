"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase/client';
import { DashboardPageClientView } from "@/features/dashboard/components/DashboardPageClientView";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import {
  processDashboardMetrics,
  type DashboardSubjectRecord,
  withQuestionCounts,
  fetchUserCoursesProgress,
  type CourseProgressItem,
} from "@/features/dashboard/services/DashboardPageService";

async function fetchDashboardClientData() {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, standard, subject_name, chapters(id, name)")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  let progressData: CourseProgressItem[] = [];
  if (userId) {
    progressData = await fetchUserCoursesProgress(supabase, userId);
  }

  const subjects = (data as DashboardSubjectRecord[]) ?? [];
  return {
    ongoingCourses: processDashboardMetrics(subjects),
    initialExploreSubjects: subjects,
    progressData,
  };
}

import Loading from "@/app/dashboard/loading";

export default function DashboardPageUI() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-bootstrap"],
    queryFn: fetchDashboardClientData,
    staleTime: 0,
    gcTime: 15 * 60_000,
  });

  if (!data && isLoading) {
    return <Loading />;
  }

  return (
    <DashboardPageClientView
      initialExploreSubjects={data?.initialExploreSubjects ?? []}
      progressData={data?.progressData ?? []}
    />
  );
}
