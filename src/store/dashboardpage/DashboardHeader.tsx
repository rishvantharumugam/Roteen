"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { appRoutes } from "@/navigation/AppRoutes";
import { prefetchCoreRoutes } from "@/navigation/prefetch";
import { HeaderSettingsMenu } from "@/store/shared/HeaderSettingsMenu";

type DashboardHeaderProps = {
  activeLabel?: string;
};

const headerNavItems = [
  { label: "Home", href: appRoutes.home },
  { label: "Dashboard", href: appRoutes.dashboard },
  { label: "Notes", href: appRoutes.notes },
  { label: "Revision", href: appRoutes.revision },
  { label: "Sessions", href: appRoutes.sessions },
  { label: "News", href: appRoutes.news },
] as const;

export function DashboardHeader({ activeLabel }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const normalizedActiveLabel = activeLabel?.trim().toLowerCase();

  useEffect(() => {
    prefetchCoreRoutes(router);
  }, [router]);

  const isItemActive = (label: string, href: string) => {
    if (normalizedActiveLabel) {
      return normalizedActiveLabel === label.toLowerCase();
    }

    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] min-h-[72px] shrink-0 w-full items-center justify-between border-b border-zinc-800/80 bg-[linear-gradient(180deg,rgba(8,10,16,0.95),rgba(3,5,11,0.96))] px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#7c3aed] to-[#a855f7] text-lg font-bold text-white">
          R
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-[#a855f7]">Roteen</h1>
      </div>

      <nav className="flex items-center gap-6">
        {headerNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            prefetch
            onClick={() => applyRouteThemeClass(item.href)}
            className={
              isItemActive(item.label, item.href)
                ? "rounded-full border border-purple-400/35 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-6 py-1.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)]"
                : "rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:text-zinc-100"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <button type="button" aria-label="Theme" className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" aria-label="Notifications" className="relative rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V11a5 5 0 1 1 10 0v3.2a2 2 0 0 0 .6 1.4L19 17h-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <HeaderSettingsMenu />
      </div>
    </header>
  );
}

