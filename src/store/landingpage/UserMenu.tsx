"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/navigation/AppRoutes";
import { useAuth } from "@/providers/AuthProvider";

type UserMenuProps = {
  loginClassName?: string;
  loginLabel?: string;
  onLoginClick?: () => void;
};

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 20c0-3.2 3.58-5.5 8-5.5s8 2.3 8 5.5" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M9 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" strokeLinecap="round" />
      <path d="m13 8 5 4-5 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12H9" strokeLinecap="round" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 20a7 7 0 1 0-7-7 7 7 0 0 0 7 7Z" />
      <path d="M9.5 9.5h.01M14.5 9.5h.01" strokeLinecap="round" />
      <path d="M9 14a5.3 5.3 0 0 0 6 0" strokeLinecap="round" />
    </svg>
  );
}

function getUserDisplayName(email: string | undefined, metadataName: unknown) {
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  if (email) {
    return email.split("@")[0];
  }

  return "User";
}

function getUserInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function UserMenu({
  loginClassName = "",
  loginLabel = "Login",
  onLoginClick,
}: UserMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, isLoading, signOut } = useAuth();

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

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  if (isLoading && !user) {
    return (
      <div className="h-11 w-24 animate-pulse rounded-xl bg-slate-200" aria-hidden="true" />
    );
  }

  if (!user) {
    if (onLoginClick) {
      return (
        <button
          type="button"
          onClick={onLoginClick}
          className={`rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 ${loginClassName}`}
        >
          {loginLabel}
        </button>
      );
    }

    return (
      <Link
        href={appRoutes.signIn}
        className={`rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 ${loginClassName}`}
      >
        {loginLabel}
      </Link>
    );
  }

  const displayName = getUserDisplayName(
    user.email,
    user.user_metadata.full_name ?? user.user_metadata.name,
  );
  const initials = getUserInitials(displayName);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    const { error } = await signOut();

    if (error) {
      setIsLoggingOut(false);
      return;
    }

    setIsOpen(false);
    router.replace(appRoutes.home);
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-2 text-slate-800 shadow-[0_10px_24px_rgba(148,163,184,0.14)] transition hover:border-slate-300 hover:bg-slate-50"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open profile menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c7bcff_0%,#a797ff_100%)] text-xs font-bold text-slate-950">
          {initials || "U"}
        </span>
        <ChevronDownIcon />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-base font-semibold text-slate-950">{displayName}</p>
            <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
          </div>

          <div className="p-2">
            <Link
              href={appRoutes.profile}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <ProfileIcon />
              My Profile
            </Link>
            <Link
              href={appRoutes.account}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <ProfileIcon />
              Account
            </Link>
            <Link
              href={appRoutes.bugReport}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <BugIcon />
              Bug Report
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogoutIcon />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

