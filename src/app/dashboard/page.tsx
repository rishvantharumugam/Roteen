import { createServerSupabaseClient, getCachedAuthUser } from '@/lib/supabase/server';
import DashboardPageUI from "@/features/dashboard/components/DashboardPageUI";
import {
  type DashboardSubjectRecord,
  fetchUserCoursesProgress,
  getCachedUserStandard,
  getCachedSubjectsWithCounts,
  type CourseProgressItem,
} from "@/features/dashboard/services/DashboardPageService";
import { Suspense } from "react";
import Loading from "./loading";

export const revalidate = 0;
export const runtime = 'edge';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  console.log("[Dashboard Page] Started loading Page Component...");
  const start = Date.now();
  const serverSupabase = await createServerSupabaseClient();
  console.log(`[Dashboard Page] Client created in ${Date.now() - start}ms`);
  
  const userStart = Date.now();
  const userResult = await getCachedAuthUser();
  const userId = userResult?.id;
  console.log(`[Dashboard Page] auth.getUser() (cached) finished in ${Date.now() - userStart}ms. userId: ${userId}`);

  // Fetch user standard, courses progress, and cached subjects with counts in parallel.
  console.log("[Dashboard Page] Fetching standard, progress, and subjects in parallel...");
  const dbStart = Date.now();
  const [userStandard, progressData, allSubjectsWithCounts] = await Promise.all([
    userId ? getCachedUserStandard(serverSupabase, userId) : null,
    userId ? fetchUserCoursesProgress(serverSupabase, userId) : [],
    getCachedSubjectsWithCounts(serverSupabase)
  ]);
  console.log(`[Dashboard Page] Parallel db fetches (using cache) finished in ${Date.now() - dbStart}ms`);

  let subjects = allSubjectsWithCounts;

  console.log(`[Dashboard Page] userStandard: ${userStandard}, progressData count: ${progressData.length}, subjects count: ${subjects.length}`);

  // Filter subjects in memory by the user's standard if available
  if (userStandard) {
    subjects = subjects.filter((subject) => subject.standard === userStandard);
  }

  console.log(`[Dashboard Page] Total load time: ${Date.now() - start}ms`);

  return (
    <DashboardPageUI
      initialExploreSubjects={subjects}
      progressData={progressData}
    />
  );
}
