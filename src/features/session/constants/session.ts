"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollSession,
  getMeetingEnrollments,
  getSessionRecordById,
  getSessionsAll,
} from "@/features/session/actions/session";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { queryKeys } from "@/lib/queryKeys";
import { supabase } from '@/lib/supabase/client';
import type { SessionRouteLink, SessionDashboardState, SessionRecord } from "@/features/session/components/sessionStore";
import { useAuth } from "@/providers/AuthProvider";

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
  enrollmentCounts: Record<string, number>;
};

export function useSessionPageNavigation() {
  const { user, openLoginModal } = useAuth();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState("");

  // ─── OPTIMIZED: one query fetches dashboard stats + records simultaneously ───
  // Previously: 2 separate queries (sessionDashboard + sessionRecords) to the same table.
  // Now: 1 query via getSessionsAll(), stats computed locally — saves ~300-600ms.
  const sessionsAllQuery = useQuery({
    queryKey: queryKeys.sessionsAll,
    queryFn: () => getSessionsAll(),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
  });

  const recordsQuery = useQuery({
    queryKey: queryKeys.sessionRecordsWithEnrollments,
    queryFn: async (): Promise<RecordsWithEnrollments> => {
      const { getCurrentUserId } = await import("@/features/session/services/session");
      const [enrollments, currentUserId] = await Promise.all([
        getMeetingEnrollments(),
        getCurrentUserId(),
      ]);

      const records = sessionsAllQuery.data?.records ?? [];
      const enrollmentCounts: Record<string, number> = {};
      const enrolledSessionIds = new Set<string>();

      enrollments.forEach((item) => {
        enrollmentCounts[item.session_id] = (enrollmentCounts[item.session_id] ?? 0) + 1;
        if (item.user_id && item.user_id === currentUserId) {
          enrolledSessionIds.add(item.session_id);
        }
      });

      return { records, enrolledSessionIds, enrollmentCounts };
    },
    staleTime: 30_000,
    gcTime: 15 * 60_000,
    refetchInterval: 30_000,
    enabled: sessionsAllQuery.isSuccess && !!user,
  });

  useEffect(() => {
    if (!user) return;
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
  }, [queryClient, user]);

  const enrollMutation = useMutation({
    mutationFn: async (sessionId: string) => enrollSession(sessionId),
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessionRecordsWithEnrollments });
      const previous = queryClient.getQueryData<RecordsWithEnrollments>(queryKeys.sessionRecordsWithEnrollments);

      queryClient.setQueryData<RecordsWithEnrollments>(queryKeys.sessionRecordsWithEnrollments, (current) => {
        if (!current) return current;
        const nextIds = new Set(current.enrolledSessionIds);
        nextIds.add(sessionId);
        
        const nextCounts = { ...current.enrollmentCounts };
        nextCounts[sessionId] = (nextCounts[sessionId] ?? 0) + 1;

        return {
          ...current,
          enrolledSessionIds: nextIds,
          enrollmentCounts: nextCounts,
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
    if (!user) {
      openLoginModal(getSessionDetailRoute(session.id));
      return;
    }
    try {
      await enrollMutation.mutateAsync(session.id);
      setSuccessMessage(`${session.title ?? "Session"} enrolled successfully. Join Now is ready.`);

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3_000);
    } catch (error) {
      console.error(error);
    }
  }, [enrollMutation, user, openLoginModal]);

  const unenrollMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { unenrollSession } = await import("@/features/session/actions/session");
      return unenrollSession(sessionId);
    },
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessionRecordsWithEnrollments });
      const previous = queryClient.getQueryData<RecordsWithEnrollments>(queryKeys.sessionRecordsWithEnrollments);

      queryClient.setQueryData<RecordsWithEnrollments>(queryKeys.sessionRecordsWithEnrollments, (current) => {
        if (!current) return current;
        const nextIds = new Set(current.enrolledSessionIds);
        nextIds.delete(sessionId);
        
        const nextCounts = { ...current.enrollmentCounts };
        nextCounts[sessionId] = Math.max(0, (nextCounts[sessionId] ?? 1) - 1);

        return {
          ...current,
          enrolledSessionIds: nextIds,
          enrollmentCounts: nextCounts,
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

  const handleUnenroll = useCallback(async (session: SessionRecord) => {
    if (!user) {
      openLoginModal(getSessionDetailRoute(session.id));
      return;
    }
    try {
      await unenrollMutation.mutateAsync(session.id);
      setSuccessMessage(`${session.title ?? "Session"} enrollment cancelled.`);

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3_000);
    } catch (error) {
      console.error(error);
    }
  }, [unenrollMutation, user, openLoginModal]);

  const state = useMemo(
    () => ({
      dashboard: (sessionsAllQuery.data?.dashboard ?? null) as SessionDashboardState | null,
      records: recordsQuery.data?.records ?? sessionsAllQuery.data?.records ?? [],
      enrolledSessionIds: recordsQuery.data?.enrolledSessionIds ?? new Set<string>(),
      enrollmentCounts: recordsQuery.data?.enrollmentCounts ?? {},
      isDashboardLoading: sessionsAllQuery.isLoading,
      isRecordsLoading: recordsQuery.isLoading,
      dashboardError: sessionsAllQuery.error instanceof Error ? sessionsAllQuery.error.message : "",
      recordsError: recordsQuery.error instanceof Error ? recordsQuery.error.message : "",
      successMessage,
      enrollingSessionId: enrollMutation.isPending ? (enrollMutation.variables ?? "") : "",
      unenrollingSessionId: unenrollMutation.isPending ? (unenrollMutation.variables ?? "") : "",
    }),
    [
      sessionsAllQuery.data,
      sessionsAllQuery.error,
      sessionsAllQuery.isLoading,
      enrollMutation.isPending,
      enrollMutation.variables,
      unenrollMutation.isPending,
      unenrollMutation.variables,
      recordsQuery.data,
      recordsQuery.error,
      recordsQuery.isLoading,
      successMessage,
    ],
  );

  return {
    state,
    handleEnroll,
    handleUnenroll,
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
