"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { appRoutes } from "@/constants/AppRoutes";
import { HeaderSettingsMenu } from "@/components/layout/HeaderSettingsMenu";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { MoreHorizontal } from "lucide-react";

type DashboardHeaderProps = {
  activeLabel?: string;
};

const headerNavItems = [
  { label: "Home", href: appRoutes.home },
  { label: "Dashboard", href: appRoutes.dashboard },
  { label: "Notes", href: appRoutes.notes },
  { label: "Revision", href: appRoutes.revision },
  { label: "Sessions", href: appRoutes.sessions },
  { label: "PYQs", href: appRoutes.pyqs },
] as const;

export function DashboardHeader({ activeLabel }: DashboardHeaderProps) {
  const pathname = usePathname();
  const normalizedActiveLabel = activeLabel?.trim().toLowerCase();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const isItemActive = (label: string, href: string) => {
    if (normalizedActiveLabel) {
      return normalizedActiveLabel === label.toLowerCase();
    }

    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 flex h-[72px] min-h-[72px] shrink-0 w-full items-center justify-between bg-black px-4 md:px-8 gap-4 border-b border-[rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-3 shrink-0 relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3AED] text-xl font-bold text-white shrink-0">
          R
        </div>
        <h1 className="text-white font-bold text-xl tracking-wide hidden sm:block shrink-0">Roteen</h1>

        {/* Mobile three-dot menu trigger */}
        <div className="md:hidden relative" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            suppressHydrationWarning
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] border border-zinc-800 text-[#A1A1AA] hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Navigation menu"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {isMobileMenuOpen && (
            <div className="absolute left-0 mt-2 z-[100] w-48 rounded-xl border border-zinc-800 bg-[#121212] py-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {headerNavItems.map((item) => {
                const active = isItemActive(item.label, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      applyRouteThemeClass(item.href);
                    }}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#7C3AED]/10 text-white border-l-2 border-[#7C3AED]"
                        : "text-[#A1A1AA] hover:text-white hover:bg-zinc-800/30"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 text-sm font-medium">
        {headerNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            prefetch
            onClick={() => applyRouteThemeClass(item.href)}
            className={`shrink-0 ${
              isItemActive(item.label, item.href)
                ? "bg-[#7C3AED] text-white px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                : "text-[#A1A1AA] hover:text-white transition-colors"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right control panel (always visible and same) */}
      <div className="flex items-center gap-3.5 sm:gap-6 text-[#A1A1AA] shrink-0">
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
