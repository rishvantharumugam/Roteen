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
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  const userId = user?.id;

  // Fetch standard, progress, and all subjects in parallel to optimize client-side load time.
  const [userRowResult, progressResult, subjectsResult] = await Promise.all([
    userId
      ? supabase
          .from("users")
          .select("standard")
          .eq("id", userId)
          .single()
      : null,
    userId ? fetchUserCoursesProgress(supabase, userId) : [],
    supabase
      .from("subjects")
      .select("id, standard, subject_name, chapters(id, name)")
      .order("created_at", { ascending: true })
  ]);

  if (subjectsResult.error) {
    throw new Error(subjectsResult.error.message);
  }

  const userStandard = userRowResult?.data?.standard ?? null;
  const progressData = progressResult;
  let subjects = (subjectsResult.data as DashboardSubjectRecord[]) ?? [];

  // Filter subjects in memory by standard
  if (userStandard) {
    subjects = subjects.filter((subject) => subject.standard === userStandard);
  }

  const subjectsWithCounts = await withQuestionCounts(supabase, subjects);

  return {
    ongoingCourses: processDashboardMetrics(subjectsWithCounts),
    initialExploreSubjects: subjectsWithCounts,
    progressData,
  };
}

import Loading from "@/app/dashboard/loading";

interface DashboardPageUIProps {
  initialExploreSubjects?: DashboardSubjectRecord[];
  progressData?: CourseProgressItem[];
}

export default function DashboardPageUI({ initialExploreSubjects, progressData }: DashboardPageUIProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-bootstrap"],
    queryFn: fetchDashboardClientData,
    initialData: initialExploreSubjects && progressData ? {
      ongoingCourses: processDashboardMetrics(initialExploreSubjects),
      initialExploreSubjects,
      progressData,
    } : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes cache TTL
    refetchOnMount: false, // Prevent refetch on mount if initialData is present
    refetchOnWindowFocus: false, // Prevent refetch on focus
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
