import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { appRoutes } from "@/constants/AppRoutes";

export function goToDashboard(router: AppRouterInstance) {
  router.push(appRoutes.dashboard);
}

export function goToBugPage(router: AppRouterInstance) {
  router.push(appRoutes.bugReport);
}

export function goToLogin(router: AppRouterInstance) {
  router.push(appRoutes.signIn);
}

export function handleBackNavigation(router: AppRouterInstance) {
  router.back();
}

export function clearLandingAuthQuery(router: AppRouterInstance) {
  router.replace(appRoutes.home, { scroll: false });
}
