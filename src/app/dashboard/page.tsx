import { createServerSupabaseClient } from '@/lib/supabase/server';
import DashboardPageUI from "@/features/dashboard/components/DashboardPageUI";
import {
  type DashboardSubjectRecord,
  withQuestionCounts,
  fetchUserCoursesProgress,
  type CourseProgressItem,
} from "@/features/dashboard/services/DashboardPageService";

export const revalidate = 0;

export default async function Page() {
  const serverSupabase = await createServerSupabaseClient();
  
  const userResult = await serverSupabase.auth.getUser();
  const userId = userResult.data.user?.id;

  // Fetch user's standard from the users table
  let userStandard: string | null = null;
  if (userId) {
    const { data: userRow } = await serverSupabase
      .from("users")
      .select("standard")
      .eq("id", userId)
      .single();
    userStandard = userRow?.standard ?? null;
  }

  // Build subjects query — filter by the user's standard if available
  let subjectsQuery = serverSupabase
    .from("subjects")
    .select("id, standard, subject_name, chapters(id, name)")
    .order("created_at", { ascending: true });

  if (userStandard) {
    subjectsQuery = subjectsQuery.eq("standard", userStandard);
  }

  const [subjectsResult] = await Promise.all([subjectsQuery]);
  
  let progressData: CourseProgressItem[] = [];
  if (userId) {
    progressData = await fetchUserCoursesProgress(serverSupabase, userId);
  }

  const subjects = (subjectsResult.data as DashboardSubjectRecord[]) ?? [];
  const subjectsWithCounts = await withQuestionCounts(serverSupabase, subjects);

  return (
    <DashboardPageUI
      initialExploreSubjects={subjectsWithCounts}
      progressData={progressData}
    />
  );
}
