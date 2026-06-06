import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function goToDashboardHome(router: AppRouterInstance) {
  router.push("/dashboard");
}

export function goToDashboardBugPage(router: AppRouterInstance) {
  router.push("/bug");
}

export function handleDashboardBackNavigation(router: AppRouterInstance) {
  router.back();
}
