"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/navigation/AppRoutes";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { useAuth } from "@/providers/AuthProvider";

function getDisplayName(email: string | undefined, metadataName: unknown) {
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  if (email) {
    return email.split("@")[0];
  }

  return "User";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function HeaderSettingsMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const displayName = getDisplayName(
    user?.email,
    user?.user_metadata?.full_name ?? user?.user_metadata?.name,
  );
  const initials = getInitials(displayName) || "U";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node) || menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    applyRouteThemeClass(href);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    const { error } = await signOut();

    if (error) {
      console.warn("Failed to log out:", error);
      setIsLoggingOut(false);
      return;
    }

    setIsOpen(false);
    setIsLoggingOut(false);
    applyRouteThemeClass(appRoutes.home);
    router.replace(appRoutes.home);
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-700/80 bg-zinc-900/90 text-xs font-semibold text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_0_20px_rgba(168,85,247,0.18)] transition hover:border-purple-400/50 hover:text-white hover:shadow-[0_0_0_1px_rgba(168,85,247,0.35),0_0_26px_rgba(168,85,247,0.28)]"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.32),transparent_55%)] opacity-70 transition group-hover:opacity-100" />
        <span className="relative">{initials}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-72 overflow-hidden rounded-[1.8rem] border border-white/12 bg-[linear-gradient(160deg,rgba(26,27,31,0.96),rgba(19,20,24,0.96))] p-2.5 shadow-[0_0_0_1px_rgba(168,85,247,0.15),0_30px_80px_rgba(0,0,0,0.55),0_0_48px_rgba(168,85,247,0.25)] backdrop-blur-xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-lg font-semibold leading-none text-zinc-100">{displayName}</p>
            <p className="mt-2 truncate text-sm text-zinc-400">{user?.email ?? "Guest user"}</p>
          </div>
          <Link
            href={appRoutes.profile}
            prefetch
            onClick={() => handleNavigate(appRoutes.profile)}
            className="mt-2.5 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-base font-medium text-zinc-300 transition hover:border-purple-300/30 hover:bg-purple-400/10 hover:text-white"
          >
            <span className="text-zinc-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-3.2 3.58-5.5 8-5.5s8 2.3 8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>My Profile</span>
          </Link>
          <Link
            href={appRoutes.account}
            prefetch
            onClick={() => handleNavigate(appRoutes.account)}
            className="mt-2 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-base font-medium text-zinc-300 transition hover:border-purple-300/30 hover:bg-purple-400/10 hover:text-white"
          >
            <span className="text-zinc-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-3.2 3.58-5.5 8-5.5s8 2.3 8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>Account</span>
          </Link>
          <Link
            href={appRoutes.bugReport}
            prefetch
            onClick={() => handleNavigate(appRoutes.bugReport)}
            className="mt-2 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-base font-medium text-zinc-300 transition hover:border-purple-300/30 hover:bg-purple-400/10 hover:text-white"
          >
            <span className="text-zinc-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9.5 9.5h.01M14.5 9.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9 14a5.3 5.3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>Bug Report</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-2 mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold text-red-400 transition hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="m13 8 5 4-5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
