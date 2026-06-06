"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase/client';
import { DashboardPageClientView } from "@/features/dashboard/components/DashboardPageClientView";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import {
  processDashboardMetrics,
  type DashboardSubjectRecord,
  withQuestionCounts,
} from "@/features/dashboard/services/DashboardPageService";

async function fetchDashboardClientData() {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, standard, subject_name, chapters(id, name)")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const subjects = (data as DashboardSubjectRecord[]) ?? [];
  return {
    ongoingCourses: processDashboardMetrics(subjects),
    initialExploreSubjects: subjects,
  };
}

import Loading from "@/app/dashboard/loading";

export default function DashboardPageUI() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-bootstrap"],
    queryFn: fetchDashboardClientData,
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
  });

  if (!data && isLoading) {
    return <Loading />;
  }

  return (
    <DashboardPageClientView
      initialExploreSubjects={data?.initialExploreSubjects ?? []}
    />
  );
}
