"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/constants/AppRoutes";
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

import { ProfileService } from "@/features/profile/services/profile.service";

export function HeaderSettingsMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dynamicName, setDynamicName] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchName() {
      if (!user?.id) return;
      try {
        const profile = await ProfileService.getProfile(user.id);
        if (profile && profile.full_name && !profile.full_name.startsWith('Error:')) {
          setDynamicName(profile.full_name);
        }
      } catch (err) {
        // Ignore fetch errors
      }
    }
    fetchName();
  }, [user?.id]);

  const fallbackName = getDisplayName(
    user?.email,
    user?.user_metadata?.full_name ?? user?.user_metadata?.name,
  );
  const displayName = dynamicName || fallbackName;
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
    setIsOpen(false);

    // Optimistically route immediately for a snappy user experience
    applyRouteThemeClass(appRoutes.home);
    router.replace(appRoutes.home);

    // Run the slow network request in the background
    const { error } = await signOut();

    if (error) {
      console.warn("Failed to log out:", error);
    }

    setIsLoggingOut(false);
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
        className="group flex items-center gap-1.5 outline-none"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b3b40] text-zinc-300 transition-colors group-hover:bg-[#4a4a50] group-hover:text-white border border-white/5">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <svg className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[280px] overflow-hidden rounded-[14px] border border-[#2a2a2a] bg-[#111111] shadow-2xl">
          <div className="flex flex-col border-b border-[#2a2a2a] px-4 py-4">
            <p className="text-[15px] font-semibold leading-none text-zinc-100">{displayName}</p>
            <p className="mt-1.5 truncate text-[13px] text-zinc-400">{user?.email ?? "Guest user"}</p>
          </div>

          <div className="flex flex-col border-b border-[#2a2a2a] py-2">
            <Link
              href={appRoutes.profile}
              prefetch
              onClick={() => handleNavigate(appRoutes.profile)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  <path d="M4 20c0-3.2 3.58-5.5 8-5.5s8 2.3 8 5.5" />
                </svg>
              </span>
              Profile
            </Link>

            <Link
              href={appRoutes.progress}
              prefetch
              onClick={() => handleNavigate(appRoutes.progress)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </span>
              Progress
            </Link>

            <Link
              href={appRoutes.refer}
              prefetch
              onClick={() => handleNavigate(appRoutes.refer)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="8" width="18" height="4" rx="1" />
                  <path d="M12 8v13" />
                  <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                  <path d="M7.5 8a2.5 2.5 0 1 1 4.5-1.5V8" />
                  <path d="M16.5 8A2.5 2.5 0 1 0 12 6.5V8" />
                </svg>
              </span>
              Refer &amp; Earn
            </Link>

            <Link
              href={appRoutes.news}
              prefetch
              onClick={() => handleNavigate(appRoutes.news)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 11 18-5v12L3 14v-3z" />
                  <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                </svg>
              </span>
              News & Announcements
            </Link>

            <Link
              href={appRoutes.notifications}
              prefetch
              onClick={() => handleNavigate(appRoutes.notifications)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              Notifications
            </Link>
          </div>

          <div className="flex flex-col border-b border-[#2a2a2a] py-2">
            <Link
              href={appRoutes.bugReport}
              prefetch
              onClick={() => handleNavigate(appRoutes.bugReport)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="8" height="14" x="8" y="6" rx="4" />
                  <path d="m19 7-3 2" />
                  <path d="m5 7 3 2" />
                  <path d="m19 19-3-2" />
                  <path d="m5 19 3-2" />
                  <path d="M20 13h-4" />
                  <path d="M4 13h4" />
                  <path d="m10 4 1 2" />
                  <path d="m14 4-1 2" />
                </svg>
              </span>
              Bug
            </Link>

            <Link
              href={appRoutes.feedback}
              prefetch
              onClick={() => handleNavigate(appRoutes.feedback)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                </svg>
              </span>
              Feedback
            </Link>

            <Link
              href={appRoutes.tutorial}
              prefetch
              onClick={() => handleNavigate(appRoutes.tutorial)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z" />
                </svg>
              </span>
              Tutorial
            </Link>

            <Link
              href={appRoutes.terms}
              prefetch
              onClick={() => handleNavigate(appRoutes.terms)}
              className="group flex items-center gap-3.5 px-4 py-2.5 text-[14px] font-medium text-[#b0b0b0] transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-[#888888] transition-colors group-hover:text-zinc-300">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </span>
              Terms & Conditions
            </Link>

          </div>

          <div className="flex flex-col py-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="group flex w-full items-center gap-3.5 px-4 py-2.5 text-left text-[14px] font-medium text-[#f87171] transition-colors hover:bg-white/5 hover:text-[#fca5a5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-[#f87171] transition-colors group-hover:text-[#fca5a5]">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </span>
              {isLoggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
