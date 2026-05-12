import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { appRoutes } from "@/navigation/AppRoutes";

export function goToBugDashboard(router: AppRouterInstance) {
  router.push(appRoutes.dashboard);
}

export function goToBugPage(router: AppRouterInstance) {
  router.push(appRoutes.bugReport);
}

export function goToBugLogin(router: AppRouterInstance) {
  router.push(appRoutes.signIn);
}

export function handleBugBackNavigation(router: AppRouterInstance) {
  router.back();
}
