"use client";

import { useDeferredValue, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase/client';
import {
  type DashboardSubjectRecord,
  withQuestionCounts,
} from "@/features/dashboard/services/DashboardPageService";

async function fetchDashboardSubjectSearch(searchTerm: string, standard: string | null): Promise<DashboardSubjectRecord[]> {
  let query = supabase
    .from("subjects")
    .select("id, standard, subject_name, chapters(id, name)")
    .ilike("subject_name", `%${searchTerm}%`)
    .order("created_at", { ascending: true });

  if (standard) {
    query = query.eq("standard", standard);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return withQuestionCounts(supabase, (data as DashboardSubjectRecord[]) ?? []);
}

async function fetchUserStandard(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { data } = await supabase
    .from("users")
    .select("standard")
    .eq("id", userId)
    .single();

  return data?.standard ?? null;
}

export function useDashboardPageController(initialExploreSubjects: DashboardSubjectRecord[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [userStandard, setUserStandard] = useState<string | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const trimmedSearch = deferredSearchTerm.trim();

  // Fetch the user's standard on mount for client-side search filtering
  useEffect(() => {
    fetchUserStandard().then(setUserStandard);
  }, []);

  const searchQuery = useQuery({
    queryKey: ["dashboard-subject-search", trimmedSearch.toLowerCase(), userStandard],
    queryFn: () => fetchDashboardSubjectSearch(trimmedSearch, userStandard),
    enabled: trimmedSearch.length > 0,
    staleTime: 60_000,
    gcTime: 15 * 60_000,
  });

  const exploreSubjects = useMemo(() => {
    if (!trimmedSearch) {
      return initialExploreSubjects;
    }
    return searchQuery.data ?? [];
  }, [initialExploreSubjects, searchQuery.data, trimmedSearch]);

  return {
    exploreSubjects,
    isSearching: searchQuery.isFetching,
    searchTerm,
    setSearchTerm,
  };
}
