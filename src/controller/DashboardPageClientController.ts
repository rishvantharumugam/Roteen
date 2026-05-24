"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  type DashboardSubjectRecord,
  withQuestionCounts,
} from "@/service/DashboardPageService";

async function fetchDashboardSubjectSearch(searchTerm: string): Promise<DashboardSubjectRecord[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, standard, subject_name, chapters(id, name)")
    .ilike("subject_name", `%${searchTerm}%`)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return withQuestionCounts(supabase, (data as DashboardSubjectRecord[]) ?? []);
}

export function useDashboardPageController(initialExploreSubjects: DashboardSubjectRecord[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const trimmedSearch = deferredSearchTerm.trim();

  const searchQuery = useQuery({
    queryKey: ["dashboard-subject-search", trimmedSearch.toLowerCase()],
    queryFn: () => fetchDashboardSubjectSearch(trimmedSearch),
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
