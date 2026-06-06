import Link from "next/link";
import type { MouseEvent } from "react";
import type { SessionRouteLink } from "@/features/session/components/sessionStore";

type SessionHeaderProps = {
  userName: string;
  title: string;
  subtitle: string;
  routes: SessionRouteLink[];
  onRouteClick?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

export function SessionHeader({
  userName,
  title,
  subtitle,
  routes,
  onRouteClick,
}: SessionHeaderProps) {
  return (
    <header className="rounded-none bg-black px-4 py-5 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-teal-700">Welcome back, {userName}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block sm:w-72">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Search</span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-16 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
              placeholder="sessions, notes, hosts"
              type="search"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              className="relative grid h-11 w-11 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
              type="button"
              aria-label="Notifications"
            >
              <span className="text-lg">!</span>
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="grid h-11 w-11 place-items-center rounded-md bg-slate-950 text-sm font-semibold text-white">{userName.slice(0, 2).toUpperCase()}</div>
          </div>
        </div>
      </div>
      <nav className="mx-auto mt-5 flex max-w-7xl gap-2 overflow-x-auto">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            prefetch
            onClick={(event) => onRouteClick?.(route.href, event)}
            className={route.isPrimary ? "rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15" : "rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
