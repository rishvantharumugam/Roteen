"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { appRoutes } from "@/constants/AppRoutes";
import { HeaderSettingsMenu } from "@/components/layout/HeaderSettingsMenu";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

type VideoStyleHeaderProps = {
  activeLabel: "Notes" | "Revision";
};

const navItems: ReadonlyArray<{ label: string; href?: string }> = [
  { label: "Home", href: appRoutes.home },
  { label: "Dashboard", href: appRoutes.dashboard },
  { label: "Notes", href: appRoutes.notes },
  { label: "Revision", href: appRoutes.revision },
  { label: "Sessions", href: appRoutes.sessions },
];

export function VideoStyleHeader({ activeLabel }: VideoStyleHeaderProps) {
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme !== "light";

  return (
    <header className="sticky top-0 z-20 flex h-[72px] w-full items-center justify-between bg-black px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#7c3aed] to-[#a855f7] text-lg font-bold text-white">R</div>
        <h1 className="text-lg font-semibold tracking-tight text-[#a855f7]">Roteen</h1>
      </div>

      <nav className="flex items-center gap-6">
        {navItems.map((item) => {
          const href = item.href;
          return href ? (
            <Link
              key={item.label}
              href={href}
              prefetch
              onClick={() => applyRouteThemeClass(href)}
              className={item.label === activeLabel ? "rounded-full border border-purple-400/35 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-6 py-1.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)]" : "rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:text-zinc-100"}
            >
              {item.label}
            </Link>
          ) : null;
        })}
      </nav>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => {}}
          className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white"
        >
          {isDark ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <NotificationDropdown />

        <HeaderSettingsMenu />
      </div>
    </header>
  );
}
