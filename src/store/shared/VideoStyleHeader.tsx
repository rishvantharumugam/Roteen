"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { appRoutes } from "@/navigation/AppRoutes";
import { prefetchCoreRoutes } from "@/navigation/prefetch";
import { videoStyles } from "@/styles/video";
import { HeaderSettingsMenu } from "@/store/shared/HeaderSettingsMenu";

type VideoStyleHeaderProps = {
  activeLabel: "Notes" | "Revision";
};

const navItems: ReadonlyArray<{ label: string; href?: string }> = [
  { label: "Home", href: appRoutes.home },
  { label: "Dashboard", href: appRoutes.dashboard },
  { label: "Notes", href: appRoutes.notes },
  { label: "Revision", href: appRoutes.revision },
  { label: "Sessions", href: appRoutes.sessions },
  { label: "News", href: appRoutes.news },
];

export function VideoStyleHeader({ activeLabel }: VideoStyleHeaderProps) {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme !== "light";

  useEffect(() => {
    prefetchCoreRoutes(router);
  }, [router]);

  return (
    <header className={videoStyles.navbar}>
      <div className={videoStyles.style_1da7023612fe2}>
        <div className={videoStyles.style_108db2f6831414}>R</div>
        <h1 className={videoStyles.style_11c7ba220cd9f1}>Roteen</h1>
      </div>

      <nav className={videoStyles.navMenu}>
        {navItems.map((item) => {
          const href = item.href;
          return href ? (
            <Link
              key={item.label}
              href={href}
              prefetch
              onClick={() => applyRouteThemeClass(href)}
              className={item.label === activeLabel ? videoStyles.navItemActive : videoStyles.navItem}
            >
              {item.label}
            </Link>
          ) : null;
        })}
      </nav>

      <div className={videoStyles.style_1da7023612fe2}>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => {}}
          className={videoStyles.style_133113f7d3ca84}
        >
          {isDark ? (
            <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <button
          title="Notifications"
          aria-label="Notifications"
          className={videoStyles.style_bfa4d0a2442ef}
        >
          <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V11a5 5 0 1 1 10 0v3.2a2 2 0 0 0 .6 1.4L19 17h-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className={videoStyles.style_1a3a5a5399c328} />
        </button>

        <HeaderSettingsMenu />
      </div>
    </header>
  );
}
