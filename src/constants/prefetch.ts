import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { appRoutes } from "@/constants/AppRoutes";

const PREFETCH_ROUTES = [
  appRoutes.home,
  appRoutes.dashboard,
  appRoutes.notes,
  appRoutes.revision,
  appRoutes.sessions,
  appRoutes.pyqs,
  appRoutes.bugReport,
  "/video",
] as const;

export function prefetchCoreRoutes(router: AppRouterInstance) {
  const run = () => {
    PREFETCH_ROUTES.forEach((route) => {
      router.prefetch(route);
    });
  };

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(run);
    return;
  }

  run();
}

