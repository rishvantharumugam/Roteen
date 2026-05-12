"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type DashboardSubjectRecord,
  withQuestionCounts,
} from "@/service/DashboardPageService";

const subjectSearchCache = new Map<string, DashboardSubjectRecord[]>();

export function useDashboardPageController(initialExploreSubjects: DashboardSubjectRecord[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [exploreSubjects, setExploreSubjects] = useState<DashboardSubjectRecord[]>(initialExploreSubjects);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isActive = true;
    const trimmedSearch = searchTerm.trim();

    const timer = window.setTimeout(async () => {
      if (!trimmedSearch) {
        if (isActive) {
          setExploreSubjects(initialExploreSubjects);
          setIsSearching(false);
        }
        return;
      }

      const normalizedSearch = trimmedSearch.toLowerCase();
      const cachedSearchResult = subjectSearchCache.get(normalizedSearch);
      if (cachedSearchResult) {
        setExploreSubjects(cachedSearchResult);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      const { data, error } = await supabase
        .from("subjects")
        .select("id, standard, subject_name, chapters(id, name)")
        .ilike("subject_name", `%${trimmedSearch}%`)
        .order("created_at", { ascending: true });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to search subjects:", error.message);
        setExploreSubjects([]);
        setIsSearching(false);
        return;
      }

      const hydratedSubjects = await withQuestionCounts(supabase, (data as DashboardSubjectRecord[]) ?? []);
      subjectSearchCache.set(normalizedSearch, hydratedSubjects);
      setExploreSubjects(hydratedSubjects);
      setIsSearching(false);
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [initialExploreSubjects, searchTerm]);

  return {
    exploreSubjects,
    isSearching,
    searchTerm,
    setSearchTerm,
  };
}
