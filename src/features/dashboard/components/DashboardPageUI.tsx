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

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
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
    staleTime: 60_000, // Cache is fresh for 1 minute, preventing duplicate load
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
