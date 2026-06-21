"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/constants/AppRoutes";
import { useAuth } from "@/providers/AuthProvider";
import { HeaderSettingsMenu } from "@/components/layout/HeaderSettingsMenu";

type UserMenuProps = {
  loginClassName?: string;
  loginLabel?: string;
  onLoginClick?: () => void;
};

export function UserMenu({
  loginClassName = "",
  loginLabel = "Login",
  onLoginClick,
}: UserMenuProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading && !user) {
    return null;
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

    const signInHref = pathname && pathname !== "/"
      ? `${appRoutes.signIn}?next=${encodeURIComponent(pathname)}`
      : appRoutes.signIn;

    return (
      <Link
        href={signInHref}
        className={`rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 ${loginClassName}`}
      >
        {loginLabel}
      </Link>
    );
  }

  // If user is logged in, return the global settings menu
  // This satisfies the requirement for the dark grey avatar button with the same options.
  return <HeaderSettingsMenu />;
}
