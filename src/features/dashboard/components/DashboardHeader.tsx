"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { appRoutes } from "@/constants/AppRoutes";
import { HeaderSettingsMenu } from "@/components/layout/HeaderSettingsMenu";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

type DashboardHeaderProps = {
  activeLabel?: string;
};

const headerNavItems = [
  { label: "Home", href: appRoutes.home },
  { label: "Dashboard", href: appRoutes.dashboard },
  { label: "Notes", href: appRoutes.notes },
  { label: "Revision", href: appRoutes.revision },
  { label: "Sessions", href: appRoutes.sessions },
] as const;

export function DashboardHeader({ activeLabel }: DashboardHeaderProps) {
  const pathname = usePathname();
  const normalizedActiveLabel = activeLabel?.trim().toLowerCase();

  const isItemActive = (label: string, href: string) => {
    if (normalizedActiveLabel) {
      return normalizedActiveLabel === label.toLowerCase();
    }

    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 flex h-[72px] min-h-[72px] shrink-0 w-full items-center justify-between bg-black px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3AED] text-xl font-bold text-white">
          R
        </div>
        <h1 className="text-white font-bold text-xl tracking-wide">Roteen</h1>
      </div>

      <nav className="flex items-center gap-8 text-sm font-medium">
        {headerNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            prefetch
            onClick={() => applyRouteThemeClass(item.href)}
            className={
              isItemActive(item.label, item.href)
                ? "bg-[#7C3AED] text-white px-5 py-2 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                : "text-[#A1A1AA] hover:text-white transition-colors"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-6 text-[#A1A1AA]">
        <button suppressHydrationWarning type="button" aria-label="Theme" className="hover:text-white transition-colors">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <NotificationDropdown />
        <HeaderSettingsMenu />
      </div>
    </header>
  );
}
