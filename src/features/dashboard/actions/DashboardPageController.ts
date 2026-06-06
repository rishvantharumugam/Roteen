import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  processDashboardMetrics,
  type DashboardSubjectCard,
  type DashboardSubjectRecord,
  withQuestionCounts,
} from "@/features/dashboard/services/DashboardPageService";

export type DashboardPageData = {
  ongoingCourses: DashboardSubjectCard[];
  initialExploreSubjects: DashboardSubjectRecord[];
};

const DASHBOARD_CACHE_TTL_MS = 120_000;
let dashboardDataCache: { value: DashboardPageData; expiresAt: number } | null = null;
let dashboardDataPromise: Promise<DashboardPageData> | null = null;

export async function fetchDashboardStats(): Promise<DashboardPageData> {
  const now = Date.now();

  if (dashboardDataCache && dashboardDataCache.expiresAt > now) {
    return dashboardDataCache.value;
  }

  if (dashboardDataPromise) {
    return dashboardDataPromise;
  }

  dashboardDataPromise = (async () => {
    const serverSupabase = await createServerSupabaseClient();
    const { data, error } = await serverSupabase
      .from("subjects")
      .select("id, standard, subject_name, chapters(id, name)")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch dashboard subjects:", error.message);
      if (dashboardDataCache) {
        return dashboardDataCache.value;
      }
      return { ongoingCourses: [], initialExploreSubjects: [] };
    }

    const subjects = await withQuestionCounts(serverSupabase, (data as DashboardSubjectRecord[]) ?? []);
    const result = {
      ongoingCourses: processDashboardMetrics(subjects),
      initialExploreSubjects: subjects,
    };

    dashboardDataCache = {
      value: result,
      expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
    };

    return result;
  })();

  try {
    return await dashboardDataPromise;
  } finally {
    dashboardDataPromise = null;
  }
}
