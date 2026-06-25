"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

const LEGACY_DARK_ROUTES = [
  "/",
  "/video",
  "/news",
  "/dashboard",
  "/bug",
  "/notes",
  "/revision",
  "/session",
  "/profile",
  "/progress",
  "/feedback",
  "/notification",
  "/notifications",
  "/terms",
  "/tutorial",
  "/refer",
  "/pyq",
];

export function usesLegacyDarkRoute(pathname: string | null) {
  if (!pathname) return false;
  return LEGACY_DARK_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function applyRouteThemeClass(pathname: string | null) {
  if (typeof document === "undefined") return;
  const shouldUseLegacyDark = usesLegacyDarkRoute(pathname);
  document.body.classList.toggle("legacy-dark-route", shouldUseLegacyDark);
  document.documentElement.classList.toggle("dark", shouldUseLegacyDark);
}

export function RouteThemeScope() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    applyRouteThemeClass(pathname);
  }, [pathname]);

  return null;
}
