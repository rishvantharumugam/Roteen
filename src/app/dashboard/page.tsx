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
  
  const subjectsQuery = serverSupabase
    .from("subjects")
    .select("id, standard, subject_name, chapters(id, name)")
    .order("created_at", { ascending: true });

  const userQuery = serverSupabase.auth.getUser();

  const [subjectsResult, userResult] = await Promise.all([
    subjectsQuery,
    userQuery,
  ]);

  const userId = userResult.data.user?.id;
  
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
