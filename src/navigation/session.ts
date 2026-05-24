"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollSession,
  getMeetingEnrollments,
  getSessionDashboard,
  getSessionRecordById,
  getSessionRecords,
} from "@/controller/session";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import type { SessionRouteLink, SessionDashboardState, SessionRecord } from "@/store/session/sessionStore";

export const SESSION_ROUTE = "/session";

export const sessionRoutes: SessionRouteLink[] = [
  {
    label: "Dashboard",
    href: SESSION_ROUTE,
    isPrimary: true,
  },
  {
    label: "Calendar",
    href: `${SESSION_ROUTE}?view=calendar`,
  },
  {
    label: "Reports",
    href: `${SESSION_ROUTE}?view=reports`,
  },
];

export function getSessionRoute() {
  return SESSION_ROUTE;
}

export function getSessionDetailRoute(sessionId: string) {
  return `${SESSION_ROUTE}/${sessionId}`;
}

export function goToSessionRoute(router: AppRouterInstance) {
  applyRouteThemeClass(SESSION_ROUTE);
  router.push(SESSION_ROUTE);
}

export function handleSessionHeaderClick(
  router: AppRouterInstance,
  event?: MouseEvent<HTMLElement>,
) {
  event?.preventDefault();
  goToSessionRoute(router);
}

export function handleSessionTopNavClick(
  router: AppRouterInstance,
  href: string,
  event?: MouseEvent<HTMLElement>,
) {
  event?.preventDefault();
  applyRouteThemeClass(href);
  router.push(href);
}

type RecordsWithEnrollments = {
  records: SessionRecord[];
  enrolledSessionIds: Set<string>;
};

export function useSessionPageNavigation() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState("");

  const dashboardQuery = useQuery({
    queryKey: queryKeys.sessionDashboard,
    queryFn: () => getSessionDashboard(),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
  });

  const recordsQuery = useQuery({
    queryKey: queryKeys.sessionRecordsWithEnrollments,
    queryFn: async (): Promise<RecordsWithEnrollments> => {
      const [records, enrollments] = await Promise.all([
        getSessionRecords(),
        getMeetingEnrollments(),
      ]);

      return {
        records,
        enrolledSessionIds: new Set(enrollments.map((item) => item.session_id)),
      };
    },
    staleTime: 30_000,
    gcTime: 15 * 60_000,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const sessionChannel = supabase
      .channel("sessions-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.sessionDashboard });
        void queryClient.invalidateQueries({ queryKey: queryKeys.sessionRecordsWithEnrollments });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "meeting_enrollments" }, () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.sessionRecordsWithEnrollments });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(sessionChannel);
    };
  }, [queryClient]);

  const enrollMutation = useMutation({
    mutationFn: async (sessionId: string) => enrollSession(sessionId),
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessionRecordsWithEnrollments });
      const previous = queryClient.getQueryData<RecordsWithEnrollments>(queryKeys.sessionRecordsWithEnrollments);

      queryClient.setQueryData<RecordsWithEnrollments>(queryKeys.sessionRecordsWithEnrollments, (current) => {
        if (!current) return current;
        const nextIds = new Set(current.enrolledSessionIds);
        nextIds.add(sessionId);
        return {
          ...current,
          enrolledSessionIds: nextIds,
        };
      });

      return { previous };
    },
    onError: (_error, _sessionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.sessionRecordsWithEnrollments, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessionRecordsWithEnrollments });
    },
  });

  const handleEnroll = useCallback(async (session: SessionRecord) => {
    try {
      await enrollMutation.mutateAsync(session.id);
      setSuccessMessage(`${session.title ?? "Session"} enrolled successfully. Join Now is ready.`);

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3_000);
    } catch (error) {
      console.error(error);
    }
  }, [enrollMutation]);

  const state = useMemo(
    () => ({
      dashboard: (dashboardQuery.data ?? null) as SessionDashboardState | null,
      records: recordsQuery.data?.records ?? [],
      enrolledSessionIds: recordsQuery.data?.enrolledSessionIds ?? new Set<string>(),
      isDashboardLoading: dashboardQuery.isLoading,
      isRecordsLoading: recordsQuery.isLoading,
      dashboardError: dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "",
      recordsError: recordsQuery.error instanceof Error ? recordsQuery.error.message : "",
      successMessage,
      enrollingSessionId: enrollMutation.variables ?? "",
    }),
    [
      dashboardQuery.data,
      dashboardQuery.error,
      dashboardQuery.isLoading,
      enrollMutation.variables,
      recordsQuery.data,
      recordsQuery.error,
      recordsQuery.isLoading,
      successMessage,
    ],
  );

  return {
    state,
    handleEnroll,
    getSessionDetailHref: getSessionDetailRoute,
  };
}

export function useSessionVideoNavigation(sessionId: string) {
  const recordQuery = useQuery({
    queryKey: queryKeys.sessionRecordById(sessionId),
    queryFn: () => getSessionRecordById(sessionId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    enabled: Boolean(sessionId),
  });

  return useMemo(
    () => ({
      record: recordQuery.data ?? null,
      isLoading: recordQuery.isLoading,
      errorMessage: recordQuery.error instanceof Error ? recordQuery.error.message : "",
    }),
    [recordQuery.data, recordQuery.error, recordQuery.isLoading],
  );
}
